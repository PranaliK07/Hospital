// server/models/Admission.js
const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  roomType: {
    type: String,
    enum: ['General', 'Semi-Private', 'Private', 'ICU'],
    required: true,
  },
  roomNumber: { type: String, required: true },
  bedNumber: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  notes: { type: String },
  status: { type: String, enum: ['active', 'discharged'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
