const Pet = require('../models/Pet');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const AbilityService = require('../services/abilityService');
const AchievementService = require('../services/achievementService');
const EconomicService = require('../services/economicService');
const MissionValidationService = require('../services/missionValidationService');
const { CacheService, QueryOptimizer, PerformanceMonitor, CACHE_KEYS, CACHE_TTL } = require('../services/cacheService');

// Centralized internal error handler
function handleInternalError(res, err, label) {
  console.error(`[petController.${label}]`, err.stack || err);
  return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

// ============================
// Use Pet Ability
// ============================
const usePetAbility = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.usePetAbility', async () => {
    try {
      const petId = req.params.id;
      const { ability } = req.body;

      // Optimize: Get pet and user data in parallel (reads use lean)
      const [pet, user] = await Promise.all([
        PerformanceMonitor.measureAsync('Pet.findOne', () =>
          Pet.findOne({ _id: petId, owner: req.user.id }).lean().exec()
        ),
        CacheService.getOrFetch(
          CACHE_KEYS.USER_PROFILE(req.user.id),
          () => PerformanceMonitor.measureAsync('User.findById', () =>
            User.findById(req.user.id).select(QueryOptimizer.getUserFields(true)).lean().exec()
          ),
          CACHE_TTL.USER_PROFILE
        )
      ]);

      if (!pet) {
        return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      }

      // Kiểm tra cooldown cho ability
      const canUseAbility = EconomicService.checkCooldown(
        user.actionCooldowns?.ability,
        EconomicService.INCOME_CONFIG.ability.cooldown
      );

      if (!canUseAbility) {
        const lastAction = user.actionCooldowns?.ability ? new Date(user.actionCooldowns.ability).getTime() : 0;
        const timeLeft = Math.ceil((lastAction + EconomicService.INCOME_CONFIG.ability.cooldown - Date.now()) / 60000);
        return res.status(400).json({ success: false, message: `⏰ Phải đợi ${timeLeft} phút nữa mới có thể dùng ability!`, data: null });
      }

      // Get pet document (not lean) for ability usage
      const petDoc = await Pet.findOne({ _id: petId, owner: req.user.id });
      if (!petDoc) {
        return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      }

      const message = await AbilityService.useAbility(petDoc, ability);

      // Tính toán phần thưởng
      const coinsReward = EconomicService.calculateReward(
        EconomicService.INCOME_CONFIG.ability.coins,
        petDoc.level
      );

      // Batch update user and pet data
      const updatedUser = await PerformanceMonitor.measureAsync('User.updateUser', async () => {
        return await User.findByIdAndUpdate(
          req.user.id,
          {
            $inc: {
              coins: coinsReward,
              'dailyStats.coinsEarned': coinsReward
            },
            $set: { 'actionCooldowns.ability': new Date() }
          },
          { new: true, select: QueryOptimizer.getUserFields(true) }
        ).exec();
      });

      // Invalidate user and pet caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidatePetCaches(petId, req.user.id);
      } catch (cacheErr) {
        console.error('[petController.usePetAbility] cache invalidate error:', cacheErr);
      }

      // Parallel mission validation
      await Promise.all([
        MissionValidationService.checkAndUpdateMissions(req.user.id, 'ability', { petId: petDoc._id, ability }),
        MissionValidationService.checkAndUpdateMissions(req.user.id, 'earn_coins', { amount: coinsReward })
      ]);

      return res.json({ success: true, message: `${message} (+${coinsReward} \ud83d\udcb0)`, data: { pet: petDoc, coinsEarned: coinsReward, user: { coins: updatedUser.coins } } });
    } catch (err) {
      return handleInternalError(res, err, 'usePetAbility');
    }
  });
};

// ============================
// Get all pets for authenticated user
// ============================
const getUserPets = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.getUserPets', async () => {
    try {
      // Try to get from cache first
      const cacheKey = CACHE_KEYS.USER_PETS(req.user.id);
      const cachedPets = CacheService.get(cacheKey);

      if (cachedPets) {
        return res.json({ success: true, message: 'Fetched user pets (cached)', data: { pets: cachedPets, fromCache: true } });
      }

      // Use optimized aggregation pipeline (returns plain objects)
      const pets = await PerformanceMonitor.measureAsync('Pet.aggregate', async () => {
        return await Pet.aggregate(QueryOptimizer.getUserPetsAggregation(req.user.id));
      });

      // Update stats only for pets that need it (older than 1 hour)
      const petsToUpdate = [];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      for (let pet of pets) {
        if (!pet.lastUpdated || pet.lastUpdated < oneHourAgo) {
          petsToUpdate.push(pet._id);
        }
      }

      // Batch update lastUpdated for pets that need it
      if (petsToUpdate.length > 0) {
        await PerformanceMonitor.measureAsync('Pet.bulkUpdate', async () => {
          const bulkOps = petsToUpdate.map(petId => ({
            updateOne: {
              filter: { _id: petId },
              update: { $set: { lastUpdated: new Date() } }
            }
          }));
          return await Pet.bulkWrite(bulkOps);
        });
      }

      // Cache the result
      CacheService.set(cacheKey, pets, CACHE_TTL.USER_PETS);

      return res.json({ success: true, message: 'Fetched user pets', data: { pets, fromCache: false } });
    } catch (err) {
      return handleInternalError(res, err, 'getUserPets');
    }
  });
};

