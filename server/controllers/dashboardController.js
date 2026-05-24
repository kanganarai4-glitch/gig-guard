const User = require('../models/User');
const Risk = require('../models/Risk');
const Claim = require('../models/Claim');
const Payment = require('../models/Payment');

/**
 * @desc  Get all dashboard data for the logged-in user
 * @route GET /api/dashboard
 * @access Private
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch in parallel for performance
    const [user, latestRisk, claims, payments] = await Promise.all([
      User.findById(userId),
      Risk.findOne({ userId }).sort({ createdAt: -1 }),
      Claim.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Payment.find({ userId, type: 'payout' }).sort({ createdAt: -1 }).limit(10),
    ]);

    // Calculate protected hours this week (mock: based on claims count)
    const approvedClaims = claims.filter((c) => c.status === 'approved');
    const protectedHours = Math.min(approvedClaims.length * 1.5, 8);
    const totalHours = 8;

    // Total claimed amount
    const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          city: user.city,
          zone: user.zone,
          plan: user.plan,
          whatsappConnected: user.whatsappConnected,
        },
        totalEarnings: user.weeklyEarnings,
        protectedAmount: Math.round(user.weeklyEarnings * 0.55),
        risk: latestRisk
          ? {
              score: latestRisk.score,
              level: latestRisk.level,
              message: latestRisk.message,
              rain: latestRisk.rain,
              aqi: latestRisk.aqi,
              updatedAt: latestRisk.createdAt,
            }
          : { score: 0, level: 'LOW', message: 'Fetching risk data…', rain: 0, aqi: 0 },
        claims: claims.map((c) => ({
          _id: c._id,
          claimId: c.claimId,
          date: c.createdAt,
          type: c.type,
          zone: c.zone,
          amount: c.amount,
          status: c.status,
          riskScore: c.riskScore,
          rain: c.rain,
          aqi: c.aqi,
        })),
        payments: payments.map((p) => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          upiRef: p.upiRef,
          description: p.description,
          paidAt: p.paidAt || p.createdAt,
        })),
        summary: {
          totalClaims: claims.length,
          totalClaimed,
          totalPaid,
          protectedHours: +protectedHours.toFixed(1),
          totalHours,
          shieldPercent: Math.round((protectedHours / totalHours) * 100),
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

module.exports = { getDashboard };
