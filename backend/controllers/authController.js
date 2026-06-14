const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Doctor } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'telemedicine_jwt_secret_key_123';
const JWT_EXPIRES_IN = '30d';

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address,
      // NEW personal fields
      profilePhoto, gender, dateOfBirth, city, state, country, postalCode,
      // NEW medical fields
      bloodGroup, height, weight, allergies, chronicDiseases, currentMedications,
      previousSurgeries, familyMedicalHistory,
      // NEW identification
      governmentIdType, governmentIdFile, governmentIdNumber,
      // NEW emergency contact
      emergencyContact,
      // Doctor-specific
      specialization, qualification, experience, consultationFee
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate patientId for patients
    const patientId = role === 'patient' ? `MED-${String(Date.now()).slice(-5)}${Math.floor(Math.random()*10)}` : undefined;

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      address: address || '',
      status: 'active',
      // New fields
      profilePhoto: profilePhoto || null,
      gender: gender || '',
      dateOfBirth: dateOfBirth || '',
      city: city || '', state: state || '', country: country || '', postalCode: postalCode || '',
      patientId: patientId || '',
      isVerified: false,
      bloodGroup: bloodGroup || '',
      height: height || '', weight: weight || '',
      allergies: allergies || [], chronicDiseases: chronicDiseases || [],
      currentMedications: currentMedications || [], previousSurgeries: previousSurgeries || [],
      familyMedicalHistory: familyMedicalHistory || '',
      governmentIdType: governmentIdType || '', governmentIdFile: governmentIdFile || null,
      governmentIdNumber: governmentIdNumber || '',
    });

    // Create emergency contact if provided
    if (emergencyContact && emergencyContact.name) {
      const { EmergencyContact } = require('../config/db');
      await EmergencyContact.create({
        userId: newUser._id,
        name: emergencyContact.name,
        relationship: emergencyContact.relationship || '',
        phone: emergencyContact.phone || '',
      });
    }

    // If role is doctor, create a doctor profile
    if (role === 'doctor') {
      await Doctor.create({
        userId: newUser._id,
        specialization: specialization || 'General Physician',
        experience: experience || 1,
        qualification: qualification || 'MBBS',
        consultationFee: consultationFee || 50,
        rating: 4.8,
        availability: {
          Monday: ['09:00-13:00', '14:00-17:00'],
          Tuesday: ['09:00-13:00', '14:00-17:00'],
          Wednesday: ['09:00-13:00', '14:00-17:00'],
          Thursday: ['09:00-13:00', '14:00-17:00'],
          Friday: ['09:00-13:00', '14:00-17:00']
        }
      });
    }

    // Return response with token (strip password)
    const token = generateToken(newUser._id);
    const userData = { ...newUser };
    delete userData.password;
    res.status(201).json({ ...userData, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _pw, ...userData } = { ...user };
    res.json({
      ...userData,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return all user fields except password
    const { password: _pw, ...response } = { ...user };

    // If doctor, load profile details
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) {
        response.doctorProfile = doctorProfile;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, dateOfBirth, city, state, country,
      postalCode, profilePhoto, bloodGroup, height, weight, allergies,
      chronicDiseases, currentMedications, previousSurgeries,
      familyMedicalHistory, emergencyContact, governmentId,
      doctorProfile } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update User main fields (only if provided)
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (postalCode !== undefined) user.postalCode = postalCode;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (allergies !== undefined) user.allergies = allergies;
    if (chronicDiseases !== undefined) user.chronicDiseases = chronicDiseases;
    if (currentMedications !== undefined) user.currentMedications = currentMedications;
    if (previousSurgeries !== undefined) user.previousSurgeries = previousSurgeries;
    if (familyMedicalHistory !== undefined) user.familyMedicalHistory = familyMedicalHistory;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (governmentId !== undefined) user.governmentId = governmentId;

    await user.save();

    // Build response (all fields except password)
    const { password: _pw, ...response } = { ...user };

    // If user is a doctor, update doctor profile details too
    if (user.role === 'doctor' && doctorProfile) {
      const profile = await Doctor.findOne({ userId: user._id });
      if (profile) {
        profile.specialization = doctorProfile.specialization || profile.specialization;
        profile.experience = doctorProfile.experience !== undefined ? Number(doctorProfile.experience) : profile.experience;
        profile.qualification = doctorProfile.qualification || profile.qualification;
        profile.consultationFee = doctorProfile.consultationFee !== undefined ? Number(doctorProfile.consultationFee) : profile.consultationFee;
        profile.availability = doctorProfile.availability || profile.availability;
        await profile.save();
        response.doctorProfile = profile;
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
