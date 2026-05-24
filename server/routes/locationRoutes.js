const express = require('express');
const { updateLocation, getRiskZones, getClaimsMap } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All location routes require authentication
router.post('/update', protect, updateLocation);
router.get('/risk-zones', protect, getRiskZones);
router.get('/claims-map', protect, getClaimsMap);

module.exports = router;
