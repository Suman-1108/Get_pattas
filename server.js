require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const Product = require('./models/Product');
const Order = require('./models/Order');
const SiteConfig = require('./models/SiteConfig');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/get_pattasu';

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Dedicated Brand Full Website Clean Routes & Shop Sub-routes
const serveMuthu = (req, res) => res.sendFile(path.join(__dirname, 'shopno001', 'index.html'));
const serveDaddy = (req, res) => res.sendFile(path.join(__dirname, 'shopno002', 'index.html'));
const serveRed = (req, res) => res.sendFile(path.join(__dirname, 'shopno003', 'index.html'));
const serveGetPattasu = (req, res) => res.sendFile(path.join(__dirname, 'shopno004', 'index.html'));

// Shop Sub-Domain / Clean URL Routes
// shopno001 -> Sivakasi Muthu Crackers
// shopno002 -> Daddy's Crackers
// shopno003 -> The RED Crackers
// shopno004 -> Get Pattasu Kadai Master Store
app.get(['/shopno001', '/shopno001/', '/getpattas/shopno001', '/getpattas/shopno001/', '/getpattasu/shopno001', '/muthu'], serveMuthu);
app.get(['/shopno002', '/shopno002/', '/getpattas/shopno002', '/getpattas/shopno002/', '/getpattasu/shopno002', '/daddy'], serveDaddy);
app.get(['/shopno003', '/shopno003/', '/getpattas/shopno003', '/getpattas/shopno003/', '/getpattasu/shopno003', '/red'], serveRed);
app.get(['/', '/shopno004', '/shopno004/', '/getpattas/shopno004', '/getpattas/shopno004/', '/getpattasu/shopno004', '/getpattas', '/getpattasu'], serveGetPattasu);

// Static Assets
app.use(express.static(path.join(__dirname)));
app.use('/getpattas', express.static(path.join(__dirname, 'getpattas')));
app.use('/uploads', express.static(uploadsDir));

