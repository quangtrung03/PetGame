const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Validate token format
      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      // Verify token with additional checks
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Validate decoded token structure
      if (!decoded.id || typeof decoded.id !== 'string') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token payload'
        });
      }

      // Check token expiration with buffer
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      // Get user from token with additional validation
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // Check if user account is active (if you have status field)
      if (user.status && user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'User account is not active'
        });
      }

      // Add user to request with security metadata
      req.user = user;
      req.tokenIssuedAt = decoded.iat;
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided'
    });
  }
};

module.exports = protect;
