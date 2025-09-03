const DailyMission = require('../models/DailyMission');
const User = require('../models/User');
const { CacheService, PerformanceMonitor } = require('../services/cacheService');

// Lấy danh sách nhiệm vụ hằng ngày
exports.getDailyMissions = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('dailyMissionController.getDailyMissions');
  try {
    // Read-only queries use lean() for better performance
    const missions = await DailyMission.find({ active: true }).lean().exec();
    const user = await User.findById(req.user.id).lean().exec();

    const today = new Date().toISOString().split('T')[0]; // UTC date YYYY-MM-DD

    const userDailyMissions = (user && user.dailyMissions) ? user.dailyMissions : [];

    const missionsWithProgress = missions.map(mission => {
      const userMission = userDailyMissions.find(um => {
        if (!um) return false;
        const umDate = um.date ? new Date(um.date).toISOString().split('T')[0] : null;
        return um.missionCode === mission.code && umDate === today;
      });

      return Object.assign({}, mission, {
        currentProgress: userMission?.currentProgress || 0,
        completed: userMission?.completed || false,
        claimed: userMission?.claimed || false,
        expiresAt: mission.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    });

    timer.end();
    return res.json({ success: true, message: 'Fetched daily missions', data: { missions: missionsWithProgress } });
  } catch (err) {
    console.error('[dailyMissionController.getDailyMissions] error:', err);
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể lấy danh sách nhiệm vụ hiện tại', error: 'Internal server error' });
  }
};

// Đánh dấu hoàn thành nhiệm vụ
exports.completeMission = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('dailyMissionController.completeMission');
  try {
    const { code } = req.body;

    if (!code) {
      timer.end();
      return res.status(400).json({ success: false, message: 'Missing mission code', data: null });
    }

    // mission read as lean (read-only)
    const mission = await DailyMission.findOne({ code, active: true }).lean().exec();

    if (!mission) {
      timer.end();
      return res.status(404).json({ success: false, message: 'Nhiệm vụ không tồn tại', data: null });
    }

    // user needs to be a document to modify and save
    const user = await User.findById(req.user.id);
    if (!user) {
      timer.end();
      return res.status(404).json({ success: false, message: 'User không tồn tại', data: null });
    }

    const today = new Date().toISOString().split('T')[0];

    // Ensure dailyMissions array exists
    user.dailyMissions = user.dailyMissions || [];

    let userMission = user.dailyMissions.find(um => {
      if (!um) return false;
      const umDate = um.date ? new Date(um.date).toISOString().split('T')[0] : null;
      return um.missionCode === code && umDate === today;
    });

    if (!userMission) {
      userMission = {
        missionCode: code,
        currentProgress: 0,
        completed: false,
        claimed: false,
        date: new Date()
      };
      user.dailyMissions.push(userMission);
    }

    // Increase progress
    userMission.currentProgress = Math.min((userMission.currentProgress || 0) + 1, mission.targetProgress || 1);

    if (userMission.currentProgress >= (mission.targetProgress || 1)) {
      userMission.completed = true;
    }

    await user.save();

    // Invalidate caches for this user
    try {
      CacheService.invalidateUserCaches(user._id.toString());
    } catch (cacheErr) {
      console.error('[dailyMissionController.completeMission] cache invalidate error:', cacheErr);
    }

    timer.end();
    return res.json({ success: true, message: 'Đã cập nhật tiến độ nhiệm vụ!', data: { progress: userMission.currentProgress, completed: userMission.completed } });
  } catch (err) {
    console.error('[dailyMissionController.completeMission] error:', err);
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể cập nhật nhiệm vụ', error: 'Internal server error' });
  }
};

// Nhận thưởng nhiệm vụ
exports.claimMissionReward = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('dailyMissionController.claimMissionReward');
  try {
    const { code } = req.body;

    if (!code) {
      timer.end();
      return res.status(400).json({ success: false, message: 'Missing mission code', data: null });
    }

    // mission read-only
    const mission = await DailyMission.findOne({ code, active: true }).lean().exec();
    if (!mission) {
      timer.end();
      return res.status(404).json({ success: false, message: 'Nhiệm vụ không tồn tại', data: null });
    }

    // user as document to modify
    const user = await User.findById(req.user.id);
    if (!user) {
      timer.end();
      return res.status(404).json({ success: false, message: 'User không tồn tại', data: null });
    }

    const today = new Date().toISOString().split('T')[0];

    const userMission = (user.dailyMissions || []).find(um => {
      if (!um) return false;
      const umDate = um.date ? new Date(um.date).toISOString().split('T')[0] : null;
      return um.missionCode === code && umDate === today;
    });

    if (!userMission || !userMission.completed) {
      timer.end();
      return res.status(400).json({ success: false, message: 'Nhiệm vụ chưa hoàn thành', data: null });
    }

    if (userMission.claimed) {
      timer.end();
      return res.status(400).json({ success: false, message: 'Đã nhận thưởng rồi', data: null });
    }

    // Apply rewards safely
    user.coins = (user.coins || 0) + (mission.reward?.coins || 0);
    user.xp = (user.xp || 0) + (mission.reward?.xp || 0);
    userMission.claimed = true;

    await user.save();

    // Invalidate caches for this user
    try {
      CacheService.invalidateUserCaches(user._id.toString());
    } catch (cacheErr) {
      console.error('[dailyMissionController.claimMissionReward] cache invalidate error:', cacheErr);
    }

    timer.end();
    return res.json({ success: true, message: `Nhận thưởng thành công`, data: { reward: mission.reward || {} } });
  } catch (err) {
    console.error('[dailyMissionController.claimMissionReward] error:', err);
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể xử lý nhận thưởng', error: 'Internal server error' });
  }
};
