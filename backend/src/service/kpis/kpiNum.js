const Contact = require('../../model/contact')
const buildMatch = require('../construirMatchFiltro')
const { conversionRate } = require('./calculadorKpis')
const { redondear } = require('../../utils/utils')

exports.getConversionRate = async (q) => {
  const match = buildMatch(q)
  const [r] = await Contact.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } }
  ])
  const total = r?.total ?? 0
  const yes = r?.yes ?? 0
  return { conversionRate: conversionRate(yes, total) }
}

exports.getAvgDuration = async (q) => {
  const match = buildMatch(q)
  const [r] = await Contact.aggregate([
    { $match: match },
    { $group: { _id: null, avgDuration: { $avg: '$duration' }, total: { $sum: 1 } } }
  ])
  return { avgDuration: redondear(r?.avgDuration ?? 0)}
}
