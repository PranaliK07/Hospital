// server/routes/admissionRoutes.js
const express = require('express');
const { getAdmissions, createAdmission, updateAdmission, dischargeAdmission } = require('../controllers/admissionController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getAdmissions);
router.post('/', protect, createAdmission);
router.put('/:id', protect, updateAdmission);
router.put('/:id/discharge', protect, dischargeAdmission);

module.exports = router;
