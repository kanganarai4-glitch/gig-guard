const Risk = require('../models/Risk');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { getWeather, getAQI } = require('../utils/weatherService');
const { predictFullPipeline } = require('../utils/aiModel');
const { sendWhatsAppMessage, messages } = require('../utils/whatsappService');

const PAYOUT_AMOUNTS = { rain: 320, aqi: 180, curfew: 450 };

const getClaimType = (rain, aqi) => {
  if (rain > 10) return 'rain';
  if (aqi > 200) return 'aqi';
  return 'rain';
};

/**
 * @desc  Get latest risk score for logged-in user
 * @route GET /api/risk/latest
 * @access Private
 */
const getLatestRisk = async (req, res) => {
  try {
    const risk = await Risk.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!risk) return res.json({ success: true, data: null });
    res.json({ success: true, data: risk });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch risk data' });
  }
};

/**
 * @desc  Manually trigger a risk calculation for the logged-in user
 * @route POST /api/risk/calculate
 * @access Private
 */
const calculateRisk = async (req, res) => {
  try {
    const user = req.user;
    const city = user.city || 'Mumbai';

    const [weather, aqiData] = await Promise.all([getWeather(city), getAQI(city)]);
    const hour = new Date().getHours();
    
    // Construct payload for the ML Engine
    const mlPayload = {
      user_id: user._id.toString(),
      rain: weather.rain,
      aqi: aqiData.aqi,
      wind: weather.wind,
      visibility: weather.visibility,
      humidity: weather.humidity,
      temp: weather.temp,
      pressure: weather.pressure,
      hour,
      location_risk: Math.random() * 20 + 30, // Mock location map risk
      curfew: 0,
      speed: Math.random() * 40,               // Mock speed
      claims_last_4h: await Claim.countDocuments({ userId: user._id, createdAt: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } }),
      gps_distance: Math.random() * 100        // Mock gps jitter
    };

    const mlResult = await predictFullPipeline(mlPayload);

    // Destructure real ML response
    const { indra, kavach, payout } = mlResult;
    const score = indra.risk_score;
    const level = indra.risk_label;
    const message = `ML Engine computed risk: ${score.toFixed(1)}/100. Status: ${level}`;

    const risk = await Risk.create({
      userId: user._id,
      city,
      zone: user.zone,
      rain: weather.rain,
      aqi: aqiData.aqi,
      hour,
      score,
      level,
      message,
    });

    // ── WhatsApp: alert only on HIGH or CRITICAL ────────────────────────────
    if (user.phone && (level === 'HIGH' || level === 'CRITICAL')) {
      sendWhatsAppMessage(
        user.phone,
        messages.riskAlert(score, level, user.zone, message)
      ).catch(() => {});
    }

    // ── Auto-claim if INDRA triggers ──────────────────────────
    if (indra.auto_claim_trigger) {
      if (kavach.fraud) {
        console.warn(`🚨 KAVACH Blocked Auto-Claim for ${user.email} (Fraud Score: ${kavach.fraud_score})`);
        return res.json({ success: true, data: risk, blocked_by_fraud: true });
      }

      const type = getClaimType(weather.rain, aqiData.aqi);
      const amount = Math.round(payout.final_payout); // ML computed payout

      const claim = await Claim.create({
        userId: user._id,
        type,
        zone: user.zone,
        amount,
        status: 'approved',
        riskScore: score,
        rain: weather.rain,
        aqi: aqiData.aqi,
        approvedAt: new Date(),
      });

      const payment = await Payment.create({
        userId: user._id,
        claimId: claim._id,
        amount,
        type: 'payout',
        status: 'completed',
        description: `Auto-payout for ${type} disruption (ML Computed)`,
        paidAt: new Date(),
      });

      await User.findByIdAndUpdate(user._id, {
        $inc: { weeklyEarnings: amount, totalEarnings: amount },
      });

      // WhatsApp: claim created + payment received
      if (user.phone) {
        sendWhatsAppMessage(
          user.phone,
          messages.claimCreated(claim.claimId, amount, type)
        ).catch(() => {});

        // Small delay so messages arrive in order
        setTimeout(() => {
          sendWhatsAppMessage(
            user.phone,
            messages.paymentReceived(amount, payment.upiRef, claim.claimId)
          ).catch(() => {});
        }, 3000);
      }

      return res.json({
        success: true,
        data: risk,
        autoclaim: { claim, payment },
      });
    }

    res.json({ success: true, data: risk });
  } catch (err) {
    console.error('Risk calculate error:', err.message);
    res.status(500).json({ message: 'Failed to calculate risk' });
  }
};

module.exports = { getLatestRisk, calculateRisk };
