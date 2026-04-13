// server/models/AccessSetting.js
const mongoose = require('mongoose');

const accessSettingSchema = new mongoose.Schema({
  role: { type: String, enum: ['Admin', 'Doctor', 'Staff', 'Receptionist', 'Patient'], unique: true, required: true },
  allowedRoutes: [{ type: String }]
});

module.exports = mongoose.model('AccessSetting', accessSettingSchema);
