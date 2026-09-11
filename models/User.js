const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, default: 'Home' },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addresses: [addressSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
