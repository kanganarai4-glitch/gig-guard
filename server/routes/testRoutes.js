const express = require('express');
const { sendWhatsAppMessage, messages } = require('../utils/whatsappService');

const router = express.Router();

/**
 * @desc  Send a test WhatsApp message — for debugging
 * @route GET /api/test/whatsapp
 * @access Public (dev only — remove in production)
 */
router.get('/whatsapp', async (req, res) => {
  const testNumber = process.env.USER_TEST_WHATSAPP;

  if (!testNumber || testNumber === '+91XXXXXXXXXX') {
    return res.status(400).json({
      success: false,
      message: 'Set USER_TEST_WHATSAPP in server/.env first (e.g. +919876543210)',
    });
  }

  const testMsg =
    `🛡️ *GigGuard WhatsApp Test*\n\n` +
    `✅ Your WhatsApp integration is working!\n` +
    `Timestamp: ${new Date().toLocaleString('en-IN')}\n\n` +
    `You'll now receive:\n` +
    `• Login confirmations\n` +
    `• Risk alerts\n` +
    `• Claim notifications\n` +
    `• Payment receipts`;

  const success = await sendWhatsAppMessage(testNumber, testMsg);

  if (success) {
    res.json({
      success: true,
      message: `✅ Test WhatsApp sent to ${testNumber}`,
      tip: 'If not received, make sure you joined the Twilio sandbox by sending "join <sandbox-word>" to +14155238886',
    });
  } else {
    res.status(500).json({
      success: false,
      message: '❌ Failed to send WhatsApp. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env',
    });
  }
});

/**
 * @desc  Send a custom WhatsApp message
 * @route POST /api/test/whatsapp
 * @body  { to: "+91XXXXXXXXXX", message: "Hello!" }
 */
router.post('/whatsapp', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ message: 'to and message are required' });
  }

  const success = await sendWhatsAppMessage(to, message);
  res.json({ success, to, message });
});

module.exports = router;
