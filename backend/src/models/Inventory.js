const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user + item
inventorySchema.index({ user: 1, item: 1 });

// Static method to get user inventory
inventorySchema.statics.getUserInventory = function(userId) {
  return this.find({ user: userId })
    .populate('item')
    .sort({ createdAt: -1 });
};

// Method to use item
inventorySchema.methods.useItem = async function() {
  if (this.quantity > 1) {
    this.quantity -= 1;
    return await this.save();
  } else {
    return await this.deleteOne();
  }
};

module.exports = mongoose.model('Inventory', inventorySchema);
