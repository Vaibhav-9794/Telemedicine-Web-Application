const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllAppointments,
  verifyUserDocument,
  getUserDetails
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Restrict all these endpoints to admin only
router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/verify', verifyUserDocument);
router.get('/users/:id/details', getUserDetails);
router.get('/appointments', getAllAppointments);

module.exports = router;
