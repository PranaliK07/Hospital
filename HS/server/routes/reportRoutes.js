// server/routes/reportRoutes.js
const express = require('express');
const {
  getSummary,
  getPatientStatusReport,
  getPatientDetailReport,
  getDoctorReport,
  getDoctorDetailReport,
  getBillingReport,
  getBillingDetailReport,
  getAppointmentReport,
  getAppointmentDetailReport,
  getStaffReport,
  getStaffDetailReport,
} = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/summary', protect, getSummary);
router.get('/patients', protect, getPatientStatusReport);
router.get('/patients/:id', protect, getPatientDetailReport);
router.get('/patient/:id', protect, getPatientDetailReport);
router.get('/doctors', protect, getDoctorReport);
router.get('/doctors/:id', protect, getDoctorDetailReport);
router.get('/billing', protect, getBillingReport);
router.get('/billing/:id', protect, getBillingDetailReport);
router.get('/appointments', protect, getAppointmentReport);
router.get('/appointments/:id', protect, getAppointmentDetailReport);
router.get('/staff', protect, getStaffReport);
router.get('/staff/:id', protect, getStaffDetailReport);

module.exports = router;
