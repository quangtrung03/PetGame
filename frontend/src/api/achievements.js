import axios from 'axios';

export const getUserAchievements = async (token) => {
  return axios.get('/api/achievements/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getAllAchievements = async () => {
  return axios.get('/api/achievements');
};
