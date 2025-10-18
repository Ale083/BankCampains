const express = require('express');
const router = express.Router();
const Client = require('../../model/Client');


function buildFilter(q) {
  const multi = (key) =>
    q[key] ? String(q[key]).split(',').map(s => s.trim()).filter(Boolean) : null;

  const rng = (base, parser = Number) => {
    const min = q[base + 'Min'] !== undefined ? parser(q[base + 'Min']) : undefined;
    const max = q[base + 'Max'] !== undefined ? parser(q[base + 'Max']) : undefined;
    if (min === undefined && max === undefined) return null;
    const cond = {};
    if (min !== undefined) cond.$gte = min;
    if (max !== undefined) cond.$lte = max;
    return cond;
  };

  const f = {};

  
  [
    'job','marital','education','default','housing','loan',
    'contact','month','day_of_week','poutcome','y'
  ].forEach(k => {
    const v = multi(k);
    if (v && v.length) f[k] = { $in: v };
  });

  
  const map = {
    empVarRate: 'emp_var_rate',
    consPriceIdx: 'cons_price_idx',
    consConfIdx: 'cons_conf_idx',
    euribor3m: 'euribor3m',
    nrEmployed: 'nr_employed',
    age: 'age',
    duration: 'duration',
    campaign: 'campaign',
    pdays: 'pdays',
    previous: 'previous',
  };

  Object.keys(map).forEach(k => {
    const r = rng(k);
    if (r) f[map[k]] = r;
  });

  return f;
}


router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '50', 10), 1), 200);

    const filter = buildFilter(req.query);

    
    //console.log('FILTER /api/btw =>', JSON.stringify(filter, null, 2));

    const cursor = Client.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const [data, total] = await Promise.all([
      cursor.lean(),
      Client.countDocuments(filter)
    ]);

    res.json({ ok: true, page, pageSize, total, pages: Math.ceil(total / pageSize), data });
  } catch (err) {
    console.error('GET /api/btw error:', err);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

module.exports = router;
