import api from './index';

export const getDailyMissions = async () => {
  try {
    const res = await api.get('/daily-missions');
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const completeMission = async (code) => {
  try {
    const res = await api.post('/daily-missions/complete', { code });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const claimMissionReward = async (code) => {
  try {
    const res = await api.post('/daily-missions/claim', { code });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};
