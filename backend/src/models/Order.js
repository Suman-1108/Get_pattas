const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.Mixed, 
    ref: 'Product', 
    required: false 
  },
  id: { type: String },
  name: { type: String, required: true },
  tamilName: { type: String, default: '' },
  code: { type: String, default: '' },
  pack: { type: String, default: '' },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, default: 0 },
  image: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, index: true },
  bookingNumber: { type: String, default: '', index: true },
  brand: { 
    type: mongoose.Schema.Types.Mixed, 
    ref: 'Brand', 
    required: false 
  },
  brandName: { type: String, default: 'Get Pattas' },
  customerName: { type: String },
  phone: { type: String },
  email: { type: String, default: '' },
  address: { type: String },
  city: { type: String, default: 'Direct Dispatch' },
  state: { type: String, default: 'Tamil Nadu' },
  pincode: { type: String, default: '626123' },
  customer: {
    name: { type: String },
    phone: { type: String },
    email: { type: String, default: '' },
    address: { type: String },
    city: { type: String, default: 'Direct Dispatch' },
    state: { type: String, default: 'Tamil Nadu' },
    pincode: { type: String, default: '626123' }
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  totalItems: { type: Number, default: 0 },
  totalBoxes: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'WhatsApp Direct' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentGateway: { 
    type: String, 
    default: 'whatsapp' 
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  orderStatus: { 
    type: String, 
    default: 'placed' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

