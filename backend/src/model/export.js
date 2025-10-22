const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true,
    enum: ['csv', 'xlsx', 'json']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'ready', 'failed'],
    default: 'pending'
  },
  url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sizeMB: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    }
  },
  requestedBy: {
    type: String,
    default: 'admin'
  },
  filters: {
    type: Object,
    default: {}
  },
  resultCount: {
    type: Number,
    default: 0
  }
}, {
  // Permitir campos adicionales para compatibilidad
  strict: false
});

// Especificar el nombre exacto de la colección existente
module.exports = mongoose.model('Export', exportSchema, 'exports');