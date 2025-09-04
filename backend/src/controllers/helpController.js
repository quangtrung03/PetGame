const { PerformanceMonitor } = require('../services/cacheService');

// Lấy thông tin hướng dẫn toàn diện về tính năng game
exports.getHelpInfo = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('helpController.getHelpInfo');
  
  try {
    const helpData = {
      title: "Pet Game - Hướng Dẫn Tổng Quan",
      introduction: "Chào mừng bạn đến với Pet Game! Đây là tất cả những gì bạn có thể làm trong game:",
      
      features: [
        {
          id: 'pets',
          title: '🐾 Quản Lý Thú Cưng',
          description: 'Nuôi và chăm sóc thú cưng ảo của bạn',
          capabilities: [
            'Tạo thú cưng mới (5 loại: Mèo, Chó, Thỏ, Chim, Cá)',
            'Cho ăn để tăng độ đói (5 phút cooldown, +20 hunger, +10 happiness, +10 XP)',
            'Chơi cùng để tăng hạnh phúc (10 phút cooldown, +20 happiness, +15 XP)',
            'Sử dụng kỹ năng đặc biệt (15 phút cooldown, thưởng đặc biệt)',
            'Theo dõi thống kê: độ đói, hạnh phúc, level, XP',
            'Thú cưng sẽ tự động giảm stats theo thời gian nếu không chăm sóc'
          ],
          rewards: 'Nhận coins từ hoạt động: Feed +5 coins, Play +8 coins, Ability +10 coins'
        },
        
        {
          id: 'shop',
          title: '🛒 Cửa Hàng & Kho Đồ',
          description: 'Mua sắm vật phẩm và quản lý inventory',
          capabilities: [
            'Mua thức ăn, đồ chơi và phụ kiện cho thú cưng',
            'Hệ thống giá động - giá tăng khi mua nhiều để chống spam',
            '3 loại vật phẩm: Basic (10-30 coins), Premium (50-80 coins), Special (100-200 coins)',
            'Sử dụng vật phẩm để tăng stats cho thú cưng',
            'Theo dõi lịch sử mua hàng và thống kê chi tiêu',
            'Giới hạn mua hàng hàng ngày để cân bằng game'
          ],
          rewards: 'Vật phẩm có hiệu ứng khác nhau: tăng hunger, happiness, XP'
        },
        
        {
          id: 'missions',
          title: '📋 Nhiệm Vụ Hàng Ngày',
          description: 'Hoàn thành nhiệm vụ để nhận thưởng',
          capabilities: [
            'Nhiệm vụ tự động theo dõi tiến độ khi bạn chơi game',
            '6 loại nhiệm vụ: Feed, Play, Login, Purchase, Ability, Minigame',
            'Reset hàng ngày với nhiệm vụ mới',
            'Nhận thưởng tự động khi hoàn thành',
            'Hoặc claim thưởng thủ công từ danh sách nhiệm vụ'
          ],
          rewards: 'Coins, XP, vật phẩm đặc biệt, achievement unlock'
        },
        
        {
          id: 'games',
          title: '🎮 Mini Games',
          description: 'Chơi game để kiếm coins và giải trí',
          capabilities: [
            'Memory Game với 3 độ khó: Easy (1x), Medium (1.5x), Hard (2x)',
            'Bonus điểm theo performance: 50+(1.2x), 70+(1.5x), 90+(2x)',
            'Bonus tốc độ: dưới 30s (1.5x), dưới 60s (1.2x)',
            'Daily Login Bonus với streak multiplier (1.2x - 2.4x tối đa 7 ngày)',
            'Xem thống kê kinh tế và performance dashboard',
            '5 phút cooldown giữa các game'
          ],
          rewards: '15 coins cơ bản + bonus theo performance và streak'
        },
        
        {
          id: 'friends',
          title: '👥 Hệ Thống Bạn Bè',
          description: 'Kết nối và tương tác với người chơi khác',
          capabilities: [
            'Tìm kiếm người dùng theo tên (case-insensitive)',
            'Gửi lời mời kết bạn',
            'Chấp nhận hoặc từ chối lời mời',
            'Quản lý danh sách bạn bè',
            'Xem danh sách lời mời đang chờ',
            'Bảo mật: chỉ chia sẻ username và email trong tìm kiếm'
          ],
          rewards: 'Unlock achievement "Social" khi có bạn bè'
        },
        
        {
          id: 'achievements',
          title: '🏆 Hệ Thống Thành Tích',
          description: 'Đạt được thành tích và nhận thưởng đặc biệt',
          capabilities: [
            'First Pet: Tạo thú cưng đầu tiên',
            'Pet Lover: Sở hữu nhiều thú cưng',
            'Caretaker: Cho ăn nhiều lần',
            'Player: Chơi cùng thú cưng nhiều lần',
            'Rich: Tích lũy nhiều coins',
            'Social: Kết bạn với người chơi khác',
            'Dedicated: Đăng nhập liên tục nhiều ngày',
            'Tự động unlock khi đạt điều kiện'
          ],
          rewards: '100 coins + XP cho mỗi achievement'
        },
        
        {
          id: 'economy',
          title: '💰 Hệ Thống Kinh Tế',
          description: 'Quản lý coins và tài nguyên trong game',
          capabilities: [
            'Kiếm coins từ: chăm sóc thú cưng, login hàng ngày, mini games, achievements',
            'Chi tiêu thông minh với hệ thống giá động',
            'Level multiplier: thú cưng level cao kiếm được nhiều coins hơn (+10%/level)',
            'Cooldown system ngăn chặn farming vô hạn',
            'Daily limits để cân bằng kinh tế game',
            'Theo dõi thu nhập và chi tiêu hàng ngày'
          ],
          rewards: 'Hệ thống cân bằng đảm bảo progression ổn định'
        }
      ],
      
      tips: [
        '💡 Đăng nhập hàng ngày để nhận bonus streak cao nhất',
        '💡 Chăm sóc thú cưng thường xuyên để tránh stats giảm',
        '💡 Hoàn thành daily missions để tối ưu thu nhập',
        '💡 Chơi mini games khi hết cooldown để kiếm thêm coins',
        '💡 Mua vật phẩm khi cần thiết, tránh mua quá nhiều cùng lúc',
        '💡 Kết bạn để unlock achievement Social',
        '💡 Level up thú cưng để tăng coin multiplier'
      ],
      
      quickStart: {
        title: 'Bắt Đầu Nhanh',
        steps: [
          '1. Tạo thú cưng đầu tiên ở trang Pets',
          '2. Cho ăn và chơi để tăng stats và kiếm coins',
          '3. Hoàn thành daily missions để nhận thưởng',
          '4. Ghé Shop để mua vật phẩm hỗ trợ',
          '5. Chơi mini games để kiếm thêm thu nhập',
          '6. Kết bạn và unlock achievements'
        ]
      },
      
      support: {
        title: 'Hỗ Trợ & Thông Tin',
        info: [
          'Health Check API: /api/health',
          'Performance Stats: /api/performance',
          'Comprehensive Documentation: DOCUMENTATION.txt',
          'All features có detailed validation và error handling',
          'Caching system để tối ưu performance',
          'Security: JWT authentication, rate limiting, CORS protection'
        ]
      }
    };
    
    timer.end();
    return res.json({
      success: true,
      message: 'Đây là tất cả những gì Pet Game có thể giúp bạn!',
      data: helpData
    });
    
  } catch (err) {
    console.error('[helpController.getHelpInfo] error:', err);
    timer.end();
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin hướng dẫn',
      error: 'Internal server error'
    });
  }
};

