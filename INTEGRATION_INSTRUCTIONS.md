// Add this to server/src/routes/index.js after line 5:
const newsletterRoutes = require('./newsletterRoutes');

// Add this to server/src/routes/index.js after line 17:
router.use('/newsletter', newsletterRoutes);
