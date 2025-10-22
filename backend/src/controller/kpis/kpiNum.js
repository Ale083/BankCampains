const { Router } = require('express')
const service = require('../../service/kpis/kpiNum')

const router = Router()

// Tasa de conversión
// /kpis/conversion-rate?...
// { conversionRate: number}
router.get('/conversion-rate', async (req, res) => {
  try { res.json(await service.getConversionRate(req.query)) }
  catch { res.status(500).json({ error: 'Error en tasa de conversión' }) }
})

// Duración promedio de llamadas
// /kpis/avg-duration?...
// { avgDuration: number}
router.get('/avg-duration', async (req, res) => {
  try { res.json(await service.getAvgDuration(req.query)) }
  catch { res.status(500).json({ error: 'Error en duración promedio de llamadas' }) }
})



module.exports = router
