const { Router } = require('express');
const { exportCsv, exportExcel } = require('../../service/exports/exports');
const historyService = require('../../service/history/history');

const router = Router();

// GET /api/exports/csv?type=...&<filtros>
router.get('/csv', async (req, res) => {
  try {
    const { type = 'contacts' } = req.query;
    const filters = { ...req.query };
    delete filters.type;

    const { filename, buffer } = await exportCsv(type, filters);

    // store in history
    await historyService.add({
      name: `Export CSV ${type}`,
      type: 'csv',
      filters,
      resultCount: undefined,
      notes: 'Exportación CSV desde Historial/Centro de Descargas'
    });

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(buffer);
  } catch (e) {
    console.error('export csv failed', e);
    res.status(500).json({ error: 'export_failed' });
  }
});

// GET /api/exports/excel?type=...&<filtros>
router.get('/excel', async (req, res) => {
  try {
    const { type = 'contacts' } = req.query;
    const filters = { ...req.query };
    delete filters.type;

    const { filename, buffer } = await exportExcel(type, filters);

    await historyService.add({
      name: `Export Excel ${type}`,
      type: 'excel',
      filters,
      resultCount: undefined,
      notes: 'Exportación Excel desde Historial/Centro de Descargas'
    });

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (e) {
    console.error('export excel failed', e);
    res.status(500).json({ error: 'export_failed' });
  }
});

module.exports = router;
