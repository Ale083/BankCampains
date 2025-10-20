export function mergeFiltersAND(filters = []) {
  const out = {};
  for (const f of filters.filter(Boolean)) {
    for (const [field, cond] of Object.entries(f || {})) {
      if (!out[field]) out[field] = {};

      if (cond.$in) {
        const incoming = Array.isArray(cond.$in) ? cond.$in : [cond.$in];
        const cur = out[field].$in;
        out[field].$in = cur ? cur.filter(v => incoming.includes(v)) : [...incoming];
      }

      if (cond.$gte !== undefined) {
        out[field].$gte = out[field].$gte !== undefined
          ? Math.max(out[field].$gte, cond.$gte)
          : cond.$gte;
      }
      if (cond.$lte !== undefined) {
        out[field].$lte = out[field].$lte !== undefined
          ? Math.min(out[field].$lte, cond.$lte)
          : cond.$lte;
      }
    }
  }

  for (const [k, v] of Object.entries(out)) {
    if (v.$in && v.$in.length === 0) delete out[k].$in;
    if (v.$gte !== undefined && v.$lte !== undefined && v.$gte > v.$lte) delete out[k];
    if (Object.keys(out[k] || {}).length === 0) delete out[k];
  }
  return out;
}

const KEY = 'presets_v1';
const storage = typeof window !== 'undefined' && window.sessionStorage
  ? window.sessionStorage
  : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const genId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function listPresets() {
  try { return JSON.parse(storage.getItem(KEY)) || []; } catch { return []; }
}

export function savePreset({ name, filter }) {
  const all = listPresets();
  const id = genId();
  all.push({ id, name, filter, createdAt: Date.now() });
  storage.setItem(KEY, JSON.stringify(all));
  return id;
}

export function deletePreset(id) {
  const all = listPresets().filter(p => p.id !== id);
  storage.setItem(KEY, JSON.stringify(all));
}

export function clearPresets() {
  storage.removeItem(KEY);
}

export function writeQSForDashboard(filter = {}, { persist = false } = {}) {
  if (!persist) {
    try { localStorage.removeItem('filters'); } catch {}
    return '';
  }
  const params = new URLSearchParams();
  for (const [field, cond] of Object.entries(filter || {})) {
    if (cond?.$in?.length) params.set(field, cond.$in.join(','));
    if (cond?.$gte !== undefined) params.set(`${field}Min`, String(cond.$gte));
    if (cond?.$lte !== undefined) params.set(`${field}Max`, String(cond.$lte));
  }
  const qs = params.toString();
  try { localStorage.setItem('filters', qs); } catch {}
  return qs;
}
