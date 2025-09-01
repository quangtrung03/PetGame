const DailyMission = require('../models/DailyMission');
const User = require('../models/User');

// Lấy danh sách nhiệm vụ hằng ngày
exports.getDailyMissions = async (req, res) => {
  try {
    const missions = await DailyMission.find({ active: true });
    // TODO: lấy trạng thái hoàn thành từ user
    res.json({ success: true, missions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đánh dấu hoàn thành nhiệm vụ
exports.completeMission = async (req, res) => {
  try {
    const { code } = req.body;
    // TODO: cập nhật trạng thái hoàn thành cho user
    res.json({ success: true, message: 'Đã hoàn thành nhiệm vụ!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Nhận thưởng nhiệm vụ
exports.claimMissionReward = async (req, res) => {
  try {
    const { code } = req.body;
    // TODO: kiểm tra hoàn thành, cộng thưởng cho user
    res.json({ success: true, message: 'Đã nhận thưởng!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
