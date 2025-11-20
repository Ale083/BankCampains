const express = require('express');
const router = express.Router();
const User = require('../../model/user');


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

router.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    await User.create({
      nombre,
      email,
      password,
      permisos: rol
    });

    return res.status(201).json({
      ok: true
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    return res.status(500).json({
      ok: false
    });
  }
});

module.exports = router;
