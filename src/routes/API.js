// routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const communityController = require('../controllers/communityController');
const authenticateToken = require('../middleware/authToken');

// Homepage Route
router.get('/homepage', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome to the home page, ${req.user.username}!` });
});

// Users Route
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/acc/:username', authenticateToken, userController.getProfile);
router.put('/acc/:username/change-password', authenticateToken, userController.changePassword);
router.put('/acc/:username/update-profile', authenticateToken, userController.updateProfile);
router.put('/acc/:username/profile-picture', authenticateToken, userController.uploadProfilePicture);
router.delete('/acc/:username/delete-account', authenticateToken, userController.deleteAccount);

// Community Routes
router.get('/community', communityController.getAllNotes);
router.post('/community', communityController.createNote);

// Products Route
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products/add', productController.addProduct);
router.put('/products/:id/edit', productController.editProduct);
router.delete('/products/:id/delete', productController.deleteProduct);

// Product interactions
router.get('/products/recommendations', productController.getTopRecommendedProducts);
router.post('/products/:id/buy', productController.incrementJumlahPembeli);
router.post('/products/:id/rate', productController.addRating);

module.exports = router;