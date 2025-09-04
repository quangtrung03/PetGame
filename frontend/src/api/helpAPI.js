import api from './index';

export const helpAPI = {
  // Lấy thông tin hướng dẫn toàn diện
  getHelpInfo: async () => {
    try {
      const response = await api.get('/help');
      return response.data;
    } catch (error) {
      console.error('Error fetching help info:', error);
      throw error;
    }
  },

  // Lấy hướng dẫn nhanh
  getQuickGuide: async () => {
    try {
      const response = await api.get('/help/quick-guide');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick guide:', error);
      throw error;
    }
  }
};