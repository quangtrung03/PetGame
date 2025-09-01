import api from './index';

export const searchUsers = async (q) => {
  const res = await api.get(`/friends/search?q=${q}`);
  return res.data;
};

export const sendFriendRequest = async (userId) => {
  const res = await api.post('/friends/send', { userId });
  return res.data;
};

export const acceptFriendRequest = async (userId) => {
  const res = await api.post('/friends/accept', { userId });
  return res.data;
};

export const declineFriendRequest = async (userId) => {
  const res = await api.post('/friends/decline', { userId });
  return res.data;
};

export const getFriends = async () => {
  const res = await api.get('/friends/list');
  return res.data;
};

export const getFriendRequests = async () => {
  const res = await api.get('/friends/requests');
  return res.data;
};
