import React, { useEffect, useState } from 'react';
import { searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends, getFriendRequests } from '../api/friends';
import { useToast } from '../context/ToastContext';

const Friends = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const res = await getFriends();
      // Backend trả về { success, message, data }
      setFriends(res.data?.data?.friends || res.data?.friends || res.friends || []);
    } catch (err) {}
  };

  const loadRequests = async () => {
    try {
      const res = await getFriendRequests();
      // Backend trả về { success, message, data }
      setRequests(res.data?.data?.requests || res.data?.requests || res.requests || []);
    } catch (err) {}
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await searchUsers(search);
      // Backend trả về { success, message, data }
      setResults(res.data?.data?.users || res.data?.users || res.users || []);
    } catch (err) {
      addToast('Không tìm thấy user', 'error');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      addToast('Đã gửi lời mời kết bạn', 'success');
    } catch (err) {
      addToast('Không thể gửi lời mời', 'error');
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptFriendRequest(userId);
      addToast('Đã chấp nhận kết bạn', 'success');
      loadFriends();
      loadRequests();
    } catch (err) {
      addToast('Không thể chấp nhận', 'error');
    }
  };

  const handleDecline = async (userId) => {
    try {
      await declineFriendRequest(userId);
      addToast('Đã từ chối lời mời', 'info');
      loadRequests();
    } catch (err) {
      addToast('Không thể từ chối', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Kết bạn</h2>
      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm username..." className="input" />
        <button className="btn-primary ml-2" onClick={handleSearch}>Tìm kiếm</button>
        <div className="mt-2">
          {results.map(u => (
            <div key={u._id} className="flex items-center gap-2">
              <span>{u.username}</span>
              <button className="btn-secondary" onClick={() => handleSendRequest(u._id)}>Kết bạn</button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Lời mời kết bạn</h3>
        {requests.length === 0 ? <div>Không có lời mời.</div> : requests.map(u => (
          <div key={u._id} className="flex items-center gap-2">
            <span>{u.username}</span>
            <button className="btn-primary" onClick={() => handleAccept(u._id)}>Chấp nhận</button>
            <button className="btn-secondary" onClick={() => handleDecline(u._id)}>Từ chối</button>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Bạn bè</h3>
        {friends.length === 0 ? <div>Chưa có bạn nào.</div> : friends.map(u => (
          <div key={u._id} className="flex items-center gap-2">
            <span>{u.username}</span>
            {/* Có thể mở rộng: xem pet của bạn bè, gửi quà... */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
