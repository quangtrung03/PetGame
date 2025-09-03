# 🐾 Pet Game - MERN Stack Virtual Pet Management System

Một ứng dụng web toàn diện cho phép người dùng nuôi, chăm sóc và tương tác với thú cưng ảo. Hệ thống bao gồm 8 module chính với hơn 80 API endpoints và testing automation.

## 🏗️ Kiến trúc hệ thống

### 🔧 **Công nghệ Core**
- **Backend**: Node.js + Express.js + MongoDB Atlas
- **Frontend**: React 18 + Vite + TailwindCSS
- **Authentication**: JWT + bcrypt
- **Performance**: Node-cache + Query optimization
- **Testing**: PowerShell automation + Smoke tests

### 📦 **Cấu trúc project**
```
Pet/
├── backend/                 # Server API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/     # 8 business logic controllers  
│   │   ├── models/          # 6 MongoDB schemas
│   │   ├── routes/          # RESTful API routes
│   │   ├── services/        # 4 helper services
│   │   ├── middleware/      # Auth + validation + security
│   │   └── config/          # Database configuration
│   └── scripts/
│       └── smoke_tests.ps1  # Comprehensive API testing
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # 9 route pages
│   │   ├── context/         # 3 React contexts for state
│   │   ├── api/             # HTTP client layer
│   │   └── utils/           # Helper utilities
└── DOCUMENTATION.txt        # Complete technical reference

```

## 🎯 Hệ thống chức năng

### 🔐 **1. Authentication & User Management**
- **JWT-based authentication** với 7-day expiry
- **Password security** với bcrypt hashing (10 salt rounds)
- **Daily login streak** với bonus multiplier (1.2x - 2.4x)
- **User profile** tracking: level, XP, coins, streaks
- **Registration validation**: Username (3-20 chars), email format, password strength

### 🐾 **2. Pet Management System**
- **5 pet types**: Cat, Dog, Rabbit, Bird, Fish
- **Pet stats**: Hunger/Happiness (0-100), Level, XP
- **Unique abilities** per pet type (2 abilities each):
  - Cat: Heal, Lucky | Dog: Guard, Fetch | Rabbit: Speed Up, Double Feed
  - Bird: Sing, Scout | Fish: Splash, Treasure
- **Status decay system**: Auto-decay hunger/happiness over time
- **Activities với cooldowns**:
  - Feed (5 min cooldown): +20 hunger, +10 happiness, +10 XP
  - Play (10 min cooldown): +20 happiness, -5 hunger, +15 XP  
  - Abilities (15 min cooldown): Various effects + bonus rewards

### 🛒 **3. Shop & Inventory System**
- **Dynamic pricing** với inflation protection
- **3 categories**: Basic (10-30 coins), Premium (50-80 coins), Special (100-200 coins)
- **Item types**: Food, Toys, Accessories
- **Pet compatibility**: Items for specific pet types or universal
- **Purchase tracking** và spending analytics
- **Inventory management**: Stacking, usage, effect application

### 🎮 **4. Mini Games & Activities**
- **Memory Game** với 3 difficulty levels:
  - Easy/Medium/Hard multipliers (1x/1.5x/2x)
  - Score bonuses: 50+(1.2x), 70+(1.5x), 90+(2x)
  - Speed bonuses: <30s(1.5x), <60s(1.2x)
- **Daily bonus system** với streak tracking
- **Economic stats dashboard** với performance metrics
- **5-minute cooldown** giữa games để prevent farming

### 📋 **5. Daily Missions System**
- **6 mission types**: Feed, Play, Login, Purchase, Ability, Minigame
- **Auto-progress tracking** qua MissionValidationService
- **Reward system**: Coins, XP, items, achievements
- **Daily reset** at midnight với new missions
- **Completion verification** và claim system

### 👥 **6. Friends & Social Features**
- **User search** by username (case-insensitive)
- **Friend request workflow**: Send → Accept/Decline → Friends list
- **Privacy protection**: Only username/email shared in search
- **Social integration** với mission system
- **Expandable** for future features (visit friends, gifts)

