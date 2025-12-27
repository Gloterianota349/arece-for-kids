import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { MemoryCard } from '@/types/game';
import { RotateCcw, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface MemoryGameProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const levelConfigs = {
  1: { pairs: 4, emojis: ['🦟', '💧', '🌿', '🌳'] },
  2: { pairs: 6, emojis: ['🦟', '💧', '🌿', '🌳', '🌺', '🍃'] },
  3: { pairs: 8, emojis: ['🦟', '💧', '🌿', '🌳', '🌺', '🍃', '🦜', '🐸'] },
  4: { pairs: 10, emojis: ['🦟', '💧', '🌿', '🌳', '🌺', '🍃', '🦜', '🐸', '🌴', '🌻'] },
  5: { pairs: 12, emojis: ['🦟', '💧', '🌿', '🌳', '🌺', '🍃', '🦜', '🐸', '🌴', '🌻', '🦋', '🐛'] },
};

export function MemoryGame({ level, onComplete, onBack }: MemoryGameProps) {
  const config = levelConfigs[level as keyof typeof levelConfigs];
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const initGame = () => {
    const emojis = config.emojis.slice(0, config.pairs);
    const cardPairs = [...emojis, ...emojis];
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
    setGameComplete(false);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameComplete]);

  useEffect(() => {
    if (matchedPairs === config.pairs && matchedPairs > 0) {
      setGameComplete(true);
      const score = calculateScore();
      toast.success(`🎉 Parabéns! Você completou a fase ${level}!`);
      setTimeout(() => onComplete(score), 1500);
    }
  }, [matchedPairs]);

  const calculateScore = () => {
    const baseScore = 1000;
    const movePenalty = moves * 10;
    const timePenalty = time * 2;
    const levelBonus = level * 200;
    return Math.max(100, baseScore - movePenalty - timePenalty + levelBonus);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatchedPairs(p => p + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const gridCols = {
    1: 'grid-cols-4',
    2: 'grid-cols-4',
    3: 'grid-cols-4',
    4: 'grid-cols-5',
    5: 'grid-cols-6',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="text-primary">
          ← Voltar
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Clock className="w-4 h-4 text-secondary" />
            <span className="font-bold">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <span className="text-sm">Movimentos:</span>
            <span className="font-bold">{moves}</span>
          </div>
        </div>
        <Button variant="outline" onClick={initGame} size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Level Indicator */}
      <div className="text-center mb-6">
        <h2 className="font-pearl text-3xl text-primary">Fase {level}</h2>
        <p className="text-muted-foreground">Encontre {config.pairs} pares</p>
      </div>

      {/* Game Grid */}
      <div className={`grid ${gridCols[level as keyof typeof gridCols]} gap-3 md:gap-4`}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            className={`
              aspect-square rounded-2xl text-4xl md:text-5xl
              transition-all duration-300 transform
              ${card.isFlipped || card.isMatched
                ? 'bg-gradient-to-br from-secondary to-primary scale-100 rotate-0'
                : 'bg-gradient-to-br from-primary to-primary/80 hover:scale-105 cursor-pointer'
              }
              ${card.isMatched ? 'opacity-70 scale-95' : ''}
              shadow-soft
            `}
            style={{
              transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
            }}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
          </button>
        ))}
      </div>

      {/* Score Preview */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">Pontuação atual: </span>
          <span className="font-bold text-secondary">{calculateScore()}</span>
        </div>
      </div>
    </div>
  );
}
