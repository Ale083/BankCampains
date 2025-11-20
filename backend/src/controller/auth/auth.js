const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../model/user');

const SEED_EMAIL = process.env.SEED_EMAIL || 'seed@bank.local';
const SEED_NAME  = process.env.SEED_NAME  || 'Usuario Semilla';
const SEED_ROLE  = process.env.SEED_ROLE  || 'admin';

router.get('/login', async (req, res) => {
  const { email, password } = req.query;

  try {
    const user = await User.findOne({ email, password }).lean();
    if(!user) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' });
    } else {
      res.json({
      ok: true,
      user: { userId: String(user._id), nombre: user.nombre, permisos: user.permisos }
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Error interno.' });
  }
});

module.exports = router;
