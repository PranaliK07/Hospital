// server/routes/billingRoutes.js
const express = require('express');
const { createBill, getBills, updateBill, deleteBill } = require('../controllers/billingController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, createBill)
  .get(getBills);

router.route('/:id')
  .put(protect, updateBill)
  .delete(protect, deleteBill);

module.exports = router;
