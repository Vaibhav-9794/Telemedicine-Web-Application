const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { setAvailability, getAvailability, blockDate, unblockDate, getAvailableSlots } = require('../controllers/availabilityController');

router.put('/', protect, restrictTo('doctor'), setAvailability);
router.post('/block', protect, restrictTo('doctor'), blockDate);
router.post('/unblock', protect, restrictTo('doctor'), unblockDate);
router.get('/:doctorId', getAvailability);
router.get('/:doctorId/slots', getAvailableSlots);

module.exports = router;
