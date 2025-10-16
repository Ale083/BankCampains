const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true
  },
  job: {
    type: String,
    required: true
  },
  marital: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  default: {
    type: String,
    required: true
  },
  housing: {
    type: String,
    required: true
  },
  loan: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  day_of_week: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  campaign: {
    type: Number,
    required: true
  },
  pdays: {
    type: Number,
    required: true
  },
  previous: {
    type: Number,
    required: true
  },
  poutcome: {
    type: String,
    required: true
  },
  emp_var_rate: {
    type: Number,
    required: true
  },
  cons_price_idx: {
    type: Number,
    required: true
  },
  cons_conf_idx: {
    type: Number,
    required: true
  },
  euribor3m: {
    type: Number,
    required: true
  },
  nr_employed: {
    type: Number,
    required: true
  },
  y: {
    type: String,
    required: true
  }
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;