// Lấy hướng dẫn nhanh cho người mới bắt đầu
exports.getQuickGuide = async (req, res) => {
  const timer = PerformanceMonitor.startTimer('helpController.getQuickGuide');
  
  try {
    const quickGuide = {
      title: "Hướng Dẫn Nhanh - Pet Game",
      steps: [
        {
          step: 1,
          title: "Tạo Thú Cưng",
          description: "Vào trang Pets và tạo thú cưng đầu tiên",
          action: "Chọn loại thú cưng và đặt tên",
          reward: "Achievement 'First Pet' + 100 coins"
        },
        {
          step: 2,
          title: "Chăm Sóc Cơ Bản",
          description: "Cho ăn và chơi để duy trì stats",
          action: "Click Feed/Play khi cooldown hết",
          reward: "5-10 coins mỗi action + XP"
        },
        {
          step: 3,
          title: "Daily Missions",
          description: "Kiểm tra và hoàn thành nhiệm vụ hàng ngày",
          action: "Làm theo nhiệm vụ tự động hoặc claim reward",
          reward: "Coins, XP, items đặc biệt"
        },
        {
          step: 4,
          title: "Mini Games",
          description: "Chơi Memory Game để kiếm thêm coins",
          action: "Chọn độ khó và chơi game",
          reward: "15+ coins tùy performance"
        },
        {
          step: 5,
          title: "Mua Sắm Thông Minh",
          description: "Mua vật phẩm khi cần để hỗ trợ thú cưng",
          action: "Chọn items phù hợp với loại thú cưng",
          reward: "Tăng hiệu quả chăm sóc"
        }
      ],
      
      warnings: [
        "⚠️ Thú cưng sẽ đói và buồn theo thời gian - chăm sóc thường xuyên",
        "⚠️ Có cooldown cho mỗi action - không thể spam liên tục",
        "⚠️ Giá shop sẽ tăng nếu mua quá nhiều - mua có kế hoạch",
        "⚠️ Daily missions reset lúc nửa đêm - hoàn thành kịp thời"
      ]
    };
    
    timer.end();
    return res.json({
      success: true,
      message: 'Hướng dẫn nhanh cho người mới',
      data: quickGuide
    });
    
  } catch (err) {
    console.error('[helpController.getQuickGuide] error:', err);
    timer.end();
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy hướng dẫn nhanh',
      error: 'Internal server error'
    });
  }
};