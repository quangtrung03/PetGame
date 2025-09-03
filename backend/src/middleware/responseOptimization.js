const compression = require('compression');
const { CacheService } = require('./cacheService');

/**
 * Response optimization middleware
 */

// Compression middleware with custom configuration
const responseCompression = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (1-9, 6 is default)
  level: 6,
  
  // Only compress these MIME types
  filter: (req, res) => {
    // Don't compress responses with Cache-Control: no-transform
    if (res.getHeader('Cache-Control') && res.getHeader('Cache-Control').includes('no-transform')) {
      return false;
    }
    
    // Compress JSON responses and text
    const contentType = res.getHeader('Content-Type');
    return contentType && (
      contentType.includes('application/json') ||
      contentType.includes('text/') ||
      contentType.includes('application/javascript')
    );
  }
});

// Response optimization middleware
const optimizeResponse = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to add optimizations
  res.json = function(data) {
    // Add response metadata for monitoring
    const responseSize = JSON.stringify(data).length;
    
    // Set cache headers for different types of responses
    if (req.path.includes('/pets') && req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, max-age=180'); // 3 minutes
    } else if (req.path.includes('/auth/profile') && req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes
    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    // Add performance headers
    res.setHeader('X-Response-Size', responseSize);
    res.setHeader('X-Response-Time', Date.now() - req.startTime);
    
    // Add ETAG for cacheable responses
    if (req.method === 'GET' && data.success) {
      const etag = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
      res.setHeader('ETag', `"${etag}"`);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${etag}"`) {
        return res.status(304).end();
      }
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  // Track request start time
  req.startTime = Date.now();
  
  next();
};

// Response pagination middleware
const paginateResponse = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    const skip = (page - 1) * limit;
    
    // Add pagination to request
    req.pagination = {
      page,
      limit,
      skip,
      maxLimit
    };
    
    // Override json method to add pagination metadata
    const originalJson = res.json;
    res.json = function(data) {
      if (data.success && Array.isArray(data.data)) {
        const total = data.total || data.data.length;
        const totalPages = Math.ceil(total / limit);
        
        return originalJson.call(this, {
          ...data,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Response validation middleware
const validateResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Validate response structure
    if (typeof data !== 'object' || data === null) {
      console.warn('⚠️ Invalid response format - not an object');
      data = { success: false, message: 'Invalid response format' };
    }
    
    // Ensure success field exists
    if (data.success === undefined) {
      data.success = res.statusCode >= 200 && res.statusCode < 300;
    }
    
    // Add timestamp to response
    data.timestamp = new Date().toISOString();
    
    // Remove sensitive fields in production
    if (process.env.NODE_ENV === 'production' && data.data) {
      delete data.data.password;
      delete data.data.tokens;
      delete data.error?.stack;
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Response caching middleware for expensive operations
const cacheExpensiveOperations = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create cache key from request
    const cacheKey = `response:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
    
    // Try to get cached response
    const cachedResponse = CacheService.get(cacheKey);
    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override to cache successful responses
    res.json = function(data) {
      if (data.success && res.statusCode === 200) {
        CacheService.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Monitor response performance
const monitorPerformance = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  // Override end method to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Number(process.hrtime.bigint() - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow responses
    if (duration > 1000) {
      console.warn(`🐌 Slow response: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }
    
    // Log to monitoring service (if available)
    if (global.monitoring) {
      global.monitoring.recordResponseTime(req.path, duration, res.statusCode);
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = {
  responseCompression,
  optimizeResponse,
  paginateResponse,
  validateResponse,
  cacheExpensiveOperations,
  monitorPerformance
};
