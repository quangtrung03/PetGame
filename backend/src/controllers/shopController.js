const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const EconomicService = require('../services/economicService');
const MissionValidationService = require('../services/missionValidationService');
const CacheService = require('../services/cacheService');

// PerformanceMonitor may be exported from cacheService; provide a safe fallback
const PerformanceMonitor = CacheService.PerformanceMonitor || CacheService.PerformanceMonitor || {
  measureAsync: async (label, fn) => await fn()
};

// Centralized internal error handler
function handleInternalError(res, error, label = 'shop') {
  try {
    console.error(`[${label}] Internal error:`, error && error.stack ? error.stack : error);
  } catch (logErr) {
    // swallow logging errors
    console.error('[handleInternalError] logging failed', logErr);
  }

  return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
}

// Get all shop items (read-only: use lean())
const getShopItems = async (req, res) => {
  return PerformanceMonitor.measureAsync('shop.getShopItems', async () => {
    try {
      // Use lean() for read-only optimization
      const items = await Item.find({}).lean().exec();

      return res.json({ success: true, message: 'Shop items retrieved.', data: { items } });
    } catch (error) {
      return handleInternalError(res, error, 'shop.getShopItems');
    }
  });
};

// Buy item from shop (transactional)
const buyItem = async (req, res) => {
  return PerformanceMonitor.measureAsync('shop.buyItem', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { itemId, quantity = 1 } = req.body;

      // Get item details (full doc for potential hooks)
      const item = await Item.findById(itemId).session(session);
      if (!item || !item.isAvailable) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Item not found or unavailable' });
      }

      // Validate purchase
      const validation = await MissionValidationService.validatePurchase(
        req.user.id,
        item.category,
        item.price,
        quantity
      );

      if (!validation.canPurchase) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Không thể mua item này lúc này' });
      }

      const totalCost = validation.finalPrice;

      // Get user (full doc)
      const user = await User.findById(req.user.id).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check daily reset (do this outside DB mutation or before commit)
      const today = new Date();
      if (!user.dailyStats || !user.dailyStats.lastReset || today.toDateString() !== user.dailyStats.lastReset.toDateString()) {
        try {
          // best-effort reset (may be implemented outside transaction)
          await MissionValidationService.resetDailyStats(req.user.id);
        } catch (err) {
          console.warn('[shop.buyItem] resetDailyStats failed', err && err.message ? err.message : err);
        }
      }

      // Check funds
      if (user.coins < totalCost) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Không đủ coins! Cần ${totalCost} coins, bạn có ${user.coins} coins.` });
      }

      // Deduct coins and update tracking
      user.coins -= totalCost;
      user.dailyStats = user.dailyStats || { coinsSpent: 0, lastReset: new Date() };
      user.dailyStats.coinsSpent = (user.dailyStats.coinsSpent || 0) + totalCost;
      user.purchaseHistory = user.purchaseHistory || { total: 0 };
      user.purchaseHistory[item.category] = (user.purchaseHistory[item.category] || 0) + quantity;
      user.purchaseHistory.total = (user.purchaseHistory.total || 0) + quantity;

      await user.save({ session });

      // Update or create inventory
      let inventoryItem = await Inventory.findOne({ user: req.user.id, item: itemId }).session(session);
      if (inventoryItem) {
        inventoryItem.quantity = (inventoryItem.quantity || 0) + quantity;
        await inventoryItem.save({ session });
      } else {
        inventoryItem = new Inventory({ user: req.user.id, item: itemId, quantity });
        await inventoryItem.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Populate item details for response (outside transaction)
      await inventoryItem.populate('item');

      // Update missions (best-effort, not part of transaction)
      try {
        await MissionValidationService.checkAndUpdateMissions(req.user.id, 'buy_item', { amount: totalCost, itemType: item.category });
        await MissionValidationService.checkAndUpdateMissions(req.user.id, 'spend_coins', { amount: totalCost });
      } catch (missionErr) {
        console.warn('[shop.buyItem] mission update failed', missionErr && missionErr.message ? missionErr.message : missionErr);
      }

      // Best-effort cache invalidation
      try {
        if (CacheService && CacheService.invalidateUserCaches) await CacheService.invalidateUserCaches(req.user.id);
        if (CacheService && CacheService.invalidateInventoryCaches) await CacheService.invalidateInventoryCaches(req.user.id);
      } catch (cacheErr) {
        console.warn('[shop.buyItem] cache invalidation failed', cacheErr && cacheErr.message ? cacheErr.message : cacheErr);
      }

      return res.json({
        success: true,
        message: `🛒 Đã mua ${quantity}x ${item.name}! (-${totalCost} 💰)`,
        data: {
          item: inventoryItem,
          userCoins: user.coins,
          totalCost,
          dynamicPricing: totalCost > item.price * quantity
        }
      });
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (e) {
        // ignore
      }
      session.endSession();
      return handleInternalError(res, error, 'shop.buyItem');
    }
  });
};

// Get user inventory (read-only: use lean())
const getUserInventory = async (req, res) => {
  return PerformanceMonitor.measureAsync('shop.getUserInventory', async () => {
    try {
      const inventory = await Inventory.find({ user: req.user.id }).populate('item').lean().exec();
      return res.json({ success: true, message: 'Inventory retrieved.', data: { inventory } });
    } catch (error) {
      return handleInternalError(res, error, 'shop.getUserInventory');
    }
  });
};

// Use item from inventory (transactional)
const useItem = async (req, res) => {
  return PerformanceMonitor.measureAsync('shop.useItem', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { inventoryId, petId } = req.body;

      // Get inventory item (full doc)
      let inventoryItem = await Inventory.findById(inventoryId).populate('item').session(session);
      if (!inventoryItem || inventoryItem.user.toString() !== req.user.id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Item not found in inventory' });
      }

      // Get pet (if specified)
      let pet = null;
      if (petId) {
        const Pet = require('../models/Pet');
        pet = await Pet.findById(petId).session(session);
        if (!pet || pet.owner.toString() !== req.user.id) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        // Check compatibility
        const item = inventoryItem.item;
        if (!item.petTypes.includes('all') && !item.petTypes.includes(pet.type)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: `${item.name} không phù hợp với ${pet.type}` });
        }

        // Apply effects
        pet.hunger = Math.min(100, (pet.hunger || 0) + (item.effects?.hunger || 0));
        pet.happiness = Math.min(100, (pet.happiness || 0) + (item.effects?.happiness || 0));
        pet.xp = (pet.xp || 0) + (item.effects?.xp || 0);

        const oldLevel = pet.level || 0;
        if (typeof pet.checkLevelUp === 'function') pet.checkLevelUp();
        const leveledUp = (pet.level || 0) > oldLevel;

        await pet.save({ session });
      }

      // Decrease quantity or remove
      inventoryItem.quantity = (inventoryItem.quantity || 0) - 1;
      if (inventoryItem.quantity <= 0) {
        await Inventory.deleteOne({ _id: inventoryItem._id }).session(session);
      } else {
        await inventoryItem.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Best-effort cache invalidation
      try {
        if (CacheService && CacheService.invalidateUserCaches) await CacheService.invalidateUserCaches(req.user.id);
        if (CacheService && CacheService.invalidateInventoryCaches) await CacheService.invalidateInventoryCaches(req.user.id);
      } catch (cacheErr) {
        console.warn('[shop.useItem] cache invalidation failed', cacheErr && cacheErr.message ? cacheErr.message : cacheErr);
      }

      return res.json({ success: true, message: `✨ Đã sử dụng ${inventoryItem.item.name}${pet ? ` cho ${pet.name}` : ''}!`, data: { pet, itemUsed: inventoryItem.item } });
    } catch (error) {
      try { await session.abortTransaction(); } catch (e) {}
      session.endSession();
      return handleInternalError(res, error, 'shop.useItem');
    }
  });
};

module.exports = {
  getShopItems,
  buyItem,
  getUserInventory,
  useItem
};
