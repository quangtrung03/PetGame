const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  authRateLimit,
  validateRequest
} = require('../middleware/validation');

const router = express.Router();

// Apply general request validation to all routes
router.use(validateRequest);

// Public routes with rate limiting and validation
router.post('/register', 
  authRateLimit,
  validateRegistration,
  registerUser
);

router.post('/login', 
  authRateLimit,
  validateLogin,
  loginUser
);

// Protected routes
router.get('/profile', auth, getUserProfile);

module.exports = router;
