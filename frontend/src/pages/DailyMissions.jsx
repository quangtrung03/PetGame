import React, { useEffect, useState } from 'react';
import { getDailyMissions, completeMission, claimMissionReward } from '../api/dailyMissions';
import { getAchievements } from '../api/achievements';
import { useToast } from '../context/ToastContext';

const DailyMissions = () => {
  const [missions, setMissions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('missions');
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [missionRes, achievementRes] = await Promise.all([
        getDailyMissions(),
        getAchievements()
      ]);
      // Backend trả về { success, message, data }
      setMissions(missionRes.data?.data?.missions || missionRes.data?.missions || []);
      setAchievements(achievementRes.data?.data?.achievements || achievementRes.data?.achievements || []);
    } catch (err) {
      addToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (code) => {
    try {
      await completeMission(code);
      addToast('Đã hoàn thành nhiệm vụ!', 'success');
      loadData();
    } catch (err) {
      addToast('Không thể hoàn thành nhiệm vụ', 'error');
    }
  };

  const handleClaim = async (code) => {
    try {
      await claimMissionReward(code);
      addToast('Đã nhận thưởng!', 'success');
      loadData();
    } catch (err) {
      addToast('Không thể nhận thưởng', 'error');
    }
  };

  const renderProgressBar = (current, target) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const getMissionIcon = (type) => {
    const icons = {
      feed_pets: '🍖',
      play_with_pets: '🎾',
      use_abilities: '✨',
      earn_coins: '💰',
      spend_coins: '💸',
      buy_items: '🛒',
      level_up_pets: '⭐',
      win_minigames: '🎮'
    };
    return icons[type] || '📋';
  };

  const getAchievementIcon = (name) => {
    const icons = {
      'First Pet': '🐾',
      'Pet Lover': '❤️',
      'Feeder': '🍖',
      'Player': '🎾',
      'Pet Master': '👑',
      'Trainer': '🏆'
    };
    return icons[name] || '🏅';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Nhiệm vụ & Thành tích</h1>
        <p className="text-gray-600">Hoàn thành nhiệm vụ hàng ngày và mở khóa thành tích để nhận thưởng!</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('missions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'missions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Nhiệm vụ hàng ngày
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏆 Bảng thành tích
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Missions Tab */}
              {activeTab === 'missions' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nhiệm vụ hôm nay ({missions.filter(m => m.isCompleted).length}/{missions.length})
                    </h3>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${missions.length > 0 ? (missions.filter(m => m.isCompleted).length / missions.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {missions.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-6xl mb-4 block">📋</span>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có nhiệm vụ nào</h3>
                      <p className="text-gray-600">Hãy quay lại sau để nhận nhiệm vụ mới!</p>
                    </div>
                  ) : (
                    missions.map(mission => (
                      <div key={mission._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <span className="text-3xl">{getMissionIcon(mission.type)}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{mission.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{mission.description}</p>
                              
                              <div className="flex items-center space-x-4 mb-2">
                                <div className="flex-1">
                                  {renderProgressBar(mission.currentProgress, mission.targetProgress)}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {mission.currentProgress}/{mission.targetProgress}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600 font-medium">
                                  🎁 Phần thưởng: {mission.reward?.coins || 0} coins
                                  {mission.reward?.xp > 0 && ` + ${mission.reward.xp} XP`}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Hết hạn: {new Date(mission.expiresAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            {mission.isCompleted ? (
                              mission.isClaimed ? (
                                <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium">
                                  ✅ Đã nhận thưởng
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleClaim(mission.code)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  🎁 Nhận thưởng
                                </button>
                              )
                            ) : (
                              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
                                ⏳ Đang thực hiện
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Bảng thành tích ({achievements.filter(a => a.isUnlocked).length}/{achievements.length})
                    </h3>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${achievements.length > 0 ? (achievements.filter(a => a.isUnlocked).length / achievements.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {achievements.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-6xl mb-4 block">🏆</span>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có thành tích nào</h3>
                      <p className="text-gray-600">Hãy chăm sóc pet để mở khóa thành tích!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map(achievement => (
                        <div 
                          key={achievement._id} 
                          className={`rounded-lg p-4 border-2 ${
                            achievement.isUnlocked 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className={`text-3xl ${achievement.isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                              {getAchievementIcon(achievement.name)}
                            </span>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                {achievement.name}
                              </h4>
                              <p className={`text-sm ${achievement.isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                                {achievement.description}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className={`text-sm font-medium ${
                                  achievement.isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                                }`}>
                                  🎁 {achievement.reward?.coins || 0} coins
                                  {achievement.reward?.xp > 0 && ` + ${achievement.reward.xp} XP`}
                                </span>
                                {achievement.isUnlocked && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    ✅ Đã mở khóa
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyMissions;
