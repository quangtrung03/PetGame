import api from './index';

export const getUserAchievements = async (token) => {
  try {
    const res = await api.get('/achievements/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const getAllAchievements = async () => {
  try {
    const res = await api.get('/achievements');
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Alias for compatibility
export const getAchievements = getAllAchievements;
