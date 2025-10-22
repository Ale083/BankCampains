const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['búsqueda', 'descarga', 'export', 'kpi', 'csv', 'excel']
  },
  description: {
    type: String,
    default: ''
  },
  filtersIncluded: {
    type: Array,
    default: []
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  
  filters: {
    type: Object,
    default: {}
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
  notes: {
    type: String,
    default: ''
  }
}, {
  
  strict: false
});


module.exports = mongoose.model('History', historySchema, 'history');