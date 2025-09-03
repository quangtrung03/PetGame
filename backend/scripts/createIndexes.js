const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Database indexes for performance optimization
const createIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    console.log('🔄 Creating indexes...');

    // User collection indexes
    await db.collection('users').createIndexes([
      // Authentication indexes
      { key: { email: 1 }, unique: true, background: true },
      { key: { username: 1 }, unique: true, background: true },
      
      // Performance indexes
      { key: { lastLoginDate: -1 }, background: true },
      { key: { level: -1 }, background: true },
      { key: { coins: -1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      
      // Compound indexes for complex queries
      { key: { level: -1, coins: -1 }, background: true },
      { key: { dailyLoginStreak: -1, lastLoginDate: -1 }, background: true }
    ]);
    console.log('✅ User indexes created');

    // Pet collection indexes
    await db.collection('pets').createIndexes([
      // Owner-based queries (most common)
      { key: { owner: 1 }, background: true },
      { key: { owner: 1, level: -1 }, background: true },
      { key: { owner: 1, createdAt: -1 }, background: true },
      { key: { owner: 1, type: 1 }, background: true },
      
      // Performance indexes
      { key: { level: -1 }, background: true },
      { key: { happiness: -1 }, background: true },
      { key: { hunger: -1 }, background: true },
      { key: { xp: -1 }, background: true },
      { key: { lastFed: -1 }, background: true },
      { key: { lastPlayed: -1 }, background: true },
      
      // Compound indexes for analytics
      { key: { type: 1, level: -1 }, background: true },
      { key: { owner: 1, happiness: -1, hunger: -1 }, background: true }
    ]);
    console.log('✅ Pet indexes created');

    // Achievement collection indexes
    await db.collection('achievements').createIndexes([
      { key: { userId: 1 }, background: true },
      { key: { userId: 1, achievementType: 1 }, background: true },
      { key: { userId: 1, unlockedAt: -1 }, background: true },
      { key: { achievementType: 1, unlockedAt: -1 }, background: true }
    ]);
    console.log('✅ Achievement indexes created');

    // DailyMission collection indexes (if exists)
    try {
      await db.collection('dailymissions').createIndexes([
        { key: { userId: 1 }, background: true },
        { key: { userId: 1, date: -1 }, background: true },
        { key: { userId: 1, completed: 1 }, background: true },
        { key: { date: -1 }, background: true },
        { key: { missionType: 1, date: -1 }, background: true }
      ]);
      console.log('✅ DailyMission indexes created');
    } catch (error) {
      console.log('ℹ️ DailyMission collection not found, skipping indexes');
    }

    // Friend collection indexes (if exists)
    try {
      await db.collection('friends').createIndexes([
        { key: { userId: 1 }, background: true },
        { key: { friendId: 1 }, background: true },
        { key: { userId: 1, status: 1 }, background: true },
        { key: { friendId: 1, status: 1 }, background: true },
        { key: { createdAt: -1 }, background: true }
      ]);
      console.log('✅ Friend indexes created');
    } catch (error) {
      console.log('ℹ️ Friend collection not found, skipping indexes');
    }

    // Shop/Purchase collection indexes (if exists)
    try {
      await db.collection('purchases').createIndexes([
        { key: { userId: 1 }, background: true },
        { key: { userId: 1, purchaseDate: -1 }, background: true },
        { key: { itemType: 1, purchaseDate: -1 }, background: true },
        { key: { purchaseDate: -1 }, background: true }
      ]);
      console.log('✅ Purchase indexes created');
    } catch (error) {
      console.log('ℹ️ Purchase collection not found, skipping indexes');
    }

    console.log('✅ All indexes created successfully!');

    // Show index information
    console.log('\n📊 Index Information:');
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`\n${collectionName}:`);
        indexes.forEach((index, i) => {
          const keys = Object.keys(index.key).map(k => `${k}:${index.key[k]}`).join(', ');
          console.log(`  ${i + 1}. ${index.name || 'unnamed'} (${keys})${index.unique ? ' [UNIQUE]' : ''}`);
        });
      } catch (error) {
        console.log(`  Error reading indexes for ${collectionName}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔄 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the index creation
if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;
