const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const communityController = require('../controllers/communityController');

// Homepage Route
router.get('/homepage', userController.authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome to the home page, ${req.user.username}!` });
});

// Users Route
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', userController.authenticateToken, userController.getProfile);

// Community Routes
router.get('/community', communityController.getAllNotes);
router.post('/community', communityController.createNote);

// Products Route
router.get('/product', productController.getAllProducts);
router.post('/product/add', productController.addProduct);
router.get('/product/recommendations', productController.getTopRatedProducts);
router.get('/product/:id', productController.getProductById);

module.exports = router;