const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { submitVerification, getVerificationStatus, getPendingVerifications, approveVerification, rejectVerification } = require('../controllers/verificationController');

router.post('/submit', protect, restrictTo('doctor'), submitVerification);
router.get('/status', protect, restrictTo('doctor'), getVerificationStatus);
router.get('/pending', protect, restrictTo('admin'), getPendingVerifications);
router.patch('/:id/approve', protect, restrictTo('admin'), approveVerification);
router.patch('/:id/reject', protect, restrictTo('admin'), rejectVerification);

module.exports = router;
