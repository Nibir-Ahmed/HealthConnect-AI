const express = require('express');
const router = express.Router();
const { triagePatient } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/triage', optionalAuth, triagePatient);

module.exports = router;

