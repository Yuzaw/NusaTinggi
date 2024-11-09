const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rute untuk register dan login
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rute yang dilindungi
router.get('/protected', userController.authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected route!' });
});

module.exports = router;
