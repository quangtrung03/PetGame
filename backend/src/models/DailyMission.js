const mongoose = require('mongoose');

const dailyMissionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  reward: {
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    item: { type: String },
    achievement: { type: String }
  },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('DailyMission', dailyMissionSchema);
