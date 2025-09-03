const User = require('../models/User');
const { CacheService, PerformanceMonitor } = require('../services/cacheService');

// Helper: Generic error response
function handleInternalError(res, err, label) {
  console.error(`[friendController.${label}]`, err.stack || err);
  return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

// Tìm kiếm user theo username (read-only, optimized)
exports.searchUsers = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.searchUsers', async () => {
      const q = (req.query.q || '').trim();
      // Use lean() for read-only queries
      const users = await User.find({ username: { $regex: q, $options: 'i' } })
        .select('username email')
        .lean()
        .exec();

      return res.json({ success: true, message: 'Search results', data: { users } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'searchUsers');
  }
};

// Gửi lời mời kết bạn
exports.sendFriendRequest = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.sendFriendRequest', async () => {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId', data: null });
      }

      // Cannot send request to self
      if (req.user.id === userId || req.user.id === String(userId)) {
        return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself', data: null });
      }

      // Load target as a full document to modify
      const target = await User.findById(userId);
      if (!target) return res.status(404).json({ success: false, message: 'User not found', data: null });

      target.friendRequests = target.friendRequests || [];
      target.friends = target.friends || [];

      const alreadyRequested = target.friendRequests.some(id => id.toString() === req.user.id.toString());
      const alreadyFriends = target.friends.some(id => id.toString() === req.user.id.toString());

      if (alreadyRequested || alreadyFriends) {
        return res.status(400).json({ success: false, message: 'Đã gửi hoặc đã là bạn', data: null });
      }

      target.friendRequests.push(req.user.id);
      await target.save();

      // Invalidate caches for both users (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidateUserCaches(target._id.toString());
      } catch (cacheErr) {
        console.error('[friendController.sendFriendRequest] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message: 'Đã gửi lời mời kết bạn', data: null });
    });
  } catch (err) {
    return handleInternalError(res, err, 'sendFriendRequest');
  }
};

// Chấp nhận lời mời kết bạn
exports.acceptFriendRequest = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.acceptFriendRequest', async () => {
      const { userId } = req.body; // userId = the one who sent the request

      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId', data: null });
      }

      // Load both users as documents to modify
      const user = await User.findById(req.user.id);
      const friend = await User.findById(userId);

      if (!user || !friend) {
        return res.status(404).json({ success: false, message: 'User not found', data: null });
      }

      user.friendRequests = user.friendRequests || [];
      user.friends = user.friends || [];
      friend.friends = friend.friends || [];

      const hasRequest = user.friendRequests.some(id => id.toString() === userId.toString());
      if (!hasRequest) {
        return res.status(400).json({ success: false, message: 'Không có lời mời này', data: null });
      }

      // Remove from friendRequests and add to friends if not already present
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== userId.toString());
      if (!user.friends.some(id => id.toString() === userId.toString())) {
        user.friends.push(userId);
      }

      if (!friend.friends.some(id => id.toString() === req.user.id.toString())) {
        friend.friends.push(req.user.id);
      }

      // Save both documents atomically-ish (sequential saves)
      await user.save();
      await friend.save();

      // Invalidate caches for both users
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidateUserCaches(userId.toString());
      } catch (cacheErr) {
        console.error('[friendController.acceptFriendRequest] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message: 'Đã chấp nhận kết bạn', data: null });
    });
  } catch (err) {
    return handleInternalError(res, err, 'acceptFriendRequest');
  }
};

// Từ chối lời mời kết bạn
exports.declineFriendRequest = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.declineFriendRequest', async () => {
      const { userId } = req.body; // userId = the one who sent the request

      if (!userId) {
        return res.status(400).json({ success: false, message: 'Missing userId', data: null });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

      user.friendRequests = (user.friendRequests || []).filter(id => id.toString() !== userId.toString());
      await user.save();

      // Invalidate caches for both users
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidateUserCaches(userId.toString());
      } catch (cacheErr) {
        console.error('[friendController.declineFriendRequest] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message: 'Đã từ chối lời mời kết bạn', data: null });
    });
  } catch (err) {
    return handleInternalError(res, err, 'declineFriendRequest');
  }
};

// Lấy danh sách bạn bè (read-only)
exports.getFriends = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.getFriends', async () => {
      const user = await User.findById(req.user.id).populate('friends', 'username email').lean().exec();
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
      return res.json({ success: true, message: 'Fetched friends', data: { friends: user.friends || [] } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'getFriends');
  }
};

// Lấy danh sách lời mời kết bạn (read-only)
exports.getFriendRequests = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('friend.getFriendRequests', async () => {
      const user = await User.findById(req.user.id).populate('friendRequests', 'username email').lean().exec();
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });
      return res.json({ success: true, message: 'Fetched friend requests', data: { requests: user.friendRequests || [] } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'getFriendRequests');
  }
};
