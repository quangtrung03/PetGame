const User = require('../models/User');

// Tìm kiếm user theo username
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('username email');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gửi lời mời kết bạn
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.friendRequests.includes(req.user.id) || target.friends.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Đã gửi hoặc đã là bạn' });
    }
    target.friendRequests.push(req.user.id);
    await target.save();
    res.json({ success: true, message: 'Đã gửi lời mời kết bạn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Chấp nhận lời mời kết bạn
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.friendRequests.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Không có lời mời này' });
    }
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== userId);
    user.friends.push(userId);
    await user.save();
    const friend = await User.findById(userId);
    friend.friends.push(req.user.id);
    await friend.save();
    res.json({ success: true, message: 'Đã chấp nhận kết bạn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Từ chối lời mời kết bạn
exports.declineFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.user.id);
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== userId);
    await user.save();
    res.json({ success: true, message: 'Đã từ chối lời mời kết bạn' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách bạn bè
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username email');
    res.json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách lời mời kết bạn
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests', 'username email');
    res.json({ success: true, requests: user.friendRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
