const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin (Supports file uploads)
router.post('/', authMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