// ============================
// Create new pet
// ============================
const createPet = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.createPet', async () => {
    try {
      const { name, type } = req.body;
      const abilities = AbilityService.getAbilitiesForType(type);

      const pet = await Pet.create({ name, type, abilities, owner: req.user.id });

      await User.findByIdAndUpdate(req.user.id, { $push: { pets: pet._id } }).exec();

      // Check achievements
      await AchievementService.checkFirstPet(req.user.id);
      await AchievementService.checkPetLover(req.user.id);

      // Invalidate caches for user
      try {
        await CacheService.invalidateUserCaches(req.user.id);
      } catch (cacheErr) {
        console.error('[petController.createPet] cache invalidate error:', cacheErr);
      }

      return res.status(201).json({ success: true, message: 'Pet created successfully', data: { pet } });
    } catch (err) {
      return handleInternalError(res, err, 'createPet');
    }
  });
};

// ============================
// Feed pet
// ============================
const feedPet = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.feedPet', async () => {
    try {
      const petId = req.params.id;

      // Get pet and user data in parallel with caching
      const [petData, user] = await Promise.all([
        PerformanceMonitor.measureAsync('Pet.findById', () => Pet.findOne({ _id: petId, owner: req.user.id }).lean().exec()),
        CacheService.getOrFetch(
          CACHE_KEYS.USER_PROFILE(req.user.id),
          () => PerformanceMonitor.measureAsync('User.findById', () => User.findById(req.user.id).select(QueryOptimizer.getUserFields(true)).lean().exec()),
          CACHE_TTL.USER_PROFILE
        )
      ]);

      if (!petData) {
        return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      }

      // Kiểm tra cooldown để tránh spam
      const canFeed = EconomicService.checkCooldown(user.actionCooldowns?.feed, EconomicService.INCOME_CONFIG.feed.cooldown);

      if (!canFeed) {
        const lastAction = user.actionCooldowns?.feed ? new Date(user.actionCooldowns.feed).getTime() : 0;
        const timeLeft = Math.ceil((lastAction + EconomicService.INCOME_CONFIG.feed.cooldown - Date.now()) / 60000);
        return res.status(400).json({ success: false, message: `⏰ Phải đợi ${timeLeft} phút nữa mới có thể cho ăn!`, data: null });
      }

      // Get actual Pet document (not lean) for methods with owner check
      const petDoc = await Pet.findOne({ _id: petId, owner: req.user.id });
      if (!petDoc) {
        return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      }

      const feedResult = petDoc.feed(); // Returns { pet, leveledUp }

      // Tính toán phần thưởng
      const coinsReward = EconomicService.calculateReward(EconomicService.INCOME_CONFIG.feed.coins, petDoc.level);

      // Level up bonus
      let levelUpBonus = 0;
      if (feedResult.leveledUp) {
        levelUpBonus = petDoc.level * 10; // Bonus coins for leveling up
      }

      const totalCoinsReward = coinsReward + levelUpBonus;

      // Batch update pet and user data in parallel
      const [updatedPet, updatedUser] = await Promise.all([
        PerformanceMonitor.measureAsync('Pet.save', () => petDoc.save()),
        PerformanceMonitor.measureAsync('User.updateUser', async () => {
          return await User.findByIdAndUpdate(
            req.user.id,
            {
              $inc: { coins: totalCoinsReward, 'dailyStats.coinsEarned': totalCoinsReward },
              $set: { 'actionCooldowns.feed': new Date() }
            },
            { new: true, select: QueryOptimizer.getUserFields(true) }
          ).exec();
        })
      ]);

      // Check achievements
      await AchievementService.checkFeeder(updatedPet, req.user.id);
      const leveledUp = feedResult.leveledUp;
      if (leveledUp) {
        await AchievementService.checkPetMaster(updatedPet, req.user.id);
        // Cập nhật nhiệm vụ level up
        await MissionValidationService.checkAndUpdateMissions(req.user.id, 'pet_level_up');
      }
      await AchievementService.checkTrainer(req.user.id);

      // Cập nhật nhiệm vụ
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'feed', { petId: updatedPet._id });
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'earn_coins', { amount: totalCoinsReward });

      let message = `🍖 Pet đã no rồi! (+${totalCoinsReward} 💰)`;
      if (leveledUp) {
        message += ` 🎉 Level lên ${updatedPet.level}! (+${levelUpBonus} bonus)`;
      }

      // Invalidate caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidatePetCaches(petId, req.user.id);
      } catch (cacheErr) {
        console.error('[petController.feedPet] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message, data: { pet: updatedPet, leveledUp, xpGained: 10, coinsEarned: totalCoinsReward, user: { coins: updatedUser.coins } } });
    } catch (err) {
      return handleInternalError(res, err, 'feedPet');
    }
  });
};

