const { User, Doctor } = require('../config/db');

exports.submitVerification = async (req, res) => {
  try {
    const { licenseNumber, registrationNumber, degreeInfo, specialization } = req.body;
    if (!licenseNumber || !registrationNumber) {
      return res.status(400).json({ message: 'License and registration numbers are required' });
    }
    
    await User.findByIdAndUpdate(req.user._id, {
      verificationStatus: 'pending',
      verificationDocuments: {
        licenseNumber,
        registrationNumber,
        degreeInfo: degreeInfo || '',
        specialization: specialization || '',
        submittedAt: new Date().toISOString()
      }
    });
    
    res.json({ message: 'Verification documents submitted successfully. Awaiting admin approval.' });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      status: user.verificationStatus || 'not_submitted',
      documents: user.verificationDocuments || null,
      rejectionReason: user.verificationReason || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending', role: 'doctor' });
    res.json(users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      verificationDocuments: u.verificationDocuments,
      verificationStatus: u.verificationStatus,
      createdAt: u.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { verificationStatus: 'approved', isVerified: true });
    res.json({ message: 'Doctor verification approved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await User.findByIdAndUpdate(id, {
      verificationStatus: 'rejected',
      verificationReason: reason || 'Documents did not meet requirements',
      isVerified: false
    });
    res.json({ message: 'Doctor verification rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
