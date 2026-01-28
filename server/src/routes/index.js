const express = require('express');
const authRoutes = require('./authRoutes');
const institutesRoutes = require('./institutesRoutes');
const notesRoutes = require('./notesRoutes');
const ordersRoutes = require('./ordersRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/institutes', institutesRoutes);
router.use('/notes', notesRoutes);
router.use('/orders', ordersRoutes);
router.use('/admin', adminRoutes);

module.exports = router;