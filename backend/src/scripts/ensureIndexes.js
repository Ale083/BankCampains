require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('../model/contact');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Contact.collection.createIndexes([
      { key: { y: 1 } },
      { key: { contact: 1 } },
      { key: { job: 1 } },
      { key: { marital: 1 } },
      { key: { education: 1 } },
      { key: { month: 1 } },
      { key: { day_of_week: 1 } },

      { key: { age: 1 } },
      { key: { duration: 1 } },
      { key: { campaign: 1 } },
      { key: { pdays: 1 } },
      { key: { previous: 1 } },
      { key: { emp_var_rate: 1 } },
      { key: { cons_price_idx: 1 } },
      { key: { cons_conf_idx: 1 } },
      { key: { euribor3m: 1 } },
      { key: { nr_employed: 1 } },
    ]);

    console.log('Índices OK');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
