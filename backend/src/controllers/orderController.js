/* ==========================================================================
   Get Pattas - MULTI-BRAND ORDER CONTROLLER
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
    const { 
      brand: brandSlug, 
      brandId, 
      brandName,
      totalAmount, 
      bookingNumber, 
      orderId: clientOrderId,
      paymentMethod,
      totalBoxes,
      totalItems,
      status
    } = req.body;

    // Support flat customer fields or nested customer object
    const customerName = req.body.customerName || (req.body.customer && req.body.customer.name) || 'Valued Customer';
    const phone = req.body.phone || (req.body.customer && req.body.customer.phone) || '';
    const email = (req.body.email || (req.body.customer && req.body.customer.email) || '').trim();
    const address = req.body.address || (req.body.customer && req.body.customer.address) || '';
    const city = req.body.city || (req.body.customer && req.body.customer.city) || 'Direct Dispatch';
    const state = req.body.state || (req.body.customer && req.body.customer.state) || 'Tamil Nadu';
    const pincode = req.body.pincode || (req.body.customer && req.body.customer.pincode) || '626123';

    const customer = {
      name: customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode
    };

    const bn = bookingNumber || clientOrderId || ('GP-BK-' + Math.floor(10000 + Math.random() * 90000));
    const finalOrderId = clientOrderId || bn;

    if (!customerName || !phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    const rawItems = req.body.items || [];
    if (rawItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    let targetBrandId = brandId;
    let matchedBrand = null;
    if (!targetBrandId && brandSlug) {
      if (getIsConnected()) {
        try {
          const b = await Brand.findOne({ slug: brandSlug });
          if (b) { targetBrandId = b._id; matchedBrand = b; }
        } catch (e) {}
      } else {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) { targetBrandId = b._id; matchedBrand = b; }
      }
    }

    if (!targetBrandId) {
      targetBrandId = getIsConnected() ? (await Brand.findOne())?._id : (memoryStore.brands[0]?._id || brandSlug || 'getpattasu');
      matchedBrand = getIsConnected() ? (await Brand.findById(targetBrandId)) : memoryStore.brands[0];
    }

    const bTitle = brandName || (matchedBrand && matchedBrand.name) || 'Get Pattas Kadai';

    const formattedItems = rawItems.map(it => ({
      product: it.product || it.id || 'item_' + Date.now(),
      id: it.id || '',
      name: it.name,
      tamilName: it.tamilName || '',
      code: it.code || '',
      pack: it.pack || it.packInfo || 'Box',
      qty: Number(it.qty) || 1,
      price: Number(it.price) || 0,
      subtotal: Number(it.subtotal) || ((Number(it.price) || 0) * (Number(it.qty) || 1)),
      image: it.image || ''
    }));

    const finalPaymentMethod = paymentMethod || 'WhatsApp Direct';
    const computedTotalBoxes = Number(totalBoxes) || formattedItems.reduce((acc, i) => acc + i.qty, 0);
    const computedTotalItems = Number(totalItems) || formattedItems.length;

    if (getIsConnected()) {
      const orderData = {
        orderId: finalOrderId,
        bookingNumber: bn,
        brand: targetBrandId,
        brandName: bTitle,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        customer,
        items: formattedItems,
        totalAmount: Number(totalAmount) || 0,
        totalItems: computedTotalItems,
        totalBoxes: computedTotalBoxes,
        paymentMethod: finalPaymentMethod,
        paymentStatus: 'pending',
        paymentGateway: 'whatsapp',
        status: status || 'Pending',
        orderStatus: 'placed'
      };

      const order = await Order.create(orderData);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: order.orderId || order._id,
        bookingNumber: bn,
        order
      });
    } else {
      const newOrder = {
        _id: 'ord_' + Date.now(),
        orderId: finalOrderId,
        bookingNumber: bn,
        brand: targetBrandId,
        brandName: bTitle,
        brandInfo: matchedBrand,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        customer,
        items: formattedItems,
        totalAmount: Number(totalAmount) || 0,
        totalItems: computedTotalItems,
        totalBoxes: computedTotalBoxes,
        paymentMethod: finalPaymentMethod,
        paymentStatus: 'pending',
        paymentGateway: 'whatsapp',
        status: status || 'Pending',
        orderStatus: 'placed',
        createdAt: new Date().toISOString()
      };
      memoryStore.orders.unshift(newOrder);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        orderId: newOrder.orderId,
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
      let order = await Order.findOne({ 
        $or: [{ bookingNumber }, { orderId: bookingNumber }] 
      }).populate('brand', 'name slug phone email shortName');
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

// Helper to normalize an order object for the admin panel
const normalizeOrderForAdmin = (orderDoc) => {
  const o = (orderDoc && typeof orderDoc.toObject === 'function') ? orderDoc.toObject() : { ...orderDoc };
  const cust = o.customer || {};
  return {
    ...o,
    orderId: o.orderId || o.bookingNumber || o._id,
    bookingNumber: o.bookingNumber || o.orderId || '',
    customerName: o.customerName || cust.name || 'Valued Customer',
    phone: o.phone || cust.phone || '',
    email: o.email || cust.email || '',
    address: o.address || cust.address || [cust.address, cust.city, cust.state, cust.pincode].filter(Boolean).join(', '),
    city: o.city || cust.city || '',
    state: o.state || cust.state || '',
    pincode: o.pincode || cust.pincode || '',
    paymentMethod: o.paymentMethod || 'WhatsApp Direct',
    status: o.status || 'Pending',
    totalAmount: Number(o.totalAmount) || 0,
    totalBoxes: Number(o.totalBoxes) || 0,
    totalItems: Number(o.totalItems) || (o.items ? o.items.length : 0),
    brandName: o.brandName || (o.brand && typeof o.brand === 'object' ? o.brand.name : '') || 'Get Pattas'
  };
};

// GET /api/orders (Public & Admin)
const getOrders = async (req, res) => {
  const { brand: brandSlug, status } = req.query;

  try {
    let rawOrders = [];
    if (getIsConnected()) {
      let filter = {};
      if (brandSlug) {
        const brand = await Brand.findOne({ slug: brandSlug });
        if (brand) filter.brand = brand._id;
      }
      if (status) {
        filter.status = status;
      }

      rawOrders = await Order.find(filter)
        .populate('brand', 'name slug phone email shortName')
        .sort({ createdAt: -1 });
    } else {
      rawOrders = [...memoryStore.orders];

      if (brandSlug) {
        const b = memoryStore.brands.find(br => br.slug === brandSlug);
        if (b) rawOrders = rawOrders.filter(o => o.brand === b._id);
      }
      if (status) {
        rawOrders = rawOrders.filter(o => (o.status === status || o.orderStatus === status));
      }
    }

    const normalized = rawOrders.map(normalizeOrderForAdmin);
    return res.json(normalized);
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
