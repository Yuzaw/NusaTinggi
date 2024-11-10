const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/homepage', userController.authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome to the home page, ${req.user.username}!` });
});
router.get('/profile', userController.authenticateToken, userController.getProfile);

module.exports = router;