// server/routes/patientRoutes.js
const express = require('express');
const { createPatient, getPatients, deletePatient, updatePatient } = require('../controllers/patientController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createPatient)
  .get(getPatients);

router.route('/:id')
  .put(protect, updatePatient)
  .delete(protect, deletePatient);

module.exports = router;
