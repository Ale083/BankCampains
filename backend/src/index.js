require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/', routes);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'bank_campaigns' });
    console.log('Conectado a la DB');

    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`API corriendo en :${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
