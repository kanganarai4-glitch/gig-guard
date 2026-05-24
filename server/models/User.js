const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    provider: {
      type: String,
      enum: ['zomato', 'swiggy', 'google'],
      default: 'google',
    },
    city: { type: String, default: 'Mumbai' },
    zone: { type: String, default: 'Andheri West' },

    // ── Phone for WhatsApp alerts ──────────────────────────────────────────
    // Store in E.164 format: +91XXXXXXXXXX
    phone: {
      type: String,
      trim: true,
      default: null,
      // Validate Indian mobile numbers (+91 followed by 10 digits)
      validate: {
        validator: (v) => !v || /^\+91[6-9]\d{9}$/.test(v),
        message: 'Phone must be in format +91XXXXXXXXXX',
      },
    },

    // Earnings tracked weekly
    weeklyEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    // Plan info
    plan: {
      active: { type: Boolean, default: true },
      startDate: { type: Date, default: Date.now },
      weeklyFee: { type: Number, default: 49 },
    },

    // WhatsApp / UPI
    upiId: { type: String },
    whatsappConnected: { type: Boolean, default: false },

    // ── Location for map features ──────────────────────────────────────────
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      lastUpdatedAt: { type: Date, default: null },
      accuracy: { type: Number, default: null }, // metres
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
