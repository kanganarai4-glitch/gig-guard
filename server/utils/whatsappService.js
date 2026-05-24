const twilio = require('twilio');

// ─── Twilio client (singleton) ────────────────────────────────────────────────
let client = null;

const getClient = () => {
  if (client) return client;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn('⚠️  Twilio credentials not configured — WhatsApp messages will be skipped');
    return null;
  }

  try {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return client;
  } catch (err) {
    console.warn('⚠️  Twilio init failed:', err.message);
    return null;
  }
};

/**
 * Send a WhatsApp message via Twilio.
 *
 * @param {string} to   - Recipient number in format +91XXXXXXXXXX
 * @param {string} body - Message text
 * @returns {Promise<boolean>} true on success, false on failure (never throws)
 */
const sendWhatsAppMessage = async (to, body) => {
  const twClient = getClient();

  if (!twClient) {
    console.log(`📵 WhatsApp skipped (no Twilio config) → ${to}: ${body.slice(0, 40)}...`);
    return false;
  }

  if (!to) {
    console.warn('⚠️  WhatsApp: recipient phone number is missing');
    return false;
  }

  // Normalize number: strip non-digits except leading +
  const normalized = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  try {
    const msg = await twClient.messages.create({
      from,
      to: normalized,
      body,
    });
    console.log(`✅ WhatsApp sent → ${normalized} | SID: ${msg.sid}`);
    return true;
  } catch (err) {
    // Non-fatal — log and continue, never crash the API
    console.error(`❌ WhatsApp failed → ${normalized}: ${err.message}`);
    return false;
  }
};

// ─── Pre-built message templates ──────────────────────────────────────────────

const messages = {
  loginWelcome: (name) =>
    `🛡️ *GigGuard*\nWelcome back, ${name}! Your income protection is now *ACTIVE*.\n\nWe're monitoring weather + AQI in your zone. If risk > 70, your claim is auto-created. 💪`,

  newUser: (name) =>
    `🛡️ *GigGuard*\nHi ${name}! Your account has been created.\n\nYour weekly income protection (₹49/week) is now live. We'll alert you before any disruption happens. Stay safe! 🌟`,

  riskAlert: (score, level, zone, message) =>
    `⚠️ *GigGuard Risk Alert*\n\nRisk Score: *${score}/100* [${level}]\nZone: ${zone}\n\n${message}\n\nA claim will be auto-processed if conditions worsen.`,

  claimCreated: (claimId, amount, type) =>
    `📄 *GigGuard Claim Created*\n\nClaim ID: ${claimId}\nType: ${type.toUpperCase()} disruption\nAmount: *₹${amount}*\nStatus: Processing ⏳\n\nYou'll receive payment within 60 seconds.`,

  paymentReceived: (amount, upiRef, claimId) =>
    `💰 *GigGuard Payout*\n\n*₹${amount}* has been credited to your UPI account!\n\nClaim: ${claimId}\nRef: ${upiRef}\nStatus: ✅ SUCCESS\n\nThank you for trusting GigGuard. 🙏`,
};

module.exports = { sendWhatsAppMessage, messages };
