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

export default function Explorer() {
  const [presets, setPresets] = useState(() => listPresets());
  const [active, setActive] = useState({});
  const { rows, columns } = useSessionData();
  const [dbFilters, setDbFilters] = useState([]);
  const [activeDb, setActiveDb] = useState({});
  const [loadingDb, setLoadingDb] = useState(false);

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
  const datasetTotal = rows.length;
  const filteredCount = filteredRows.length;
  const yes = filteredRows.filter(r => String(r.y) === 'yes').length;
  const conversionRate = filteredCount ? Math.round((yes * 10000) / filteredCount) / 100 : 0;

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
        <div className="container-wide">
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 300px) 1fr',
              gap: 16,
              width: '100%',
              alignItems: 'start'
            }}
          >
            <aside style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Filtros (presets)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {presets.length === 0 && <div className="muted">No hay presets. Crea uno en “Constructor de Filtros”.</div>}
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
                <Link className="btn" to="/filtros">Crear/Cargar presets</Link>
              </div>
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
            </aside>

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="minw0">
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, display: 'flex', gap: 24, alignItems: 'center' }}>
                <div>Filas filtradas: <b>{filteredCount}</b></div>
                <div>Tasa de Conversión: <b>{conversionRate}%</b></div>
                <div>Contactos Totales: <b>{datasetTotal}</b></div>
              </div>

              <div className="table-wrap">
                <div className="table-scroll-top" ref={topScrollRef}>
                  <div className="spacer" ref={topSpacerRef} />
                </div>
                <div className="table-scroll-body" ref={bodyScrollRef}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {(columns?.length ? columns : [
                          'age','job','marital','education','default','balance','housing','loan',
                          'contact','day','month','duration','campaign','pdays','previous','poutcome','y'
                        ]).map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length ? filteredRows.map((r, i) => (
                        <tr key={i}>
                          {(columns?.length ? columns : Object.keys(r)).map(c => (
                            <td key={c}>{r[c]}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={columns?.length || 18} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                            Sin resultados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="muted">Total: {filteredCount}</div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
