// routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const communityController = require('../controllers/communityController');
const myTripController = require('../controllers/myTripController');
const authenticateToken = require('../middleware/authToken');

// Homepage Route
router.get('/homepage', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome to the home page, ${req.user.username}!` });
});

// Users Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/user/profile', authenticateToken, userController.getProfile);
router.put('/user/change-password', authenticateToken, userController.changePassword);
router.put('/user/update-profile', authenticateToken, userController.updateProfile);
router.put('/user/profile-picture', authenticateToken, userController.uploadProfilePicture);
router.delete('/user/delete-account', authenticateToken, userController.deleteAccount);

// myTrip Routes
router.get('/user/mytrip', authenticateToken, myTripController.getMyTrips);
router.post('/user/mytrip/:productId/buy', authenticateToken, myTripController.buyProduct);
router.post('/user/mytrip/:myTripId/cancel', authenticateToken, myTripController.cancelOrder);
router.post('/user/mytrip/:myTripId/complete', authenticateToken, myTripController.completeOrder);

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