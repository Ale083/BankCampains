require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const kpiNum = require('./controller/kpis/kpiNum');
const kpiTablas = require('./controller/kpis/kpiTablas');
const uploadCsv = require('./controller/uploads/uploadCsv');
const btw = require('./controller/filters/btw');
const auth = require('./controller/auth/auth');
const savedFiltersRouter = require('./controller/filters/savedFilters');
const contacts = require('./controller/contacts/contacts');
const clearContacts = require('./controller/contacts/clear');
const history = require('./controller/history/history');
const historyRouter = require('./controller/history/history');
const contactsRouter = require('./controller/contacts/contacts');
const modelPredict = require('./controller/model/predict');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/kpis', kpiNum);
app.use('/kpis', kpiTablas);
app.use('/api/uploads', uploadCsv);
app.use('/api/btw', btw);
app.use('/api/auth', auth);
app.use('/api/saved-filters', savedFiltersRouter);
app.use('/api/contacts', contacts);
app.use('/api/contacts', clearContacts);
app.use('/api/history', history);
app.use('/api/history', historyRouter);
app.use('/api/contacts', contactsRouter);


app.post('/api/model/predict', modelPredict.predict);

async function start() {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankcampains';

    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la DB');

    const port = process.env.PORT || 3000;
    app.listen(port, () =>
      console.log(`API corriendo en :${port} ${MONGO_URI}`)
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
