const mongoose = require('mongoose');

const dailyMissionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['feed', 'play', 'login', 'purchase', 'ability', 'minigame'], required: true },
  targetProgress: { type: Number, default: 1 },
  reward: {
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    item: { type: String },
    achievement: { type: String }
  },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24h from now
}, {
  timestamps: true
});

module.exports = mongoose.model('DailyMission', dailyMissionSchema);
