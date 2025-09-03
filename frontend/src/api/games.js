import api from './index';

// Submit memory game result
export const submitMemoryGameResult = async (gameData) => {
  try {
    const response = await api.post('/games/memory-result', gameData);
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Claim daily bonus
export const claimDailyBonus = async () => {
  try {
    const response = await api.post('/games/daily-bonus');
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Get economic stats
export const getUserEconomicStats = async () => {
  try {
    const response = await api.get('/games/economic-stats');
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};
