const mongoose = require('mongoose');
const User = require('../models/User');
const Pet = require('../models/Pet');

/**
 * Database index optimization script
 * Run this to create optimized indexes for better query performance
 */

async function createOptimizedIndexes() {
  try {
    console.log('🔧 Creating optimized database indexes...');

    // User model indexes
    console.log('📑 Creating User indexes...');
    
    // Compound index for authentication queries
    await User.collection.createIndex(
      { email: 1, username: 1 },
      { unique: true, sparse: true, name: 'auth_lookup' }
    );

    // Index for user stats and economic data
    await User.collection.createIndex(
      { _id: 1, level: 1, coins: 1 },
      { name: 'user_economic' }
    );

    // Index for daily login tracking
    await User.collection.createIndex(
      { lastLoginDate: 1, dailyLoginStreak: 1 },
      { name: 'daily_login_tracking' }
    );

    // Index for user achievements
    await User.collection.createIndex(
      { 'achievements.type': 1, 'achievements.unlockedAt': 1 },
      { name: 'user_achievements' }
    );

    // Pet model indexes
    console.log('🐾 Creating Pet indexes...');
    
    // Primary lookup index for pets by owner
    await Pet.collection.createIndex(
      { owner: 1, _id: 1 },
      { name: 'pet_owner_lookup' }
    );

    // Compound index for pet filtering and sorting
    await Pet.collection.createIndex(
      { owner: 1, level: -1, createdAt: -1 },
      { name: 'pet_owner_sorted' }
    );

    // Index for pet stats queries
    await Pet.collection.createIndex(
      { _id: 1, happiness: 1, health: 1, level: 1 },
      { name: 'pet_stats' }
    );

    // Index for pet care tracking
    await Pet.collection.createIndex(
      { owner: 1, lastFed: 1, lastPlayed: 1 },
      { name: 'pet_care_tracking' }
    );

    // Index for pet abilities and type
    await Pet.collection.createIndex(
      { type: 1, 'abilities.type': 1 },
      { name: 'pet_abilities' }
    );

    // Time-based indexes for performance monitoring
    await Pet.collection.createIndex(
      { lastUpdated: 1 },
      { name: 'pet_update_tracking' }
    );

    await User.collection.createIndex(
      { createdAt: 1 },
      { name: 'user_creation_date' }
    );

    // Sparse indexes for optional fields
    await User.collection.createIndex(
      { 'actionCooldowns.feed': 1 },
      { sparse: true, name: 'feed_cooldown' }
    );

    await User.collection.createIndex(
      { 'actionCooldowns.play': 1 },
      { sparse: true, name: 'play_cooldown' }
    );

    await User.collection.createIndex(
      { 'actionCooldowns.ability': 1 },
      { sparse: true, name: 'ability_cooldown' }
    );

    console.log('✅ All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    
    // Get index information
    const userIndexes = await User.collection.listIndexes().toArray();
    const petIndexes = await Pet.collection.listIndexes().toArray();
    
    console.log(`👤 User collection: ${userIndexes.length} indexes`);
    userIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log(`🐾 Pet collection: ${petIndexes.length} indexes`);
    petIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Drop all custom indexes (for cleanup/reset)
 */
async function dropCustomIndexes() {
  try {
    console.log('🗑️ Dropping custom indexes...');
    
    const customIndexNames = [
      'auth_lookup', 'user_economic', 'daily_login_tracking', 'user_achievements',
      'user_creation_date', 'feed_cooldown', 'play_cooldown', 'ability_cooldown',
      'pet_owner_lookup', 'pet_owner_sorted', 'pet_stats', 'pet_care_tracking',
      'pet_abilities', 'pet_update_tracking'
    ];

    for (const indexName of customIndexNames) {
      try {
        await User.collection.dropIndex(indexName);
        console.log(`✅ Dropped User index: ${indexName}`);
      } catch (err) {
        // Index might not exist, continue
      }
      
      try {
        await Pet.collection.dropIndex(indexName);
        console.log(`✅ Dropped Pet index: ${indexName}`);
      } catch (err) {
        // Index might not exist, continue
      }
    }
    
    console.log('✅ Custom indexes cleanup completed!');
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
    throw error;
  }
}

/**
 * Analyze query performance
 */
async function analyzeQueryPerformance() {
  try {
    console.log('📈 Analyzing query performance...');
    
    // Sample queries to test
    const queries = [
      {
        name: 'User login lookup',
        collection: User,
        query: { email: 'test@example.com' }
      },
      {
        name: 'Get user pets',
        collection: Pet,
        query: { owner: new mongoose.Types.ObjectId() }
      },
      {
        name: 'Pet stats lookup',
        collection: Pet,
        query: { _id: new mongoose.Types.ObjectId(), happiness: { $lt: 70 } }
      }
    ];

    for (const queryTest of queries) {
      console.log(`\n🔍 Testing: ${queryTest.name}`);
      
      const explain = await queryTest.collection
        .find(queryTest.query)
        .explain('executionStats');
      
      console.log(`   - Execution time: ${explain.executionStats.executionTimeMillis}ms`);
      console.log(`   - Documents examined: ${explain.executionStats.totalDocsExamined}`);
      console.log(`   - Documents returned: ${explain.executionStats.totalDocsReturned}`);
      console.log(`   - Index used: ${explain.executionStats.indexName || 'COLLECTION_SCAN'}`);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing performance:', error);
    throw error;
  }
}

module.exports = {
  createOptimizedIndexes,
  dropCustomIndexes,
  analyzeQueryPerformance
};
