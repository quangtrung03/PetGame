const User = require('../models/User');
const Pet = require('../models/Pet');
const DailyMission = require('../models/DailyMission');
const EconomicService = require('./economicService');

class MissionValidationService {
  // Kiểm tra và cập nhật nhiệm vụ
  static async checkAndUpdateMissions(userId, action, data = {}) {
    try {
      const user = await User.findById(userId).populate('pets');
      if (!user) return;

      // Lấy tất cả nhiệm vụ đang active
      const activeMissions = await DailyMission.find({
        active: true,
        type: action // Match với action type
      });

      const today = new Date().toDateString();

      for (const mission of activeMissions) {
        // Tìm progress của user cho mission này hôm nay
        let userMission = user.dailyMissions.find(
          um => um.missionCode === mission.code && 
               new Date(um.date).toDateString() === today
        );

        if (!userMission) {
          // Tạo mới nếu chưa có
          userMission = {
            missionCode: mission.code,
            currentProgress: 0,
            completed: false,
            claimed: false,
            date: new Date()
          };
          user.dailyMissions.push(userMission);
        }

        // Use detailed validator to compute progress increments
        try {
          const { progressIncrement, completed } = await (async () => {
            // Reuse validateMissionProgress to determine increment
            let progressIncrement = 0;
            let shouldUpdate = false;

            switch (mission.type) {
              case 'feed':
                if (action === 'feed') { progressIncrement = 1; shouldUpdate = true; }
                break;
              case 'play':
                if (action === 'play') { progressIncrement = 1; shouldUpdate = true; }
                break;
              case 'ability':
                if (action === 'ability') { progressIncrement = 1; shouldUpdate = true; }
                break;
              case 'earn_coins':
                if (action === 'earn_coins') { progressIncrement = data.amount || 0; shouldUpdate = true; }
                break;
              case 'spend_coins':
                if (action === 'spend_coins') { progressIncrement = data.amount || 0; shouldUpdate = true; }
                break;
              case 'purchase':
                if (action === 'buy_item') { progressIncrement = 1; shouldUpdate = true; }
                break;
              case 'level_up_pets':
                if (action === 'pet_level_up') { progressIncrement = 1; shouldUpdate = true; }
                break;
              case 'win_minigames':
                if (action === 'minigame_win') { progressIncrement = 1; shouldUpdate = true; }
                break;
            }

            if (!shouldUpdate) return { progressIncrement: 0, completed: false };

            // Apply increment to userMission
            userMission.currentProgress = (userMission.currentProgress || 0) + progressIncrement;
            if (userMission.currentProgress >= mission.targetProgress) {
              userMission.completed = true;
            }

            return { progressIncrement, completed: userMission.completed };
          })();

          // If mission got completed just now, grant rewards
          if (userMission.completed && !userMission.claimed) {
            if (mission.reward?.coins) {
              user.coins += mission.reward.coins;
              user.dailyStats.coinsEarned = (user.dailyStats.coinsEarned || 0) + mission.reward.coins;
            }
            if (mission.reward?.xp) {
              user.xp = (user.xp || 0) + mission.reward.xp;
            }
            // mark claimed only when user claims via endpoint; here we only auto-apply coins/xp
          }
        } catch (err) {
          console.error('Error validating mission progress for', mission.code, err.message);
        }
      }

      await user.save();
    } catch (error) {
      console.error('Mission validation error:', error);
    }
  }

  // Validate từng loại nhiệm vụ
  static async validateMissionProgress(mission, action, data, user) {
    let progressIncrement = 0;
    let shouldUpdate = false;

    switch (mission.type) {
      case 'feed':
        if (action === 'feed') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;

      case 'play':
        if (action === 'play') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;

      case 'ability':
        if (action === 'ability') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;

      case 'earn_coins':
        if (action === 'earn_coins') {
          progressIncrement = data.amount || 0;
          shouldUpdate = true;
        }
        break;

      case 'spend_coins':
        if (action === 'spend_coins') {
          progressIncrement = data.amount || 0;
          shouldUpdate = true;
        }
        break;

      case 'purchase':
        if (action === 'buy_item') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;

      case 'level_up_pets':
        if (action === 'pet_level_up') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;

      case 'win_minigames':
        if (action === 'minigame_win') {
          progressIncrement = 1;
          shouldUpdate = true;
        }
        break;
    }

    if (shouldUpdate) {
      mission.currentProgress += progressIncrement;
      
      // Kiểm tra hoàn thành
      if (mission.currentProgress >= mission.targetProgress) {
        mission.isCompleted = true;
        mission.completedAt = new Date();
        
        // Thưởng coins và XP
        const updateObj = {};
        if (mission.reward.coins > 0) {
          updateObj['coins'] = mission.reward.coins;
          updateObj['dailyStats.coinsEarned'] = mission.reward.coins;
        }
        if (mission.reward.xp > 0) {
          updateObj['xp'] = mission.reward.xp;
        }
        
        if (Object.keys(updateObj).length > 0) {
          await User.findByIdAndUpdate(user._id, { $inc: updateObj });
        }

        // Mission completion notification (development only)
        if (process.env.NODE_ENV === 'development') {
          // console.log(`Mission completed: ${mission.title} - Reward: ${mission.reward.coins} coins, ${mission.reward.xp} XP`);
        }
      }

      await mission.save();
    }
  }

  // Kiểm tra nhiệm vụ mua sắm với chống spam
  static async validatePurchase(userId, itemType, itemCost, quantity = 1) {
    const user = await User.findById(userId);
    
    // Kiểm tra đủ tiền
    if (!EconomicService.canAfford(user.coins, itemCost * quantity)) {
      throw new Error('Không đủ tiền để mua item này');
    }

    // Kiểm tra giới hạn mua hàng hàng ngày
    const dailyLimit = this.getDailyPurchaseLimit(itemType);
    const todayPurchases = this.getTodayPurchases(user, itemType);
    
    if (todayPurchases + quantity > dailyLimit) {
      throw new Error(`Đã đạt giới hạn mua ${itemType} hôm nay (${dailyLimit} lần)`);
    }

    // Tính giá động chống spam
    const dynamicPrice = EconomicService.calculateDynamicPrice(
      itemCost, 
      user.purchaseHistory[itemType] || 0
    );

    return {
      finalPrice: dynamicPrice * quantity,
      canPurchase: true
    };
  }

  // Giới hạn mua hàng theo loại
  static getDailyPurchaseLimit(itemType) {
    const limits = {
      food: 20,      // 20 lần/ngày
      toys: 10,      // 10 lần/ngày
      abilities: 5,  // 5 lần/ngày
      premium: 3     // 3 lần/ngày
    };
    return limits[itemType] || 5;
  }

  // Đếm số lần mua hôm nay
  static getTodayPurchases(user, itemType) {
    const today = new Date();
    const lastReset = user.dailyStats.lastReset;
    
    // Reset nếu qua ngày mới
    if (today.toDateString() !== lastReset.toDateString()) {
      return 0;
    }
    
    return user.purchaseHistory[itemType] || 0;
  }

  // Reset daily stats
  static async resetDailyStats(userId) {
    const today = new Date();
    await User.findByIdAndUpdate(userId, {
      'dailyStats.coinsEarned': 0,
      'dailyStats.coinsSpent': 0,
      'dailyStats.lastReset': today,
      'purchaseHistory.food': 0,
      'purchaseHistory.toys': 0,
      'purchaseHistory.total': 0
    });
  }
}

module.exports = MissionValidationService;
