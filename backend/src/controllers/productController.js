const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

// GET /api/products?brand=slug&category=slug (Public)
const getProducts = async (req, res) => {
  const { brand: brandSlug, category: categorySlug, search } = req.query;

  try {
    if (getIsConnected()) {
      let filter = { isActive: true };

      if (brandSlug) {
        const brand = await Brand.findOne({ slug: brandSlug });
        if (brand) {
          filter.brand = brand._id;
        } else {
          return res.json({ success: true, products: [] });
        }
      }

      if (categorySlug && categorySlug !== 'all') {
        const category = await Category.findOne({ slug: categorySlug, ...(filter.brand ? { brand: filter.brand } : {}) });
        if (category) {
          filter.category = category._id;
        }
      }

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { name: regex },
          { tamilName: regex },
          { code: regex },
          { description: regex }
        ];
      }

      const products = await Product.find(filter)
        .populate('category', 'name slug')
        .populate('brand', 'name slug themeColor')
        .sort({ displayOrder: 1, createdAt: -1 });

      return res.json({ success: true, count: products.length, products });
    } else {
      let brandId = null;
      if (brandSlug) {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) brandId = b._id;
      }

      let categoryId = null;
      if (categorySlug && categorySlug !== 'all') {
        const c = memoryStore.categories.find(cat => cat.slug === categorySlug && (!brandId || cat.brand === brandId));
        if (c) categoryId = c._id;
      }

      let products = memoryStore.products.filter(p => p.isActive);

      if (brandId) {
        products = products.filter(p => p.brand === brandId);
      }
      if (categoryId) {
        products = products.filter(p => p.category === categoryId);
      }
      if (search) {
        const q = search.toLowerCase();
        products = products.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.tamilName && p.tamilName.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q))
        );
      }

      return res.json({ success: true, count: products.length, products });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id (Public)
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    if (getIsConnected()) {
      const product = await Product.findById(id)
        .populate('category', 'name slug')
        .populate('brand', 'name slug themeColor');
      
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    } else {
      const product = memoryStore.products.find(p => p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/products (Admin)
const createProduct = async (req, res) => {
  try {
    let { brand, category, name, tamilName, code, description, packInfo, mrp, sellingPrice, stock, isActive, displayOrder } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      images = [`/uploads/${req.file.filename}`];
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      images = ['/uploads/product_sparklers.jpg'];
    }

    if (getIsConnected()) {
      const product = await Product.create({
        brand,
        category,
        name,
        tamilName: tamilName || '',
        code: code || '',
        description: description || '',
        packInfo: packInfo || '1 box',
        mrp: Number(mrp) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        stock: Number(stock) || 100,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: Number(displayOrder) || 0,
        images
      });

      return res.status(201).json({ success: true, product });
    } else {
      const newProd = {
        _id: 'prod_' + Date.now(),
        brand,
        category,
        name,
        tamilName: tamilName || '',
        code: code || '',
        description: description || '',
        packInfo: packInfo || '1 box',
        mrp: Number(mrp) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        stock: Number(stock) || 100,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: Number(displayOrder) || 0,
        images
      };
      memoryStore.products.push(newProd);
      return res.status(201).json({ success: true, product: newProd });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/products/:id (Admin)
const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    let updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.file) {
      updateData.images = [`/uploads/${req.file.filename}`];
    }

    if (getIsConnected()) {
      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    } else {
      const idx = memoryStore.products.findIndex(p => p._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
      memoryStore.products[idx] = { ...memoryStore.products[idx], ...updateData };
      return res.json({ success: true, product: memoryStore.products[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/products/:id (Admin)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (getIsConnected()) {
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted' });
    } else {
      memoryStore.products = memoryStore.products.filter(p => p._id !== id);
      return res.json({ success: true, message: 'Product deleted' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
