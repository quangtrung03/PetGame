import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPets } from '../api/pets';
import AchievementList from '../components/AchievementList';

const Dashboard = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalCoins: 0,
    totalLevel: 0,
    avgHealth: 0,
    needCare: 0
  });

  useEffect(() => {
    loadPetsAndStats();
  }, []);

  const loadPetsAndStats = async () => {
    try {
      const response = await getPets();
      const petsData = response.data.pets;
      setPets(petsData);
      
      // Calculate stats
      const totalCoins = petsData.reduce((sum, pet) => sum + (pet.coins || 0), 0);
      const totalLevel = petsData.reduce((sum, pet) => sum + (pet.level || 1), 0);
      const avgHealth = petsData.length > 0 
        ? petsData.reduce((sum, pet) => sum + ((pet.hunger + pet.happiness) / 2), 0) / petsData.length
        : 0;
      const needCare = petsData.filter(pet => (pet.hunger + pet.happiness) / 2 < 40).length;
      
      setStats({
        totalPets: petsData.length,
        totalCoins,
        totalLevel,
        avgHealth: Math.round(avgHealth),
        needCare
      });
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.username}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Hãy chăm sóc những người bạn thú cưng của bạn
          </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enhanced Stats Cards */}
        </div>

        {/* Achievement Section */}
        <AchievementList />
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🐾</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Tổng số Pet</h3>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.totalPets}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Tổng Coins</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.totalCoins}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Tổng Level</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalLevel}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">
                  {stats.needCare > 0 ? '⚠️' : '💚'}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Tình trạng</h3>
                <p className={`text-2xl font-bold ${stats.needCare > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.needCare > 0 ? `${stats.needCare} cần chăm sóc` : 'Tất cả khỏe mạnh!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hành động nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/pets"
              className="card hover:shadow-lg transition-shadow duration-200 block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Quản lý Pet</h3>
                  <p className="text-gray-600">Xem và chăm sóc các pet của bạn</p>
                </div>
                <span className="text-2xl">🐱</span>
              </div>
            </Link>

            <div className="card bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500">Cửa hàng</h3>
                  <p className="text-gray-400">Sắp ra mắt...</p>
                </div>
                <span className="text-2xl opacity-50">🛒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="card">
            <div className="text-center py-8">
              <span className="text-4xl">📝</span>
              <p className="mt-2 text-gray-600">Chưa có hoạt động nào</p>
              <p className="text-sm text-gray-500">
                Hãy bắt đầu bằng cách tạo pet đầu tiên của bạn!
              </p>
              <Link
                to="/pets"
                className="mt-4 inline-block btn-primary"
              >
                Tạo Pet ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
