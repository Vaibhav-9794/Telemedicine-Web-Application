const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/')
  .post(protect, bookAppointment);

router.get('/patient', protect, restrictTo('patient'), getPatientAppointments);
router.get('/doctor', protect, restrictTo('doctor'), getDoctorAppointments);

router.patch('/:id/status', protect, restrictTo('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
