import api from './index';

export const getDailyMissions = async () => {
  const res = await api.get('/daily-missions');
  return res.data;
};

export const completeMission = async (code) => {
  const res = await api.post('/daily-missions/complete', { code });
  return res.data;
};

export const claimMissionReward = async (code) => {
  const res = await api.post('/daily-missions/claim', { code });
  return res.data;
};
