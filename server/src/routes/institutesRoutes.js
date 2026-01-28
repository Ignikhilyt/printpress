const express = require('express');
const {
    getAll,
    getFeatured,
    getById,
    getBySlug,
    create,
    update,
    toggleFeatured,
    remove,
    getStatistics,
    bulkUpdate,
} = require('../controllers/institutesController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAll);
router.get('/featured', getFeatured);
router.get('/slug/:slug', getBySlug);
router.get('/:id', getById);

// Admin routes (protected)
router.get('/admin/stats', authenticateAdmin, getStatistics);
router.post('/', authenticateAdmin, create);
router.put('/:id', authenticateAdmin, update);
router.patch('/:id/featured', authenticateAdmin, toggleFeatured);
router.delete('/:id', authenticateAdmin, remove);
router.post('/bulk-update', authenticateAdmin, bulkUpdate);

module.exports = router;