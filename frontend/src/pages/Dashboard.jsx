import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEconomic } from '../context/EconomicContext';
import { getPets } from '../api/pets';
import EconomicDashboard from '../components/EconomicDashboard';
import AchievementList from '../components/AchievementList';
import Card, { StatsCard, QuickActionCard } from '../components/Card';

const Dashboard = () => {
  const { user } = useAuth();
  const { coins } = useEconomic();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalCoins: 0,
    totalLevel: 0,
    avgHealth: 0,
    needCare: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update coins when economic context changes
  useEffect(() => {
    if (coins !== undefined) {
      setStats(prev => ({ ...prev, totalCoins: coins }));
    }
  }, [coins]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load pets data
      const petsResponse = await getPets();
      
      // Backend trả về { success, message, data: { pets } }
      const petsData = petsResponse.data.data.pets;
      setPets(petsData);
      
      // Calculate pet stats
      const totalLevel = petsData.reduce((sum, pet) => sum + (pet.level || 1), 0);
      const avgHealth = petsData.length > 0 
        ? petsData.reduce((sum, pet) => sum + ((pet.hunger + pet.happiness) / 2), 0) / petsData.length
        : 0;
      const needCare = petsData.filter(pet => (pet.hunger + pet.happiness) / 2 < 40).length;
      
      setStats({
        totalPets: petsData.length,
        totalCoins: coins || 0,
        totalLevel,
        avgHealth: Math.round(avgHealth),
        needCare
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.username}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Hãy chăm sóc những người bạn thú cưng của bạn
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <span className="text-red-800">{error}</span>
              <button 
                onClick={loadDashboardData}
                className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Economic Dashboard */}
            <EconomicDashboard />

            {/* Achievement Section */}
            <AchievementList />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard 
                icon="🐾"
                title="Tổng số Pet"
                value={stats.totalPets}
                color="text-blue-600"
              />
              
              <StatsCard 
                icon="💰"
                title="Tổng Coins"
                value={stats.totalCoins}
                color="text-yellow-600"
              />
              
              <StatsCard 
                icon="⭐"
                title="Tổng Level"
                value={stats.totalLevel}
                color="text-purple-600"
              />
              
              <StatsCard 
                icon={stats.needCare > 0 ? '⚠️' : '💚'}
                title="Tình trạng"
                value={stats.needCare > 0 ? `${stats.needCare} cần chăm sóc` : 'Tất cả khỏe mạnh!'}
                color={stats.needCare > 0 ? 'text-red-600' : 'text-green-600'}
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Hành động nhanh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/pets">
                  <QuickActionCard
                    icon="🐱"
                    title="Quản lý Pet"
                    description="Chăm sóc thú cưng"
                  />
                </Link>

                <Link to="/daily-missions">
                  <QuickActionCard
                    icon="📋"
                    title="Nhiệm vụ"
                    description="Hoàn thành để nhận thưởng"
                  />
                </Link>

                <Link to="/shop">
                  <QuickActionCard
                    icon="🛒"
                    title="Cửa hàng"
                    description="Mua thức ăn & đồ chơi"
                  />
                </Link>

                <Link to="/mini-games">
                  <QuickActionCard
                    icon="🎮"
                    title="Mini Games"
                    description="Chơi game kiếm coins"
                  />
                </Link>
              </div>
            </div>

        {/* Recent Pets */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">🐾 Pet gần đây</h2>
            <Link 
              to="/pets" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          
          {pets.length === 0 ? (
            <Card className="text-center py-8">
              <span className="text-6xl mb-4 block">🐱</span>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Chưa có pet nào
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy tạo pet đầu tiên của bạn để bắt đầu chăm sóc!
              </p>
              <Link
                to="/pets"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
              >
                Tạo Pet đầu tiên
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.slice(0, 6).map(pet => (
                <div key={pet._id} className="card hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {pet.type === 'cat' && '🐱'}
                      {pet.type === 'dog' && '🐶'}
                      {pet.type === 'bird' && '🐦'}
                      {pet.type === 'fish' && '🐠'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-600">Level {pet.level}</p>
                      <div className="flex space-x-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          🍖 {pet.hunger}%
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          � {pet.happiness}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${
                        (pet.hunger + pet.happiness) / 2 > 70 ? 'bg-green-400' :
                        (pet.hunger + pet.happiness) / 2 > 40 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                  <span className="text-4xl">📝</span>
                  <p className="mt-2 text-gray-600">Chưa có hoạt động nào</p>
                  <p className="text-sm text-gray-500">
                    Hãy bắt đầu bằng cách tạo pet đầu tiên của bạn!
                  </p>
                  <Link
                    to="/pets"
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Tạo Pet ngay
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
