const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getOrderByBookingNumber } = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Public / Admin Orders API
router.post('/', createOrder);
router.get('/booking/:bookingNumber', getOrderByBookingNumber);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
