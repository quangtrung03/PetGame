import React, { useEffect, useState } from 'react';
import { getDailyMissions, completeMission, claimMissionReward } from '../api/dailyMissions';
import { useToast } from '../context/ToastContext';

const DailyMissions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const res = await getDailyMissions();
      setMissions(res.missions || []);
    } catch (err) {
      addToast('Không thể tải nhiệm vụ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (code) => {
    try {
      await completeMission(code);
      addToast('Đã hoàn thành nhiệm vụ!', 'success');
      loadMissions();
    } catch (err) {
      addToast('Không thể hoàn thành nhiệm vụ', 'error');
    }
  };

  const handleClaim = async (code) => {
    try {
      await claimMissionReward(code);
      addToast('Đã nhận thưởng!', 'success');
      loadMissions();
    } catch (err) {
      addToast('Không thể nhận thưởng', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Nhiệm vụ hằng ngày</h2>
      {loading ? <div>Đang tải...</div> : (
        <div className="space-y-4">
          {missions.length === 0 ? <div>Không có nhiệm vụ nào.</div> : missions.map(m => (
            <div key={m.code} className="card p-4 flex flex-col gap-2">
              <div className="font-semibold">{m.description}</div>
              <div className="text-sm text-gray-500">Phần thưởng: {m.reward.coins}💰 {m.reward.xp}XP {m.reward.item && `, ${m.reward.item}`}</div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={() => handleComplete(m.code)}>Hoàn thành</button>
                <button className="btn-secondary" onClick={() => handleClaim(m.code)}>Nhận thưởng</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyMissions;
