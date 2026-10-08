const express = require('express');
const router = express.Router();
const { adminLogin, getDashboardStats } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/login', adminLogin);

// Protected
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, valid: true, admin: req.admin, message: 'Token is valid' });
});
router.get('/dashboard', authMiddleware, getDashboardStats);

module.exports = router;
