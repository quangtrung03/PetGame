const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  submitMemoryGameResult,
  claimDailyBonus,
  getUserEconomicStats
} = require('../controllers/gameController');

// @route   POST /api/games/memory-result
// @desc    Submit memory game result
// @access  Private
router.post('/memory-result', auth, submitMemoryGameResult);

// @route   POST /api/games/daily-bonus
// @desc    Claim daily login bonus
// @access  Private
router.post('/daily-bonus', auth, claimDailyBonus);

// @route   GET /api/games/economic-stats
// @desc    Get user economic statistics
// @access  Private
router.get('/economic-stats', auth, getUserEconomicStats);

module.exports = router;
