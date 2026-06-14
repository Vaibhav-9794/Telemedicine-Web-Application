const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, PasswordReset } = require('../config/db');
const { sendPasswordResetEmail } = require('../services/emailService');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    
    await PasswordReset.create({ email: email.toLowerCase(), token, expiresAt, used: false });
    
    // Build reset URL
    const resetUrl = `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    try {
      await sendPasswordResetEmail(email, resetUrl, user.name);
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }
    
    res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    
    const resetRecord = await PasswordReset.findOne({ token, used: false });
    if (!resetRecord) return res.status(400).json({ message: 'Invalid or expired reset link' });
    if (new Date(resetRecord.expiresAt) < new Date()) return res.status(400).json({ message: 'Reset link has expired' });
    
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    // Mark token as used
    await PasswordReset.findByIdAndUpdate(resetRecord._id, { used: true });
    
    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
