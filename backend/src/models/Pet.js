const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    required: true,
    enum: ['cat', 'dog', 'rabbit', 'bird', 'fish'],
    default: 'cat'
  },
  hunger: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  happiness: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  lastFed: {
    type: Date,
    default: Date.now
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
    abilities: {
      type: [String],
      default: [],
      description: 'Special skills for each pet type'
    },
  playCount: {
    type: Number,
    default: 0,
    min: 0
  },
  feedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-decline stats based on time passed
petSchema.methods.updateStatsOverTime = function() {
  const now = new Date();
  const timeSinceLastFed = (now - this.lastFed) / (1000 * 60 * 60); // hours
  const timeSinceLastPlayed = (now - this.lastPlayed) / (1000 * 60 * 60); // hours
  
  // Decline hunger: -5 per hour
  const hungerDecline = Math.floor(timeSinceLastFed * 5);
  this.hunger = Math.max(0, this.hunger - hungerDecline);
  
  // Decline happiness: -3 per hour  
  const happinessDecline = Math.floor(timeSinceLastPlayed * 3);
  this.happiness = Math.max(0, this.happiness - happinessDecline);
};

// Method to feed pet - Coins được quản lý bởi User model
petSchema.methods.feed = function() {
  this.updateStatsOverTime();
  this.hunger = Math.min(100, this.hunger + 20);
  this.happiness = Math.min(100, this.happiness + 10);
  this.xp += 10;
  // Removed: this.coins += 5; - Coins now managed by User model
  this.lastFed = new Date();
  this.feedCount = (this.feedCount || 0) + 1;
  const leveledUp = this.checkLevelUp();
  return { pet: this, leveledUp };
};

// Method to play with pet - Coins được quản lý bởi User model
petSchema.methods.play = function() {
  this.updateStatsOverTime();
  this.happiness = Math.min(100, this.happiness + 20);
  this.hunger = Math.max(0, this.hunger - 5);
  this.xp += 15;
  // Removed: this.coins += 8; - Coins now managed by User model
  this.lastPlayed = new Date();
  this.playCount = (this.playCount || 0) + 1;
  const leveledUp = this.checkLevelUp();
  return { pet: this, leveledUp };
};

// Level up system - Coins bonus được xử lý bởi controller
petSchema.methods.checkLevelUp = function() {
  const xpNeeded = this.level * 100; // 100 XP per level
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
    // Removed: this.coins += this.level * 10; - Coins managed by User model
    return true;
  }
  return false;
};

// Get XP needed for next level
petSchema.methods.getXPForNextLevel = function() {
  return this.level * 100;
};

// Get pet status based on stats
petSchema.methods.getStatus = function() {
  this.updateStatsOverTime();
  const avgStats = (this.hunger + this.happiness) / 2;
  
  if (avgStats >= 70) return { level: 'great', color: 'green', message: 'Tuyệt vời!' };
  if (avgStats >= 40) return { level: 'good', color: 'yellow', message: 'Bình thường' };
  return { level: 'poor', color: 'red', message: 'Cần chăm sóc!' };
};

module.exports = mongoose.model('Pet', petSchema);
