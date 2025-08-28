const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Pet = require('../models/Pet');

// Lấy danh sách thành tích
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json({ achievements });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách thành tích' });
  }
};

// Lấy thành tích của user hiện tại
exports.getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('achievements');
    res.json({ achievements: user.achievements || [] });
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy thành tích user' });
  }
};

// Unlock achievement cho user
exports.unlockAchievement = async (req, res) => {
  try {
    const { code } = req.body;
    const achievement = await Achievement.findOne({ code });
    if (!achievement) return res.status(404).json({ error: 'Không tìm thấy thành tích' });
    const user = await User.findById(req.user.id);
    if (!user.achievements.includes(achievement._id)) {
      user.achievements.push(achievement._id);
      await user.save();
    }
    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ error: 'Không thể unlock thành tích' });
  }
};