### 🏆 **7. Achievement System**
- **Achievement categories**:
  - First Pet, Pet Lover (multiple pets)
  - Caretaker (feeding), Player (playing)  
  - Rich (coin accumulation), Social (friends)
  - Dedicated (login streaks)
- **Auto-unlock mechanism** với condition checking
- **Reward distribution**: 100 coins + XP per achievement
- **Progress tracking** và unlock notifications

### 💰 **8. Economic System**
- **Balanced income sources**:
  - Pet activities: 5-10 coins với level multipliers
  - Daily login: 50 coins với streak bonuses
  - Mini games: 15 base coins với performance bonuses
  - Achievements: 100 coins one-time
- **Economic controls**:
  - Cooldown systems prevent farming
  - Dynamic pricing for repeated purchases  
  - Daily spending/earning limits
  - Purchase history analytics

## 🚀 Cài đặt và chạy

### ⚡ **Quick start**
```powershell
# Backend server
cd backend
npm install
npm start              # Production mode
# OR
npm run dev           # Development mode với nodemon

# Frontend development server (new terminal)
cd frontend  
npm install
npm run dev           # Vite dev server với hot reload
```

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

### 🧪 **Automated testing**
```powershell
# Comprehensive API testing (requires backend running)
cd backend
powershell -ExecutionPolicy Bypass -File scripts/smoke_tests.ps1

# Test coverage: 43 test cases across 8 modules
# Expected pass rate: 95%+ (35+ passing tests)
```

## 🗄️ Database Schema (MongoDB)

### **Collections Overview**
- `users` - User accounts và game progress
- `pets` - Pet instances với stats và abilities  
- `items` - Shop items với effects và pricing
- `inventory` - User-owned items với quantities
- `dailymissions` - Mission templates và rewards
- `achievements` - Achievement definitions và unlock conditions

### **User Schema**
```javascript
{
  _id: ObjectId,
  username: String (3-30 chars, unique),
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  
  // Game Progress
  coins: Number (default: 100),
  level: Number (default: 1), 
  xp: Number (default: 0),
  dailyLoginStreak: Number (default: 0),
  lastLogin: Date,
  
  // Economic Tracking  
  actionCooldowns: {
    feed: Date, play: Date, ability: Date,
    dailyLogin: Date, minigame: Date
  },
  purchaseHistory: {
    food: Number, toys: Number, total: Number
  },
  dailyStats: {
    coinsEarned: Number, coinsSpent: Number, lastReset: Date
  },
  
  // Daily Missions Progress
  dailyMissions: [{
    missionCode: String,
    currentProgress: Number,
    completed: Boolean, claimed: Boolean,
    date: Date
  }],
  
  // Relationships
  pets: [ObjectId] (ref: Pet),
  friends: [ObjectId] (ref: User),
  friendRequests: [ObjectId] (ref: User),
  achievements: [ObjectId] (ref: Achievement)
}
```

### **Pet Schema**
```javascript
{
  _id: ObjectId,
  name: String (max 50 chars),
  type: String (enum: ['cat', 'dog', 'rabbit', 'bird', 'fish']),
  
  // Status (0-100)
  hunger: Number (default: 50),
  happiness: Number (default: 50),
  level: Number (default: 1),
  xp: Number (default: 0),
  
  // Activity Tracking
  lastFed: Date, lastPlayed: Date,
  playCount: Number, feedCount: Number,
  
  // Pet-specific abilities
  abilities: [String], // ['Heal', 'Lucky'] for cats
  
  owner: ObjectId (ref: User)
}
```

## 🔌 API Endpoints Reference

### **🔐 Authentication** 
```
POST   /api/auth/register     # User registration với validation
POST   /api/auth/login        # Login với daily bonus calculation  
GET    /api/auth/profile      # Protected: User profile với economic stats
```

