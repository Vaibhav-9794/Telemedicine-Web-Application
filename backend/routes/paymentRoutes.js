const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPayment, getPatientPayments, getPaymentInvoice } = require('../controllers/paymentController');

router.post('/', protect, createPayment);
router.get('/patient', protect, getPatientPayments);
router.get('/:id/invoice', protect, getPaymentInvoice);

module.exports = router;
