const Contact = require('../../model/contact')
const buildMatch = require('../construirMatchFiltro')
const { ageBucketExpr, monthIndexExpr } = require('./calculadorKpis')

exports.contactsByMonth = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $addFields: { monthIndex: monthIndexExpr() } },
    { $group: { _id: '$monthIndex', total: { $sum: 1 } } },
    { $project: { _id: 0, index: '$_id', total: 1 } },
    { $sort: { index: 1 } },
  ]);
}

exports.channelSuccess = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: '$contact', total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { _id: 0, contact: '$_id', yes: 1 } },
    { $sort: { contact: 1 } },
  ])
}

exports.ageConversion = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: ageBucketExpr(), total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { 
      _id: 0, 
      segment: '$_id', 
      total: 1, 
      yes: 1, 
      conversionRate: {
        $round: [{
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$yes', '$total'] }, 100] },
            0,
          ]},
        2]
      },
    } },
    { $sort: { segment: 1 } },
  ])
}

exports.poutcomeStacked = async (q) => {
  const match = buildMatch(q)
  return Contact.aggregate([
    { $match: match },
    { $group: { _id: '$poutcome', total: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ['$y','yes'] }, 1, 0] } } } },
    { $project: { _id: 0, poutcome: '$_id', total: 1, yes: 1, no: { $subtract: ['$total','$yes'] } } },
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
