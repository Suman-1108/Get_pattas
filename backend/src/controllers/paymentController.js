const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';

let razorpayInstance = null;
if (key_id && key_secret && !key_id.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({ key_id, key_secret });
  } catch (e) {
    console.warn('Razorpay initialization notice: using sandbox test mode.');
  }
}

// POST /api/payments/razorpay/create-order
const createRazorpayOrder = async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'orderId and amount are required.' });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  try {
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${orderId.toString().slice(-8)}`
      };
      const rzpOrder = await razorpayInstance.orders.create(options);

      if (getIsConnected()) {
        await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rzpOrder.id });
      } else {
        const o = memoryStore.orders.find(ord => ord._id === orderId);
        if (o) o.razorpayOrderId = rzpOrder.id;
      }

      return res.json({
        success: true,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: key_id
      });
    } else {
      // Mock / Sandbox Order for test integration
      const mockRzpOrderId = `order_mock_${Date.now()}`;
      if (getIsConnected()) {
        await Order.findByIdAndUpdate(orderId, { razorpayOrderId: mockRzpOrderId });
      } else {
        const o = memoryStore.orders.find(ord => ord._id === orderId);
        if (o) o.razorpayOrderId = mockRzpOrderId;
      }

      return res.json({
        success: true,
        razorpayOrderId: mockRzpOrderId,
        amount: amountInPaise,
        currency: 'INR',
        key: key_id,
        isSandbox: true,
        message: 'Sandbox order created'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/razorpay/verify
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  try {
    let isValid = false;

    if (razorpayInstance && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValid = expectedSignature === razorpay_signature;
    } else {
      // Allow sandbox verification
      isValid = true;
    }

    if (isValid) {
      if (getIsConnected()) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`
        });
      } else {
        const o = memoryStore.orders.find(ord => ord._id === orderId);
        if (o) {
          o.paymentStatus = 'paid';
          o.orderStatus = 'confirmed';
          o.razorpayPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
        }
      }

      return res.json({ success: true, message: 'Payment verified and marked paid successfully.' });
    } else {
      if (getIsConnected()) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      }
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
