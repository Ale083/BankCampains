import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import AccessFacade from '../auth/AccessFacade';

function buildQuery(q) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) s.set(k, v);
  return s.toString();
}

export default function Historial() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [range, setRange] = useState(''); 

  const navigate = useNavigate();
  useEffect(() => {
    if(!AccessFacade.puedeVerHistorial()){
      alert("Usuario sin permisos para ver el historial");
      navigate(-1);
    }
  }, []);

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
    return {}; 
  }, [range]);

  const load = useCallback(async () => {
    try {
      const q = buildQuery({ ...rangeToDates });
      const r = await fetch('/api/history' + (q ? `?${q}` : ''));
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      const json = await r.json();
      
      const consultas = (json.items || []).filter(item => 
        item.type === 'búsqueda' || item.type === 'consulta' || item.type === 'search' || item.type === 'csv'
      );
      setItems(consultas);
      if (!selectedId && consultas.length) {
        setSelectedId(consultas[0].id);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setItems([]);
    }
  }, [rangeToDates, selectedId]);

  useEffect(() => { load(); }, [load]);

  const selected = items.find(i => i.id === selectedId);

  return (
    <div className="downloads-page">
      <Header title="Historial de Consultas" />
      <div className="downloads-wrap">
        {/* Filtros laterales */}
        <aside className="downloads-card">
          <h4 className="downloads-panel-title">Filtros</h4>
          <div className="filter-group">
            <div className="filter-title">Rango de Fechas</div>
            <label className="filter-item">
              <input type="checkbox" checked={range === 'today'} onChange={() => setRange(range === 'today' ? '' : 'today')} />
              Hoy
            </label>
            <label className="filter-item">
              <input type="checkbox" checked={range === '7'} onChange={() => setRange(range === '7' ? '' : '7')} />
              Últimos 7 días
            </label>
            <label className="filter-item">
              <input type="checkbox" checked={range === '30'} onChange={() => setRange(range === '30' ? '' : '30')} />
              Últimos 30 días
            </label>
          </div>
        </aside>

        {/* Tabla central */}
        <section>
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Resultados</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className={selectedId === it.id ? 'row-selected' : ''} onClick={() => setSelectedId(it.id)}>
                    <td>{it.name}</td>
                    <td>{it.type}</td>
                    <td>{it.notes || it.description || '-'}</td>
                    <td>{it.resultCount ?? '-'}</td>
                    <td>{new Date(it.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="downloads-muted" style={{ textAlign: 'center', padding: 16 }}>Sin consultas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Panel de detalle */}
        <aside className="downloads-card">
          <h4 className="downloads-panel-title">Detalle de Consulta</h4>
          {!selected ? (
            <div className="downloads-muted">Selecciona una consulta para ver el detalle</div>
          ) : (
            <div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Nombre:</strong> {selected.name || '-'}
              </div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Tipo:</strong> {selected.type || '-'}
              </div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Estado:</strong> {selected.status === 'success' ? 'Exitoso' : selected.status === 'failed' ? 'Fallido' : selected.status === 'pending' ? 'Pendiente' : (selected.status || '-')}
              </div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Fecha:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}
              </div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Resultados:</strong> {selected.resultCount ?? '-'}
              </div>
              <div className="downloads-muted" style={{ marginBottom: 8 }}>
                <strong>Solicitado por:</strong> {selected.requestedBy || 'admin'}
              </div>
              {(selected.notes || selected.description) && (
                <div className="downloads-muted" style={{ marginBottom: 8 }}>
                  <strong>Descripción:</strong> {selected.notes || selected.description}
                </div>
              )}
              {selected.filters && Object.keys(selected.filters).length > 0 && (
                <div className="downloads-muted" style={{ marginBottom: 8 }}>
                  <strong>Filtros:</strong> {Object.entries(selected.filters).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join(' | ')}
                </div>
              )}
              {typeof selected.sizeMB === 'number' && selected.sizeMB > 0 && (
                <div className="downloads-muted" style={{ marginBottom: 8 }}>
                  <strong>Peso:</strong> {selected.sizeMB} MB
                </div>
              )}
              {selected.expiresAt && (
                <div className="downloads-muted" style={{ marginBottom: 8 }}>
                  <strong>Expira:</strong> {new Date(selected.expiresAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
