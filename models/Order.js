const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  tamilName: { type: String, default: '' },
  pack: { type: String, default: '' },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, default: 0 },
  image: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  bookingNumber: { type: String, default: '' },
  brand: { type: String, default: 'getpattasu' },
  brandName: { type: String, default: 'Get Pattas Kadai' },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: 'Store Pickup / WhatsApp Order' },
  city: { type: String, default: '' },
  state: { type: String, default: 'Tamil Nadu' },
  pincode: { type: String, default: '' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  totalItems: { type: Number, default: 0 },
  totalBoxes: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'WhatsApp Direct / Cash' },
  utrRef: { type: String, default: '' },
  status: { 
    type: String, 
    default: 'Pending' 
  },
  // Soft delete / Draft trash mechanism
  isDraftDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null, index: true }
}, { timestamps: true });

// Compound index to optimize 30-day auto cleanup queries
orderSchema.index({ isDraftDeleted: 1, deletedAt: 1 });

module.exports = mongoose.model('Order', orderSchema);

