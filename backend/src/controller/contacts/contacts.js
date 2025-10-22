const { Router } = require('express');
const Contact = require('../../model/contact');

const router = Router();

// Endpoint to count total contacts
router.get('/count', async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error counting contacts:', error);
    res.status(500).json({ error: 'Error counting contacts', details: error.message });
  }
});

// Endpoint to check if there are any contacts (lighter than count)
router.get('/exists', async (req, res) => {
  try {
    const exists = await Contact.exists({});
    res.json({ exists: !!exists });
  } catch (error) {
    console.error('Error checking contacts existence:', error);
    res.status(500).json({ error: 'Error checking contacts existence', details: error.message });
  }
});

module.exports = router;