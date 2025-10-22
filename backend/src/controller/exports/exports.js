const { Router } = require('express');
const { exportCsv, exportExcel } = require('../../service/exports/exports');
const exportService = require('../../service/exports/exportService');
const historyService = require('../../service/history/history');

const router = Router();

// GET /api/exports?... - Lista de exports
router.get('/', async (req, res) => {
  try {
    const result = await exportService.list(req.query);
    res.json(result);
  } catch (e) {
    console.error('export list failed', e);
    res.status(500).json({ error: 'export_list_failed' });
  }
});

// DELETE /api/exports/:id - Eliminar export
router.delete('/:id', async (req, res) => {
  try {
    const ok = await exportService.remove(req.params.id);
    res.json({ ok });
  } catch (e) {
    console.error('export delete failed', e);
    res.status(500).json({ error: 'export_delete_failed' });
  }
});

// GET /api/exports/csv?type=...&<filtros>
router.get('/csv', async (req, res) => {
  try {
    const { type = 'contacts' } = req.query;
    const filters = { ...req.query };
    delete filters.type;

    const { filename, buffer } = await exportCsv(type, filters);

    // Guardar en la colección de exports
    const exportItem = await exportService.add({
      fileName: filename,
      format: 'csv',
      status: 'ready',
      url: `/downloads/${filename}`,
      sizeMB: Buffer.byteLength(buffer, 'utf8') / (1024 * 1024),
      filters,
      resultCount: buffer.split('\n').length - 1 // aproximado
    });

    // Guardar en historial
    await historyService.add({
      name: `Export CSV ${type}`,
      type: 'csv',
      filters,
      resultCount: exportItem.resultCount,
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

    // Guardar en la colección de exports
    const exportItem = await exportService.add({
      fileName: filename,
      format: 'xlsx',
      status: 'ready',
      url: `/downloads/${filename}`,
      sizeMB: buffer.length / (1024 * 1024),
      filters,
      resultCount: 0 // se podría calcular desde los datos
    });

    // Guardar en historial
    await historyService.add({
      name: `Export Excel ${type}`,
      type: 'excel',
      filters,
      resultCount: exportItem.resultCount,
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
