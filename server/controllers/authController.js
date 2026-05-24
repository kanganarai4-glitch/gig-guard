const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWhatsAppMessage, messages } = require('../utils/whatsappService');

/** Generate JWT token */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/**
 * @desc  Login / Register via social provider (Zomato, Swiggy, Google)
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { name, email, provider, city, zone, phone } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ message: 'Email and provider are required' });
    }

    // Upsert — create user if doesn't exist, update if they do
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        provider,
        city: city || 'Mumbai',
        zone: zone || 'Andheri West',
        phone: phone || null,
        weeklyEarnings: Math.floor(Math.random() * 2000 + 2000),
        totalEarnings: Math.floor(Math.random() * 10000 + 5000),
        whatsappConnected: !!phone,
      });
      console.log(`👤 New user created: ${user.email} via ${provider}`);
    } else {
      // Update fields if provided
      user.provider = provider;
      if (name) user.name = name;
      if (phone && phone !== user.phone) {
        user.phone = phone;
        user.whatsappConnected = true;
      }
      await user.save();
    }

    const token = signToken(user._id);

    // ── WhatsApp notification (non-blocking, won't crash API) ──────────────
    if (user.phone) {
      const msg = isNewUser
        ? messages.newUser(user.name)
        : messages.loginWelcome(user.name);

      // Fire-and-forget — don't await so login is instant
      sendWhatsAppMessage(user.phone, msg).catch(() => {});
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        city: user.city,
        zone: user.zone,
        phone: user.phone,
        plan: user.plan,
        whatsappConnected: user.whatsappConnected,
      },
    });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * @desc  Get currently logged-in user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, getMe };