// ============================
// Play with pet
// ============================
const playWithPet = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.playWithPet', async () => {
    try {
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      if (pet.owner.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to play with this pet', data: null });

      // Kiểm tra cooldown
      const user = await User.findById(req.user.id);
      const canPlay = EconomicService.checkCooldown(user.actionCooldowns?.play, EconomicService.INCOME_CONFIG.play.cooldown);

      if (!canPlay) {
        const lastAction = user.actionCooldowns?.play ? new Date(user.actionCooldowns.play).getTime() : 0;
        const timeLeft = Math.ceil((lastAction + EconomicService.INCOME_CONFIG.play.cooldown - Date.now()) / 60000);
        return res.status(400).json({ success: false, message: `⏰ Phải đợi ${timeLeft} phút nữa mới có thể chơi!`, data: null });
      }

      const playResult = pet.play(); // Returns { pet, leveledUp }
      await pet.save(); // Save pet after modifications

      // Tính toán phần thưởng
      const coinsReward = EconomicService.calculateReward(EconomicService.INCOME_CONFIG.play.coins, pet.level);

      // Level up bonus
      let levelUpBonus = 0;
      if (playResult.leveledUp) {
        levelUpBonus = pet.level * 10; // Bonus coins for leveling up
      }

      const totalCoinsReward = coinsReward + levelUpBonus;

      // Cập nhật user
      user.coins = (user.coins || 0) + totalCoinsReward;
      user.actionCooldowns = user.actionCooldowns || {};
      user.actionCooldowns.play = new Date();
      user.dailyStats = user.dailyStats || { coinsEarned: 0 };
      user.dailyStats.coinsEarned = (user.dailyStats.coinsEarned || 0) + totalCoinsReward;
      await user.save();

      // Check achievements
      await AchievementService.checkPlayer(pet, req.user.id);
      const leveledUp = playResult.leveledUp;
      if (leveledUp) {
        await AchievementService.checkPetMaster(pet, req.user.id);
        await MissionValidationService.checkAndUpdateMissions(req.user.id, 'pet_level_up');
      }
      await AchievementService.checkTrainer(req.user.id);

      // Cập nhật nhiệm vụ
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'play', { petId: pet._id });
      await MissionValidationService.checkAndUpdateMissions(req.user.id, 'earn_coins', { amount: totalCoinsReward });

      let message = `🎾 Pet rất vui! (+${totalCoinsReward} 💰)`;
      if (leveledUp) {
        message += ` 🎉 Level lên ${pet.level}! (+${levelUpBonus} bonus)`;
      }

      // Invalidate caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidatePetCaches(pet._id.toString(), req.user.id);
      } catch (cacheErr) {
        console.error('[petController.playWithPet] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message, data: { pet, leveledUp, xpGained: 15, coinsEarned: totalCoinsReward, user: { coins: user.coins } } });
    } catch (err) {
      return handleInternalError(res, err, 'playWithPet');
    }
  });
};

// ============================
// Delete pet
// ============================
const deletePet = async (req, res) => {
  return await PerformanceMonitor.measureAsync('pet.deletePet', async () => {
    try {
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ success: false, message: 'Pet not found', data: null });
      if (pet.owner.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized to delete this pet', data: null });

      await User.findByIdAndUpdate(req.user.id, { $pull: { pets: pet._id } }).exec();
      await Pet.findByIdAndDelete(req.params.id).exec();

      // Invalidate caches (best-effort)
      try {
        await CacheService.invalidateUserCaches(req.user.id);
        await CacheService.invalidatePetCaches(req.params.id, req.user.id);
      } catch (cacheErr) {
        console.error('[petController.deletePet] cache invalidate error:', cacheErr);
      }

      return res.json({ success: true, message: 'Pet deleted successfully', data: null });
    } catch (err) {
      return handleInternalError(res, err, 'deletePet');
    }
  });
};

// ============================
// Exports
// ============================
module.exports = {
  getUserPets,
  createPet,
  feedPet,
  playWithPet,
  deletePet,
  usePetAbility
};
