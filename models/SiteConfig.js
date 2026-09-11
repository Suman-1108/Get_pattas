const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main_config', unique: true },
  heroTitle: { type: String, default: 'DIRECT SIVAKASI FACTORY FIREWORKS' },
  heroSubtitle: { type: String, default: 'Buy genuine 100% Green Certified Crackers online at direct wholesale prices with flat 80% discount and doorstep delivery.' },
  heroBadge: { type: String, default: '💥 SIVAKASI DIRECT WHOLESALE STORE' },
  heroImage: { type: String, default: 'assets/hero_banner.jpg' },
  storePhone: { type: String, default: '+91 98765 43210' },
  storeEmail: { type: String, default: 'sales@getpattas.com' },
  storeAddress: { type: String, default: '12/4B Sivakasi Main Road, Near Factory Zone, Sivakasi, Tamil Nadu - 626123' }
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
