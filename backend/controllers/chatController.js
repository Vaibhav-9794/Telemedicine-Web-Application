const { Message, Appointment, Doctor, User } = require('../config/db');

/**
 * Get message history with a specific user
 * GET /api/chat/history/:otherUserId
 */
const getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user._id;

    // Fetch all messages sorted chronologically, then filter
    const messages = await Message.find({}).sort({ createdAt: 1 });
    const chatMessages = messages.filter(msg => 
      (msg.senderId === myId && msg.receiverId === otherUserId) ||
      (msg.senderId === otherUserId && msg.receiverId === myId)
    );

    res.json(chatMessages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
};

/**
 * Get contacts list for active user (people they have appointments or messages with)
 * GET /api/chat/contacts
 */
const getChatContacts = async (req, res) => {
  try {
    const myId = req.user._id;
    const myRole = req.user.role;
    const contacts = new Map();

    if (myRole === 'patient') {
      // Patients look up doctors they have appointments with
      const appointments = await Appointment.find({ patientId: myId }).populate('doctorId');
      for (const appt of appointments) {
        if (appt.doctorId && appt.doctorId.userId) {
          const docUser = appt.doctorId.userId;
          contacts.set(docUser._id, {
            _id: docUser._id,
            name: docUser.name,
            email: docUser.email,
            role: 'doctor',
            specialization: appt.doctorId.specialization,
            consultationFee: appt.doctorId.consultationFee
          });
        }
      }
    } else if (myRole === 'doctor') {
      // Doctors look up patients who have booked appointments with them
      const doctorProfile = await Doctor.findOne({ userId: myId });
      if (doctorProfile) {
        const appointments = await Appointment.find({ doctorId: doctorProfile._id }).populate('patientId');
        for (const appt of appointments) {
          if (appt.patientId) {
            const patUser = appt.patientId;
            contacts.set(patUser._id, {
              _id: patUser._id,
              name: patUser.name,
              email: patUser.email,
              role: 'patient',
              phone: patUser.phone
            });
          }
        }
      }
    }

    // Fallback/Supplement: Include users whom they have messages history with
    const allMessages = await Message.find({}).sort({ createdAt: 1 });
    const myMessages = allMessages.filter(msg => msg.senderId === myId || msg.receiverId === myId);

    for (const msg of myMessages) {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!contacts.has(otherId)) {
        const otherUser = await User.findById(otherId);
        if (otherUser) {
          contacts.set(otherId, {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role,
            phone: otherUser.phone
          });
        }
      }
    }

    res.json(Array.from(contacts.values()));
  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    res.status(500).json({ message: 'Server error fetching contacts' });
  }
};

module.exports = {
  getChatHistory,
  getChatContacts
};
