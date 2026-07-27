const express = require('express');
const router = express.Router();
const { getChatHistory, sendMessage, markAsRead, getInbox } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/inbox', protect, getInbox);
router.get('/:partnerId', protect, getChatHistory);
router.put('/read/:partnerId', protect, markAsRead);
router.post('/send', protect, sendMessage);

module.exports = router;
