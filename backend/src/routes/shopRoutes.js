const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  getShopItems,
  buyItem,
  getUserInventory,
  useItem
} = require('../controllers/shopController');

// @route   GET /api/shop/items
// @desc    Get all shop items
// @access  Public
router.get('/items', getShopItems);

// @route   POST /api/shop/buy
// @desc    Buy item from shop
// @access  Private
router.post('/buy', auth, buyItem);

// @route   GET /api/shop/inventory
// @desc    Get user inventory
// @access  Private
router.get('/inventory', auth, getUserInventory);

// @route   POST /api/shop/inventory/use
// @desc    Use item from inventory
// @access  Private
router.post('/inventory/use', auth, useItem);


module.exports = router;
