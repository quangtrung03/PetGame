import React, { useState, useEffect } from 'react';
import { helpAPI } from '../api/helpAPI';

const Help = () => {
  const [helpData, setHelpData] = useState(null);
  const [quickGuide, setQuickGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // Fallback mock data when API is not available
  const mockHelpData = {
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

  const mockQuickGuide = {
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

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true);
        const [helpResponse, guideResponse] = await Promise.all([
          helpAPI.getHelpInfo(),
          helpAPI.getQuickGuide()
        ]);
        
        if (helpResponse.success) {
          setHelpData(helpResponse.data);
        }
        if (guideResponse.success) {
          setQuickGuide(guideResponse.data);
        }
      } catch (err) {
        console.error('Error loading help data:', err);
        // Use fallback mock data instead of showing error
        setHelpData(mockHelpData);
        setQuickGuide(mockQuickGuide);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Use mock data if API data is not available
  const currentHelpData = helpData || mockHelpData;
  const currentQuickGuide = quickGuide || mockQuickGuide;

  const tabs = [
    { id: 'overview', label: '🎯 Tổng Quan', icon: '🎮' },
    { id: 'quickstart', label: '🚀 Bắt Đầu Nhanh', icon: '⚡' },
    { id: 'features', label: '✨ Tính Năng', icon: '🔥' },
    { id: 'tips', label: '💡 Mẹo Hay', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {currentHelpData?.title || 'Pet Game - Hướng Dẫn'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentHelpData?.introduction || 'Khám phá tất cả những gì bạn có thể làm trong Pet Game!'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-xl shadow-sm p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 mx-1 my-1 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && currentHelpData && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentHelpData.features.map((feature, index) => (
                  <div key={feature.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{feature.title.split(' ')[0]}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title.substring(2)}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {feature.capabilities.length} tính năng
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Start Tab */}
          {activeTab === 'quickstart' && currentQuickGuide && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  🚀 {currentQuickGuide.title}
                </h2>
                
                <div className="space-y-6">
                  {currentQuickGuide.steps.map((step, index) => (
                    <div key={step.step} className="flex items-start bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            🎯 {step.action}
                          </span>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            🏆 {step.reward}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                <div className="mt-8 bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-xl">
                  <h3 className="text-lg font-bold text-orange-800 mb-4">⚠️ Những Điều Cần Lưu Ý</h3>
                  <ul className="space-y-2">
                    {currentQuickGuide.warnings.map((warning, index) => (
                      <li key={index} className="text-orange-700 flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>{warning.substring(3)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && currentHelpData && (
            <div className="p-8">
              <div className="space-y-8">
                {currentHelpData.features.map((feature, index) => (
                  <div key={feature.id} className="border rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                      <h2 className="text-2xl font-bold">{feature.title}</h2>
                      <p className="text-blue-100 mt-2">{feature.description}</p>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Tính Năng Chi Tiết:</h3>
                          <ul className="space-y-2">
                            {feature.capabilities.map((capability, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <span className="text-green-500 mr-2 mt-1">✓</span>
                                <span>{capability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎁 Phần Thưởng:</h3>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800">{feature.rewards}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && currentHelpData && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  💡 Mẹo Chơi Game Hiệu Quả
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {currentHelpData.tips.map((tip, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Support Section */}
                {currentHelpData.support && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🆘 {currentHelpData.support.title}</h3>
                    <ul className="space-y-2">
                      {currentHelpData.support.info.map((info, index) => (
                        <li key={index} className="text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">ℹ️</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Sẵn Sàng Bắt Đầu? 🎮</h2>
            <p className="text-blue-100 mb-6">Bây giờ bạn đã biết Pet Game có thể giúp gì cho bạn rồi!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/pets" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                🐾 Tạo Thú Cưng Ngay
              </a>
              <a 
                href="/dashboard" 
                className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
              >
                📊 Vào Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;