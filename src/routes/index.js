const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/products', require('./products'));
router.use('/carts', require('./carts'));
router.use('/orders', require('./orders'));
router.use('/health', require('./health'));

module.exports = router;