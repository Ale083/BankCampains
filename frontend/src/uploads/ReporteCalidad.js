import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './styles.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ReporteCalidad() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { result, columns = [], fileName = '' } = state || {};

  if (!state) {
    navigate('/', { replace: true });
    return null;
  }

  const backendSummary = result?.summary || {};
  const totalRegistros = backendSummary.totalRecords ?? 0;
  const backendColumns = Array.isArray(backendSummary.columns) ? backendSummary.columns : null;
  const usedColumns = (backendColumns && backendColumns.length) ? backendColumns : columns;
  const columnas = usedColumns.length;

  // traemsos los datos del backend para el reporte
  const rejected = Array.isArray(result?.rejectedRecords) ? result.rejectedRecords : [];
  const insertedRecords = backendSummary.insertedRecords ?? 0;
  const hasValidInserted = insertedRecords > 0;
  const filasDescartadas = rejected.map(r => r.row).filter(Boolean);

  const nullsChartData = (backendSummary.nullsByColumn || []).slice().sort((a, b) => b.nulls - a.nulls);
  const porcentajeNulos = backendSummary.nullPercent ?? 0;
  const percentRejected = backendSummary.percentRejected ?? (
    totalRegistros ? +(((backendSummary.rejectedRecords || 0) / totalRegistros) * 100).toFixed(1) : 0
  );
  const qualityScore = backendSummary.qualityScore ?? Math.max(0, +(100 - (porcentajeNulos || 0) - (percentRejected || 0)).toFixed(1));
  const calidadData = [
    { name: 'Calidad', value: qualityScore }
  ];

  return (
    <div className="csv-upload-container">
      <Header title="Reporte de Calidad de Datos" showNavbar={false} />

      <div className="csv-upload-content">
       
        <div className="cards-row">
          <Card title="Registros" value={totalRegistros.toLocaleString('es-AR')} />
          <Card title="Columnas" value={columnas} />
          <Card title="Porcentaje de Nulos" value={`${porcentajeNulos}%`} />
          <Card title="Filas insertadas" value={insertedRecords} />
          <Card title="Filas descartadas" custom>
            <div className="card-value">{filasDescartadas.length}</div>
          </Card>
        </div>

      
        <div className="charts-row">
          <div className="index-card-wrapper">
            <Card title="Índice de Calidad" custom>
              <div className="index-card-body">
                <div className="index-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={calidadData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip formatter={(v) => [`${v}%`, 'Calidad']} />
                      <Bar dataKey="value" fill="#4f75e2" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="index-caption">
                  <div>Score: {qualityScore}%</div>
                  <div>Nulos {porcentajeNulos}% · Descartes {percentRejected}%</div>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Valores Nulos por Columna" custom>
            <div className="chart-container chart-container--nulls">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nullsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(v, n) => n === 'nulls' ? [`${v}`, 'Nulos'] : [v, n]} />
                  <Bar dataKey="nulls" fill="#9ab3f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        
        <div className="panel panel--logs">
          <div className="panel-title">Logs de registros</div>
          <div className="table-container table-container--logs">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fila descartada</th>
                  <th>Columna problemática</th>
                  <th>Rango/Datos esperados</th>
                  <th>Valor propuesto</th>
                </tr>
              </thead>
              <tbody>
                {(result?.rejectedRecords || []).map((r, idx) => {
                  const firstError = r.errors?.[0] || '';
                  const expectedRange = firstError.replace(/,?\s*recibido:\s*.*/i, '').trim();
                  const problemCol = (expectedRange.match(/^([^\s,.:;]+)/)?.[1]) || '-';
                  const receivedFromError = (firstError.match(/recibido:\s*(.*)$/i)?.[1] || '').trim();
                  const proposedFromData = problemCol !== '-' ? (r.data?.[problemCol]) : undefined;
                  const proposedValue = (proposedFromData !== undefined && proposedFromData !== null && `${proposedFromData}` !== '')
                    ? proposedFromData
                    : (receivedFromError || '-');
                  return (
                    <tr key={idx}>
                      <td>{r.row}</td>
                      <td>{problemCol}</td>
                      <td>{expectedRange}</td>
                      <td>{proposedValue}</td>
                    </tr>
                  );
                })}
                {(result?.rejectedRecords?.length || 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="table-empty">Sin registros rechazados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        
        <div className="report-footer">
          <button className="upload-button" onClick={() => navigate(-1)}>Volver</button>
          {hasValidInserted && (
            <button className="upload-button" onClick={() => navigate('/dashboardKPIs')}>Ir al dashboard</button>
          )}
        </div>

       
        <div className="file-hint">Archivo: {fileName}</div>
      </div>
    </div>
  );
}

function Card({ title, value, children, custom }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {custom ? (
        children
      ) : (
        <div className="card-value">{value}</div>
      )}
    </div>
  );
}

function MiniLine({ values = [] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-line">
      {values.map((v, i) => (
        <div key={i} className="mini-line__bar" style={{ height: (v / max) * 70 + 10 }} />
      ))}
    </div>
  );
}
