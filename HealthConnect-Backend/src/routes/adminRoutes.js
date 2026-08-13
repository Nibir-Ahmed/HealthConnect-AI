const express = require('express');
const router = express.Router();
const { getDashboardStats, getPendingDoctors, approveDoctor, getAllUsers, deleteUser, deleteBlog } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/doctors/pending', protect, authorize('admin'), getPendingDoctors);
router.put('/doctors/:id/approve', protect, authorize('admin'), approveDoctor);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.delete('/blogs/:id', protect, authorize('admin'), deleteBlog);

module.exports = router;
