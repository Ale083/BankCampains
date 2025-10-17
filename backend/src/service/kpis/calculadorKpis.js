const { redondear } = require("../../utils/utils")

exports.conversionRate = (yes, total) => redondear(total ? (yes * 100) / total : 0)

exports.rentabilidad = (yes, total, G, C) => yes * G - total * C

exports.ageBucketExpr = () => ({
  $switch: {
    branches: [
      { case: { $lt: ['$age', 25] }, then: '18–24' },
      { case: { $lt: ['$age', 35] }, then: '25–34' },
      { case: { $lt: ['$age', 45] }, then: '35–44' },
      { case: { $lt: ['$age', 55] }, then: '45–54' },
    ],
    default: '55+',
  },
})

exports.monthIndexExpr = () => ({
  $switch: {
    branches: [
      { case: { $eq: ['$month','jan'] }, then: 1 },
      { case: { $eq: ['$month','feb'] }, then: 2 },
      { case: { $eq: ['$month','mar'] }, then: 3 },
      { case: { $eq: ['$month','apr'] }, then: 4 },
      { case: { $eq: ['$month','may'] }, then: 5 },
      { case: { $eq: ['$month','jun'] }, then: 6 },
      { case: { $eq: ['$month','jul'] }, then: 7 },
      { case: { $eq: ['$month','aug'] }, then: 8 },
      { case: { $eq: ['$month','sep'] }, then: 9 },
      { case: { $eq: ['$month','oct'] }, then: 10 },
      { case: { $eq: ['$month','nov'] }, then: 11 },
      { case: { $eq: ['$month','dec'] }, then: 12 },
    ],
    default: 0,
  },
})


