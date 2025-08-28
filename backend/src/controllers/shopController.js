const Item = require('../models/Item');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

// Get all shop items
const getShopItems = async (req, res) => {
  try {
    const items = await Item.getShopItems();
    
    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Buy item from shop
const buyItem = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    // Get item details
    const item = await Item.findById(itemId);
    if (!item || !item.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or unavailable'
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    const totalCost = item.price * quantity;

    // Check if user has enough coins
    if (user.coins < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Không đủ coins! Cần ${totalCost} coins, bạn có ${user.coins} coins.`
      });
    }

    // Deduct coins from user
    user.coins -= totalCost;
    await user.save();

    // Add to inventory or update quantity
    let inventoryItem = await Inventory.findOne({
      user: req.user.id,
      item: itemId
    });

    if (inventoryItem) {
      inventoryItem.quantity += quantity;
      await inventoryItem.save();
    } else {
      inventoryItem = await Inventory.create({
        user: req.user.id,
        item: itemId,
        quantity
      });
    }

    // Populate item details
    await inventoryItem.populate('item');

    res.json({
      success: true,
      message: `🛒 Đã mua ${quantity}x ${item.name}! (-${totalCost} 💰)`,
      data: {
        item: inventoryItem,
        userCoins: user.coins,
        totalCost
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user inventory
const getUserInventory = async (req, res) => {
  try {
    const inventory = await Inventory.getUserInventory(req.user.id);
    
    res.json({
      success: true,
      data: { inventory }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Use item from inventory
const useItem = async (req, res) => {
  try {
    const { inventoryId, petId } = req.body;

    // Get inventory item
    const inventoryItem = await Inventory.findById(inventoryId)
      .populate('item');

    if (!inventoryItem || inventoryItem.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in inventory'
      });
    }

    // Get pet (if specified)
    let pet = null;
    if (petId) {
      const Pet = require('../models/Pet');
      pet = await Pet.findById(petId);
      
      if (!pet || pet.owner.toString() !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found'
        });
      }

      // Check if item is compatible with pet type
      const item = inventoryItem.item;
      if (!item.petTypes.includes('all') && !item.petTypes.includes(pet.type)) {
        return res.status(400).json({
          success: false,
          message: `${item.name} không phù hợp với ${pet.type}`
        });
      }

      // Apply item effects to pet
      pet.hunger = Math.min(100, pet.hunger + item.effects.hunger);
      pet.happiness = Math.min(100, pet.happiness + item.effects.happiness);
      pet.xp += item.effects.xp;
      
      // Check level up
      const oldLevel = pet.level;
      pet.checkLevelUp();
      const leveledUp = pet.level > oldLevel;

      await pet.save();
    }

    // Use the item (decrease quantity or remove)
    await inventoryItem.useItem();

    res.json({
      success: true,
      message: `✨ Đã sử dụng ${inventoryItem.item.name}${pet ? ` cho ${pet.name}` : ''}!`,
      data: {
        pet,
        itemUsed: inventoryItem.item
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getShopItems,
  buyItem,
  getUserInventory,
  useItem
};
