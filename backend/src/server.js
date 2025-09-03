const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Security middleware
const { securityHeaders } = require('./middleware/security');
const { apiRateLimit } = require('./middleware/validation');

// Routes
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const shopRoutes = require('./routes/shopRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const gameRoutes = require('./routes/gameRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Compression middleware (apply early for better performance)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false; // Don't compress if client doesn't want it
    }
    return compression.filter(req, res); // Use default filter
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (1-9, 6 is good balance)
}));

// Security middleware (apply early)
app.use(securityHeaders);

// Trust proxy for rate limiting behind reverse proxy/load balancer
app.set('trust proxy', 1);

// Rate limiting for all API routes
app.use('/api/', apiRateLimit);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/daily-missions', require('./routes/dailyMissionRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pet Game API is running',
    timestamp: new Date().toISOString()
  });
});

// Performance monitoring endpoint
app.get('/api/performance', (req, res) => {
  const { CacheService } = require('./services/cacheService');
  
  res.json({
    success: true,
    data: {
      cache: CacheService.getStats(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
