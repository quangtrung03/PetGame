const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('./src/models/Item');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const shopItems = [
  // FOOD ITEMS
  {
    name: 'Basic Food',
    type: 'food',
    category: 'basic',
    price: 10,
    effects: { hunger: 15, happiness: 5, xp: 2 },
    petTypes: ['all'],
    icon: '🥘',
    description: 'Thức ăn cơ bản cho mọi loại pet'
  },
  {
    name: 'Premium Steak',
    type: 'food',
    category: 'premium',
    price: 50,
    effects: { hunger: 30, happiness: 15, xp: 8 },
    petTypes: ['cat', 'dog'],
    icon: '🥩',
    description: 'Bít tết cao cấp cho mèo và chó'
  },
  {
    name: 'Fresh Fish',
    type: 'food',
    category: 'premium',
    price: 35,
    effects: { hunger: 25, happiness: 20, xp: 6 },
    petTypes: ['cat', 'fish'],
    icon: '🐟',
    description: 'Cá tươi ngon dành cho mèo và cá'
  },
  {
    name: 'Bone Treat',
    type: 'food',
    category: 'basic',
    price: 25,
    effects: { hunger: 20, happiness: 10, xp: 4 },
    petTypes: ['dog'],
    icon: '🦴',
    description: 'Xương ngon cho chó'
  },
  {
    name: 'Carrot Snack',
    type: 'food',
    category: 'basic',
    price: 15,
    effects: { hunger: 18, happiness: 8, xp: 3 },
    petTypes: ['rabbit'],
    icon: '🥕',
    description: 'Cà rốt tươi cho thỏ'
  },
  {
    name: 'Bird Seeds',
    type: 'food',
    category: 'basic',
    price: 20,
    effects: { hunger: 22, happiness: 12, xp: 5 },
    petTypes: ['bird'],
    icon: '🌰',
    description: 'Hạt dinh dưỡng cho chim'
  },

  // TOY ITEMS
  {
    name: 'Tennis Ball',
    type: 'toy',
    category: 'basic',
    price: 30,
    effects: { hunger: -2, happiness: 25, xp: 5 },
    petTypes: ['dog', 'cat'],
    icon: '🎾',
    description: 'Bóng tennis vui nhộn'
  },
  {
    name: 'Feather Wand',
    type: 'toy',
    category: 'premium',
    price: 45,
    effects: { hunger: -3, happiness: 30, xp: 8 },
    petTypes: ['cat'],
    icon: '🪶',
    description: 'Cần câu lông cho mèo'
  },
  {
    name: 'Squeaky Mouse',
    type: 'toy',
    category: 'basic',
    price: 25,
    effects: { hunger: -1, happiness: 20, xp: 4 },
    petTypes: ['cat'],
    icon: '🐭',
    description: 'Chuột đồ chơi kêu chít chít'
  },
  {
    name: 'Chew Rope',
    type: 'toy',
    category: 'basic',
    price: 35,
    effects: { hunger: -2, happiness: 22, xp: 6 },
    petTypes: ['dog'],
    icon: '🪢',
    description: 'Dây thừng nhai cho chó'
  },
  {
    name: 'Mirror Toy',
    type: 'toy',
    category: 'premium',
    price: 40,
    effects: { hunger: 0, happiness: 28, xp: 7 },
    petTypes: ['bird'],
    icon: '🪞',
    description: 'Gương đồ chơi cho chim'
  },
  {
    name: 'Tunnel',
    type: 'toy',
    category: 'premium',
    price: 55,
    effects: { hunger: -1, happiness: 35, xp: 10 },
    petTypes: ['rabbit'],
    icon: '🕳️',
    description: 'Đường hầm vui chơi cho thỏ'
  },

  // SPECIAL ITEMS
  {
    name: 'Golden Food Bowl',
    type: 'accessory',
    category: 'special',
    price: 100,
    effects: { hunger: 40, happiness: 25, xp: 15 },
    petTypes: ['all'],
    icon: '🏆',
    description: 'Bát ăn vàng đặc biệt, hiệu quả gấp đôi!'
  },
  {
    name: 'Magic Potion',
    type: 'food',
    category: 'special',
    price: 80,
    effects: { hunger: 50, happiness: 50, xp: 20 },
    petTypes: ['all'],
    icon: '🧪',
    description: 'Thuốc thần kỳ hồi phục hoàn toàn'
  },
  {
    name: 'XP Boost',
    type: 'accessory',
    category: 'special',
    price: 75,
    effects: { hunger: 5, happiness: 5, xp: 50 },
    petTypes: ['all'],
    icon: '⭐',
    description: 'Tăng XP mạnh mẽ cho pet'
  }
];

const seedShopData = async () => {
  try {
    console.log('🌱 Seeding shop data...');
    
    // Clear existing items
    await Item.deleteMany({});
    console.log('🗑️ Cleared existing items');
    
    // Insert new items
    await Item.insertMany(shopItems);
    console.log(`✅ Inserted ${shopItems.length} shop items`);
    
    console.log('🎉 Shop data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedShopData();
