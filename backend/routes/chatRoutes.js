const express = require('express');
const router = express.Router();
const { getChatHistory, getChatContacts } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/contacts', protect, getChatContacts);
router.get('/history/:otherUserId', protect, getChatHistory);

module.exports = router;
