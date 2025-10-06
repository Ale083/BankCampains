const { Router } = require('express');
const kpis = require('./kpis');

const router = Router();

router.use('/kpis', kpis);

module.exports = router;
