// server/models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, default: 0 },
  availability: { type: String, default: 'Mon-Fri' },
  fees: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);