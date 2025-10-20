import { useEffect, useMemo, useState } from 'react';
import { useFilters } from '../store/useFilters';
import { fetchKpis, fetchTable } from '../api/btw';

const COLS = ['age','job','marital','education','default','housing','loan','contact',
  'month','day_of_week','duration','campaign','pdays','previous','poutcome',
  'emp_var_rate','cons_price_idx','cons_conf_idx','euribor3m','nr_employed','y'];

export default function DataTable() {
  const { datasetId, filter } = useFilters();
  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setSize] = useState(25);
  const [total, setTotal] = useState(0);

  const merged = useMemo(() => {
    const f = { ...filter };
    if (datasetId) f.batchId = { $in: [datasetId] };
    return f;
  }, [filter, datasetId]);

  useEffect(() => {
    (async () => {
      const k = await fetchKpis({ filter: merged });
      setKpis(k);
      const t = await fetchTable({ filter: merged, page, pageSize });
      setRows(t.data || []);
      setTotal(t.total || 0);
    })().catch(console.error);
  }, [merged, page, pageSize]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, display:'flex', gap:24 }}>
        <div>Filtradas: <b>{kpis?.filteredCount ?? '—'}</b></div>
        <div>Conversión: <b>{kpis ? `${kpis.conversionRate}%` : '—'}</b></div>
        <div>Totales: <b>{kpis?.datasetTotal ?? '—'}</b></div>
      </div>

      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <label>Página</label>
        <input type="number" min={1} value={page} onChange={e=>setPage(Number(e.target.value))} style={{ width:64 }} />
        <label>Tamaño</label>
        <input type="number" min={5} max={200} value={pageSize} onChange={e=>setSize(Number(e.target.value))} style={{ width:64 }} />
        <div style={{ marginLeft:'auto' }}>Total: {total}</div>
      </div>

      <div style={{ overflow:'auto', border:'1px solid #e5e7eb', borderRadius:12 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ background:'#f8fafc' }}>
            <tr>{COLS.map(c=>(
              <th key={c} style={{ textAlign:'left', padding:8, borderBottom:'1px solid #e5e7eb' }}>{c}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r._id || i}>
                {COLS.map(c=>(
                  <td key={c} style={{ padding:8, borderTop:'1px solid #f1f5f9' }}>{r[c]}</td>
                ))}
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td colSpan={COLS.length} style={{ padding:24, textAlign:'center', color:'#64748b' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
