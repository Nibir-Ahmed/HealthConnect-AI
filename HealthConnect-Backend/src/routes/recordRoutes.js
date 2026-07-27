const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  createHealthRecord, 
  getHealthRecords,
  deleteHealthRecord
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');

// Setup multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Health Records
router.post('/ehr', protect, upload.single('file'), createHealthRecord);
router.get('/ehr', protect, getHealthRecords);
router.delete('/ehr/:id', protect, deleteHealthRecord);

// Prescriptions routes removed - see prescriptionRoutes.js

module.exports = router;
