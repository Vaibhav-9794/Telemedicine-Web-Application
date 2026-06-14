const { Availability, Appointment } = require('../config/db');

exports.setAvailability = async (req, res) => {
  try {
    const { weeklySchedule, slotDuration } = req.body;
    if (!weeklySchedule) return res.status(400).json({ message: 'Weekly schedule is required' });
    
    // Check if availability record exists for this doctor
    const existing = await Availability.findOne({ doctorId: req.user._id });
    
    if (existing) {
      await Availability.findByIdAndUpdate(existing._id, {
        weeklySchedule,
        slotDuration: slotDuration || 30,
        updatedAt: new Date().toISOString()
      });
    } else {
      await Availability.create({
        doctorId: req.user._id,
        weeklySchedule,
        slotDuration: slotDuration || 30,
        blockedDates: [],
        createdAt: new Date().toISOString()
      });
    }
    
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availability = await Availability.findOne({ doctorId });
    res.json(availability || { weeklySchedule: {}, blockedDates: [], slotDuration: 30 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });
    
    const availability = await Availability.findOne({ doctorId: req.user._id });
    if (!availability) return res.status(404).json({ message: 'Set your weekly schedule first' });
    
    const blockedDates = availability.blockedDates || [];
    if (!blockedDates.find(d => d.date === date)) {
      blockedDates.push({ date, reason: reason || '' });
      await Availability.findByIdAndUpdate(availability._id, { blockedDates });
    }
    
    res.json({ message: 'Date blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unblockDate = async (req, res) => {
  try {
    const { date } = req.body;
    const availability = await Availability.findOne({ doctorId: req.user._id });
    if (!availability) return res.status(404).json({ message: 'No availability found' });
    
    const blockedDates = (availability.blockedDates || []).filter(d => d.date !== date);
    await Availability.findByIdAndUpdate(availability._id, { blockedDates });
    
    res.json({ message: 'Date unblocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });
    
    const availability = await Availability.findOne({ doctorId });
    if (!availability) return res.json({ slots: [] });
    
    // Check if date is blocked
    const isBlocked = (availability.blockedDates || []).some(d => d.date === date);
    if (isBlocked) return res.json({ slots: [], blocked: true });
    
    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const daySlots = availability.weeklySchedule[dayOfWeek] || [];
    
    // Get booked appointments for this date
    const appointments = await Appointment.find({ doctorId, date, status: { $ne: 'rejected' } });
    const bookedTimes = appointments.map(a => a.time);
    
    // Filter out booked slots
    const availableSlots = daySlots.filter(slot => !bookedTimes.includes(slot));
    
    res.json({ slots: availableSlots, blocked: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
