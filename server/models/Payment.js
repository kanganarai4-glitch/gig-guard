const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: {
      type: String,
      enum: ['payout', 'subscription', 'refund'],
      default: 'payout',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    // Razorpay fields (for subscription payments)
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    // Mock UPI payout reference
    upiRef: {
      type: String,
      default: () => `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`,
    },
    description: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
