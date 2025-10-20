const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../model/user');

const SEED_EMAIL = process.env.SEED_EMAIL || 'seed@bank.local';
const SEED_NAME  = process.env.SEED_NAME  || 'Usuario Semilla';
const SEED_ROLE  = process.env.SEED_ROLE  || 'admin';

router.get('/session', async (req, res) => {
  try {
    let user = await User.findOne({ email: SEED_EMAIL }).lean();

    if (!user) {
      const created = await User.create({
        email: SEED_EMAIL,
        password: 'dev',  
        nombre: SEED_NAME,
        permisos: SEED_ROLE,
      });
      user = created.toObject();
    }
    res.json({
      ok: true,
      user: { userId: String(user._id), nombre: user.nombre, permisos: user.permisos }
    });
  } catch (err) {
    console.error('GET /api/dev/session error:', err);
    res.status(500).json({ ok: false, error: 'Error interno.' });
  }
});

module.exports = router;
