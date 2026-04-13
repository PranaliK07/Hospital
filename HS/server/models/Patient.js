// server/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String },
  address: { type: String },
  medicalHistory: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
