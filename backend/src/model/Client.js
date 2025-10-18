const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  job: String,
  marital: String,
  education: String,
  default: String,
  housing: String,
  loan: String,
  contact: String,
  month: String,
  day_of_week: String,
  poutcome: String,
  y: String,
  age: Number,
  duration: Number,
  campaign: Number,
  pdays: Number,
  previous: Number,
  emp_var_rate: Number,
  cons_price_idx: Number,
  cons_conf_idx: Number,
  euribor3m: Number,
  nr_employed: Number
}, { collection: 'clients' }); 

module.exports = mongoose.model('Client', ClientSchema);
