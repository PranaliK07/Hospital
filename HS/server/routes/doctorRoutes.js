// server/routes/doctorRoutes.js
const express = require('express');
const { createDoctor, getDoctors, deleteDoctor, updateDoctor } = require('../controllers/doctorController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createDoctor)
  .get(getDoctors);

router.route('/:id')
  .put(protect, updateDoctor)
  .delete(protect, deleteDoctor);

module.exports = router;
