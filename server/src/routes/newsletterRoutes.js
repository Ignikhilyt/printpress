/**
 * Newsletter Routes
 * Handles newsletter subscription endpoints
 */

const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin routes
router.get(
    '/subscribers',
    authenticate,
    authorize('admin'),
    newsletterController.getSubscribers
);

module.exports = router;
