const { Appointment, Doctor } = require('../config/db');

/**
 * Book an appointment
 * POST /api/appointments
 */
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Please provide doctorId, date, and time' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      status: 'pending'
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
};

/**
 * Get appointments for logged in patient
 * GET /api/appointments/patient
 */
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId');
    
    // Sort by date/time (most recent first)
    appointments.sort((a, b) => {
      return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    res.status(500).json({ message: 'Server error getting appointments' });
  }
};

/**
 * Get appointments for logged in doctor
 * GET /api/appointments/doctor
 */
const getDoctorAppointments = async (req, res) => {
  try {
    // Find doctor profile ID first
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctorProfile._id }).populate('patientId');
    
    // Sort by date/time (most recent first)
    appointments.sort((a, b) => {
      return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    res.status(500).json({ message: 'Server error getting appointments' });
  }
};

/**
 * Update appointment status (accept, reject, complete)
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile || appointment.doctorId !== doctorProfile._id) {
        return res.status(403).json({ message: 'Access denied: You do not own this appointment' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Unauthorized action' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
};
