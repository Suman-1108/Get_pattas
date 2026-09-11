const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: { type: String, required: true },
  tamilName: { type: String, default: '' },
  code: { type: String, default: '' },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: true 
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentGateway: { 
    type: String, 
    default: 'razorpay' 
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  orderStatus: { 
    type: String, 
    enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  bookingNumber: { type: String, default: '', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
