const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, createDoctorProfile, setAvailability, updateDoctorProfile, getDoctorProfile } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);
router.get('/:id', protect, getDoctorById);
router.post('/', protect, authorize('doctor'), createDoctorProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.post('/availability', protect, authorize('doctor'), setAvailability);

module.exports = router;