// Initial Seed Data (Fallback & Seed with 80% Direct Wholesale Prices)
const INITIAL_PRODUCTS = [
  // 1. Sparklers (Kambi Mathappu)
  {
    id: 'spk-01',
    name: '10 cm Electric Sparklers (Kambi Mathappu)',
    category: 'sparklers',
    mrp: 250,
    price: 50,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_sparklers.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.8
  },
  {
    id: 'spk-02',
    name: '10 cm Color Sparklers (Vanna Mathappu)',
    category: 'sparklers',
    mrp: 300,
    price: 60,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_sparklers_color.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.9
  },
  {
    id: 'spk-03',
    name: '15 cm Mega Green & Red Sparklers',
    category: 'sparklers',
    mrp: 450,
    price: 90,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_sparklers_color.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.9
  },
  {
    id: 'spk-04',
    name: '30 cm Giant Royal Sparklers',
    category: 'sparklers',
    mrp: 700,
    price: 140,
    pack: 'Box of 5 Pcs',
    image: 'assets/product_sparklers_giant.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 5.0
  },

  // 2. Flower Pots (Poo Thotti)
  {
    id: 'flp-01',
    name: 'Flower Pots Special (Poo Thotti Special)',
    category: 'flowerpots',
    mrp: 400,
    price: 80,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_flowerpots.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.7
  },
  {
    id: 'flp-02',
    name: 'Flower Pots Asoka (Poo Thotti Asoka)',
    category: 'flowerpots',
    mrp: 500,
    price: 100,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_flowerpots_asoka.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.8
  },
  {
    id: 'flp-03',
    name: 'Flower Pots Giant Deluxe (Big Poo Thotti)',
    category: 'flowerpots',
    mrp: 750,
    price: 150,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_flowerpots_giant.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.9
  },
  {
    id: 'flp-04',
    name: 'Mayil Thogai Peacock Color Fountain',
    category: 'flowerpots',
    mrp: 850,
    price: 170,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_peacock.jpg',
    tag: 'BESTSELLER',
    eco: true,
    rating: 5.0
  },

  // 3. Ground Chakkars (Zamin Chakra)
  {
    id: 'chk-01',
    name: 'Zamin Chakra Big (Ground Spinner)',
    category: 'chakkars',
    mrp: 350,
    price: 70,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_chakkars.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.6
  },
  {
    id: 'chk-02',
    name: 'Zamin Chakra Special (Whirling Wheel)',
    category: 'chakkars',
    mrp: 450,
    price: 90,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_chakkars_deluxe.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.8
  },
  {
    id: 'chk-03',
    name: 'Zamin Chakra Deluxe Wheel Spinner',
    category: 'chakkars',
    mrp: 600,
    price: 120,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_chakkars_deluxe.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.9
  },

  // 4. Sky Shots & Aerial Fireworks
  {
    id: 'sky-01',
    name: '12 Deluxe Aerial Multi-Shots',
    category: 'skyshots',
    mrp: 1800,
    price: 360,
    pack: 'Single Box (12 Shots)',
    image: 'assets/product_skyshots.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.9
  },
  {
    id: 'sky-02',
    name: '30 Multi-Color Crackling Sky Shells',
    category: 'skyshots',
    mrp: 3500,
    price: 700,
    pack: 'Single Box (30 Shots)',
    image: 'assets/product_skyshots_box.jpg',
    tag: 'TOP RATED',
    eco: true,
    rating: 5.0
  },
  {
    id: 'sky-03',
    name: '60 Mega Aerial Night Sky Shells',
    category: 'skyshots',
    mrp: 6500,
    price: 1300,
    pack: 'Single Box (60 Shots)',
    image: 'assets/product_skyshots_mega.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 5.0
  },
  {
    id: 'sky-04',
    name: '120 Royal Grand Sky Shells',
    category: 'skyshots',
    mrp: 12000,
    price: 2400,
    pack: 'Single Box (120 Shots)',
    image: 'assets/product_skyshots_mega.jpg',
    tag: 'MEGA HIT',
    eco: true,
    rating: 5.0
  },

  // 5. Sound Bombs & Rockets
  {
    id: 'bmb-01',
    name: 'Red Bijli Crackers (100 Strips Pack)',
    category: 'bombs',
    mrp: 300,
    price: 60,
    pack: '1 Packet',
    image: 'assets/product_bombs.jpg',
    tag: '80% OFF',
    eco: false,
    rating: 4.5
  },
  {
    id: 'bmb-02',
    name: 'Diwali Sky Rockets Deluxe Pack',
    category: 'bombs',
    mrp: 550,
    price: 110,
    pack: 'Box of 10 Rockets',
    image: 'assets/product_rockets.jpg',
    tag: '80% OFF',
    eco: false,
    rating: 4.8
  },
  {
    id: 'bmb-03',
    name: '2 Sound Mega Hydro Bomb',
    category: 'bombs',
    mrp: 400,
    price: 80,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_bomb_hydro.jpg',
    tag: '80% OFF',
    eco: false,
    rating: 4.7
  },
  {
    id: 'bmb-04',
    name: 'Green Hydro Thunder Bomb',
    category: 'bombs',
    mrp: 500,
    price: 100,
    pack: 'Box of 10 Pcs',
    image: 'assets/product_bomb_hydro.jpg',
    tag: '80% OFF',
    eco: true,
    rating: 4.8
  },

  // 6. Diwali Gift Combos
  {
    id: 'combo-1',
    name: 'Get Pattas Grand Family Festival Dhamaka Pack',
    category: 'combos',
    mrp: 9000,
    price: 1799,
    pack: '45 Assorted Items Box',
    image: 'assets/product_grand_combo.jpg',
    tag: 'MEGA SAVINGS',
    eco: true,
    rating: 5.0
  },
  {
    id: 'combo-2',
    name: 'Get Pattas Kids Super Safe Sparkler Hamper',
    category: 'combos',
    mrp: 3500,
    price: 699,
    pack: '30 Kid-Safe Light Items',
    image: 'assets/product_combopack.jpg',
    tag: 'KIDS SPECIAL',
    eco: true,
    rating: 4.9
  },
  {
    id: 'combo-3',
    name: 'Get Pattas Sivakasi VIP Mega Bumper Box',
    category: 'combos',
    mrp: 14000,
    price: 2799,
    pack: '65 Premium Assorted Items Box',
    image: 'assets/product_grand_combo.jpg',
    tag: 'VIP BUMPER',
    eco: true,
    rating: 5.0
  }
];

// Memory Store Fallback if MongoDB is connecting / offline
let isDbConnected = false;
let memoryProducts = [...INITIAL_PRODUCTS];
let memoryOrders = [];
let memoryUsers = [];
let memoryConfig = {
  key: 'main_config',
  heroTitle: 'DIRECT SIVAKASI FACTORY FIREWORKS',
  heroSubtitle: 'Buy genuine 100% Green Certified Crackers online at direct wholesale prices with flat 80% discount and doorstep delivery.',
  heroBadge: '💥 SIVAKASI DIRECT WHOLESALE STORE',
  heroImage: 'assets/hero_banner.jpg',
  storePhone: '+91 86104 51118',
  storeEmail: 'sales@getpattas.com',
  storeAddress: '12/4B Sivakasi Main Road, Near Factory Zone, Sivakasi, Tamil Nadu - 626123'
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
}).then(async () => {
  isDbConnected = true;
  console.log('✅ Connected to MongoDB successfully.');

  // Seed Products if DB empty or needs refresh
  const count = await Product.countDocuments();
  if (count < INITIAL_PRODUCTS.length) {
    await Product.deleteMany({});
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log('🌱 Seeded 22 initial Sivakasi products into MongoDB.');
  }

  // Seed Config if DB empty
  const configCount = await SiteConfig.countDocuments();
  if (configCount === 0) {
    await SiteConfig.create(memoryConfig);
  }
}).catch(err => {
  console.warn('⚠️ MongoDB connection warning (Running with fast in-memory persistence):', err.message);
  isDbConnected = false;
});

