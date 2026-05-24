const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimId: {
      type: String,
      // Use timestamp + random suffix to guarantee uniqueness
      default: () => `GG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 99 + 10)}`,
      unique: true,
    },
    type: {
      type: String,
      enum: ['rain', 'aqi', 'curfew'],
      required: true,
    },
    zone: { type: String, default: 'Andheri West' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'approved', 'rejected'],
      default: 'processing',
    },
    riskScore: { type: Number }, // snapshot of risk at time of claim
    rain: { type: Number, default: 0 },
    aqi: { type: Number, default: 0 },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
