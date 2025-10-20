const mongoose = require('mongoose');

const SavedFilterSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filters:   { type: String, required: true },
  createdAt: { type: Date,   required: true, default: Date.now },
  updatedAt: { type: Date }
}, { collection: 'saved_filters' });

SavedFilterSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedFilter', SavedFilterSchema);
