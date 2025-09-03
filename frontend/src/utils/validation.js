// Frontend validation utilities

export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (typeof email !== 'string') {
      errors.push('Email must be a string');
    } else {
      const trimmed = email.trim().toLowerCase();
      if (!emailRegex.test(trimmed)) {
        errors.push('Please enter a valid email address');
      }
      if (trimmed.length > 100) {
        errors.push('Email address is too long');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: email ? email.trim().toLowerCase() : ''
    };
  },

  // Username validation
  username: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    const errors = [];
    
    if (!username) {
      errors.push('Username is required');
    } else if (typeof username !== 'string') {
      errors.push('Username must be a string');
    } else {
      const trimmed = username.trim();
      if (trimmed.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (trimmed.length > 20) {
        errors.push('Username must be no more than 20 characters long');
      }
      if (!usernameRegex.test(trimmed)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: username ? username.trim() : ''
    };
  },

  // Password validation
  password: (password, isLogin = false) => {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
    } else if (typeof password !== 'string') {
      errors.push('Password must be a string');
    } else {
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (password.length > 128) {
        errors.push('Password is too long');
      }
      
      // Only check complexity for registration, not login
      if (!isLogin) {
        if (!/(?=.*[a-z])/.test(password)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/(?=.*[A-Z])/.test(password)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/(?=.*\d)/.test(password)) {
          errors.push('Password must contain at least one number');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: password // Don't modify password
    };
  },

  // Pet name validation
  petName: (name) => {
    const nameRegex = /^[a-zA-Z0-9\s-']+$/;
    const errors = [];
    
    if (!name) {
      errors.push('Pet name is required');
    } else if (typeof name !== 'string') {
      errors.push('Pet name must be a string');
    } else {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        errors.push('Pet name must be at least 2 characters long');
      }
      if (trimmed.length > 30) {
        errors.push('Pet name must be no more than 30 characters long');
      }
      if (!nameRegex.test(trimmed)) {
        errors.push('Pet name can only contain letters, numbers, spaces, hyphens, and apostrophes');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: name ? name.trim() : ''
    };
  },

  // Amount validation (for feeding, playing, etc.)
  amount: (amount) => {
    const errors = [];
    
    if (amount === undefined || amount === null) {
      errors.push('Amount is required');
    } else {
      const numAmount = Number(amount);
      if (isNaN(numAmount)) {
        errors.push('Amount must be a valid number');
      } else if (numAmount < 0) {
        errors.push('Amount cannot be negative');
      } else if (numAmount > 1000000) {
        errors.push('Amount is too large');
      } else if (!Number.isInteger(numAmount)) {
        errors.push('Amount must be a whole number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: amount ? Number(amount) : 0
    };
  }
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  const sanitizedData = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const rule = rules[field];
    
    if (typeof rule === 'function') {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
      sanitizedData[field] = result.sanitized;
    } else if (Array.isArray(rule)) {
      // Multiple validation rules
      const fieldErrors = [];
      let sanitized = value;
      
      rule.forEach(validatorFn => {
        const result = validatorFn(value);
        if (!result.isValid) {
          fieldErrors.push(...result.errors);
          isValid = false;
        }
        sanitized = result.sanitized;
      });
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
      sanitizedData[field] = sanitized;
    }
  });

  return {
    isValid,
    errors,
    sanitizedData
  };
};

// XSS protection for display
export const sanitizeForDisplay = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting helper for frontend
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = [];
  
  return () => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    return true;
  };
};

export default validators;
