const express = require('express');
const { getLatestRisk, calculateRisk } = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/latest', protect, getLatestRisk);
router.post('/calculate', protect, calculateRisk);

module.exports = router;
