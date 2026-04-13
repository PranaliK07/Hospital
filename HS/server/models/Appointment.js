// server/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'admitted', 'completed', 'discharged', 'canceled'], 
    default: 'scheduled' 
  },
  visitType: { type: String, enum: ['OPD', 'IPD', 'Emergency'], default: 'OPD' },
  symptoms: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
