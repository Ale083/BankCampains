const { Router } = require('express');
const historyService = require('../../service/history/history');

const router = Router();


router.get('/', async (req, res) => {
  try {
    const r = await historyService.list(req.query);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: 'history_list_failed' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const item = await historyService.add(req.body);
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: 'history_add_failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await historyService.remove(req.params.id);
    res.json({ ok });
  } catch (e) {
    res.status(500).json({ error: 'history_delete_failed' });
  }
});

router.post('/retry', async (req, res) => {
  try {
    const { ids } = req.body || {};
    const r = await historyService.retry(ids || []);
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: 'history_retry_failed' });
  }
});

module.exports = router;
