require('dotenv').config();
const mongoose = require('mongoose');
const DailyMission = require('./src/models/DailyMission');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding daily missions');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const dailyMissions = [
  {
    code: 'feed_pet',
    description: 'Cho pet ăn 1 lần',
    type: 'feed',
    targetProgress: 1,
    reward: { coins: 10, xp: 5 }
  },
  {
    code: 'play_with_pet',
    description: 'Chơi với pet 1 lần',
    type: 'play',
    targetProgress: 1,
    reward: { coins: 15, xp: 8 }
  },
  {
    code: 'use_ability',
    description: 'Sử dụng kỹ năng đặc biệt 1 lần',
    type: 'ability',
    targetProgress: 1,
    reward: { coins: 20, xp: 10 }
  },
  {
    code: 'login_daily',
    description: 'Đăng nhập hàng ngày',
    type: 'login',
    targetProgress: 1,
    reward: { coins: 25 }
  },
  {
    code: 'play_minigame',
    description: 'Chơi mini-game 1 lần',
    type: 'minigame',
    targetProgress: 1,
    reward: { coins: 30, xp: 15 }
  }
];

const seedDailyMissions = async () => {
  try {
    await connectDB();
    
    // Clear existing missions
    await DailyMission.deleteMany({});
    console.log('Cleared existing daily missions');
    
    // Insert new missions
    const missions = await DailyMission.insertMany(dailyMissions);
    console.log(`Seeded ${missions.length} daily missions successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding daily missions:', error);
    process.exit(1);
  }
};

seedDailyMissions();
