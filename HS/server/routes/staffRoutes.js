// server/routes/staffRoutes.js
const express = require('express');
const { createStaff, getStaff, deleteStaff, updateStaff } = require('../controllers/staffController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createStaff)
  .get(getStaff); // CORRECTED: Changed getDoctors to getStaff

router.route('/:id')
  .put(protect, updateStaff)
  .delete(protect, deleteStaff);

module.exports = router;
