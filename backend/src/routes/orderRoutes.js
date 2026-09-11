const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getOrderByBookingNumber } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/', createOrder);
router.get('/booking/:bookingNumber', getOrderByBookingNumber);

// Admin
router.get('/', authMiddleware, getOrders);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
