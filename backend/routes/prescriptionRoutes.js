const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPatientPrescriptions,
  downloadPrescriptionPDF
} = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/')
  .post(protect, restrictTo('doctor'), createPrescription)
  .get(protect, getPatientPrescriptions);

router.get('/:id/download', protect, downloadPrescriptionPDF);

module.exports = router;
