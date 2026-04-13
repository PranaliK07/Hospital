// server/routes/appointmentRoutes.js
const express = require('express');
const { createAppointment, getAppointments, getAppointmentsByPatient, updateStatus, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createAppointment)
  .get(getAppointments);

router.get('/patient/:id', protect, getAppointmentsByPatient);

router.route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

// Optional explicit status update endpoint
router.put('/:id/status', protect, updateStatus);

module.exports = router;
