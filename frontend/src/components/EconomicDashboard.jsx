import React from 'react';
import { claimDailyBonus } from '../api/games';
import { useToast } from '../context/ToastContext';
import { useEconomic } from '../context/EconomicContext';

const EconomicDashboard = () => {
  const { addToast } = useToast();
  const { 
    coins, 
    level, 
    dailyLoginStreak, 
    dailyStats, 
    purchaseHistory, 
    cooldowns, 
    isLoading,
    refreshData 
  } = useEconomic();

  const handleClaimDailyBonus = async () => {
    try {
      const response = await claimDailyBonus();
  addToast(response.data.message, 'success');
      refreshData(); // Refresh từ context
    } catch (error) {
      addToast(error.response?.data?.message || 'Lỗi khi nhận thưởng', 'error');
    }
  };

  const formatTime = (minutes) => {
    if (minutes === 0) return 'Sẵn sàng';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coins & Level */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">💰 {coins?.toLocaleString() || 0} Coins</h2>
            <p className="text-yellow-100">Level {level || 1}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-yellow-100">Streak</p>
            <p className="text-2xl font-bold">🔥 {dailyLoginStreak || 0}</p>
          </div>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Thống kê hôm nay</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Kiếm được</p>
            <p className="text-xl font-bold text-green-600">+{dailyStats?.coinsEarned || 0}</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded">
            <p className="text-sm text-gray-600">Chi tiêu</p>
            <p className="text-xl font-bold text-red-600">-{dailyStats?.coinsSpent || 0}</p>
          </div>
        </div>
      </div>

      {/* Action Cooldowns */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">⏰ Hoạt động</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="flex items-center">
              🍖 Cho ăn pet
            </span>
            <span className={`font-semibold ${cooldowns?.feed?.canPerform ? 'text-green-600' : 'text-red-600'}`}>
              {formatTime(cooldowns?.feed?.timeLeftMinutes || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="flex items-center">
              🎾 Chơi với pet
            </span>
            <span className={`font-semibold ${cooldowns?.play?.canPerform ? 'text-green-600' : 'text-red-600'}`}>
              {formatTime(cooldowns?.play?.timeLeftMinutes || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="flex items-center">
              ⚡ Sử dụng ability
            </span>
            <span className={`font-semibold ${cooldowns?.ability?.canPerform ? 'text-green-600' : 'text-red-600'}`}>
              {formatTime(cooldowns?.ability?.timeLeftMinutes || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="flex items-center">
              🎮 Mini game
            </span>
            <span className={`font-semibold ${cooldowns?.minigame?.canPerform ? 'text-green-600' : 'text-red-600'}`}>
              {formatTime(cooldowns?.minigame?.timeLeftMinutes || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🎁 Phần thưởng hàng ngày</h3>
        <button
          onClick={handleClaimDailyBonus}
          disabled={!cooldowns?.dailyLogin?.canPerform}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            cooldowns?.dailyLogin?.canPerform
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {cooldowns?.dailyLogin?.canPerform 
            ? '🎁 Nhận thưởng đăng nhập' 
            : '✅ Đã nhận thưởng hôm nay'
          }
        </button>
        {(dailyLoginStreak || 0) > 0 && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            Streak hiện tại: {dailyLoginStreak} ngày (Bonus: +{Math.min((dailyLoginStreak || 0) * 20, 140)}%)
          </p>
        )}
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🛒 Lịch sử mua hôm nay</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Thức ăn</p>
            <p className="text-lg font-bold text-blue-600">{purchaseHistory?.food || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <p className="text-sm text-gray-600">Đồ chơi</p>
            <p className="text-lg font-bold text-purple-600">{purchaseHistory?.toys || 0}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded">
            <p className="text-sm text-gray-600">Tổng</p>
            <p className="text-lg font-bold text-orange-600">{purchaseHistory?.total || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicDashboard;
