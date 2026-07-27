const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getPatientAppointments, 
  getDoctorAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), createAppointment);
router.get('/patient', protect, authorize('patient'), getPatientAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
