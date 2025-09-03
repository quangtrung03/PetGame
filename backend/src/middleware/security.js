const helmet = require('helmet');

// Security headers configuration
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api."],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false,
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
  
  // Frameguard
  frameguard: {
    action: 'deny'
  },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: {
    policy: ["no-referrer"]
  },
  
  // X-XSS-Protection
  xssFilter: true
});

// Custom security middleware
const customSecurityHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });

  // Additional security headers
  res.set({
    'X-Request-ID': req.headers['x-request-id'] || require('crypto').randomUUID(),
    'X-Response-Time': Date.now()
  });

  next();
};

// Rate limiting for security events
const securityEventLogger = (req, res, next) => {
  // Log security-related events
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log failed authentication attempts
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn(`Security Event: ${res.statusCode} - ${req.method} ${req.path} - IP: ${req.ip} - UA: ${req.get('User-Agent')}`);
    }
    
    // Log rate limit hits
    if (res.statusCode === 429) {
      console.warn(`Rate Limit Hit: ${req.method} ${req.path} - IP: ${req.ip}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  securityHeaders,
  customSecurityHeaders,
  securityEventLogger
};
