import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useGame } from '@/contexts/GameContext';
import { games } from '@/data/gameData';
import { Button } from '@/components/ui/button';
import { MemoryGame } from '@/components/games/MemoryGame';
import { QuizGame } from '@/components/games/QuizGame';
import { WordSearchGame } from '@/components/games/WordSearchGame';
import { CrosswordGame } from '@/components/games/CrosswordGame';
import { MosquitoGame } from '@/components/games/MosquitoGame';
import { Star, Lock, ChevronRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isGameUnlocked, playerState, updateGameProgress, addPoints, addCoins, unlockAchievement, incrementAchievementProgress } = useGame();
  
  const game = games.find(g => g.id === gameId);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-pearl text-4xl text-primary mb-4">Jogo não encontrado</h1>
          <Button onClick={() => navigate('/games')}>Voltar aos jogos</Button>
        </div>
      </div>
    );
  }

  if (!isGameUnlocked(game.id)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-card rounded-3xl p-8 shadow-card">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-pearl text-3xl text-primary mb-4">Jogo Bloqueado</h1>
            <p className="text-muted-foreground mb-6">
              Este jogo ainda está bloqueado. Use um código do produto Arecê para desbloquear!
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/games')}>
                Voltar
              </Button>
              <Button onClick={() => navigate('/redeem')} className="bg-primary">
                Inserir Código
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = playerState.gameProgress.find(p => p.gameId === game.id);
  const maxLevel = progress?.currentLevel || 0;

  const handleLevelComplete = (score: number) => {
    if (selectedLevel === null) return;
    
    // Only update progress and give rewards if score > 0 (player passed)
    if (score > 0) {
      updateGameProgress(game.id, selectedLevel, score);
      addPoints(score);
      addCoins(Math.floor(score / 10));
      
      // Check first game achievement
      if (!playerState.achievements.includes('first_game')) {
        unlockAchievement('first_game');
      }
      
      // Check game-specific achievements
      if (game.id === 'memory') {
        // Track memory game progress
        incrementAchievementProgress('memory_master', 1);
      }
      
      if (game.id === 'quiz') {
        // Track quiz progress (correct answers are in score calculation)
        incrementAchievementProgress('quiz_genius', Math.floor(score / 200));
      }
      
      // Note: mosquito_slayer is tracked directly in MosquitoGame
      // Note: word_hunter is tracked directly in WordSearchGame
      
      // Check for perfect score achievement
      if (score >= 1000) {
        unlockAchievement('perfect_score');
      }
      
      if (selectedLevel >= 5) {
        toast.success(`🏆 Você completou todas as fases de ${game.name}!`);
      }
    }
    
    setIsPlaying(false);
    setSelectedLevel(null);
  };

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setIsPlaying(true);
  };

  const renderGame = () => {
    if (!selectedLevel) return null;

    const gameProps = {
      level: selectedLevel,
      onComplete: handleLevelComplete,
      onBack: () => {
        setIsPlaying(false);
        setSelectedLevel(null);
      },
    };

    switch (game.id) {
      case 'memory':
        return <MemoryGame {...gameProps} />;
      case 'quiz':
        return <QuizGame {...gameProps} />;
      case 'wordsearch':
        return <WordSearchGame {...gameProps} />;
      case 'crossword':
        return <CrosswordGame {...gameProps} />;
      case 'mosquito':
        return <MosquitoGame {...gameProps} />;
      default:
        return null;
    }
  };

  if (isPlaying && selectedLevel) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {renderGame()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="text-center mb-10">
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center shadow-glow`}>
            <span className="text-5xl">{game.icon}</span>
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            {game.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {game.description}
          </p>
        </div>

        {/* Level Selection */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-pearl text-2xl text-foreground mb-6 text-center">
            Escolha a Fase
          </h2>
          
          <div className="space-y-4">
            {Array.from({ length: game.levels }).map((_, index) => {
              const level = index + 1;
              const isUnlocked = level === 1 || level <= maxLevel + 1;
              const isCompleted = level <= maxLevel;
              const highScore = progress?.highScores?.[index] || 0;
              
              return (
                <button
                  key={level}
                  onClick={() => isUnlocked && startLevel(level)}
                  disabled={!isUnlocked}
                  className={`
                    w-full p-6 rounded-2xl flex items-center justify-between
                    transition-all duration-300 transform
                    ${isUnlocked 
                      ? 'bg-card hover:bg-muted hover:scale-[1.02] cursor-pointer shadow-card' 
                      : 'bg-muted/50 cursor-not-allowed opacity-60'
                    }
                    ${isCompleted ? 'border-2 border-accent' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center font-pearl text-2xl
                      ${isCompleted 
                        ? 'bg-accent text-accent-foreground' 
                        : isUnlocked 
                        ? `bg-gradient-to-br ${game.color} text-white` 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {isUnlocked ? level : <Lock className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-foreground">
                        Fase {level}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isCompleted ? 'Completada' : isUnlocked ? 'Disponível' : 'Bloqueada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isCompleted && (
                      <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-accent">{highScore}</span>
                      </div>
                    )}
                    {isUnlocked && (
                      <ChevronRight className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Total Score */}
          {progress && (
            <div className="mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-secondary" />
                <span className="font-pearl text-2xl text-foreground">Pontuação Total</span>
              </div>
              <p className="text-4xl font-bold text-secondary">
                {progress.highScores?.reduce((a, b) => a + b, 0) || 0}
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate('/games')} className="text-primary">
            ← Voltar aos Jogos
          </Button>
        </div>
      </main>
    </div>
  );
}