### **🐾 Pet Management**
```
GET    /api/pets              # Protected: Get user's pets với status decay
POST   /api/pets              # Protected: Create pet với ability assignment
PATCH  /api/pets/:id/feed     # Protected: Feed pet (5min cooldown)
PATCH  /api/pets/:id/play     # Protected: Play với pet (10min cooldown)  
POST   /api/pets/:id/use-ability # Protected: Use ability (15min cooldown)
DELETE /api/pets/:id          # Protected: Delete pet với confirmation
```

### **🛒 Shop & Inventory**
```
GET    /api/shop/items        # Get all shop items với categories
POST   /api/shop/buy          # Protected: Purchase với dynamic pricing
GET    /api/shop/inventory    # Protected: User inventory với quantities
POST   /api/shop/inventory/use # Protected: Use item on pet
```

### **🎮 Games & Activities**  
```
POST   /api/games/memory-result # Protected: Submit game result (5min cooldown)
POST   /api/games/daily-bonus   # Protected: Claim daily bonus (24h cooldown) 
GET    /api/games/economic-stats # Protected: Economic dashboard data
```

### **📋 Daily Missions**
```
GET    /api/daily-missions    # Protected: Get active missions với progress
POST   /api/daily-missions/complete # Protected: Force complete mission
POST   /api/daily-missions/claim    # Protected: Claim mission rewards
```

### **👥 Friends & Social**
```
GET    /api/friends/search?q= # Protected: Search users by username
POST   /api/friends/send      # Protected: Send friend request
POST   /api/friends/accept    # Protected: Accept friend request  
POST   /api/friends/decline   # Protected: Decline friend request
GET    /api/friends/list      # Protected: Get friends list
GET    /api/friends/requests  # Protected: Get pending requests
```

### **🏆 Achievements**
```
GET    /api/achievements      # Get all available achievements
GET    /api/achievements/user # Protected: Get user's unlocked achievements
POST   /api/achievements/unlock # Protected: Unlock specific achievement
```

### **⚙️ System**
```
GET    /api/health           # Health check endpoint
GET    /api/performance      # Performance metrics và cache stats
```

## 🎯 Gameplay Features

### **Pet Care System**
- **Status Bars**: Hunger/Happiness với color coding (Red: 0-39, Yellow: 40-69, Green: 70-100)
- **Auto Decay**: Hunger -5/hour since last fed, Happiness -3/hour since last played
- **Level System**: Pet level up tại 100XP × level threshold
- **Abilities**: Unique skills per pet type với special effects

### **Economic Balance**
- **Income Controls**: Cooldown-based để prevent farming
- **Dynamic Pricing**: Shop prices increase với repeated purchases
- **Level Multipliers**: Higher level pets earn more coins
- **Daily Limits**: Prevent economic inflation

### **Mission System** 
- **Auto-tracking**: Progress updated automatically khi user performs actions
- **Daily Reset**: New missions generated at midnight
- **Reward Types**: Coins, XP, items, achievement unlocks
- **Completion Logic**: Target progress tracking với claim verification

## 💡 Technical Features

### **Performance Optimization**
- **Node-cache**: In-memory caching với TTL
  - User profiles: 5 minutes
  - Pet lists: 2 minutes  
  - Shop items: 30 minutes
- **Query Optimization**: Lean queries, field selection, batch operations
- **Database Indexes**: Optimized for frequent queries

### **Security Measures**
- **JWT Security**: 7-day expiry với secure secret
- **Password Hashing**: bcrypt với 10 salt rounds
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API request throttling
- **CORS Protection**: Controlled cross-origin access

### **Error Handling**
- **Graceful Degradation**: Error boundaries trong React
- **API Error Responses**: Consistent error format
- **Validation Messages**: User-friendly error feedback
- **Logging**: Comprehensive error logging

## 🧪 Testing & Quality Assurance

### **Automated Testing**
File: `backend/scripts/smoke_tests.ps1`
- **43 comprehensive test cases** covering all modules
- **End-to-end workflows**: Registration → Pet care → Shop purchases → Games
- **Error scenario testing**: Invalid inputs, authentication failures
- **Performance monitoring**: Response time tracking
- **Data cleanup**: Automatic test data removal

