const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');

/**
 * @route   GET /api/help
 * @desc    Get comprehensive help information about all game features
 * @access  Public (anyone can see what the game offers)
 */
router.get('/', helpController.getHelpInfo);

/**
 * @route   GET /api/help/quick-guide
 * @desc    Get quick start guide for new players
 * @access  Public (help new users get started)
 */
router.get('/quick-guide', helpController.getQuickGuide);

module.exports = router;