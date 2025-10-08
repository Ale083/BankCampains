const { Router } = require('express');
const datosSchema = require('../models/contact');

const router = Router();

function buildMatch(q = {}) {
  const m = {}; //filtro final

  const cats = [
    'job',
    'marital',
    'education',
    'default',
    'housing',
    'loan',
    'contact',
    'month',
    'day_of_week',
    'poutcome',
    'y',
  ];
  for (const k of cats) {
    if (!q[k]) continue // si no está en el query, skip.
    m[k] = String(q[k]).includes(',')
      ? { $in: String(q[k]).split(',').map(s => s.trim()) } //si tiene coma, lo interpreta como lista
      : q[k] //sino, solo lo mete tal cula.
  }

  const ranges = {
    age: ['ageMin','ageMax'],
    duration: ['durationMin','durationMax'],
    campaign: ['campaignMin','campaignMax'],
    pdays: ['pdaysMin','pdaysMax'],
    previous: ['previousMin','previousMax'],
    emp_var_rate: ['empVarRateMin','empVarRateMax'],
    cons_price_idx: ['consPriceIdxMin','consPriceIdxMax'],
    cons_conf_idx: ['consConfIdxMin','consConfIdxMax'],
    euribor3m: ['euribor3mMin','euribor3mMax'],
    nr_employed: ['nrEmployedMin','nrEmployedMax'],
  }

  for (const [field, [minK, maxK]] of Object.entries(ranges)) { //revisa para cada rango si tiene min o max en query.
    const g = q[minK] !== undefined ? Number(q[minK]) : undefined
    const l = q[maxK] !== undefined ? Number(q[maxK]) : undefined
    if (!Number.isNaN(g) || !Number.isNaN(l)) {
      m[field] = {}
      if (!Number.isNaN(g)) m[field].$gte = g
      if (!Number.isNaN(l)) m[field].$lte = l
    }
  }

  return m
}

function ageBucketExpr() {
  return {
    $switch: {
      branches: [
        { case: { $lt: ['$age', 25] }, then: '18-24' },
        { case: { $lt: ['$age', 35] }, then: '25-34' },
        { case: { $lt: ['$age', 45] }, then: '35-44' },
        { case: { $lt: ['$age', 55] }, then: '45-54' },
      ],
      default: '55+',
    },
  };
}

function monthIndexExpr() {
  return {
    $switch: {
      branches: [
        { case: { $eq: ['$month', 'jan'] }, then: 1 },
        { case: { $eq: ['$month', 'feb'] }, then: 2 },
        { case: { $eq: ['$month', 'mar'] }, then: 3 },
        { case: { $eq: ['$month', 'apr'] }, then: 4 },
        { case: { $eq: ['$month', 'may'] }, then: 5 },
        { case: { $eq: ['$month', 'jun'] }, then: 6 },
        { case: { $eq: ['$month', 'jul'] }, then: 7 },
        { case: { $eq: ['$month', 'aug'] }, then: 8 },
        { case: { $eq: ['$month', 'sep'] }, then: 9 },
        { case: { $eq: ['$month', 'oct'] }, then: 10 },
        { case: { $eq: ['$month', 'nov'] }, then: 11 },
        { case: { $eq: ['$month', 'dec'] }, then: 12 },
      ],
      default: 0,
    },
  };
}

const convRateExpr = {
  $cond: [
    { $gt: ['$total', 0] },
    { $multiply: [{ $divide: ['$yes', '$total'] }, 100] },
    0,
  ],
};


//Tasa de conversión
// /kpis/conversion-rate?contact=cellular&month=may
router.get('/conversion-rate', async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const [r] = await Contact.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } }
    ]);
    const total = r?.total ?? 0
    const yes = r?.yes ?? 0;
    res.json({ conversionRate: total ? (yes * 100) / total : 0, total, yes });
  } catch { res.status(500).json({ error: 'Error en tasa de conversión' }); }
});


//Número total de contactos por mes
// /kpis/contacts-by-month?job=technician&ageMin=30&ageMax=50
router.get('/contacts-by-month', async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const out = await Contact.aggregate([
      { $match: match },
      { $addFields: { monthIndex: monthIndexExpr() } },
      { $group: { _id: '$month', total: { $sum: 1 }, sortKey: { $first: '$monthIndex' } } },
      { $project: { _id: 0, month: '$_id', total: 1, sortKey: 1 } },
      { $sort: { sortKey: 1 } }
    ]);
    res.json(out);
  } catch { res.status(500).json({ error: 'Error en contactos por mes' }); }
}); 

//Duración promedio de llamadas
// /kpis/avg-duration?y=yes&durationMax=300
router.get('/avg-duration', async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const [r] = await Contact.aggregate([
      { $match: match },
      { $group: { _id: null, avgDuration: { $avg: '$duration' }, total: { $sum: 1 } } }
    ]);
    res.json({ avgDuration: r?.avgDuration ?? 0, total: r?.total ?? 0 });
  } catch { res.status(500).json({ error: 'Error en duración promedio de llamadas' }); }
}); 

//Tasa de éxito por canal
// /kpis/channel-success?education=university.degree,high.school
router.get('/channel-success', async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const out = await Contact.aggregate([
      { $match: match },
      { $group: {
        _id: '$contact',
        total: { $sum: 1 },
        yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } }
      }},
      { $project: { _id: 0, contact: '$_id', total: 1, yes: 1,
        conversionRate: { $cond: [{ $gt: ['$total',0] }, { $multiply: [{ $divide: ['$yes','$total'] }, 100] }, 0] }
      }},
      { $sort: { contact: 1 } }
    ]);
    res.json(out);
  } catch { res.status(500).json({ error: 'Error en tasa de éxito por canal.' }); }
}); 


module.exports = router;