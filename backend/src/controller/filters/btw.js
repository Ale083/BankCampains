const express = require('express');
const router = express.Router();
const Contact = require('../../model/contact');

const FIELD_TYPE = {
  job: 'str', marital: 'str', education: 'str', default: 'str',
  housing: 'str', loan: 'str', contact: 'str', month: 'str',
  day_of_week: 'str', poutcome: 'str', y: 'str',

  age: 'num', duration: 'num', campaign: 'num', pdays: 'num',
  previous: 'num', emp_var_rate: 'num', cons_price_idx: 'num',
  cons_conf_idx: 'num', euribor3m: 'num', nr_employed: 'num',
  batchId: 'str',
};

function sanitizeFilter(input = {}) {
  const out = {};
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  for (const [field, cond] of Object.entries(input || {})) {
    if (!(field in FIELD_TYPE)) continue;
    if (!cond || typeof cond !== 'object') continue;

    const kind = FIELD_TYPE[field];
    const safe = {};

    if ('$in' in cond) {
      const arr = Array.isArray(cond.$in) ? cond.$in : [cond.$in];
      safe.$in = arr
        .map(v => kind === 'num' ? toNum(v) : String(v))
        .filter(v => kind === 'num' ? Number.isFinite(v) : typeof v === 'string' && v.length);
      if (!safe.$in.length) delete safe.$in;
    }

    if ('$gte' in cond || '$lte' in cond) {
      const gte = kind === 'num' ? toNum(cond.$gte) : cond.$gte;
      const lte = kind === 'num' ? toNum(cond.$lte) : cond.$lte;
      if (gte !== null && gte !== undefined) safe.$gte = gte;
      if (lte !== null && lte !== undefined) safe.$lte = lte;
    }

    if (Object.keys(safe).length) out[field] = safe;
  }
  return out;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize || 20)));
    const fromQS = {};
    const multi = (k) => req.query[k] ? String(req.query[k]).split(',').map(s => s.trim()) : null;
    const range = (base) => {
      const min = req.query[base + 'Min'];
      const max = req.query[base + 'Max'];
      if (min === undefined && max === undefined) return null;
      const c = {};
      if (min !== undefined) c.$gte = Number(min);
      if (max !== undefined) c.$lte = Number(max);
      return c;
    };
    ['job','marital','education','default','housing','loan','contact','month','day_of_week','poutcome','y'].forEach(f=>{
      const arr = multi(f);
      if (arr && arr.length) fromQS[f] = { $in: arr };
    });
    ['age','duration','campaign','pdays','previous','emp_var_rate','cons_price_idx','cons_conf_idx','euribor3m','nr_employed']
      .forEach(f => { const r = range(f); if (r) fromQS[f] = r; });

    const filter = sanitizeFilter(fromQS);
    const [data, total] = await Promise.all([
      Contact.find(filter).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Contact.countDocuments(filter)
    ]);

    res.json({ ok: true, page, pageSize, total, pages: Math.ceil(total / pageSize), data });
  } catch (err) {
    console.error('GET /api/btw error:', err);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});


router.post('/query', async (req, res) => {
  try {
    const { filter = {}, page = 1, pageSize = 20, sort } = req.body || {};
    const safe = sanitizeFilter(filter);
    const p = Math.max(1, Number(page));
    const s = Math.min(200, Math.max(1, Number(pageSize)));
    const sortObj = (sort && sort.field) ? { [sort.field]: sort.dir === 'desc' ? -1 : 1 } : { _id: 1 };

    const [data, total] = await Promise.all([
      Contact.find(safe).sort(sortObj).skip((p - 1) * s).limit(s).lean(),
      Contact.countDocuments(safe)
    ]);

    res.json({ ok: true, page: p, pageSize: s, total, pages: Math.ceil(total / s), data });
  } catch (err) {
    console.error('POST /api/btw/query error:', err);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});


router.post('/kpis', async (req, res) => {
  try {
    const safe = sanitizeFilter(req.body?.filter || {});
    const [agg] = await Contact.aggregate([
      { $match: safe },
      { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } }
    ]);
    const total = agg?.total ?? 0;
    const yes = agg?.yes ?? 0;
    const conversionRate = total ? +(yes * 100 / total).toFixed(2) : 0;
    const datasetTotal = await Contact.estimatedDocumentCount();

    res.json({ ok: true, filteredCount: total, datasetTotal, yes, conversionRate });
  } catch (err) {
    console.error('POST /api/btw/kpis error:', err);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

module.exports = router;
