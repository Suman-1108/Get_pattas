const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['getpattasu', 'muthu-cracker', 'daddy-cracker', 'velmurugan-cracker']
  },
  name: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: '#dc2626' },
  contactPhone: [{ type: String }],
  contactEmail: { type: String, default: '' },
  address: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
