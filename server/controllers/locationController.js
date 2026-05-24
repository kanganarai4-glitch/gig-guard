const User = require('../models/User');
const Risk = require('../models/Risk');
const Claim = require('../models/Claim');

/**
 * @desc  Update user's current location
 * @route POST /api/location/update
 * @access Private
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    // Basic sanity check for Indian coordinates
    if (latitude < 6 || latitude > 37 || longitude < 68 || longitude > 98) {
      return res.status(400).json({ message: 'Coordinates appear to be outside India' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'location.latitude': latitude,
        'location.longitude': longitude,
        'location.accuracy': accuracy || null,
        'location.lastUpdatedAt': new Date(),
      },
      { new: true, select: 'name location city zone' }
    );

    res.json({ success: true, data: user.location });
  } catch (err) {
    console.error('Location update error:', err.message);
    res.status(500).json({ message: 'Failed to update location' });
  }
};

/**
 * @desc  Get risk zone data for map display — all recent risks with user locations
 * @route GET /api/location/risk-zones
 * @access Private
 */
const getRiskZones = async (req, res) => {
  try {
    // Get last 24h risk records for users who have location set
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const riskRecords = await Risk.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .populate('userId', 'name city zone location')
      .lean();

    // Build zone map: one entry per user (most recent risk)
    const zoneMap = new Map();
    for (const r of riskRecords) {
      const uid = r.userId?._id?.toString();
      if (!uid || zoneMap.has(uid)) continue;

      const loc = r.userId?.location;
      if (!loc?.latitude) continue; // skip users without location

      zoneMap.set(uid, {
        userId: uid,
        name: r.userId?.name || 'Partner',
        city: r.userId?.city || 'Mumbai',
        zone: r.userId?.zone || 'Unknown',
        lat: loc.latitude,
        lng: loc.longitude,
        score: r.score,
        level: r.level,
        message: r.message,
        rain: r.rain,
        aqi: r.aqi,
        updatedAt: r.createdAt,
      });
    }

    // Also add static Mumbai zone reference points for demo
    const staticZones = getStaticMumbaiZones();

    res.json({
      success: true,
      data: {
        userZones: Array.from(zoneMap.values()),
        staticZones,
      },
    });
  } catch (err) {
    console.error('Risk zones error:', err.message);
    res.status(500).json({ message: 'Failed to fetch risk zones' });
  }
};

/**
 * @desc  Get claims with coordinates for map pins
 * @route GET /api/location/claims-map
 * @access Private
 */
const getClaimsMap = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const claims = await Claim.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Attach coordinates — use user's actual location or zone defaults
    const userLat = user.location?.latitude || ZONE_DEFAULTS[user.zone]?.lat || 19.119;
    const userLng = user.location?.longitude || ZONE_DEFAULTS[user.zone]?.lng || 72.846;

    const claimsWithCoords = claims.map((c, i) => ({
      ...c,
      // Scatter slightly around user location for visual variety
      lat: userLat + (Math.random() - 0.5) * 0.015,
      lng: userLng + (Math.random() - 0.5) * 0.015,
    }));

    res.json({ success: true, data: claimsWithCoords });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch claims map data' });
  }
};

// ─── Static Mumbai zone defaults ──────────────────────────────────────────────
const ZONE_DEFAULTS = {
  'Andheri West': { lat: 19.1197, lng: 72.8464 },
  'Andheri East': { lat: 19.1136, lng: 72.8697 },
  'Bandra West': { lat: 19.0596, lng: 72.8295 },
  'Dadar': { lat: 19.0178, lng: 72.8478 },
  'Kurla': { lat: 19.0728, lng: 72.8826 },
  'Malad': { lat: 19.1872, lng: 72.8484 },
  'Borivali': { lat: 19.2282, lng: 72.8540 },
  'Thane': { lat: 19.2183, lng: 72.9781 },
};

// Static risk zone reference data for Mumbai (used when no real users exist yet)
const getStaticMumbaiZones = () => [
  { id: 'z1', name: 'Andheri West', lat: 19.1197, lng: 72.8464, score: 45, level: 'MODERATE', radius: 800 },
  { id: 'z2', name: 'Bandra West', lat: 19.0596, lng: 72.8295, score: 22, level: 'LOW', radius: 600 },
  { id: 'z3', name: 'Kurla', lat: 19.0728, lng: 72.8826, score: 72, level: 'HIGH', radius: 700 },
  { id: 'z4', name: 'Dadar', lat: 19.0178, lng: 72.8478, score: 38, level: 'MODERATE', radius: 600 },
  { id: 'z5', name: 'Malad', lat: 19.1872, lng: 72.8484, score: 15, level: 'LOW', radius: 900 },
  { id: 'z6', name: 'Thane', lat: 19.2183, lng: 72.9781, score: 88, level: 'CRITICAL', radius: 1000 },
];

module.exports = { updateLocation, getRiskZones, getClaimsMap };
