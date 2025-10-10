const Contact = require('../../model/contact')
const buildMatch = require('../construirMatchFiltro')
const { ageBucketExpr, monthIndexExpr, convRateProject } = require('./calculadorKpis')

exports.contactsByMonth = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $addFields: { monthIndex: monthIndexExpr() } },
    { $group: { _id: '$month', total: { $sum: 1 }, sortKey: { $first: '$monthIndex' } } },
    { $project: { _id: 0, month: '$_id', total: 1, sortKey: 1 } },
    { $sort: { sortKey: 1 } },
  ])
}

exports.channelSuccess = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: '$contact', total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { _id: 0, contact: '$_id', total: 1, yes: 1, conversionRate: convRateProject } },
    { $sort: { contact: 1 } },
  ])
}

exports.ageConversion = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: ageBucketExpr(), total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { _id: 0, segment: '$_id', total: 1, yes: 1, conversionRate: convRateProject } },
    { $sort: { segment: 1 } },
  ])
}

exports.poutcomeStacked = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: '$poutcome', total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { _id: 0, poutcome: '$_id', total: 1, yes: 1, no: { $subtract: ['$total','$yes'] }, conversionRate: convRateProject } },
    { $sort: { poutcome: 1 } },
  ])
}

exports.efficiencyLines = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: '$campaign', yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } }, attempts: { $sum: '$campaign' } } },
    { $project: { _id: 0, campaignCount: '$_id', efficiency: { $cond: [{ $gt: ['$attempts',0] }, { $divide: ['$yes','$attempts'] }, 0] } } },
    { $sort: { campaignCount: 1 } },
  ])
}
