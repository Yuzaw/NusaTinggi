const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const myTripController = require('../controllers/myTripController');
const businessController = require('../controllers/businessController');
const orderController = require('../controllers/OrderController');
const chatbotController = require('../controllers/chatbotController');
const authenticateToken = require('../middleware/authToken');
const authBusiness = require('../middleware/authBusiness');

// Auth Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Users Routes
router.get('/user/profile', authenticateToken, userController.getProfile);
router.put('/user/change-password', authenticateToken, userController.changePassword);
router.put('/user/update-profile', authenticateToken, userController.updateProfile);
router.put('/user/profile-picture', authenticateToken, userController.uploadProfilePicture);
router.put('/user/upgrade', authenticateToken, userController.upgradeToBusiness);
router.delete('/user/delete-account', authenticateToken, userController.deleteAccount);

// myTrip Routes
router.get('/user/mytrip', authenticateToken, myTripController.getMyTrips);
router.post('/user/mytrip/:productId/buy', authenticateToken, myTripController.buyProduct);
router.post('/user/mytrip/:myTripId/cancel', authenticateToken, myTripController.cancelOrder);
router.post('/user/mytrip/:myTripId/complete', authenticateToken, myTripController.completeOrder);

// Business Routes
router.get('/user/myBusiness', authenticateToken, authBusiness, businessController.getMyBusiness);
router.get('/user/myBusiness/:productId', authenticateToken, authBusiness, businessController.getMyBusinessById);
router.post('/user/myBusiness/add', authenticateToken, authBusiness, businessController.addProduct);
router.put('/user/myBusiness/:productId/edit', authenticateToken, authBusiness, businessController.editProduct);
router.delete('/user/myBusiness/:productId/delete', authenticateToken, authBusiness, businessController.deleteProduct);

// Orders Routes
router.get('/user/myOrders', authenticateToken, authBusiness, orderController.getMyOrders);
router.patch('/user/myOrders/:orderId/accept', authenticateToken, authBusiness, orderController.acceptOrder);
router.patch('/user/myOrders/:orderId/decline', authenticateToken, authBusiness, orderController.declineOrder);

// Products Route
router.get('/products', authenticateToken, productController.getAllProducts);
router.get('/products/:id', authenticateToken, productController.getProductById);
router.get('/products/recommendations', authenticateToken, productController.getTopRecommendedProducts);

// Chatbot Routes
router.put('/edit-mountain', authenticateToken, chatbotController.editMountain);
router.post('/chat', authenticateToken, chatbotController.predictChatbot);

module.exports = router;