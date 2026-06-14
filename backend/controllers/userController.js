const { Doctor } = require('../config/db');

/**
 * Get all doctors with filters (search name, specialization)
 * GET /api/users/doctors
 */
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    // Fetch all doctor profiles and populate user fields (name, email, phone)
    let doctors = await Doctor.find({}).populate('userId');

    // Filter out deactivated accounts
    doctors = doctors.filter(doc => doc.userId && doc.userId.status !== 'inactive');

    // Filter by specialization
    if (specialization && specialization !== 'All') {
      doctors = doctors.filter(doc => 
        doc.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    // Filter by doctor name
    if (search) {
      const queryLower = search.toLowerCase();
      doctors = doctors.filter(doc => 
        doc.userId && doc.userId.name.toLowerCase().includes(queryLower)
      );
    }

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

/**
 * Get doctor profile details by ID
 * GET /api/users/doctors/:id
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor details not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Server error fetching doctor details' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById
};
