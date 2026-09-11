/* ==========================================================================
   GET PATTASU - MULTI-BRAND ORDER CONTROLLER
   ==========================================================================
   COMPLIANCE NOTICE (DO NOT REMOVE):
   Per the 2018 Supreme Court of India order, online sale and delivery of firecrackers
   is restricted in various jurisdictions. Customers must verify valid state clearance,
   and orders may function as estimates / booking confirmations. Site owners must maintain
   valid explosives licenses and legal permits before fulfilling orders.
   ========================================================================== */

const Order = require('../models/Order');
const Brand = require('../models/Brand');
const { getIsConnected } = require('../config/db');
const { memoryStore } = require('../seed');

// POST /api/orders (Public - Create Order / Estimate)
const createOrder = async (req, res) => {
  try {
    const { brand: brandSlug, brandId, totalAmount, bookingNumber, orderId } = req.body;
    
    // Support nested customer object or flat fields
    const customer = req.body.customer || {
      name: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email || '',
      address: req.body.address,
      city: req.body.city || 'Direct Dispatch',
      state: req.body.state || 'Tamil Nadu',
      pincode: req.body.pincode || '626123'
    };

    const bn = bookingNumber || orderId || ('GP-BK-' + Math.floor(10000 + Math.random() * 90000));

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and address are required.' });
    }

    const rawItems = req.body.items || [];
    if (rawItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    let targetBrandId = brandId;
    let matchedBrand = null;
    if (!targetBrandId && brandSlug) {
      if (getIsConnected()) {
        const b = await Brand.findOne({ slug: brandSlug });
        if (b) { targetBrandId = b._id; matchedBrand = b; }
      } else {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) { targetBrandId = b._id; matchedBrand = b; }
      }
    }

    if (!targetBrandId) {
      targetBrandId = getIsConnected() ? (await Brand.findOne())?._id : memoryStore.brands[0]._id;
      matchedBrand = getIsConnected() ? (await Brand.findById(targetBrandId)) : memoryStore.brands[0];
    }

    const formattedItems = rawItems.map(it => ({
      product: it.product || it.id || (getIsConnected() ? targetBrandId : 'item_' + Date.now()),
      name: it.name,
      tamilName: it.tamilName || '',
      code: it.code || '',
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0
    }));

    if (getIsConnected()) {
      const order = await Order.create({
        brand: targetBrandId,
        customer,
        items: formattedItems,
        totalAmount: Number(totalAmount) || 0,
        paymentStatus: 'pending',
        orderStatus: 'placed',
        bookingNumber: bn
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: order._id,
        bookingNumber: bn,
        order
      });
    } else {
      const newOrder = {
        _id: 'ord_' + Date.now(),
        brand: targetBrandId,
        brandInfo: matchedBrand,
        customer,
        items: formattedItems,
        totalAmount: Number(totalAmount) || 0,
        paymentStatus: 'pending',
        paymentGateway: 'razorpay',
        orderStatus: 'placed',
        bookingNumber: bn,
        createdAt: new Date().toISOString()
      };
      memoryStore.orders.push(newOrder);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: newOrder._id,
        bookingNumber: bn,
        order: newOrder
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/booking/:bookingNumber
const getOrderByBookingNumber = async (req, res) => {
  const { bookingNumber } = req.params;
  try {
    if (getIsConnected()) {
      const order = await Order.findOne({ bookingNumber }).populate('brand', 'name slug phone email shortName');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    } else {
      const order = memoryStore.orders.find(o => o.bookingNumber === bookingNumber || o.orderId === bookingNumber);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/orders?brand=slug&status= (Admin)
const getOrders = async (req, res) => {
  const { brand: brandSlug, status } = req.query;

  try {
    if (getIsConnected()) {
      let filter = {};
      if (brandSlug) {
        const brand = await Brand.findOne({ slug: brandSlug });
        if (brand) filter.brand = brand._id;
      }
      if (status) {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .populate('brand', 'name slug')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: orders.length, orders });
    } else {
      let orders = [...memoryStore.orders];

      if (brandSlug) {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) orders = orders.filter(o => o.brand === b._id);
      }
      if (status) {
        orders = orders.filter(o => o.orderStatus === status);
      }

      return res.json({ success: true, count: orders.length, orders });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/orders/:id/status (Admin)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  try {
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    if (getIsConnected()) {
      const order = await Order.findByIdAndUpdate(id, update, { new: true });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    } else {
      const idx = memoryStore.orders.findIndex(o => o._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
      memoryStore.orders[idx] = { ...memoryStore.orders[idx], ...update };
      return res.json({ success: true, order: memoryStore.orders[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getOrderByBookingNumber };
