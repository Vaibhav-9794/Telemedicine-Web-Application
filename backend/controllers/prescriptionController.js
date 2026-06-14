const { Prescription, User, Doctor, Appointment } = require('../config/db');
const { generatePrescriptionPDF } = require('../services/pdfService');

/**
 * Create a new prescription
 * POST /api/prescriptions
 */
const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicineDetails, instructions } = req.body;

    if (!patientId || !appointmentId || !medicineDetails || !Array.isArray(medicineDetails)) {
      return res.status(400).json({ message: 'Missing required prescription details' });
    }

    // Find active doctor profile
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Create prescription record
    const prescription = await Prescription.create({
      doctorId: doctorProfile._id,
      patientId,
      appointmentId,
      medicineDetails,
      instructions: instructions || '',
      date: new Date().toISOString()
    });

    // Automatically complete the associated appointment
    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.status = 'completed';
      await appointment.save();
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Server error creating prescription' });
  }
};

/**
 * Get all prescriptions for the authenticated user
 * GET /api/prescriptions
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const myId = req.user._id;
    const myRole = req.user.role;
    let list = [];

    if (myRole === 'patient') {
      list = await Prescription.find({ patientId: myId }).populate('doctorId').populate('patientId');
    } else if (myRole === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: myId });
      if (doctorProfile) {
        list = await Prescription.find({ doctorId: doctorProfile._id }).populate('doctorId').populate('patientId');
      }
    } else if (myRole === 'admin') {
      list = await Prescription.find({}).populate('doctorId').populate('patientId');
    }

    // Sort by upload date (most recent first)
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(list);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error fetching prescriptions' });
  }
};

/**
 * Download prescription as PDF
 * GET /api/prescriptions/:id/download
 */
const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Fetch details of doctor and patient
    const doctorProfile = await Doctor.findById(prescription.doctorId);
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    const doctorUser = await User.findById(doctorProfile.userId);
    if (!doctorUser) {
      return res.status(404).json({ message: 'Doctor account not found' });
    }

    const patientUser = await User.findById(prescription.patientId);
    if (!patientUser) {
      return res.status(404).json({ message: 'Patient account not found' });
    }

    // Check authorization: only the patient, doctor who prescribed, or admin can download
    const myId = req.user._id;
    const myRole = req.user.role;

    if (myRole === 'patient' && prescription.patientId !== myId) {
      return res.status(403).json({ message: 'Access denied: Unauthorized download' });
    }
    if (myRole === 'doctor' && doctorProfile.userId !== myId) {
      return res.status(403).json({ message: 'Access denied: Unauthorized download' });
    }

    // Generate PDF stream buffer
    const pdfBuffer = await generatePrescriptionPDF(prescription, doctorUser, doctorProfile, patientUser);

    // Set headers to prompt a file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading prescription:', error);
    res.status(500).json({ message: 'Server error generating prescription PDF' });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  downloadPrescriptionPDF
};
