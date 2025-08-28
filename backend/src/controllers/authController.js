const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('pets');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Daily rewards logic
    let dailyReward = 0;
    let streak = user.dailyLoginStreak || 0;
    let lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    const today = new Date();
    const isNewDay = !lastLogin || today.toDateString() !== lastLogin.toDateString();

    if (isNewDay) {
      // Check streak
      if (lastLogin && (today - lastLogin) / (1000 * 60 * 60 * 24) === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
      // Multiplier: x1, x2, x3, x5
      let multiplier = 1;
      if (streak >= 14) multiplier = 5;
      else if (streak >= 7) multiplier = 3;
      else if (streak >= 3) multiplier = 2;
      dailyReward = 50 * multiplier;
      user.coins += dailyReward;
      user.dailyLoginStreak = streak;
      user.lastLogin = today;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          pets: user.pets,
          coins: user.coins,
          dailyLoginStreak: user.dailyLoginStreak
        },
        token,
        dailyReward: isNewDay ? dailyReward : 0,
        streak: user.dailyLoginStreak
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('pets')
      .select('-password');

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
