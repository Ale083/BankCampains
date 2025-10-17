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

// Rentabilidad proyectada
// /kpis/rentabilidad?G=...&C=...&...
// { profit: number }
router.get('/rentabilidad', async (req, res) => {
  try {
    const G = Number(req.query.G)
    const C = Number(req.query.C)
    if (Number.isNaN(G) || Number.isNaN(C)) {
      return res.status(400).json({ error: 'missing_params', message: 'Usa ?G=...&C=...' })
    }
    res.json(await service.getRentabilidad(req.query, G, C))
  } catch { res.status(500).json({ error: 'rentabilidad_failed' }) }
})

module.exports = router
