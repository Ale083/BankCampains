import React, { useEffect, useMemo, useState, useRef } from 'react';
import Header from '../components/Header';
import { listPresets, mergeFiltersAND, deletePreset } from '../filters/utils';
import { useSessionData } from '../store/useSessionData';
import { Link } from 'react-router-dom';
import { listSavedFilters, deleteSavedFilter } from '../api/savedFilters';

function Chip({ label, active, onToggle, onDelete }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${active ? '#2563eb' : '#e5e7eb'}`,
        background: active ? '#dbeafe' : '#fff',
        color: active ? '#1d4ed8' : '#111',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Eliminar preset"
        title="Eliminar preset"
        style={{
          width: 20,
          height: 20,
          lineHeight: '18px',
          textAlign: 'center',
          borderRadius: '50%',
          border: '1px solid #e5e7eb',
          background: '#fff',
          color: '#6b7280',
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        ×
      </button>
    </div>
  );
}

function applyFilterAND(rows, filter) {
  if (!rows?.length || !filter || Object.keys(filter).length === 0) return rows;
  return rows.filter((row) => {
    for (const [field, cond] of Object.entries(filter)) {
      const v = row[field];
      if (cond?.$in) {
        if (!cond.$in.map(String).includes(String(v))) return false;
      }
      if (cond?.$gte !== undefined || cond?.$lte !== undefined) {
        const num = Number(v);
        if (Number.isNaN(num)) return false;
        if (cond.$gte !== undefined && num < Number(cond.$gte)) return false;
        if (cond.$lte !== undefined && num > Number(cond.$lte)) return false;
      }
    }
    return true;
  });
}

function toNumberOrNull(v) {
  if (v === null || v === undefined) return null;
  const cleaned = String(v).replace(/\s+/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default function Explorer() {
  const [presets, setPresets] = useState(() => listPresets());
  const [active, setActive] = useState({});
  const { rows, columns } = useSessionData();
  const [dbFilters, setDbFilters] = useState([]);
  const [activeDb, setActiveDb] = useState({});
  const [loadingDb, setLoadingDb] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  const topScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const topSpacerRef = useRef(null);

  useEffect(() => { setActive({}); }, [rows]);
  useEffect(() => { setPresets(listPresets()); }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingDb(true);
        const r = await listSavedFilters();
        if (r?.ok) {
          setDbFilters(r.data || []);
        } else if (Array.isArray(r)) {
          setDbFilters(r);
        }
      } catch (e) {
        console.error('Error listSavedFilters:', e);
      } finally {
        setLoadingDb(false);
      }
    })();
  }, []);

  function toggle(id) { setActive(s => ({ ...s, [id]: !s[id] })); }
  function toggleDb(id) { setActiveDb(s => ({ ...s, [id]: !s[id] })); }

  function handleDelete(id) {
    if (!window.confirm('¿Eliminar este preset?')) return;
    deletePreset(id);
    setPresets(listPresets());
    setActive(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  async function handleDeleteDb(id) {
    if (!window.confirm('¿Eliminar filtro de BD?')) return;
    try {
      const r = await deleteSavedFilter(id);
      if (r?.ok || r?.deleted || r?.status === 'ok') {
        setDbFilters(prev => prev.filter(f => f._id !== id));
      } else {
        setDbFilters(prev => prev.filter(f => f._id !== id));
      }
      setActiveDb(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      console.error('Error deleteSavedFilter:', e);
      alert('No se pudo eliminar el filtro en BD.');
    }
  }

  const selectedFilters = useMemo(
    () => presets.filter(p => active[p.id]).map(p => p.filter),
    [presets, active]
  );

  const selectedDb = useMemo(
    () => dbFilters.filter(f => activeDb[f._id]).map(f => f.filter),
    [dbFilters, activeDb]
  );

  const merged = useMemo(
    () => mergeFiltersAND([...selectedFilters, ...selectedDb]),
    [selectedFilters, selectedDb]
  );

  const filteredRows = useMemo(() => applyFilterAND(rows, merged), [rows, merged]);

  const displayedCols = useMemo(() => (
    columns?.length ? columns : [
      'age','job','marital','education','default','balance','housing','loan',
      'contact','day','month','duration','campaign','pdays','previous','poutcome','y'
    ]
  ), [columns]);

  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  const searchRe = useMemo(() => {
    if (!searchDebounced) return null;
    try { return new RegExp(escapeRegExp(searchDebounced), 'i'); }
    catch { return null; }
  }, [searchDebounced]);

  const searchReGlobal = useMemo(() => {
    if (!searchDebounced) return null;
    try { return new RegExp(`(${escapeRegExp(searchDebounced)})`, 'ig'); }
    catch { return null; }
  }, [searchDebounced]);

  function rowMatches(r){
    if (!searchRe) return false;
    for (const c of displayedCols) {
      const v = r?.[c];
      if (v !== null && v !== undefined && searchRe.test(String(v))) return true;
    }
    return false;
  }

  function renderCell(val){
    const s = String(val ?? '');
    if (!searchReGlobal) return s;
    const parts = s.split(searchReGlobal);
    return parts.map((p, i) =>
      i % 2 === 1 ? <mark key={i} className="hl">{p}</mark> : <span key={i}>{p}</span>
    );
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const dir = sortDir === 'asc' ? 1 : -1;
    const out = [...filteredRows];
    out.sort((a, b) => {
      const va = a?.[sortKey];
      const vb = b?.[sortKey];
      const aNull = va === null || va === undefined || va === '';
      const bNull = vb === null || vb === undefined || vb === '';
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      const na = toNumberOrNull(va);
      const nb = toNumberOrNull(vb);
      if (na !== null && nb !== null) {
        if (na < nb) return -1 * dir;
        if (na > nb) return 1 * dir;
        return 0;
      }
      const sa = String(va);
      const sb = String(vb);
      return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' }) * dir;
    });
    return out;
  }, [filteredRows, sortKey, sortDir]);

  const datasetTotal = rows.length;
  const filteredCount = filteredRows.length;
  const yes = filteredRows.filter(r => String(r.y) === 'yes').length;
  const conversionRate = filteredCount ? Math.round((yes * 10000) / filteredCount) / 100 : 0;

  function handleSort(col) {
    if (sortKey === col) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  }

  useEffect(() => {
    setPage(1);
  }, [merged, sortKey, sortDir, pageSize]);

  useEffect(() => {
    const id = setTimeout(() => setSearchDebounced(search.trim()), 200);
    return () => clearTimeout(id);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedRows.length);
  const pagedRows = useMemo(() => sortedRows.slice(startIndex, endIndex), [sortedRows, startIndex, endIndex]);

  function gotoPage(p) {
    if (!Number.isFinite(p)) return;
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function getPageList(total, current) {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '…', total);
      return pages;
    }
    if (current >= total - 3) {
      pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total);
      return pages;
    }
    pages.push(1, '…', current - 1, current, current + 1, '…', total);
    return pages;
  }

  const matchCountTotal = useMemo(() => {
    if (!searchRe) return sortedRows.length;
    let c = 0; for (const r of sortedRows) if (rowMatches(r)) c++;
    return c;
  }, [sortedRows, searchRe]);

  const matchCountPage = useMemo(() => {
    if (!searchRe) return pagedRows.length;
    let c = 0; for (const r of pagedRows) if (rowMatches(r)) c++;
    return c;
  }, [pagedRows, searchRe]);

  useEffect(() => {
    const top = topScrollRef.current;
    const body = bodyScrollRef.current;
    const spacer = topSpacerRef.current;
    if (!top || !body || !spacer) return;
    let lock = false;
    const onTop = () => { if (lock) return; lock = true; body.scrollLeft = top.scrollLeft; lock = false; };
    const onBody = () => { if (lock) return; lock = true; top.scrollLeft = body.scrollLeft; lock = false; };
    top.addEventListener('scroll', onTop, { passive: true });
    body.addEventListener('scroll', onBody, { passive: true });
    const resize = () => {
      spacer.style.width = body.scrollWidth + 'px';
      top.scrollLeft = body.scrollLeft;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(body);
    window.addEventListener('resize', resize);
    return () => {
      top.removeEventListener('scroll', onTop);
      body.removeEventListener('scroll', onBody);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
  }, [filteredRows, columns]);

  return (
    <div className="page">
      <Header title="Explorador Tabulador de Datos" />
      <main className="wrap" style={{ gap: 16 }}>
        <section style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <aside style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Filtros (presets)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              
              {presets.map(p => (
                <Chip
                  key={p.id}
                  label={p.name}
                  active={!!active[p.id]}
                  onToggle={() => toggle(p.id)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Link className="btn" to="/filtros">Crear presets</Link>
            </div>

            <div style={{ marginTop: 16 }}>
              
             
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: '12px 0 8px' }}>Mis filtros (BD)</h4>
                <div className="muted" style={{ marginBottom: 8 }}>
                  {loadingDb ? 'Cargando…' : (dbFilters?.length ? 'Persistidos en la base de datos' : 'No hay filtros en BD')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dbFilters.map(f => (
                    <Chip
                      key={f._id}
                      label={f.name}
                      active={!!activeDb[f._id]}
                      onToggle={() => toggleDb(f._id)}
                      onDelete={() => handleDeleteDb(f._id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="minw0">
              <div
                className="statsbar"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  gap: 24,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                <div className="statsbar__nums" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>Filas filtradas: <b>{filteredCount}</b></div>
                  <div>Tasa de Conversión: <b>{conversionRate}%</b></div>
                  <div>Contactos Totales: <b>{datasetTotal}</b></div>
                  <div className="muted">Coincidencias: <b>{matchCountPage}</b> / <b>{matchCountTotal}</b></div>
                </div>
                <div className="searchbar">
                  <input
                    className="searchbox"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar en la tabla…"
                    aria-label="Buscar en la tabla"
                  />
                  {search && (
                    <button className="clearsearch" onClick={() => setSearch('')} aria-label="Borrar búsqueda">×</button>
                  )}
                </div>
              </div>

              <div className="table-wrap">
                <div className="table-scroll-top" ref={topScrollRef}>
                  <div className="spacer" ref={topSpacerRef} />
                </div>
                <div className="table-scroll-body" ref={bodyScrollRef}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {displayedCols.map(h => (
                          <th
                            key={h}
                            onClick={() => handleSort(h)}
                            className={`th-sortable ${sortKey === h ? `sorted ${sortDir}` : ''}`}
                            title="Ordenar"
                          >
                            <span className="th-content">
                              {h}
                              {sortKey === h && <span className="sort-ind">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.length ? pagedRows.map((r, i) => {
                        const matched = rowMatches(r);
                        return (
                          <tr key={startIndex + i} className={matched && searchDebounced ? 'row-match' : ''}>
                            {displayedCols.map(c => (
                              <td key={c}>{renderCell(r[c])}</td>
                            ))}
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={displayedCols.length} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                            Sin resultados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pager">
                <div className="pager__left">
                  <label className="pager__rpp">
                    <span>Filas por página</span>
                    <select
                      value={pageSize}
                      onChange={e => setPageSize(Number(e.target.value))}
                      aria-label="Filas por página"
                    >
                      {[5, 6, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>

                <div className="pager__center" role="navigation" aria-label="Paginación">
                  <button className="pager__btn" onClick={() => gotoPage(1)} disabled={currentPage === 1} aria-label="Primera página">«</button>
                  <button className="pager__btn" onClick={() => gotoPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior">‹</button>
                  <div className="pager__nums">
                    {getPageList(totalPages, currentPage).map((p, idx) =>
                      p === '…' ? (
                        <span key={`e${idx}`} className="pager__ellipsis">…</span>
                      ) : (
                        <button
                          key={p}
                          className={`pager__num ${p === currentPage ? 'is-active' : ''}`}
                          onClick={() => gotoPage(p)}
                          aria-current={p === currentPage ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>
                  <button className="pager__btn" onClick={() => gotoPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Página siguiente">›</button>
                  <button className="pager__btn" onClick={() => gotoPage(totalPages)} disabled={currentPage === totalPages} aria-label="Última página">»</button>
                </div>

                <div className="pager__right">
                  <span className="pager__range">
                    Mostrando <b>{sortedRows.length ? startIndex + 1 : 0}</b>–<b>{endIndex}</b> de <b>{sortedRows.length}</b>
                  </span>
                </div>
              </div>
            </section>
          </section>
      </main>
    </div>
  );
}
