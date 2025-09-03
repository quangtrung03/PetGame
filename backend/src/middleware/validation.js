const validator = require('validator');
const rateLimit = require('express-rate-limit');

// Input sanitization helper
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
};

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
  } else {
    const sanitizedUsername = sanitizeInput(username);
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
      errors.push('Username must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedUsername)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
    req.body.username = sanitizedUsername;
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    if (!validator.isEmail(sanitizedEmail)) {
      errors.push('Please provide a valid email address');
    }
    if (sanitizedEmail.length > 100) {
      errors.push('Email address is too long');
    }
    req.body.email = sanitizedEmail;
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    if (password.length < 6 || password.length > 128) {
      errors.push('Password must be between 6 and 128 characters');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    if (!validator.isEmail(sanitizedEmail)) {
      errors.push('Please provide a valid email address');
    }
    req.body.email = sanitizedEmail;
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6 || password.length > 128) {
    errors.push('Invalid password format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation for pet actions
const validatePetAction = (req, res, next) => {
  const { id } = req.params; // Changed from petId to id
  const errors = [];

  if (!id || typeof id !== 'string') {
    errors.push('Pet ID is required');
  } else if (!validator.isMongoId(id)) {
    errors.push('Invalid Pet ID format');
  }

  // Validate request body if present
  if (req.body && Object.keys(req.body).length > 0) {
    const allowedFields = ['action', 'amount', 'type', 'value', 'ability'];
    const bodyFields = Object.keys(req.body);
    
    bodyFields.forEach(field => {
      if (!allowedFields.includes(field)) {
        errors.push(`Unexpected field: ${field}`);
      }
      
      // Sanitize string values
      if (typeof req.body[field] === 'string') {
        req.body[field] = sanitizeInput(req.body[field]);
      }
    });

    // Validate numeric fields
    if (req.body.amount !== undefined) {
      const amount = parseInt(req.body.amount);
      if (isNaN(amount) || amount < 0 || amount > 1000000) {
        errors.push('Amount must be a valid number between 0 and 1,000,000');
      }
      req.body.amount = amount;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for API endpoints
const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General request validation
const validateRequest = (req, res, next) => {
  // Check content-type for POST/PUT/PATCH requests only if they have body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // Only check content-type if request has body
    if (req.body && Object.keys(req.body).length > 0) {
      if (!req.is('application/json')) {
        return res.status(400).json({
          success: false,
          message: 'Content-Type must be application/json'
        });
      }
    }
  }

  // Check request size (already handled by express.json() limit)
  // Add any additional general validations here

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePetAction,
  authRateLimit,
  apiRateLimit,
  validateRequest,
  sanitizeInput
};
