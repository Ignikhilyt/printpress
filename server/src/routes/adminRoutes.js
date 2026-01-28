const express = require('express');
const {
    getDashboardStats,
    getAnalytics,
    getSalesReport,
    getInventoryReport,
    getActivityLog,
    getSystemHealth,
    exportOrders,
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Reports
router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);

// Activity & System
router.get('/activity', getActivityLog);
router.get('/health', getSystemHealth);

// Export
router.get('/export/orders', exportOrders);

module.exports = router;