const cron = require('node-cron');
const User = require('../models/User');
const Risk = require('../models/Risk');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const { getWeather, getAQI } = require('../utils/weatherService');
const { predictFullPipeline } = require('../utils/aiModel');
const { sendWhatsAppMessage, messages } = require('../utils/whatsappService');

// Payout amounts per disruption type
const PAYOUT_AMOUNTS = { rain: 320, aqi: 180, curfew: 450 };

/**
 * Determine claim type from raw weather data
 */
const getClaimType = (rain, aqi) => {
  if (rain > 10) return 'rain';
  if (aqi > 200) return 'aqi';
  return 'rain'; // fallback
};

/**
 * Core risk job — runs every 5 minutes.
 * For each active user:
 *   1. Fetch weather + AQI
 *   2. Calculate INDRA risk score
 *   3. Save risk record
 *   4. If score >= 70: auto-create claim + payout + emit socket events
 *
 * @param {import('http').Server} io - Socket.IO instance for real-time events
 */
const startRiskJob = (io) => {
  // '*/5 * * * *' = every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log(`\n⏱️  [INDRA Cron] Running risk assessment — ${new Date().toLocaleTimeString()}`);

    try {
      // Only process users with active plans
      const users = await User.find({ 'plan.active': true });
      if (!users.length) return console.log('   No active users found.');

      for (const user of users) {
        try {
          const city = user.city || 'Mumbai';

          // 1. Fetch weather data
          const [weather, aqiData] = await Promise.all([
            getWeather(city),
            getAQI(city),
          ]);

          const hour = new Date().getHours();

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
            location_risk: Math.random() * 20 + 30,
            curfew: 0,
            speed: Math.random() * 40,
            claims_last_4h: await Claim.countDocuments({ userId: user._id, createdAt: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } }),
            gps_distance: Math.random() * 100
          };

          // 2. Run Full ML Engine Pipeline
          const mlResult = await predictFullPipeline(mlPayload);
          const { indra, kavach, payout } = mlResult;

          const score = indra.risk_score;
          const level = indra.risk_label;
          const message = `Cron ML Engine computed risk: ${score.toFixed(1)}/100. Status: ${level}`;

          // 3. Save risk record
          const riskRecord = await Risk.create({
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

          console.log(`   📊 ${user.name} (${city}): score=${score} [${level}] rain=${weather.rain.toFixed(1)}mm aqi=${Math.round(aqiData.aqi)}`);

          // 4. Emit real-time risk update to user's socket room
          io.to(user._id.toString()).emit('risk:update', {
            score,
            level,
            message,
            rain: weather.rain,
            aqi: aqiData.aqi,
            updatedAt: new Date(),
          });

          // 5a. WhatsApp risk alert on HIGH/CRITICAL (fire-and-forget)
          if (user.phone && (level === 'HIGH' || level === 'CRITICAL')) {
            sendWhatsAppMessage(
              user.phone,
              messages.riskAlert(score, level, user.zone, message)
            ).catch(() => {});
          }

          // 5. Auto-claim if INDRA ML says true
          if (indra.auto_claim_trigger) {
            console.log(`   🚨 Risk ML triggered for ${user.name}`);

            if (kavach.fraud) {
              console.log(`   ❌ KAVACH Fraud Block active for ${user.name}! Score: ${kavach.fraud_score}. Skipping auto-payout.`);
              continue; // Skip the auto-claim entirely
            }

            const type = getClaimType(weather.rain, aqiData.aqi);
            const amount = Math.round(payout.final_payout); // ML computed payout

            // Create approved claim immediately
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

            // Simulate UPI payout (auto-payment)
            const payment = await Payment.create({
              userId: user._id,
              claimId: claim._id,
              amount,
              type: 'payout',
              status: 'completed',
              description: `Auto-payout for ${type} disruption (ML Computed)`,
              paidAt: new Date(),
            });

            // Track the auto-payout in user weekly earnings
            await User.findByIdAndUpdate(user._id, {
              $inc: { weeklyEarnings: amount, totalEarnings: amount },
            });

            // Emit payment received event to user
            io.to(user._id.toString()).emit('payment:received', {
              amount,
              claimId: claim.claimId,
              type,
              upiRef: payment.upiRef,
              description: payment.description,
              paidAt: payment.paidAt,
            });

            console.log(`   ✅ Auto-claim ${claim.claimId} created — ₹${amount} sent via UPI (${payment.upiRef})`);

            // WhatsApp: claim created + payment received (fire-and-forget)
            if (user.phone) {
              sendWhatsAppMessage(
                user.phone,
                messages.claimCreated(claim.claimId, amount, type)
              ).catch(() => {});

              setTimeout(() => {
                sendWhatsAppMessage(
                  user.phone,
                  messages.paymentReceived(amount, payment.upiRef, claim.claimId)
                ).catch(() => {});
              }, 3000);
            }
          }
        } catch (userErr) {
          console.error(`   ❌ Error processing user ${user.email}:`, userErr.message);
        }
      }
    } catch (err) {
      console.error('❌ Cron job error:', err.message);
    }
  });

  console.log('⏱️  INDRA risk cron job scheduled — runs every 5 minutes');
};

module.exports = { startRiskJob };
