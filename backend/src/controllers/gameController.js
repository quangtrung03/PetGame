const User = require('../models/User');
const EconomicService = require('../services/economicService');
const MissionValidationService = require('../services/missionValidationService');
const { CacheService, PerformanceMonitor } = require('../services/cacheService');

// Internal error handler
function handleInternalError(res, err, label) {
  console.error(`[gameController.${label}]`, err.stack || err);
  return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

// Memory Game result
const submitMemoryGameResult = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('economic.submitMemoryGameResult', async () => {
      const { score, timeCompleted, difficulty } = req.body;

      // Load user document (we will modify it)
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

      // Kiểm tra cooldown using EconomicService helper (unchanged business logic)
      const canPlay = EconomicService.checkCooldown(
        user.actionCooldowns?.minigame,
        EconomicService.INCOME_CONFIG.minigame.cooldown
      );

      if (!canPlay) {
        const lastAction = user.actionCooldowns?.minigame ? new Date(user.actionCooldowns.minigame).getTime() : 0;
        const timeLeft = Math.ceil((lastAction + EconomicService.INCOME_CONFIG.minigame.cooldown - Date.now()) / 60000);
        return res.status(400).json({ success: false, message: `⏰ Phải đợi ${timeLeft} phút nữa mới có thể chơi game!` });
      }

      // Reward calculation (business logic preserved)
      let baseReward = EconomicService.INCOME_CONFIG.minigame.coins;
      let multiplier = 1;
      const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
      multiplier *= difficultyMultiplier[difficulty] || 1;

      if (score >= 90) multiplier *= 2;
      else if (score >= 70) multiplier *= 1.5;
      else if (score >= 50) multiplier *= 1.2;

      if (timeCompleted < 30) multiplier *= 1.5;
      else if (timeCompleted < 60) multiplier *= 1.2;

      const finalReward = Math.floor(baseReward * multiplier);
      const isWin = score >= 50;

      // Update user document
      user.coins = (user.coins || 0) + finalReward;
      user.actionCooldowns = user.actionCooldowns || {};
      user.actionCooldowns.minigame = new Date();
      user.dailyStats = user.dailyStats || { coinsEarned: 0 };
      user.dailyStats.coinsEarned = (user.dailyStats.coinsEarned || 0) + finalReward;
      await user.save();

      // Invalidate caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
      } catch (cacheErr) {
        console.error('[gameController.submitMemoryGameResult] cache invalidate error:', cacheErr);
      }

      // Update missions (unchanged)
      if (isWin) {
        await MissionValidationService.checkAndUpdateMissions(req.user.id, 'minigame_win', { score, difficulty });
      }
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'earn_coins', { amount: finalReward });

      return res.json({ success: true, message: isWin ? `🎮 Chúc mừng! Bạn thắng! (+${finalReward} 💰)` : `🎮 Cố gắng thêm! (+${finalReward} 💰)`, data: {
        score,
        timeCompleted,
        difficulty,
        coinsEarned: finalReward,
        userCoins: user.coins,
        isWin,
        multiplier: multiplier.toFixed(1)
      } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'submitMemoryGameResult');
  }
};

// Daily login bonus
const claimDailyBonus = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('economic.claimDailyBonus', async () => {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

      // Kiểm tra có thể claim không
      const canClaim = EconomicService.checkCooldown(
        user.actionCooldowns?.dailyLogin,
        EconomicService.INCOME_CONFIG.dailyLogin.cooldown
      );

      if (!canClaim) {
        return res.status(400).json({ success: false, message: 'Đã nhận phần thưởng đăng nhập hôm nay!', data: null });
      }

      // Tính streak bonus using UTC date comparison
      const yesterdayUTC = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const lastLoginUTC = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null;

      let streak = user.dailyLoginStreak || 0;
      if (lastLoginUTC === yesterdayUTC) {
        streak += 1;
      } else {
        streak = 1; // Reset streak
      }

      const streakMultiplier = Math.min(streak, 7) * 0.2 + 1; // 1.2x - 2.4x
      const baseReward = EconomicService.INCOME_CONFIG.dailyLogin.coins;
      const finalReward = Math.floor(baseReward * streakMultiplier);

      // Update user document
      user.coins = (user.coins || 0) + finalReward;
      user.dailyLoginStreak = streak;
      user.lastLogin = new Date();
      user.actionCooldowns = user.actionCooldowns || {};
      user.actionCooldowns.dailyLogin = new Date();
      user.dailyStats = user.dailyStats || { coinsEarned: 0 };
      user.dailyStats.coinsEarned = (user.dailyStats.coinsEarned || 0) + finalReward;
      await user.save();

      // Invalidate caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
      } catch (cacheErr) {
        console.error('[gameController.claimDailyBonus] cache invalidate error:', cacheErr);
      }

      // Update missions
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'earn_coins', { amount: finalReward });

      return res.json({ success: true, message: `🎁 Nhận thưởng đăng nhập! Streak ${streak} ngày (+${finalReward} 💰)`, data: {
        coinsEarned: finalReward,
        userCoins: user.coins,
        streak,
        streakMultiplier: streakMultiplier.toFixed(1)
      } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'claimDailyBonus');
  }
};

// Get user economic stats
const getUserEconomicStats = async (req, res) => {
  try {
    return await PerformanceMonitor.measureAsync('economic.getUserEconomicStats', async () => {
      // Use lean() for read-only
      const user = await User.findById(req.user.id).lean().exec();
      if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

      const now = Date.now();
      const cooldowns = {};

      Object.keys(EconomicService.INCOME_CONFIG).forEach(action => {
        const lastActionRaw = user.actionCooldowns?.[action];
        const lastAction = lastActionRaw ? new Date(lastActionRaw) : null;
        const cooldownMs = EconomicService.INCOME_CONFIG[action].cooldown;

        if (lastAction && cooldownMs) {
          const timeLeft = lastAction.getTime() + cooldownMs - now;
          cooldowns[action] = {
            canPerform: timeLeft <= 0,
            timeLeftMs: Math.max(0, timeLeft),
            timeLeftMinutes: Math.max(0, Math.ceil(timeLeft / 60000))
          };
        } else {
          cooldowns[action] = { canPerform: true, timeLeftMs: 0, timeLeftMinutes: 0 };
        }
      });

      return res.json({ success: true, message: 'Fetched economic stats', data: {
        coins: user.coins,
        level: user.level,
        dailyStats: user.dailyStats,
        purchaseHistory: user.purchaseHistory,
        cooldowns,
        dailyLoginStreak: user.dailyLoginStreak
      } });
    });
  } catch (err) {
    return handleInternalError(res, err, 'getUserEconomicStats');
  }
};

module.exports = {
  submitMemoryGameResult,
  claimDailyBonus,
  getUserEconomicStats
};
