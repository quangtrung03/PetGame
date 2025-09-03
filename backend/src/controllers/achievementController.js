const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { CacheService, PerformanceMonitor } = require('../services/cacheService');

// Lấy danh sách thành tích
exports.getAchievements = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('achievementController.getAchievements');
  try {
    // Use lean() for lower overhead on read-only queries
    const achievements = await Achievement.find().lean().exec();

    timer.end();
    return res.json({ success: true, message: 'Fetched achievements', data: { achievements } });
  } catch (err) {
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể lấy danh sách thành tích', error: err.message });
  }
};

// Lấy thành tích của user hiện tại
exports.getUserAchievements = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('achievementController.getUserAchievements');
  try {
    // Populate then lean to return plain objects and reduce memory overhead
    const user = await User.findById(req.user.id)
      .populate({ path: 'achievements' })
      .lean()
      .exec();

    if (!user) {
      timer.end();
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    const achievements = user.achievements || [];

    timer.end();
    return res.json({ success: true, message: 'Fetched user achievements', data: { achievements } });
  } catch (err) {
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể lấy thành tích user', error: err.message });
  }
};

// Unlock achievement cho user
exports.unlockAchievement = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('achievementController.unlockAchievement');
  try {
    const { code } = req.body;

    if (!code) {
      timer.end();
      return res.status(400).json({ success: false, message: 'Missing achievement code in request body' });
    }

    const achievement = await Achievement.findOne({ code }).lean().exec();

    if (!achievement) {
      timer.end();
      return res.status(404).json({ success: false, message: 'Không tìm thấy thành tích' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      timer.end();
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    const hasAchievement = (user.achievements || []).some(a => a.toString() === achievement._id.toString());

    if (!hasAchievement) {
      user.achievements = user.achievements || [];
      user.achievements.push(achievement._id);

      // Apply rewards if present
      if (achievement.reward) {
        user.coins = (user.coins || 0) + (achievement.reward.coins || 0);
        user.xp = (user.xp || 0) + (achievement.reward.xp || 0);
      }

      await user.save();

      // Invalidate user caches so frontend and other services get fresh data
      try {
        CacheService.invalidateUserCaches(user._id.toString());
      } catch (cacheErr) {
        // Log but don't fail the request because of cache issues
        console.error('Failed to invalidate user caches:', cacheErr.message || cacheErr);
      }
    }

    timer.end();
    return res.json({ success: true, message: 'Đã mở khóa thành tích!', data: { achievement, reward: achievement.reward || {} } });
  } catch (err) {
    timer.end();
    return res.status(500).json({ success: false, message: 'Không thể unlock thành tích', error: err.message });
  }
};
