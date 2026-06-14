const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  submitContactForm,
  getContactMessages,
  markAsRead,
  deleteContactMessage,
} = require('../controllers/contactController');

// Public — anyone can submit
router.post('/', submitContactForm);

// Admin only — manage messages
router.get('/', protect, restrictTo('admin'), getContactMessages);
router.patch('/:id/read', protect, restrictTo('admin'), markAsRead);
router.delete('/:id', protect, restrictTo('admin'), deleteContactMessage);

module.exports = router;
