import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import './styles.css';

function buildQuery(q) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) s.set(k, v);
  return s.toString();
}

export default function Historial() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [statusOk, setStatusOk] = useState(true);
  const [statusFail, setStatusFail] = useState(true);
  const [range, setRange] = useState(''); // Sin filtro de fecha por defecto

  const statuses = useMemo(() => {
    const s = [];
    if (statusOk) s.push('success');
    if (statusFail) s.push('failed');
    return s.join(',');
  }, [statusOk, statusFail]);

  const rangeToDates = useMemo(() => {
    const now = new Date();
    if (range === 'today') {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (range === '7') {
      return { from: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString(), to: now.toISOString() };
    }
    if (range === '30') {
      return { from: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(), to: now.toISOString() };
    }
    return {}; // Sin filtro de fecha si es personalizado o vacío
  }, [range]);

  const load = useCallback(async () => {
    try {
      const q = buildQuery({ status: statuses, ...rangeToDates });
      const r = await fetch('/api/history' + (q ? `?${q}` : ''));
      
      if (!r.ok) {
        throw new Error(`HTTP error! status: ${r.status}`);
      }
      
      const json = await r.json();
      setItems(json.items || []);
      
      if (!selectedId && json.items?.length) {
        setSelectedId(json.items[0].id);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setItems([]);
    }
  }, [statuses, rangeToDates, selectedId]);

  useEffect(() => { load(); }, [load]);

  const exportar = async (fmt) => {
    const filtros = localStorage.getItem('filtros') || '';
    const url = `/api/exports/${fmt}?type=contacts${filtros ? '&' + filtros : ''}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    const urlBlob = window.URL.createObjectURL(blob);
    a.href = urlBlob;
    a.download = fmt === 'csv' ? 'consulta.csv' : 'consulta.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlBlob);
  };

  const selected = items.find(i => i.id === selectedId);

  return (
    <div className="downloads-page">
      <Header title="Historial de Consultas" />
      <div className="downloads-wrap">
        {/* Filtros laterales */}
        <aside className="downloads-card">
          <h4 className="downloads-panel-title">Filtros</h4>
          <div className="filter-group">
            <div className="filter-title">Estado</div>
            <label className="filter-item">
              <input type="checkbox" checked={statusOk} onChange={(e) => setStatusOk(e.target.checked)} />
              Exitosas
            </label>
            <label className="filter-item">
              <input type="checkbox" checked={statusFail} onChange={(e) => setStatusFail(e.target.checked)} />
              Fallidas
            </label>
          </div>
          <div className="filter-group">
            <div className="filter-title">Rango de Fechas</div>
            <label className="filter-item">
              <input type="radio" name="rango" checked={range === ''} onChange={() => setRange('')} />
              Todos
            </label>
            <label className="filter-item">
              <input type="radio" name="rango" checked={range === 'today'} onChange={() => setRange('today')} />
              Hoy
            </label>
            <label className="filter-item">
              <input type="radio" name="rango" checked={range === '7'} onChange={() => setRange('7')} />
              Últimos 7 días
            </label>
            <label className="filter-item">
              <input type="radio" name="rango" checked={range === '30'} onChange={() => setRange('30')} />
              Últimos 30 días
            </label>
            <label className="filter-item">
              <input type="radio" name="rango" checked={range === 'custom'} onChange={() => setRange('custom')} />
              Personalizado
            </label>
          </div>
        </aside>

        {/* Tabla central */}
        <section>
          <div className="downloads-actions">
            <button className="btn" onClick={() => exportar('csv')}>Exportar CSV</button>
            <button className="btn" onClick={() => exportar('excel')}>Exportar Excel</button>
          </div>
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Filtros Incluidos</th>
                  <th>Resultados</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className={selectedId === it.id ? 'row-selected' : ''} onClick={() => setSelectedId(it.id)}>
                    <td>{it.name}</td>
                    <td>{it.type}</td>
                    <td>{it.notes || '-'}</td>
                    <td>{Object.keys(it.filters || {}).length}</td>
                    <td>{it.resultCount ?? '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="downloads-muted" style={{ textAlign: 'center', padding: 16 }}>Sin registros</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Panel de detalle */}
        <aside className="downloads-card">
          <h4 className="downloads-panel-title">Detalle de Consulta</h4>
          {selected ? (
            <div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>Estado: {selected.status}</div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>Generado el: {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>Resultados: {selected.resultCount ?? '-'}</div>
              <h5>Parámetros</h5>
              <ul>
                {Object.entries(selected.filters || {}).map(([k,v]) => (
                  <li key={k}><strong>{k}</strong>: {String(v)}</li>
                ))}
              </ul>
              <h5>Archivo de Exportación</h5>
              <div className="downloads-muted">Tipo: {selected.type?.toUpperCase?.()}</div>
              <div className="downloads-muted">Tamaño estimado: {selected.sizeMB?.toFixed?.(1) || '2.0'} MB</div>
            </div>
          ) : (
            <div className="downloads-muted">Selecciona una fila para ver detalles</div>
          )}
        </aside>
      </div>
    </div>
  );
}
