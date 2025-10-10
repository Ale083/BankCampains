const Contact = require('../../model/contact')
const buildMatch = require('../construirMatchFiltro')
const { conversionRate, rentabilidad } = require('./calculadorKpis')

exports.getConversionRate = async (q) => {
  const match = buildMatch(q)
  const [r] = await Contact.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } }
  ])
  const total = r?.total ?? 0
  const yes = r?.yes ?? 0
  return { conversionRate: conversionRate(yes, total), total, yes }
}

exports.getAvgDuration = async (q) => {
  const match = buildMatch(q)
  const [r] = await Contact.aggregate([
    { $match: match },
    { $group: { _id: null, avgDuration: { $avg: '$duration' }, total: { $sum: 1 } } }
  ])
  return { avgDuration: r?.avgDuration ?? 0, total: r?.total ?? 0 }
}

exports.getRentabilidad = async (q, G, C) => {
  const match = buildMatch(q)
  const [r] = await Contact.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } }
  ])
  const total = r?.total ?? 0
  const yes = r?.yes ?? 0
  return {
    profit: rentabilidad(yes, total, G, C),
    accepted: yes,
    total,
    conversionRate: conversionRate(yes, total),
    G, C
  }
}
