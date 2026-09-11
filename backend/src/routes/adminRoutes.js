const express = require('express');
const router = express.Router();
const { adminLogin, getDashboardStats } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/login', adminLogin);

// Protected
router.get('/dashboard', authMiddleware, getDashboardStats);

module.exports = router;
