/* ==========================================================================
   GET pattas  — MULTI-BRAND CRACKERS PLATFORM CENTRAL REST API
   ShaGet pattas by 4 Frontends (Get pattas , Muthu, Get pattas , Velmurugan) & 1 Admin Panel
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getIsConnected } = require('./config/db');
const { seedDatabase } = require('./seed');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const brandRoutes = require('./routes/brandRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static upload images
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Static files & frontend shop routes
const frontendDir = path.join(__dirname, '../../');
app.use(express.static(frontendDir));
app.use('/getpattas', express.static(path.join(frontendDir, 'getpattas')));

app.get(['/shopno001', '/shopno001/', '/getpattas/shopno001', '/getpattas/shopno001/', '/getpattas /shopno001', '/muthu'], (req, res) => res.sendFile(path.join(frontendDir, 'shopno001', 'index.html')));
app.get(['/shopno002', '/shopno002/', '/getpattas/shopno002', '/getpattas/shopno002/', '/getpattas /shopno002', '/Get pattas '], (req, res) => res.sendFile(path.join(frontendDir, 'shopno002', 'index.html')));
app.get(['/shopno003', '/shopno003/', '/getpattas/shopno003', '/getpattas/shopno003/', '/getpattas /shopno003', '/red'], (req, res) => res.sendFile(path.join(frontendDir, 'shopno003', 'index.html')));
app.get(['/', '/shopno004', '/shopno004/', '/getpattas/shopno004', '/getpattas/shopno004/', '/getpattas /shopno004', '/getpattas', '/getpattas '], (req, res) => res.sendFile(path.join(frontendDir, 'shopno004', 'index.html')));
app.get(['/invoice', '/invoice/:bookingNo', '/getpattas/invoice', '/getpattas /invoice'], (req, res) => res.sendFile(path.join(frontendDir, 'invoice.html')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Get pattas  Multi-Brand Backend API',
    databaseConnected: getIsConnected(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Start Server & Initialize Database
const startServer = async () => {
  const dbOk = await connectDB();
  if (dbOk) {
    try {
      await seedDatabase();
    } catch (err) {
      console.warn('Seed error:', err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Get pattas  Multi-Brand API running on http://localhost:${PORT}`);
    console.log(`📡 Brands: /api/brands/:slug (getpattas  | muthu-cracker | Get pattas -cracker | velmurugan-cracker)`);
    console.log(`📡 Categories: /api/categories?brand=slug`);
    console.log(`📡 Products: /api/products?brand=slug`);
    console.log(`🔐 Admin: /api/admin/login`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} in use. Attempting graceful reconnect or reuse.`);
    }
  });
};

startServer();

module.exports = app;
