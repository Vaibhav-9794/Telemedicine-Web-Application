const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/doctors', protect, getDoctors);
router.get('/doctors/:id', protect, getDoctorById);

module.exports = router;
