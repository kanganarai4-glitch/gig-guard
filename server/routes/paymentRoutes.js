const express = require('express');
const { createPaymentOrder, verifyPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getPayments);

module.exports = router;
