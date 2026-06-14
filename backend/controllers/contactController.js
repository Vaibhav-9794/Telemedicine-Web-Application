const { ContactMessage } = require('../config/db');
const { sendContactNotification, sendContactConfirmation } = require('../services/emailService');

// Simple in-memory rate limiting (IP -> { count, resetTime })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max 5 submissions per window

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Submit a contact form message
 * POST /api/contact
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ message: 'Message must be at least 10 characters long' });
    }
    if (message.trim().length > 5000) {
      return res.status(400).json({ message: 'Message must be under 5000 characters' });
    }

    // Honeypot spam check (if frontend sends a hidden field)
    if (req.body.website) {
      // Bot filled the honeypot field — silently accept but don't process
      return res.status(200).json({ message: 'Message sent successfully' });
    }

    // Rate limiting
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ message: 'Too many messages. Please try again in 15 minutes.' });
    }

    const submittedAt = new Date().toISOString();

    // Save to database
    const contactMsg = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt,
      status: 'unread', // unread, read, replied
      ipAddress: clientIp,
    });

    // Send emails (non-blocking — don't fail the request if email fails)
    const emailData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      date: submittedAt,
    };

    // Fire and forget — log errors but don't block response
    Promise.all([
      sendContactNotification(emailData),
      sendContactConfirmation(emailData),
    ]).catch(err => {
      console.error('Email sending failed (non-blocking):', err.message);
    });

    res.status(201).json({
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
      id: contactMsg._id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to submit message. Please try again later.' });
  }
};

/**
 * Get all contact messages (admin only)
 * GET /api/contact
 */
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

/**
 * Mark a message as read
 * PATCH /api/contact/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    msg.status = 'read';
    await msg.save();
    res.json({ message: 'Marked as read', data: msg });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message status' });
  }
};

/**
 * Delete a contact message
 * DELETE /api/contact/:id
 */
exports.deleteContactMessage = async (req, res) => {
  try {
    const result = await ContactMessage.deleteOne({ _id: req.params.id });
    if (!result) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};
