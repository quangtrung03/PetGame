const NodeCache = require('node-cache');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for better performance
  deleteOnExpire: true,
  maxKeys: 1000 // Maximum number of keys
});

// Cache keys constants
const CACHE_KEYS = {
  USER_PROFILE: (userId) => `user:${userId}`,
  USER_PETS: (userId) => `user:${userId}:pets`,
  PET_DETAILS: (petId) => `pet:${petId}`,
  USER_ECONOMIC: (userId) => `user:${userId}:economic`,
  USER_ACHIEVEMENTS: (userId) => `user:${userId}:achievements`,
  PET_ABILITIES: (petId) => `pet:${petId}:abilities`
};

// Cache TTL configurations
const CACHE_TTL = {
  USER_PROFILE: 300, // 5 minutes
  USER_PETS: 180, // 3 minutes
  PET_DETAILS: 240, // 4 minutes
  USER_ECONOMIC: 120, // 2 minutes
  USER_ACHIEVEMENTS: 600, // 10 minutes
  PET_ABILITIES: 300 // 5 minutes
};

class CacheService {
  // Get cached data
  static get(key) {
    try {
      return cache.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return undefined;
    }
  }

  // Set cached data
  static set(key, value, ttl = null) {
    try {
      return cache.set(key, value, ttl || 300);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cached data
  static del(key) {
    try {
      return cache.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return 0;
    }
  }

  // Clear multiple keys by pattern
  static delByPattern(pattern) {
    try {
      const keys = cache.keys().filter(key => key.includes(pattern));
      return cache.del(keys);
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return 0;
    }
  }

  // Get or fetch data with caching
  static async getOrFetch(key, fetchFunction, ttl = null) {
    try {
      // Try to get from cache first
      let data = this.get(key);
      
      if (data !== undefined) {
        return data;
      }

      // Fetch from database if not in cache
      data = await fetchFunction();
      
      // Cache the result
      if (data !== null && data !== undefined) {
        this.set(key, data, ttl);
      }
      
      return data;
    } catch (error) {
      console.error('Cache getOrFetch error:', error);
      // Fallback to direct fetch
      return await fetchFunction();
    }
  }

  // Invalidate user-related caches
  static invalidateUserCaches(userId) {
    this.del(CACHE_KEYS.USER_PROFILE(userId));
    this.del(CACHE_KEYS.USER_PETS(userId));
    this.del(CACHE_KEYS.USER_ECONOMIC(userId));
    this.del(CACHE_KEYS.USER_ACHIEVEMENTS(userId));
  }

  // Invalidate pet-related caches
  static invalidatePetCaches(petId, userId = null) {
    this.del(CACHE_KEYS.PET_DETAILS(petId));
    this.del(CACHE_KEYS.PET_ABILITIES(petId));
    
    if (userId) {
      this.del(CACHE_KEYS.USER_PETS(userId));
    }
  }

  // Get cache statistics
  static getStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      size: cache.keys().length
    };
  }

  // Clear all cache
  static flush() {
    cache.flushAll();
  }
}

// Database query optimization helpers
class QueryOptimizer {
  // Optimize user queries with selective fields
  static getUserFields(includePrivate = false) {
    const baseFields = 'username email level coins dailyLoginStreak lastLogin createdAt';
    const privateFields = 'actionCooldowns purchaseHistory achievements';
    
    return includePrivate ? `${baseFields} ${privateFields}` : baseFields;
  }

  // Optimize pet queries with selective fields
  static getPetFields(includePrivate = false) {
    const baseFields = 'name type level happiness hunger xp owner createdAt lastFed lastPlayed';
    const privateFields = 'abilities feedCount playCount';
    
    return includePrivate ? `${baseFields} ${privateFields}` : baseFields;
  }

  // Create optimized aggregation pipeline for user pets
  static getUserPetsAggregation(userId) {
    const mongoose = require('mongoose');
    return [
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          name: 1,
          type: 1,
          level: 1,
          happiness: 1,
          hunger: 1,
          xp: 1,
          lastFed: 1,
          lastPlayed: 1,
          createdAt: 1,
          // Calculate derived fields
          needsAttention: {
            $or: [
              { $lt: ['$happiness', 40] },
              { $lt: ['$hunger', 40] }
            ]
          },
          timeSinceLastFed: {
            $subtract: [new Date(), '$lastFed']
          }
        }
      },
      { $sort: { level: -1, createdAt: -1 } }
    ];
  }

  // Create batch update operations
  static createBatchUpdate(updates) {
    return updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data },
        upsert: false
      }
    }));
  }

  // Optimize lean queries
  static leanQuery(query) {
    return query.lean().exec();
  }

  // Add population optimization
  static optimizePopulation(query, paths) {
    const optimizedPaths = paths.map(path => {
      if (typeof path === 'string') {
        return { path, select: this.getUserFields() };
      }
      return path;
    });
    
    return query.populate(optimizedPaths);
  }
}

// Performance monitoring
class PerformanceMonitor {
  static startTimer(label) {
    console.time(label);
    return {
      end: () => console.timeEnd(label)
    };
  }

  static async measureAsync(label, asyncFunction) {
    const start = Date.now();
    try {
      const result = await asyncFunction();
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow query detected: ${label} took ${duration}ms`);
      } else if (duration > 500 && process.env.NODE_ENV === 'development') {
        // console.log(`⚡ Query: ${label} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ Query failed: ${label} took ${duration}ms`, error.message);
      throw error;
    }
  }

  static logDatabaseOperation(operation, collection, duration, documentCount = 1) {
    const logLevel = duration > 500 ? 'warn' : 'info';
    console[logLevel](`[DB] ${operation} on ${collection}: ${duration}ms (${documentCount} docs)`);
  }
}

module.exports = {
  CacheService,
  QueryOptimizer,
  PerformanceMonitor,
  CACHE_KEYS,
  CACHE_TTL
};
