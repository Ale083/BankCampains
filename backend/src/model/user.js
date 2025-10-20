const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email:     { type: String, required: true, index: true, unique: true },
  password:  { type: String, required: true },              
  nombre:    { type: String, required: true },
  permisos:  { type: String, enum: ['admin','analista','lector'], required: true },
}, {
  collection: 'usuario',   
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
