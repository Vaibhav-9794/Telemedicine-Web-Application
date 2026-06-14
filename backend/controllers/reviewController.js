const { Review, Appointment, User, Doctor } = require('../config/db');

exports.createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    if (!doctorId || !rating) return res.status(400).json({ message: 'Doctor and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    
    // Verify appointment exists and is completed
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.status !== 'completed') {
        return res.status(400).json({ message: 'You can only review after a completed appointment' });
      }
      if (appointment.patientId !== req.user._id) {
        return res.status(403).json({ message: 'You can only review your own appointments' });
      }
    }
    
    // Prevent duplicate reviews per appointment
    if (appointmentId) {
      const existing = await Review.findOne({ patientId: req.user._id, appointmentId });
      if (existing) return res.status(400).json({ message: 'You have already reviewed this appointment' });
    }
    
    const review = await Review.create({
      patientId: req.user._id,
      patientName: req.user.name,
      doctorId,
      appointmentId: appointmentId || null,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    });
    
    // Update doctor's average rating
    const allReviews = await Review.find({ doctorId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Doctor.findByIdAndUpdate(doctorId, { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId });
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctorRatingSummary = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(r => { distribution[r.rating - 1]++; });
    res.json({ avgRating: Math.round(avgRating * 10) / 10, totalReviews, distribution });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
