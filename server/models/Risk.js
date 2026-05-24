const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, default: 'Mumbai' },
    zone: { type: String, default: 'Andheri West' },
    // Raw inputs
    rain: { type: Number, default: 0 },      // mm/hr
    aqi: { type: Number, default: 0 },        // AQI value
    hour: { type: Number, default: 12 },      // hour of day (0-23)
    // Computed output
    score: { type: Number, default: 0 },      // 0-100
    level: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    message: { type: String, default: '' },   // Human-readable INDRA message
  },
  { timestamps: true }
);

// Index to efficiently get latest risk per user
riskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Risk', riskSchema);
