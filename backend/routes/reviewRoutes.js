const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { createReview, getDoctorReviews, getDoctorRatingSummary } = require('../controllers/reviewController');

router.post('/', protect, restrictTo('patient'), createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/doctor/:doctorId/summary', getDoctorRatingSummary);

module.exports = router;
