// routes/productRoutes.js

const express = require('express');
const router = express.Router();

// Import the controller
const productController = require('../controllers/productController');

// Define routes
router.get('/product', productController.getAllProducts);
router.post('/product/add', productController.addProduct);

router.get('/product/recommendations', productController.getTopRatedProducts);

router.get('/product/:id', productController.getProductById);

module.exports = router;
