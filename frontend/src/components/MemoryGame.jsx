import React, { useState, useEffect } from 'react';

const cardsData = [
  { id: 1, emoji: '🐱' },
  { id: 2, emoji: '🐶' },
  { id: 3, emoji: '🐰' },
  { id: 4, emoji: '🐦' },
  { id: 5, emoji: '🐠' },
  { id: 6, emoji: '🦴' },
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

const MemoryGame = ({ onGameComplete, onGameCancel }) => {
  const [cards, setCards] = useState(() => shuffle([...cardsData, ...cardsData]));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);

  const handleFlip = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || gameCompleted) return;
    setFlipped([...flipped, idx]);
  };

  const resetGame = () => {
    setCards(shuffle([...cardsData, ...cardsData]));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStartTime(Date.now());
    setGameCompleted(false);
  };

  const calculateScore = (moves, timeInSeconds) => {
    // Base score: 100 points minus moves
    let score = Math.max(0, 100 - moves * 2);
    
    // Time bonus
    if (timeInSeconds < 30) score = Math.floor(score * 1.5);
    else if (timeInSeconds < 60) score = Math.floor(score * 1.2);
    
    return Math.max(0, Math.min(100, score));
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(moves + 1);
      const [i, j] = flipped;
      if (cards[i].emoji === cards[j].emoji) {
        setMatched([...matched, i, j]);
        setTimeout(() => setFlipped([]), 800);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, moves, cards, matched]);

  useEffect(() => {
    if (matched.length === cards.length && !gameCompleted) {
      setGameCompleted(true);
      const timeCompleted = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore(moves, timeCompleted);
      
      if (onGameComplete) {
        onGameComplete({
          score,
          timeCompleted,
          moves,
          difficulty: 'easy' // Can be expanded later
        });
      }
    }
  }, [matched, gameCompleted, cards.length, moves, startTime, onGameComplete]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <span className="mr-4">Lượt: {moves}</span>
          <span>Thời gian: {Math.floor((Date.now() - startTime) / 1000)}s</span>
        </div>
        <div className="space-x-2">
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            🔄 Reset
          </button>
          {onGameCancel && (
            <button
              onClick={onGameCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              ❌ Thoát
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <button
            key={idx}
            className={`bg-white border rounded h-20 flex items-center justify-center text-3xl shadow ${flipped.includes(idx) || matched.includes(idx) ? '' : 'bg-gray-200'}`}
            onClick={() => handleFlip(idx)}
            disabled={flipped.length === 2 || matched.includes(idx)}
          >
            {flipped.includes(idx) || matched.includes(idx) ? card.emoji : '?'}
          </button>
        ))}
      </div>
      <div className="mt-4 text-lg">Số lần lật: {moves}</div>
      {gameCompleted && <div className="mt-4 text-green-600 font-bold">Bạn đã thắng! 🎉</div>}
    </div>
  );
};

export default MemoryGame;
