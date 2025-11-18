const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(adminAuthMiddleware);

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// PUT /api/admin/users/:userId/status - Update user status
router.put('/users/:userId/status', adminController.updateUserStatus);

// GET /api/admin/users/:userId/activity - Get user activity
router.get('/users/:userId/activity', adminController.getUserActivity);

module.exports = router;
