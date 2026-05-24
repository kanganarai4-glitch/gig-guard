const Razorpay = require('razorpay');

let razorpayInstance = null;

/**
 * Get Razorpay instance (singleton).
 * Returns null gracefully if keys are not configured.
 */
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    console.warn('⚠️  Razorpay keys not configured — payment features will use mock mode');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    return razorpayInstance;
  } catch (err) {
    console.warn('⚠️  Razorpay init failed:', err.message);
    return null;
  }
};

/**
 * Create a Razorpay order. Falls back to mock if Razorpay unavailable.
 */
const createOrder = async (amount, currency = 'INR', receipt = `rcpt_${Date.now()}`) => {
  const rz = getRazorpay();
  if (!rz) {
    // Mock order
    return {
      id: `mock_order_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt,
      mock: true,
    };
  }
  return await rz.orders.create({ amount: amount * 100, currency, receipt });
};

module.exports = { getRazorpay, createOrder };
