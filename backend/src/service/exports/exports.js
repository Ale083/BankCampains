const Contact = require('../../model/contact');
const buildMatch = require('../construirMatchFiltro');
const XLSX = require('xlsx');

function contactsProjection() {
  return {
    age: 1,
    job: 1,
    marital: 1,
    education: 1,
    default: 1,
    housing: 1,
    loan: 1,
    contact: 1,
    month: 1,
    day_of_week: 1,
    duration: 1,
    campaign: 1,
    pdays: 1,
    previous: 1,
    poutcome: 1,
    emp_var_rate: 1,
    cons_price_idx: 1,
    cons_conf_idx: 1,
    euribor3m: 1,
    nr_employed: 1,
    y: 1,
    _id: 0,
  };
}

async function queryDataset(type, filters) {
  const match = buildMatch(filters);
  switch (type) {
    case 'contacts':
    default:
      return await Contact.find(match, contactsProjection()).lean();
  }
}

exports.exportCsv = async (type, filters) => {
  const data = await queryDataset(type, filters);
  const rows = data || [];
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [];
  if (headers.length) lines.push(headers.join(';'));
  for (const row of rows) {
    lines.push(headers.map((h) => esc(row[h])).join(';'));
  }
  const csv = lines.join('\n');
  const filename = `${type}-${Date.now()}.csv`;
  return { filename, buffer: csv };
};

exports.exportExcel = async (type, filters) => {
  const data = await queryDataset(type, filters);
  const ws = XLSX.utils.json_to_sheet(data || []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  const filename = `${type}-${Date.now()}.xlsx`;
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return { filename, buffer };
};

