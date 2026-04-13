// server/routes/accessRoutes.js
const express = require('express');
const { getMyAccess, getAccessSettings, updateAccessSetting } = require('../controllers/accessController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/my', protect, getMyAccess);
router.get('/', protect, roleMiddleware('Admin'), getAccessSettings);
router.put('/:role', protect, roleMiddleware('Admin'), updateAccessSetting);

module.exports = router;
