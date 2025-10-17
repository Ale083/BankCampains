const { Router } = require('express')
const service = require('../../service/kpis/kpiTablas')

const router = Router()

// Número total de contactos por mes
// /kpis/contacts-by-month?...
// [{ index: number, total: number }]
router.get('/contacts-by-month', async (req, res) => {
  try { res.json(await service.contactsByMonth(req.query)) }
  catch { res.status(500).json({ error: 'Error en número total de contactos' }) }
})

// Tasa de éxito por canal
// /kpis/channel-success?...
// [{ contact: 'cellular'|'telephone', yes: number }]
router.get('/channel-success', async (req, res) => {
  try { res.json(await service.channelSuccess(req.query)) }
  catch { res.status(500).json({ error: 'Error en tasa de éxito por canal' }) }
})

// Conversión por segmento de edad
// /kpis/age-conversion?...
// [{ segment: '18–24'|'25–34'|'35–44'|'45–54'|'55+', total: number, yes: number, conversionRate: number }]
router.get('/age-conversion', async (req, res) => {
  try { res.json(await service.ageConversion(req.query)) }
  catch { res.status(500).json({ error: 'Error en conversión por segmento de edad' }) }
})

// Impacto del historial previo
// /kpis/poutcome-stacked?...
// [{ poutcome: 'failure'|'nonexistent'|'success', yes: number, no: number, total: number, conversionRate: number }]
router.get('/poutcome-stacked', async (req, res) => {
  try { res.json(await service.poutcomeStacked(req.query)) }
  catch { res.status(500).json({ error: 'Error en impacto del historial previo' }) }
})

// Índice de eficiencia por campaña
// /kpis/efficiency-lines?...
// [{ campaignCount: number, efficiency: number }]
router.get('/efficiency-lines', async (req, res) => {
  try { res.json(await service.efficiencyLines(req.query)) }
  catch { res.status(500).json({ error: 'Error en índice de eficiencia por campaña' }) }
})

module.exports = router
