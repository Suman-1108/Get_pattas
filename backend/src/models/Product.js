const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: true 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  name: { type: String, required: true },
  tamilName: { type: String, default: '' },
  code: { type: String, default: '' },
  description: { type: String, default: '' },
  images: [{ type: String }],
  packInfo: { type: String, default: '1 box' },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ brand: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
