const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Achievement = require('./src/models/Achievement');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petgame', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const achievements = [
  {
    code: 'first_pet',
    name: 'First Steps',
    description: 'Tạo pet đầu tiên',
    icon: '🥉',
    type: 'user',
  },
  {
    code: 'pet_lover',
    name: 'Pet Lover',
    description: 'Có 5 pets cùng lúc',
    icon: '🥈',
    type: 'user',
  },
  {
    code: 'pet_master',
    name: 'Pet Master',
    description: 'Level 10 cho 1 pet',
    icon: '🥇',
    type: 'pet',
  },
  {
    code: 'feeder',
    name: 'Feeder',
    description: 'Cho ăn 100 lần',
    icon: '🍖',
    type: 'activity',
  },
  {
    code: 'player',
    name: 'Player',
    description: 'Chơi với pet 100 lần',
    icon: '🎾',
    type: 'activity',
  },
  {
    code: 'trainer',
    name: 'Trainer',
    description: 'Đạt tổng 1000 XP',
    icon: '⭐',
    type: 'activity',
  },
];

const seedAchievements = async () => {
  try {
    console.log('🌱 Seeding achievements...');
    for (const ach of achievements) {
      const exists = await Achievement.findOne({ code: ach.code });
      if (!exists) {
        await Achievement.create(ach);
        console.log('✅ Seeded:', ach.name);
      } else {
        console.log('ℹ️ Exists:', ach.name);
      }
    }
    console.log('🎉 Achievements seeded successfully!');
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedAchievements();
