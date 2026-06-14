const { Notification } = require('../config/db');

exports.createNotification = async ({ userId, type, title, message, link }) => {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      link: link || null,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id });
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications.slice(0, 50));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id, read: false });
    for (const n of notifications) {
      await Notification.findByIdAndUpdate(n._id, { read: true });
    }
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
