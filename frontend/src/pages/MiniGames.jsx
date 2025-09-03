import React, { useState } from 'react';
import MemoryGame from '../components/MemoryGame';
import { useToast } from '../context/ToastContext';
import { useEconomic } from '../context/EconomicContext';
import { useAuth } from '../context/AuthContext';
import { submitMemoryGameResult } from '../api/games';

const MiniGames = () => {
  const { addToast } = useToast();
  const { cooldowns, refreshData, coins, dailyStats } = useEconomic();
  const { updateUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const cooldownInfo = cooldowns?.minigame;

  const handleGameResult = async (result) => {
    try {
      const response = await submitMemoryGameResult(result);
      // Backend trả về { success, message, data: { score, coinsEarned, user, isWin } }
      addToast(response.data.message, response.data.data.isWin ? 'success' : 'info');
      
      // Update user coins if earned
      if (response.data.data.coinsEarned) {
        updateUser({ coins: response.data.data.user.coins });
      }
      
      refreshData(); // Refresh economic data
      setIsPlaying(false);
    } catch (error) {
      addToast(error.response?.data?.message || 'Lỗi khi ghi nhận kết quả', 'error');
      setIsPlaying(false);
    }
  };

  const startGame = () => {
    if (!cooldownInfo?.canPerform) {
      addToast(`⏰ Phải đợi ${cooldownInfo?.timeLeftMinutes || 0} phút nữa!`, 'warning');
      return;
    }
    setIsPlaying(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎮 Mini Games</h1>
        <p className="text-lg text-gray-600">Chơi game để kiếm coins và hoàn thành nhiệm vụ!</p>
      </div>

      {/* Game Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Thống kê game</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold">{coins?.toLocaleString() || 0}</div>
            <div className="text-sm opacity-90">💰 Coins hiện tại</div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold">{dailyStats?.coinsEarned || 0}</div>
            <div className="text-sm opacity-90">📈 Kiếm hôm nay</div>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold">
              {cooldownInfo?.canPerform ? 'Sẵn sàng' : `${cooldownInfo?.timeLeftMinutes || 0}m`}
            </div>
            <div className="text-sm opacity-90">⏰ Trạng thái</div>
          </div>
        </div>
      </div>

      {/* Game Rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Luật chơi & Phần thưởng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">🎯 Cách tính điểm:</h4>
            <ul className="space-y-1">
              <li>• Điểm = 100 - số lần lật thẻ</li>
              <li>• Hoàn thành dưới 30s: Bonus x1.5</li>
              <li>• Hoàn thành dưới 60s: Bonus x1.2</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">💰 Phần thưởng coins:</h4>
            <ul className="space-y-1">
              <li>• Điểm ≥90: Coins x2</li>
              <li>• Điểm ≥70: Coins x1.5</li>
              <li>• Điểm ≥50: Coins x1.2</li>
              <li>• Cooldown: 5 phút</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Memory Game */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🧠 Memory Game</h2>
          <p className="text-gray-600">Lật thẻ để tìm cặp giống nhau. Hoàn thành càng nhanh càng nhiều thưởng!</p>
        </div>

        {!isPlaying ? (
          <div className="text-center">
            <button
              onClick={startGame}
              disabled={!cooldownInfo?.canPerform}
              className={`px-8 py-4 rounded-lg text-lg font-medium transition-all ${
                cooldownInfo?.canPerform
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {cooldownInfo?.canPerform 
                ? '🚀 Bắt đầu chơi' 
                : `⏰ Đợi ${cooldownInfo?.timeLeftMinutes || 0} phút`
              }
            </button>
            
            {!cooldownInfo?.canPerform && (
              <p className="mt-3 text-sm text-gray-500">
                Hệ thống cooldown giúp cân bằng kinh tế game
              </p>
            )}
          </div>
        ) : (
          <MemoryGame 
            onGameComplete={handleGameResult}
            onGameCancel={() => setIsPlaying(false)}
          />
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">💡 Mẹo chơi</h3>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>• Ghi nhớ vị trí các thẻ đã lật để tăng hiệu quả</p>
          <p>• Chơi thường xuyên để hoàn thành nhiệm vụ "Thắng minigame"</p>
          <p>• Kết hợp với các hoạt động khác để tối đa hóa thu nhập</p>
          <p>• Level cao của pet sẽ tăng phần thưởng từ mọi hoạt động</p>
        </div>
      </div>
    </div>
  );
};

export default MiniGames;
