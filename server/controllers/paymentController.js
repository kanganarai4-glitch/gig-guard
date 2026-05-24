const crypto = require('crypto');
const Payment = require('../models/Payment');
const { createOrder } = require('../utils/razorpay');

/**
 * @desc  Create a Razorpay order for subscription payment
 * @route POST /api/payments/create-order
 * @access Private
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { amount = 49 } = req.body; // Default ₹49/week
    // Razorpay receipt max length is 40. user._id is 24.
    const shortUserId = req.user._id.toString().slice(-6);
    const order = await createOrder(amount, 'INR', `rcpt_${shortUserId}_${Date.now()}`);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY,
      user: { name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
};

/**
 * @desc  Verify Razorpay payment signature and save record
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Skip signature check for mock orders
    if (!razorpay_order_id?.startsWith('mock_')) {
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
      }
    }

    const payment = await Payment.create({
      userId: req.user._id,
      amount: req.body.amount || 49,
      type: 'subscription',
      status: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      description: 'GigGuard Weekly Protection — ₹49',
      paidAt: new Date(),
    });

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification error' });
  }
};

/**
 * @desc  Get all payments for logged-in user
 * @route GET /api/payments
 * @access Private
 */
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getPayments };
