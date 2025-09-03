// Economic balance service để cân bằng hệ thống tiền tệ
class EconomicService {
  // Cấu hình thu nhập cơ bản
  static INCOME_CONFIG = {
    feed: { coins: 5, cooldown: 300000 }, // 5 phút
    play: { coins: 8, cooldown: 600000 }, // 10 phút
    ability: { coins: 10, cooldown: 900000 }, // 15 phút
    dailyLogin: { coins: 50, cooldown: 86400000 }, // 24 giờ
    achievement: { coins: 100 }, // Không cooldown
    minigame: { coins: 15, cooldown: 300000 } // 5 phút
  };

  // Cấu hình chi phí
  static COST_CONFIG = {
    food: {
      basic: 10,
      premium: 50,
      special: 100
    },
    toys: {
      basic: 20,
      premium: 60,
      special: 120
    },
    abilities: {
      upgrade: 200,
      unlock: 500
    }
  };

  // Kiểm tra cooldown
  static checkCooldown(lastAction, cooldownMs) {
    if (!lastAction) return true;
    return Date.now() - new Date(lastAction).getTime() >= cooldownMs;
  }

  // Tính toán phần thưởng dựa trên level
  static calculateReward(baseAmount, petLevel) {
    const multiplier = 1 + (petLevel - 1) * 0.1; // +10% mỗi level
    return Math.floor(baseAmount * multiplier);
  }

  // Kiểm tra người chơi có đủ tiền không
  static canAfford(userCoins, itemCost) {
    return userCoins >= itemCost;
  }

  // Tính toán giá theo inflation (giảm spam)
  static calculateDynamicPrice(basePrice, purchaseCount) {
    if (purchaseCount < 5) return basePrice;
    const inflationRate = Math.min(purchaseCount * 0.05, 0.5); // Max 50% increase
    return Math.floor(basePrice * (1 + inflationRate));
  }
}

module.exports = EconomicService;
