require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const kpiNum = require('./controller/kpis/kpiNum');
const kpiTablas = require('./controller/kpis/kpiTablas');
const uploadCsv = require('./controller/uploads/uploadCsv');
const btw = require('./controller/filters/btw');
const devSessionRouter   = require('./controller/auth/devSession');
const savedFiltersRouter = require('./controller/filters/savedFilters');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/kpis', kpiNum);
app.use('/kpis', kpiTablas);
app.use('/api/uploads', uploadCsv);
app.use('/api/btw', btw);
app.use('/api/dev', devSessionRouter);             
app.use('/api/saved-filters', savedFiltersRouter);  

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a la DB');
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`API corriendo en :${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