// ==========================================
// REST API ROUTES
// ==========================================

// Customer Sign Up
app.post('/api/customer/signup', async (req, res) => {
  try {
    const { username, password, fullName, phone, address } = req.body;
    if (!username || !password || !fullName || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    const userId = 'usr-' + Date.now();
    const defaultAddress = {
      id: 'addr-' + Date.now(),
      label: 'Home',
      addressLine: address || 'Sivakasi Direct Delivery',
      city: 'Default City',
      pincode: '',
      isDefault: true
    };

    const newUser = {
      userId,
      username: username.toLowerCase().trim(),
      password,
      fullName,
      phone,
      addresses: [defaultAddress]
    };

    if (isDbConnected) {
      const existing = await User.findOne({ username: newUser.username });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username already registered. Please login.' });
      }
      const created = await User.create(newUser);
      return res.status(201).json({ success: true, token: created.userId, user: created });
    } else {
      const existing = memoryUsers.find(u => u.username === newUser.username);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username already registered. Please login.' });
      }
      memoryUsers.unshift(newUser);
      return res.status(201).json({ success: true, token: newUser.userId, user: newUser });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Customer Login
app.post('/api/customer/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const uname = (username || '').toLowerCase().trim();

    if (isDbConnected) {
      const user = await User.findOne({ username: uname, password });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid Username or Password' });
      }
      return res.json({ success: true, token: user.userId, user });
    } else {
      const user = memoryUsers.find(u => u.username === uname && u.password === password);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid Username or Password' });
      }
      return res.json({ success: true, token: user.userId, user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Customer Profile
app.get('/api/customer/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (isDbConnected) {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u.userId === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add New Address
app.post('/api/customer/address', async (req, res) => {
  try {
    const { userId, label, addressLine, city, pincode, isDefault } = req.body;
    const newAddress = {
      id: 'addr-' + Date.now(),
      label: label || 'Home',
      addressLine: addressLine || '',
      city: city || '',
      pincode: pincode || '',
      isDefault: Boolean(isDefault)
    };

    if (isDbConnected) {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (newAddress.isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }
      user.addresses.push(newAddress);
      await user.save();
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u.userId === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (newAddress.isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }
      user.addresses.push(newAddress);
      return res.json({ success: true, user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Edit Address
app.put('/api/customer/address/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId, label, addressLine, city, pincode, isDefault } = req.body;

    if (isDbConnected) {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const addr = user.addresses.id(addressId) || user.addresses.find(a => a.id === addressId);
      if (addr) {
        if (label) addr.label = label;
        if (addressLine) addr.addressLine = addressLine;
        if (city) addr.city = city;
        if (pincode !== undefined) addr.pincode = pincode;
        if (isDefault) {
          user.addresses.forEach(a => a.isDefault = false);
          addr.isDefault = true;
        }
      }
      await user.save();
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u.userId === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const addr = user.addresses.find(a => a.id === addressId);
      if (addr) {
        if (label) addr.label = label;
        if (addressLine) addr.addressLine = addressLine;
        if (city) addr.city = city;
        if (pincode !== undefined) addr.pincode = pincode;
        if (isDefault) {
          user.addresses.forEach(a => a.isDefault = false);
          addr.isDefault = true;
        }
      }
      return res.json({ success: true, user });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Address
app.delete('/api/customer/address/:addressId', async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.query;

    if (isDbConnected) {
      const user = await User.findOne({ userId });
      if (user) {
        user.addresses = user.addresses.filter(a => a.id !== addressId && a._id?.toString() !== addressId);
        await user.save();
        return res.json({ success: true, user });
      }
    } else {
      const user = memoryUsers.find(u => u.userId === userId);
      if (user) {
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        return res.json({ success: true, user });
      }
    }
    return res.status(404).json({ success: false, message: 'Address not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Registered Customers (Admin)
app.get('/api/admin/customers', async (req, res) => {
  try {
    if (isDbConnected) {
      const customers = await User.find().sort({ createdAt: -1 });
      return res.json(customers);
    }
    return res.json(memoryUsers);
  } catch (error) {
    return res.json(memoryUsers);
  }
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ success: true, token: 'authenticated-admin-session-token', message: 'Login successful' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
});

// Upload File Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = 'uploads/' + req.file.filename;
  return res.json({ success: true, url: fileUrl });
});

// GET Products
app.get('/api/products', async (req, res) => {
  try {
    if (isDbConnected) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    }
    return res.json(memoryProducts);
  } catch (error) {
    return res.json(memoryProducts);
  }
});

// POST Add Product (Admin)
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, mrp, price, pack, image, tag, eco } = req.body;
    const id = 'prod-' + Date.now();
    const newProduct = {
      id,
      name: name || 'New Firecracker Item',
      category: category || 'sparklers',
      mrp: Number(mrp) || 100,
      price: Number(price) || 20,
      pack: pack || '1 Box',
      image: image || 'assets/product_sparklers.jpg',
      tag: tag || '80% OFF',
      eco: eco !== undefined ? eco : true,
      rating: 4.8
    };

    if (isDbConnected) {
      const created = await Product.create(newProduct);
      return res.status(201).json({ success: true, product: created });
    } else {
      memoryProducts.unshift(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Edit Product (Admin)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected) {
      const updated = await Product.findOneAndUpdate({ id }, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product: updated });
    } else {
      const idx = memoryProducts.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
      memoryProducts[idx] = { ...memoryProducts[idx], ...updateData };
      return res.json({ success: true, product: memoryProducts[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE Product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      await Product.findOneAndDelete({ id });
    }
    memoryProducts = memoryProducts.filter(p => p.id !== id);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }
    return res.json(memoryOrders);
  } catch (error) {
    return res.json(memoryOrders);
  }
});

// POST Place New Order (Storefront Customer)
app.post('/api/orders', async (req, res) => {
  try {
    const { 
      orderId: clientOrderId, 
      brand, 
      brandName, 
      customerName, 
      phone, 
      email, 
      address, 
      items, 
      totalAmount, 
      totalItems, 
      totalBoxes, 
      paymentMethod, 
      utrRef,
      status,
      createdAt
    } = req.body;

    const orderId = clientOrderId || ('ORD-' + Math.floor(100000 + Math.random() * 900000));

    const newOrder = {
      orderId,
      brand: brand || 'getpattasu',
      brandName: brandName || 'Get Pattasu Kadai',
      customerName: customerName || 'Valued Customer',
      phone: phone || '8610451118',
      email: email || '',
      address: address || 'Store Pickup / WhatsApp Order',
      items: items || [],
      totalAmount: Number(totalAmount) || 0,
      totalItems: Number(totalItems) || (items ? items.length : 0),
      totalBoxes: Number(totalBoxes) || 0,
      paymentMethod: paymentMethod || 'UPI QR Scan',
      utrRef: utrRef || '',
      status: status || 'Pending',
      createdAt: createdAt ? new Date(createdAt) : new Date()
    };

    if (isDbConnected) {
      try {
        const created = await Order.create(newOrder);
        return res.status(201).json({ success: true, order: created });
      } catch (dbErr) {
        memoryOrders.unshift(newOrder);
        return res.status(201).json({ success: true, order: newOrder });
      }
    } else {
      memoryOrders.unshift(newOrder);
      return res.status(201).json({ success: true, order: newOrder });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT Update Order Status (Admin)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDbConnected) {
      const updated = await Order.findOneAndUpdate({ orderId: id }, { status }, { new: true });
      return res.json({ success: true, order: updated });
    } else {
      const order = memoryOrders.find(o => o.orderId === id);
      if (order) order.status = status;
      return res.json({ success: true, order });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Site Config (Hero & Contact Info)
app.get('/api/config', async (req, res) => {
  try {
    if (isDbConnected) {
      let config = await SiteConfig.findOne({ key: 'main_config' });
      if (!config) config = await SiteConfig.create(memoryConfig);
      return res.json(config);
    }
    return res.json(memoryConfig);
  } catch (error) {
    return res.json(memoryConfig);
  }
});

// PUT Site Config (Admin Update Hero/Contact Details)
app.put('/api/config', async (req, res) => {
  try {
    const updateData = req.body;
    if (isDbConnected) {
      const updated = await SiteConfig.findOneAndUpdate(
        { key: 'main_config' },
        updateData,
        { new: true, upsert: true }
      );
      return res.json({ success: true, config: updated });
    } else {
      memoryConfig = { ...memoryConfig, ...updateData };
      return res.json({ success: true, config: memoryConfig });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Get Pattas Kadai Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already running an active server instance.`);
    process.exit(0);
  }
});
