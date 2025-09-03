import api from './index';

export const searchUsers = async (q) => {
  try {
    const res = await api.get(`/friends/search?q=${q}`);
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const res = await api.post('/friends/send', { userId });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const acceptFriendRequest = async (userId) => {
  try {
    const res = await api.post('/friends/accept', { userId });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const declineFriendRequest = async (userId) => {
  try {
    const res = await api.post('/friends/decline', { userId });
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const getFriends = async () => {
  try {
    const res = await api.get('/friends/list');
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

export const getFriendRequests = async () => {
  try {
    const res = await api.get('/friends/requests');
    return res;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};
