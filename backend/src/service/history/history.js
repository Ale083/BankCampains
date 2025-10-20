// Simple in-memory history. For production, persist to DB.
const items = [];
let seq = 1;

exports.add = async ({ name = 'Consulta', type = 'kpi', filters = {}, resultCount = 0, notes = '' }) => {
  const id = String(seq++);
  const now = new Date();
  const item = {
    id,
    name,
    type,
    status: 'success',
    createdAt: now.toISOString(),
    filters,
    resultCount,
    sizeMB: 0,
    expiresAt: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
    notes,
    requestedBy: 'admin',
  };
  items.unshift(item);
  return item;
};

exports.list = async (q = {}) => {
  let result = items.slice();
  // Filters: status, type, requestedBy, from, to
  if (q.status) {
    const set = new Set(String(q.status).split(',').map((s) => s.trim().toLowerCase()));
    result = result.filter((i) => set.has(String(i.status).toLowerCase()));
  }
  if (q.type) {
    const set = new Set(String(q.type).split(',').map((s) => s.trim().toLowerCase()));
    result = result.filter((i) => set.has(String(i.type).toLowerCase()));
  }
  if (q.requestedBy) {
    const set = new Set(String(q.requestedBy).split(',').map((s) => s.trim().toLowerCase()));
    result = result.filter((i) => set.has(String(i.requestedBy || '').toLowerCase()));
  }
  if (q.from || q.to) {
    const from = q.from ? new Date(q.from).getTime() : Number.NEGATIVE_INFINITY;
    const to = q.to ? new Date(q.to).getTime() : Number.POSITIVE_INFINITY;
    result = result.filter((i) => {
      const t = new Date(i.createdAt).getTime();
      return t >= from && t <= to;
    });
  }
  return { items: result };
};

exports.remove = async (id) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) items.splice(idx, 1);
  return true;
};

exports.retry = async (ids = []) => {
  const created = [];
  for (const id of ids) {
    const src = items.find((i) => i.id === id);
    if (!src) continue;
    const n = await exports.add({
      name: `Retry ${src.name}`,
      type: src.type,
      filters: src.filters,
      resultCount: src.resultCount,
      notes: src.notes,
    });
    created.push(n);
  }
  return { created };
};
