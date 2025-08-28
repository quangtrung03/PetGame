const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. 'first_pet', 'pet_master'
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }, // emoji or url
  type: { type: String, enum: ['user', 'pet', 'activity'], default: 'user' },
});

module.exports = mongoose.model('Achievement', achievementSchema);
