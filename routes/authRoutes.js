const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken); // make this public

// Protected routes
router.use(authMiddleware);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.delete('/account', AuthController.deleteAccount);

module.exports = router;
