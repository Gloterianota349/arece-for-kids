import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Clock, Heart, Target } from 'lucide-react';
import { toast } from 'sonner';

interface MosquitoGameProps {
  level: number;
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Mosquito = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  isGood: boolean;
  createdAt: number;
};

const levelConfigs = {
  1: { duration: 30, spawnRate: 1500, maxMosquitoes: 3, badChance: 0, mosquitoLifetime: 5000, minScore: 30 },
  2: { duration: 30, spawnRate: 1200, maxMosquitoes: 5, badChance: 0.1, mosquitoLifetime: 4500, minScore: 50 },
  3: { duration: 30, spawnRate: 1000, maxMosquitoes: 7, badChance: 0.15, mosquitoLifetime: 4000, minScore: 80 },
  4: { duration: 30, spawnRate: 800, maxMosquitoes: 10, badChance: 0.2, mosquitoLifetime: 3500, minScore: 120 },
  5: { duration: 30, spawnRate: 600, maxMosquitoes: 12, badChance: 0.25, mosquitoLifetime: 3000, minScore: 180 },
};

export function MosquitoGame({ level, onComplete, onBack }: MosquitoGameProps) {
  const config = levelConfigs[level as keyof typeof levelConfigs];
  
  const [mosquitoes, setMosquitoes] = useState<Mosquito[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [nextId, setNextId] = useState(0);

  const startGame = () => {
    setMosquitoes([]);
    setScore(0);
    setTimeLeft(config.duration);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
    setCombo(0);
    setNextId(0);
  };

  useEffect(() => {
    startGame();
  }, [level]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    if (timeLeft <= 0) {
      setGameOver(true);
      const passed = score >= config.minScore;
      if (passed) {
        toast.success(`⏰ Tempo esgotado! Pontuação: ${score} - Você passou!`);
      } else {
        toast.error(`⏰ Tempo esgotado! Pontuação: ${score} - Precisa de ${config.minScore} pontos para passar.`);
      }
      setTimeout(() => onComplete(passed ? score : 0), 1500);
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft, score]);

  // Spawn mosquitoes
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawner = setInterval(() => {
      if (mosquitoes.length >= config.maxMosquitoes) return;

      const isGood = Math.random() > config.badChance;
      const newMosquito: Mosquito = {
        id: nextId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        size: isGood ? 40 + Math.random() * 20 : 50 + Math.random() * 20,
        speed: 1 + Math.random() * 2,
        isGood: !isGood, // bad = mosquito, good = butterfly
        createdAt: Date.now(),
      };

      setMosquitoes(prev => [...prev, newMosquito]);
      setNextId(n => n + 1);
    }, config.spawnRate);

    return () => clearInterval(spawner);
  }, [gameStarted, gameOver, mosquitoes.length, nextId]);

  // Move mosquitoes and remove expired ones
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const mover = setInterval(() => {
      const now = Date.now();
      setMosquitoes(prev => 
        prev.map(m => ({
          ...m,
          x: Math.max(5, Math.min(90, m.x + (Math.random() - 0.5) * m.speed * 3)),
          y: Math.max(15, Math.min(75, m.y + (Math.random() - 0.5) * m.speed * 3)),
        })).filter(m => {
          // Remove if expired (mosquito lifetime exceeded)
          const age = now - m.createdAt;
          return age < config.mosquitoLifetime && m.x >= 5 && m.x <= 90 && m.y >= 15 && m.y <= 75;
        })
      );
    }, 100);

    return () => clearInterval(mover);
  }, [gameStarted, gameOver, config.mosquitoLifetime]);

  const handleClick = (mosquito: Mosquito) => {
    if (gameOver) return;

    setMosquitoes(prev => prev.filter(m => m.id !== mosquito.id));

    if (mosquito.isGood) {
      // Hit butterfly - lose life
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
          toast.error('💔 Você perdeu todas as vidas!');
          setTimeout(() => onComplete(Math.max(0, score)), 1500);
        } else {
          toast.error('🦋 Não acerte as borboletas!');
        }
        return newLives;
      });
      setCombo(0);
    } else {
      // Hit mosquito - score!
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 * (1 + Math.floor(newCombo / 3));
      setScore(s => s + points);
      
      if (newCombo % 5 === 0) {
        toast.success(`🔥 Combo x${newCombo}!`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <span className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-muted px-4 py-2 rounded-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart 
                key={i}
                className={`w-5 h-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-secondary" />
            <span className="font-bold text-secondary">{score}</span>
          </div>
        </div>
      </div>

      {/* Level Info */}
      <div className="text-center mb-4">
        <h2 className="font-pearl text-3xl text-primary">Fase {level}</h2>
        <p className="text-muted-foreground">Acerte os mosquitos 🦟 e evite as borboletas 🦋</p>
        <p className="text-sm text-secondary mt-1">Meta: {config.minScore} pontos para passar</p>
        {combo >= 3 && (
          <div className="mt-2 inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1 rounded-full animate-bounce-gentle">
            <Target className="w-4 h-4" />
            <span className="font-bold">Combo x{combo}!</span>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div 
        className="relative bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl overflow-hidden shadow-card"
        style={{ height: '60vh', minHeight: '400px' }}
      >
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-400 to-transparent" />
        <div className="absolute top-4 right-4 text-6xl opacity-20">☀️</div>
        <div className="absolute top-20 left-10 text-4xl opacity-30">☁️</div>
        <div className="absolute top-16 right-20 text-3xl opacity-30">☁️</div>
        
        {/* Trees */}
        <div className="absolute bottom-0 left-4 text-6xl">🌳</div>
        <div className="absolute bottom-0 right-4 text-6xl">🌴</div>
        <div className="absolute bottom-0 left-1/3 text-5xl">🌲</div>

        {/* Mosquitoes */}
        {mosquitoes.map(mosquito => {
          const age = Date.now() - mosquito.createdAt;
          const remainingLife = config.mosquitoLifetime - age;
          const opacity = remainingLife < 1000 ? remainingLife / 1000 : 1;
          
          return (
            <button
              key={mosquito.id}
              onClick={() => handleClick(mosquito)}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2
                transition-all duration-100 hover:scale-125 cursor-pointer
                ${mosquito.isGood ? 'hover:rotate-12' : 'hover:scale-110'}
                ${remainingLife < 1000 ? 'animate-pulse' : ''}
              `}
              style={{
                left: `${mosquito.x}%`,
                top: `${mosquito.y}%`,
                fontSize: `${mosquito.size}px`,
                opacity: opacity,
              }}
            >
              {mosquito.isGood ? '🦋' : '🦟'}
            </button>
          );
        })}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card rounded-3xl p-8 text-center shadow-card animate-scale-in">
              <div className="text-6xl mb-4">
                {lives > 0 ? (score >= config.minScore ? '🎉' : '⏰') : '💔'}
              </div>
              <h3 className="font-pearl text-3xl text-primary mb-2">
                {lives > 0 ? (score >= config.minScore ? 'Parabéns!' : 'Tempo Esgotado!') : 'Game Over!'}
              </h3>
              <p className="text-xl text-muted-foreground mb-2">
                Pontuação Final: <span className="font-bold text-secondary">{score}</span>
              </p>
              {score < config.minScore && (
                <p className="text-sm text-destructive">
                  Precisa de {config.minScore} pontos para passar
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>💡 Dica: Use repelentes Arecê para se proteger de mosquitos de verdade!</p>
        <p className="text-xs mt-1">⚠️ Os mosquitos desaparecem após alguns segundos!</p>
      </div>
    </div>
  );
}