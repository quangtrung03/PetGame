const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['food', 'toy', 'accessory'],
    default: 'food'
  },
  category: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'special']
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  effects: {
    hunger: { type: Number, default: 0 },
    happiness: { type: Number, default: 0 },
    xp: { type: Number, default: 0 }
  },
  petTypes: [{
    type: String,
    enum: ['cat', 'dog', 'rabbit', 'bird', 'fish', 'all'],
    default: 'all'
  }],
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static method to get shop items
itemSchema.statics.getShopItems = function() {
  return this.find({ isAvailable: true }).sort({ price: 1 });
};

module.exports = mongoose.model('Item', itemSchema);
