const express = require('express');
const { login, getProfile, refreshToken, logout, changePassword } = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticateAdmin, getProfile);
router.post('/logout', authenticateAdmin, logout);
router.put('/password', authenticateAdmin, changePassword);

module.exports = router;