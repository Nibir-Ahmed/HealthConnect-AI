const express = require('express');
const router = express.Router();
const { getDashboardStats, getPendingDoctors, approveDoctor, getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/doctors/pending', protect, authorize('admin'), getPendingDoctors);
router.put('/doctors/:id/approve', protect, authorize('admin'), approveDoctor);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
