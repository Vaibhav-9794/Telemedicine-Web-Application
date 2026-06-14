const { Payment, Appointment, User } = require('../config/db');

exports.createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, method, description } = req.body;
    const invoiceNumber = `INV-${String(Date.now()).slice(-6)}`;
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const payment = await Payment.create({
      patientId: req.user._id,
      doctorId: appointment.doctorId,
      appointmentId,
      amount: amount || 0,
      status: 'completed',
      method: method || 'card',
      transactionId,
      invoiceNumber,
      description: description || 'Consultation fee',
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Payment creation failed', error: error.message });
  }
};

exports.getPatientPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

exports.getPaymentInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    // Return payment data (frontend can render as invoice)
    const patient = await User.findById(payment.patientId);
    res.json({ ...payment, patientName: patient?.name || 'Unknown' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoice', error: error.message });
  }
};
