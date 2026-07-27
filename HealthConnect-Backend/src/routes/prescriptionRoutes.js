const express = require('express');
const router = express.Router();
const { 
  createPrescription, 
  getPatientPrescriptions, 
  getPrescriptionById 
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('doctor'), createPrescription);
router.get('/patient', protect, authorize('patient'), getPatientPrescriptions);
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
