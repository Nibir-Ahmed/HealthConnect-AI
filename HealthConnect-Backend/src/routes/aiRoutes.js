const express = require('express');
const router = express.Router();
const { triagePatient } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/triage', protect, triagePatient);

module.exports = router;
