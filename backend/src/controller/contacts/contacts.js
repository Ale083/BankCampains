const { Router } = require('express');
const Contact = require('../../model/contact');

const router = Router();


router.get('/count', async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error counting contacts:', error);
    res.status(500).json({ error: 'Error counting contacts', details: error.message });
  }
});


router.get('/exists', async (req, res) => {
  try {
    const exists = await Contact.exists({});
    res.json({ exists: !!exists });
  } catch (error) {
    console.error('Error checking contacts existence:', error);
    res.status(500).json({ error: 'Error checking contacts existence', details: error.message });
  }
});


router.get('/list', async (req, res) => {
  try {
    const contacts = await Contact.find({}).lean();
    res.json({ 
      ok: true, 
      data: contacts,
      count: contacts.length 
    });
  } catch (error) {
    console.error('Error listing contacts:', error);
    res.status(500).json({ error: 'Error listing contacts', details: error.message });
  }
});

module.exports = router;