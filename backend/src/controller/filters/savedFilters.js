const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SavedFilter = require('../../model/SavedFilter');

const oid = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
const getUserId = (req) => oid(req.headers['x-user-id'] || req.query.userId || req.body?.userId);

const parse = (s) => { try { return JSON.parse(s); } catch { return {}; } };

router.get('/', async (req, res) => {
  try {
    const userId = getUserId(req); if (!userId) return res.status(400).json({ ok:false, error:'userId inválido' });
    const docs = await SavedFilter.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ ok:true, data: docs.map(d => ({ _id:String(d._id), name:d.name, filter:parse(d.filters), createdAt:d.createdAt, updatedAt:d.updatedAt })) });
  } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'Error interno' }); }
});

router.post('/', async (req, res) => {
  try {
    const userId = getUserId(req); if (!userId) return res.status(400).json({ ok:false, error:'userId inválido' });
    const { name, filter } = req.body || {};
    if (!name || typeof filter !== 'object') return res.status(400).json({ ok:false, error:'name y filter requeridos' });
    const doc = await SavedFilter.create({ name, userId, filters: JSON.stringify(filter), createdAt:new Date() });
    res.json({ ok:true, data: { _id:String(doc._id), name:doc.name, filter, createdAt:doc.createdAt } });
  } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'Error interno' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = getUserId(req); if (!userId) return res.status(400).json({ ok:false, error:'userId inválido' });
    const { id } = req.params; if (!oid(id)) return res.status(400).json({ ok:false, error:'id inválido' });
    const u = { updatedAt:new Date() };
    if (req.body?.name) u.name = String(req.body.name);
    if (req.body?.filter && typeof req.body.filter === 'object') u.filters = JSON.stringify(req.body.filter);
    const doc = await SavedFilter.findOneAndUpdate({ _id:id, userId }, { $set:u }, { new:true }).lean();
    if (!doc) return res.status(404).json({ ok:false, error:'No encontrado' });
    res.json({ ok:true, data: { _id:String(doc._id), name:doc.name, filter:parse(doc.filters), createdAt:doc.createdAt, updatedAt:doc.updatedAt } });
  } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'Error interno' }); }
});


router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserId(req); if (!userId) return res.status(400).json({ ok:false, error:'userId inválido' });
    const { id } = req.params; if (!oid(id)) return res.status(400).json({ ok:false, error:'id inválido' });
    const r = await SavedFilter.deleteOne({ _id:id, userId });
    res.json({ ok:true, deletedCount:r.deletedCount });
  } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'Error interno' }); }
});

module.exports = router;
