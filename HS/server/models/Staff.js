// server/models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'Nurse' }, // e.g., Nurse, Technician, Receptionist
  department: { type: String },
  shift: { type: String, default: 'Day' },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);