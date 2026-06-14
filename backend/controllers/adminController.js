const { User, Doctor, Appointment } = require('../config/db');

/**
 * Get dashboard metrics and analytics
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Single pass over users
    const allUsers = await User.find({});
    const userStats = allUsers.reduce((acc, u) => {
      if (u.role === 'patient') acc.patients++;
      if (u.role === 'doctor') acc.doctors++;
      return acc;
    }, { patients: 0, doctors: 0 });

    // Single pass over appointments
    const allAppointments = await Appointment.find({});
    const apptStats = allAppointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      acc.total++;
      return acc;
    }, { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 });

    // Calculate total revenue from completed appointments
    let totalRevenue = 0;
    const completedAppts = allAppointments.filter(a => a.status === 'completed');
    for (const appt of completedAppts) {
      const doctor = await Doctor.findById(appt.doctorId);
      if (doctor) {
        totalRevenue += doctor.consultationFee || 0;
      }
    }

    res.json({
      metrics: {
        totalPatients: userStats.patients,
        totalDoctors: userStats.doctors,
        totalAppointments: apptStats.total,
        totalRevenue
      },
      statusBreakdown: {
        pending: apptStats.pending,
        accepted: apptStats.accepted,
        completed: apptStats.completed,
        rejected: apptStats.rejected
      }
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

/**
 * Get all users registered in the platform
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const usersList = [];

    // Construct profile objects and link doctor profile details if role is doctor
    for (const user of users) {
      const userObj = { ...user };
      delete userObj.password;

      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId: user._id });
        if (doctorProfile) {
          userObj.doctorProfile = doctorProfile;
        }
      }
      usersList.push(userObj);
    }

    res.json(usersList);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Server error listing users' });
  }
};

/**
 * Toggle user account status (active vs inactive)
 * PATCH /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'inactive'
    const targetUserId = req.params.id;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    if (targetUserId === req.user._id) {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account!' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User account has been successfully set to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

/**
 * Get all appointments in the system
 * GET /api/admin/appointments
 */
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).populate('patientId').populate('doctorId');
    
    // Sort by date/time (most recent first)
    appointments.sort((a, b) => {
      return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error listing all appointments:', error);
    res.status(500).json({ message: 'Server error listing appointments' });
  }
};

/**
 * Verify or unverify a user's document
 * PATCH /api/admin/users/:id/verify
 */
const verifyUserDocument = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { verified } = req.body;
    user.isVerified = verified === true;
    await user.save();
    const userData = { ...user };
    delete userData.password;
    res.json({ message: `User ${verified ? 'verified' : 'unverified'} successfully`, user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Verification update failed', error: error.message });
  }
};

/**
 * Get detailed user information including emergency contact, doctor profile, and stats
 * GET /api/admin/users/:id/details
 */
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userData = { ...user };
    delete userData.password;
    
    const { EmergencyContact } = require('../config/db');
    const emergencyContact = await EmergencyContact.findOne({ userId: user._id });
    
    let doctorProfile = null;
    if (user.role === 'doctor') {
      const { Doctor } = require('../config/db');
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }
    
    const { Appointment: Appt, Prescription, MedicalReport } = require('../config/db');
    const appointments = await Appt.find({ patientId: user._id });
    const prescriptions = await Prescription.find({ patientId: user._id });
    const reports = await MedicalReport.find({ patientId: user._id });
    
    res.json({
      ...userData,
      emergencyContact: emergencyContact || null,
      doctorProfile,
      stats: {
        totalAppointments: appointments.length,
        totalPrescriptions: prescriptions.length,
        totalReports: reports.length,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllAppointments,
  verifyUserDocument,
  getUserDetails
};
