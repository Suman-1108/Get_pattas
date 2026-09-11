const Brand = require('../models/Brand');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

// GET /api/brands/:slug (Public)
const getBrandBySlug = async (req, res) => {
  const { slug } = req.params;
  
  try {
    if (getIsConnected()) {
      const brand = await Brand.findOne({ slug });
      if (!brand) {
        return res.status(404).json({ success: false, message: `Brand '${slug}' not found.` });
      }
      return res.json({ success: true, brand });
    } else {
      const brand = memoryStore.brands.find(b => b.slug === slug);
      if (!brand) {
        return res.status(404).json({ success: false, message: `Brand '${slug}' not found.` });
      }
      return res.json({ success: true, brand });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/brands (Admin)
const getAllBrands = async (req, res) => {
  try {
    if (getIsConnected()) {
      const brands = await Brand.find().sort({ createdAt: 1 });
      return res.json({ success: true, brands });
    } else {
      return res.json({ success: true, brands: memoryStore.brands });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/brands/:id (Admin)
const updateBrand = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (getIsConnected()) {
      const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
      if (!brand) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }
      return res.json({ success: true, brand });
    } else {
      const idx = memoryStore.brands.findIndex(b => b._id === id || b.slug === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }
      memoryStore.brands[idx] = { ...memoryStore.brands[idx], ...updateData };
      return res.json({ success: true, brand: memoryStore.brands[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBrandBySlug, getAllBrands, updateBrand };
