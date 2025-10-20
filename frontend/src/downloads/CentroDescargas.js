import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import './styles.css';

function buildQuery(q) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) s.set(k, v);
  return s.toString();
}

export default function CentroDescargas() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [status, setStatus] = useState(''); // success|failed|pending
  const [type, setType] = useState(''); // csv|excel|kpi
  const [requestedBy, setRequestedBy] = useState(''); // filter by requested by
  const [range, setRange] = useState(''); // today|7|30

  const rangeToDates = useMemo(() => {
    if (!range) return {};
    const now = new Date();
    let from = null;
    if (range === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7') {
      from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (range === '30') {
      from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    }
    return from ? { from: from.toISOString(), to: now.toISOString() } : {};
  }, [range]);

  const load = useCallback(async () => {
    const q = buildQuery({ status, type, requestedBy, ...rangeToDates });
    const r = await fetch('/api/history' + (q ? `?${q}` : ''));
    const json = await r.json();
    setItems(json.items || []);
  }, [status, type, requestedBy, rangeToDates]);
  useEffect(() => { load(); }, [load]);

  const toggle = (id) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const eliminar = async () => {
    for (const id of selected) {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
    }
    setSelected(new Set());
    load();
  };

  const reintentar = async () => {
    const ids = Array.from(selected);
    await fetch('/api/history/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setSelected(new Set());
    load();
  };

  const descargarSeleccionados = async () => {
    // re-ejecuta export basándose en filtros guardados en cada item
    for (const id of selected) {
      const it = items.find((x) => x.id === id);
      if (!it) continue;
      const filtros = new URLSearchParams(it.filters || {}).toString();
      const url = `/api/exports/${it.type === 'excel' ? 'excel' : 'csv'}?type=contacts${filtros ? '&' + filtros : ''}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      const u = window.URL.createObjectURL(blob);
      a.href = u;
      a.download = `${it.name.replace(/\s+/g, '_')}.${it.type === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(u);
    }
  };

  const selArray = Array.from(selected).map((id) => items.find((i) => i.id === id)).filter(Boolean);
  const totalSize = selArray.reduce((acc, i) => acc + (Number(i.sizeMB) || 0), 0);

  return (
    <div className="downloads-page">
      <Header title="Centro de Descargas" />
      <div className="downloads-wrap" style={{ gridTemplateColumns: '1fr 340px' }}>
        <section style={{ flex: 1 }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="">Rango de fechas</option>
              <option value="today">Hoy</option>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Estado</option>
              <option value="success">Exitosos</option>
              <option value="failed">Fallidos</option>
              <option value="pending">Pendientes</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tipo</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="kpi">KPIs</option>
            </select>
            <select value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)}>
              <option value="">Solicitado por</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className="btn" onClick={descargarSeleccionados} disabled={!selected.size}>Descargar Seleccionados</button>
            <button className="btn" onClick={eliminar} disabled={!selected.size}>Eliminar</button>
            <button className="btn" onClick={reintentar} disabled={!selected.size}>Reintentar</button>
          </div>

          {/* Tabla */}
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nombre del Reporte</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Solicitado por</th>
                  <th>Generado el</th>
                  <th>Tamaño</th>
                  <th>Expira</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <input type="checkbox" checked={selected.has(it.id)} onChange={() => toggle(it.id)} />
                    </td>
                    <td>{it.name}</td>
                    <td>{it.type}</td>
                    <td>{it.status}</td>
                    <td>{it.requestedBy || 'N/A'}</td>
                    <td>{new Date(it.createdAt).toLocaleString()}</td>
                    <td>{it.sizeMB?.toFixed?.(1) || '2.0'} MB</td>
                    <td>{new Date(it.expiresAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn" onClick={() => {
                        const filtros = new URLSearchParams(it.filters || {}).toString();
                        const url = `/api/exports/${it.type === 'excel' ? 'excel' : 'csv'}?type=contacts${filtros ? '&' + filtros : ''}`;
                        window.open(url, '_blank');
                      }}>Abrir</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="9" className="downloads-muted" style={{ padding: 16, textAlign: 'center' }}>Sin trabajos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Panel lateral de detalles de la selección */}
        <aside className="downloads-card">
          <h4>Detalle del trabajo</h4>
          {selArray.length === 0 ? (
            <div className="downloads-muted">Selecciona uno o más registros</div>
          ) : (
            <div>
              <div style={{ marginBottom: 8 }}>Seleccionados: {selArray.length}</div>
              <div style={{ marginBottom: 8 }}>Tamaño total: {totalSize.toFixed(1)} MB</div>
              <h5>Parámetros del reporte</h5>
              <ul>
                {Object.entries(selArray[0].filters || {}).map(([k, v]) => (
                  <li key={k}>{k} = {String(v)}</li>
                ))}
              </ul>
              <h5>Contenido Incluido</h5>
              <ul>
                <li>{selArray[0].type?.toUpperCase?.() || 'CSV'}</li>
              </ul>
              <div className="downloads-muted">Tamaño estimado: {totalSize.toFixed(1)} MB</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
