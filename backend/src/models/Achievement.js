const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. 'first_pet', 'pet_master'
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }, // emoji or url
  type: { type: String, enum: ['user', 'pet', 'activity'], default: 'user' },
  reward: {
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    item: { type: String }
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);
