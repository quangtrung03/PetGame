const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dailyMissionController = require('../controllers/dailyMissionController');

router.use(auth);

router.get('/', dailyMissionController.getDailyMissions);
router.post('/complete', dailyMissionController.completeMission);
router.post('/claim', dailyMissionController.claimMissionReward);

module.exports = router;
