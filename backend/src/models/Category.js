const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: true 
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.index({ brand: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
