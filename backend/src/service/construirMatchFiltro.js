//TODO: ponerlo en el servicio de filtros
module.exports = function buildMatch(q = {}) {
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
