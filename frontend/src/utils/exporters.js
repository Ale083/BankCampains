import * as XLSX from 'xlsx';

function timestamp() {
  return new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
}

export function exportRowsToXLSX({ rows, cols, filename, sheetName = 'Datos' }) {
  const safeName = filename || `export_${timestamp()}.xlsx`;
  const aoa = [cols, ...rows.map(r => cols.map(c => r?.[c] ?? ''))];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, safeName); 
}

export function exportRowsToCSV({ rows, cols, filename, delimiter = ',', bom = true }) {
  const safeName = filename || `export_${timestamp()}.csv`;
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    const needsQuotes = s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delimiter);
    const t = s.replace(/"/g, '""');
    return needsQuotes ? `"${t}"` : t;
  };

  const lines = [];
  lines.push(cols.map(esc).join(delimiter));
  for (const r of rows) lines.push(cols.map(c => esc(r?.[c])).join(delimiter));
  const csv = lines.join('\r\n');

  const blob = new Blob([bom ? '\uFEFF' + csv : csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}
