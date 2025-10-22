const express = require('express');
const Contact = require('../../model/contact');

const router = express.Router();

// para que cuando vayamos a carga de datos, siempre se reinicie la collection
router.delete('/clear', async (req, res) => {
  try {
    await Contact.deleteMany({});
    res.json({ message: 'Contactos eliminados', cleared: true });
  } catch (error) {
    console.error('Error clearing contacts:', error);
    res.status(500).json({ 
      error: 'Error eliminando contactos',
      details: error.message 
    });
  }
});

module.exports = router;
