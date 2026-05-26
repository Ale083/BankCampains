import { apiFetch } from './client';

export async function postJSON(path, body) {
  const r = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export function toQueryString(filter) {
  const params = new URLSearchParams();
  const numFields = ['age','duration','campaign','pdays','previous','emp_var_rate','cons_price_idx','cons_conf_idx','euribor3m','nr_employed'];
  const catFields = ['job','marital','education','default','housing','loan','contact','month','day_of_week','poutcome','y'];

  for (const f of catFields) {
    const c = filter?.[f];
    if (c?.$in?.length) params.set(f, c.$in.join(','));
  }
  for (const f of numFields) {
    const c = filter?.[f] || {};
    if (c.$gte !== undefined) params.set(`${f}Min`, String(c.$gte));
    if (c.$lte !== undefined) params.set(`${f}Max`, String(c.$lte));
  }
  return params.toString();
}

export function parseQueryString(qs) {
  const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  const numFields = ['age','duration','campaign','pdays','previous','emp_var_rate','cons_price_idx','cons_conf_idx','euribor3m','nr_employed'];
  const catFields = ['job','marital','education','default','housing','loan','contact','month','day_of_week','poutcome','y'];

  const filter = {};
  // Categóricos: job=a,b,c
  for (const f of catFields) {
    const raw = params.get(f);
    if (raw) {
      const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) filter[f] = { $in: arr };
    }
  }
  // Numéricos: ageMin, ageMax, etc.
  for (const f of numFields) {
    const min = params.get(`${f}Min`);
    const max = params.get(`${f}Max`);
    const cond = {};
    if (min !== null) cond.$gte = Number(min);
    if (max !== null) cond.$lte = Number(max);
    if (Object.keys(cond).length) filter[f] = cond;
  }
  return filter;
}


export async function fetchTable({ filter, page = 1, pageSize = 25, sort }) {
  return postJSON('/api/btw/query', { filter, page, pageSize, sort });
}

export async function fetchKpis({ filter }) {
  return postJSON('/api/btw/kpis', { filter });
}
