const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

const secret = process.env.JWT_SECRET || 'get_pattasu_jwt_super_secret_key_2026';

// POST /api/admin/login
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  try {
    let admin = null;

    if (getIsConnected()) {
      admin = await Admin.findOne({ username: username.toLowerCase() });
    } else {
      admin = memoryStore.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin logged in successfully.',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/dashboard?brand=slug
const getDashboardStats = async (req, res) => {
  const { brand: brandSlug } = req.query;

  try {
    if (getIsConnected()) {
      let brandFilter = {};
      let orderFilter = {};

      if (brandSlug) {
        const brand = await Brand.findOne({ slug: brandSlug });
        if (brand) {
          brandFilter.brand = brand._id;
          orderFilter.brand = brand._id;
        }
      }

      const totalBrands = await Brand.countDocuments();
      const totalCategories = await Category.countDocuments(brandFilter);
      const totalProducts = await Product.countDocuments(brandFilter);
      const totalOrders = await Order.countDocuments(orderFilter);

      const paidOrders = await Order.find({ ...orderFilter, paymentStatus: 'paid' });
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const recentOrders = await Order.find(orderFilter)
        .populate('brand', 'name slug')
        .sort({ createdAt: -1 })
        .limit(10);

      return res.json({
        success: true,
        stats: {
          totalBrands,
          totalCategories,
          totalProducts,
          totalOrders,
          totalRevenue,
          recentOrders
        }
      });
    } else {
      let bId = null;
      if (brandSlug) {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) bId = b._id;
      }

      let orders = memoryStore.orders;
      let products = memoryStore.products;
      let categories = memoryStore.categories;

      if (bId) {
        orders = orders.filter(o => o.brand === bId);
        products = products.filter(p => p.brand === bId);
        categories = categories.filter(c => c.brand === bId);
      }

      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return res.json({
        success: true,
        stats: {
          totalBrands: memoryStore.brands.length,
          totalCategories: categories.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          recentOrders: orders.slice(-10).reverse()
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { adminLogin, getDashboardStats };
