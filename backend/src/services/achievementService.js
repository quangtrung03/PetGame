// Achievement service để tách logic achievement khỏi controller
const Achievement = require('../models/Achievement');
const User = require('../models/User');

class AchievementService {
  static async unlockAchievement(userId, achievementCode) {
    try {
      const achievement = await Achievement.findOne({ code: achievementCode });
      if (!achievement) return false;

      const user = await User.findById(userId);
      if (!user || user.achievements.includes(achievement._id)) return false;

      user.achievements.push(achievement._id);
      await user.save();
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  static async checkFirstPet(userId) {
    return this.unlockAchievement(userId, 'first_pet');
  }

  static async checkPetLover(userId) {
    const user = await User.findById(userId);
    if (user && user.pets.length >= 5) {
      return this.unlockAchievement(userId, 'pet_lover');
    }
    return false;
  }

  static async checkFeeder(pet, userId) {
    if (pet.feedCount >= 100) {
      return this.unlockAchievement(userId, 'feeder');
    }
    return false;
  }

  static async checkPlayer(pet, userId) {
    if (pet.playCount >= 100) {
      return this.unlockAchievement(userId, 'player');
    }
    return false;
  }

  static async checkPetMaster(pet, userId) {
    if (pet.level >= 10) {
      return this.unlockAchievement(userId, 'pet_master');
    }
    return false;
  }

  static async checkTrainer(userId) {
    const user = await User.findById(userId).populate('pets');
    const totalXP = (user.pets || []).reduce((sum, p) => sum + (p.xp || 0), 0);
    if (totalXP >= 1000) {
      return this.unlockAchievement(userId, 'trainer');
    }
    return false;
  }
}

module.exports = AchievementService;
