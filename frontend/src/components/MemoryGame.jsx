import React, { useState } from 'react';

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

const MemoryGame = ({ onWin }) => {
  const [cards, setCards] = useState(() => shuffle([...cardsData, ...cardsData]));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [win, setWin] = useState(false);

  const handleFlip = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    setFlipped([...flipped, idx]);
  };

  React.useEffect(() => {
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
  }, [flipped]);

  React.useEffect(() => {
    if (matched.length === cards.length && !win) {
      setWin(true);
      if (onWin) onWin(moves);
    }
  }, [matched, win, cards.length, moves, onWin]);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mini-game: Memory</h2>
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
      {win && <div className="mt-4 text-green-600 font-bold">Bạn đã thắng! 🎉</div>}
    </div>
  );
};

export default MemoryGame;
