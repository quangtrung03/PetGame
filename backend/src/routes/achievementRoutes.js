const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

// Lấy tất cả thành tích
router.get('/', achievementController.getAchievements);
// Lấy thành tích của user hiện tại
router.get('/user', auth, achievementController.getUserAchievements);
// Unlock thành tích cho user
router.post('/unlock', auth, achievementController.unlockAchievement);

module.exports = router;
