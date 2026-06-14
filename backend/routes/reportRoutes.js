const express = require('express');
const router = express.Router();
const { uploadReport, getPatientReports } = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/upload', protect, restrictTo('patient'), uploadReport);
router.get('/patient', protect, getPatientReports);
router.get('/patient/:patientId', protect, restrictTo('doctor', 'admin'), getPatientReports);

module.exports = router;
