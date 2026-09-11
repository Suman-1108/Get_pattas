const express = require('express');
const router = express.Router();
const { getBrandBySlug, getAllBrands, updateBrand } = require('../controllers/brandController');
const authMiddleware = require('../middleware/auth');

// Public
router.get('/:slug', getBrandBySlug);

// Admin
router.get('/', authMiddleware, getAllBrands);
router.put('/:id', authMiddleware, updateBrand);

module.exports = router;
