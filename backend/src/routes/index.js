const router = require('express').Router();
const authRoutes = require('./auth');
const orderRoutes = require('./orders');

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
