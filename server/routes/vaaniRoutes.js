const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { handleVaaniChat } = require('../controllers/vaaniController');

const router = express.Router();

router.post('/chat', protect, handleVaaniChat);

module.exports = router;
