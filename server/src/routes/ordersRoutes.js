const express = require('express');
const {
    // Public routes
    create,
    trackOrder,
    // Admin routes
    getAll,
    getById,
    updateStatus,
    updatePaymentStatus,
    cancelOrder,
    getStats,
} = require('../controllers/ordersController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', create);
router.get('/track/:orderNumber', trackOrder);

// Admin routes (protected)
router.get('/', authenticateAdmin, getAll);
router.get('/stats', authenticateAdmin, getStats);
router.get('/:id', authenticateAdmin, getById);
router.patch('/:id/status', authenticateAdmin, updateStatus);
router.patch('/:id/payment-status', authenticateAdmin, updatePaymentStatus);
router.post('/:id/cancel', authenticateAdmin, cancelOrder);

module.exports = router;