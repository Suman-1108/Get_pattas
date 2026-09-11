const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

// GET /api/categories?brand=slug (Public)
const getCategories = async (req, res) => {
  const { brand: brandSlug } = req.query;

  try {
    if (getIsConnected()) {
      let filter = {};
      if (brandSlug) {
        const brand = await Brand.findOne({ slug: brandSlug });
        if (brand) {
          filter.brand = brand._id;
        } else {
          return res.json({ success: true, categories: [] });
        }
      }

      const categories = await Category.find(filter).sort({ displayOrder: 1, createdAt: 1 });
      return res.json({ success: true, categories });
    } else {
      let brandId = null;
      if (brandSlug) {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) brandId = b._id;
      }

      let categories = memoryStore.categories;
      if (brandId) {
        categories = categories.filter(c => c.brand === brandId);
      }
      return res.json({ success: true, categories });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/categories (Admin)
const createCategory = async (req, res) => {
  const { brand, name, slug, displayOrder } = req.body;

  if (!brand || !name || !slug) {
    return res.status(400).json({ success: false, message: 'Brand, name, and slug are required.' });
  }

  try {
    if (getIsConnected()) {
      const category = await Category.create({ brand, name, slug, displayOrder: displayOrder || 0 });
      return res.status(201).json({ success: true, category });
    } else {
      const newCat = {
        _id: 'cat_' + Date.now(),
        brand,
        name,
        slug,
        displayOrder: displayOrder || 0
      };
      memoryStore.categories.push(newCat);
      return res.status(201).json({ success: true, category: newCat });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/categories/:id (Admin)
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (getIsConnected()) {
      const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      return res.json({ success: true, category });
    } else {
      const idx = memoryStore.categories.findIndex(c => c._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
      memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...updateData };
      return res.json({ success: true, category: memoryStore.categories[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/categories/:id (Admin)
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    if (getIsConnected()) {
      await Category.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Category deleted' });
    } else {
      memoryStore.categories = memoryStore.categories.filter(c => c._id !== id);
      return res.json({ success: true, message: 'Category deleted' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
