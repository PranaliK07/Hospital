// server/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Revenue", "PatientStats"
  generatedAt: { type: Date, default: Date.now },
  data: { type: Object } // Store JSON data of the report
});

module.exports = mongoose.model('Report', reportSchema);