import React, { useState } from 'react';
import MemoryGame from '../components/MemoryGame';
import { useToast } from '../context/ToastContext';

const MiniGames = () => {
  const { addToast } = useToast();
  const [xpRewarded, setXpRewarded] = useState(0);

  const handleWin = (moves) => {
    // XP logic: càng ít lượt càng nhiều XP
    const xp = Math.max(10, 50 - moves * 2);
    setXpRewarded(xp);
    addToast(`🎮 Bạn đã thắng Memory Game! Nhận ${xp} XP cho pet.`, 'success');
    // TODO: Gửi XP cho pet qua API
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Mini-games</h1>
      <MemoryGame onWin={handleWin} />
      {xpRewarded > 0 && (
        <div className="mt-6 text-center text-green-600 font-bold">
          Đã nhận {xpRewarded} XP cho pet!
        </div>
      )}
    </div>
  );
};

export default MiniGames;
