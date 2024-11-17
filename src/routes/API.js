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
router.get('/acc/:username', userController.authenticateToken, userController.getProfile);
router.put('/change-password', userController.authenticateToken, userController.changePassword);

// Community Routes
router.get('/community', communityController.getAllNotes);
router.post('/community', communityController.createNote);

// Products Route
router.get('/products', productController.getAllProducts);
router.post('/product/add', productController.addProduct);
router.get('/product/recommendations', productController.getTopRecommendedProducts);
router.get('/product/:id', productController.getProductById);

// Products interaksi
router.post('/product/:id/buy', productController.incrementJumlahPembeli);
router.post('/product/:id/rate', productController.addRating);

module.exports = router;