### **Test Coverage**
```
✅ Authentication: Register, login, profile (3 tests)
✅ Pet Management: CRUD, feed, play, abilities (8 tests)  
✅ Shop System: Items, purchase, inventory usage (6 tests)
✅ Games: Memory game, daily bonus, stats (4 tests)
✅ Daily Missions: Get, complete, claim (5 tests)
✅ Friends: Search, requests, management (8 tests)
✅ Achievements: List, unlock, user progress (4 tests)
✅ System: Health check, cleanup (5 tests)
```

## 🔧 Development Workflow

### **Development Scripts**
```powershell
# Backend development
cd backend
npm run dev                # Nodemon với auto-restart

# Frontend development  
cd frontend
npm run dev               # Vite hot reload
npm run build            # Production build
npm run preview          # Preview production build

# Testing
powershell scripts/smoke_tests.ps1  # Full API testing
```

### **Environment Configuration**
```env
# Backend (.env)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📱 Frontend Architecture

### **Component Structure**
```
src/
├── components/
│   ├── PetCard.jsx          # Pet display với action buttons
│   ├── Toast.jsx            # Notification system
│   ├── Navbar.jsx           # Navigation với user info
│   ├── MemoryGame.jsx       # Interactive mini game
│   └── ProtectedRoute.jsx   # Route protection
├── pages/
│   ├── Dashboard.jsx        # Main dashboard với stats
│   ├── Pets.jsx            # Pet management interface
│   ├── Shop.jsx            # Item shop với inventory
│   ├── DailyMissions.jsx   # Mission tracking
│   ├── Friends.jsx         # Social features
│   └── MiniGames.jsx       # Games portal
├── context/
│   ├── AuthContext.jsx     # Authentication state
│   ├── EconomicContext.jsx # Economic data
│   └── ToastContext.jsx    # Notification state
└── api/                    # HTTP client layer
```

### **State Management**
- **React Context**: Global state management
- **Local State**: Component-specific state với hooks
- **Persistent Storage**: JWT token trong localStorage
- **Real-time Updates**: Immediate UI feedback

## 🚀 Deployment & Production

### **Production Build**
```powershell
# Frontend build
cd frontend
npm run build               # Optimized production build
npm run preview            # Local preview

# Backend production
cd backend  
npm start                  # Production server
```

### **Environment Setup**
- **MongoDB Atlas**: Cloud database với connection string
- **JWT Configuration**: Secure secret và expiry settings
- **CORS Setup**: Frontend URL whitelisting
- **Port Configuration**: Flexible port settings

## 🔮 Future Roadmap

### **Planned Features**
- **Pet Evolution**: Pets evolve at higher levels
- **Breeding System**: Combine pets to create new types
- **PvP Battles**: Pet combat system
- **Guilds**: Group features for players
- **Seasonal Events**: Limited-time content
- **Mobile App**: React Native version

### **Technical Improvements**
- **Redis Caching**: External cache for better performance
- **Microservices**: Split into smaller services  
- **GraphQL**: More efficient API queries
- **CI/CD Pipeline**: Automated deployment
- **Advanced Analytics**: Player behavior tracking

## 📞 Support & Troubleshooting

### **Common Issues**
1. **Backend connection**: Check MongoDB URI và network connectivity
2. **Frontend loading**: Verify backend is running on port 5000
3. **Authentication**: Clear localStorage if tokens are expired
4. **CORS errors**: Check FRONTEND_URL configuration
5. **Performance**: Monitor cache hit rates và query optimization

### **Debug Resources**
- Health check: `GET /api/health`
- Performance stats: `GET /api/performance`  
- Browser DevTools: Network tab for API debugging
- MongoDB logs: Connection và query monitoring

---

**🎮 Pet Game v1.0.0** - Comprehensive MERN stack virtual pet management system với advanced features và production-ready architecture.

📧 **Repository**: https://github.com/quangtrung03/PetGame  
📅 **Last Updated**: September 2, 2025
