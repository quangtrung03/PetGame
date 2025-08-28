import React, { useEffect, useState } from 'react';
import { getUserAchievements, getAllAchievements } from '../api/achievements';
import { useAuth } from '../context/AuthContext';

const AchievementList = () => {
  const { token } = useAuth();
  const [userAchievements, setUserAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const [userRes, allRes] = await Promise.all([
          getUserAchievements(token),
          getAllAchievements()
        ]);
        setUserAchievements(userRes.data.achievements || []);
        setAllAchievements(allRes.data.achievements || []);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    if (token) fetchAchievements();
  }, [token]);

  if (loading) return <div>Đang tải thành tích...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Thành tích của bạn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAchievements.map((ach) => {
          const unlocked = userAchievements.some((ua) => ua._id === ach._id);
          return (
            <div key={ach._id} className={`border rounded p-4 flex items-center space-x-3 ${unlocked ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300 opacity-60'}`}>
              <span className="text-3xl">{ach.icon}</span>
              <div>
                <div className="font-semibold">{ach.name}</div>
                <div className="text-sm text-gray-600">{ach.description}</div>
                {unlocked && <span className="text-green-600 text-xs font-bold">Đã mở khoá</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementList;
