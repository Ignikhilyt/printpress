const express = require('express');
const {
    // Public routes
    getAll,
    getBySlug,
    getFeatured,
    getSubjects,
    getCategoryStats,
    calculatePrice,
    // Admin routes
    create,
    update,
    deleteNote,
    getAllAdmin,
    getStats,
} = require('../controllers/notesController');
const { authenticateAdmin } = require('../middleware/auth');
const { uploadPdf } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAll);
router.get('/featured', getFeatured);
router.get('/subjects', getSubjects);
router.get('/category-stats', getCategoryStats);
router.get('/:slug', getBySlug);
router.post('/calculate-price', calculatePrice);

// Admin routes (protected)
router.get('/admin/all', authenticateAdmin, getAllAdmin);
router.get('/admin/stats', authenticateAdmin, getStats);
router.post('/', authenticateAdmin, uploadPdf.single('pdf'), create);
router.put('/:id', authenticateAdmin, uploadPdf.single('pdf'), update);
router.delete('/:id', authenticateAdmin, deleteNote);

module.exports = router;