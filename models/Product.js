const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  pack: { type: String, required: true },
  image: { type: String, required: true },
  tag: { type: String, default: '80% OFF' },
  eco: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
