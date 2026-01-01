import { Game } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import { Link } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { isGameUnlocked, playerState } = useGame();
  const isUnlocked = isGameUnlocked(game.id);
  
  const progress = playerState.gameProgress.find(p => p.gameId === game.id);
  const currentLevel = progress?.currentLevel || 0;
  const highestScore = progress?.highScores?.reduce((a, b) => Math.max(a, b), 0) || 0;

  const CardContent = (
    <div className={`
      relative rounded-3xl overflow-hidden transition-all duration-300 
      ${isUnlocked 
        ? 'transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer' 
        : 'opacity-75 cursor-not-allowed'
      }
      shadow-card hover:shadow-glow
    `}>
      {/* Background Gradient */}
      <div className={`bg-gradient-to-br ${game.color} p-6 min-h-[200px]`}>
        {/* Lock Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Lock className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold">Bloqueado</p>
              <p className="text-sm opacity-80">Use um código para desbloquear</p>
            </div>
          </div>
        )}

        {/* Game Icon */}
        <div className="text-6xl mb-4 filter drop-shadow-lg">
          {game.icon}
        </div>

        {/* Game Info */}
        <h3 className="font-pearl text-2xl text-white text-shadow-md mb-2">
          {game.name}
        </h3>
        <p className="text-white/80 text-sm mb-4">
          {game.description}
        </p>

        {/* Progress */}
        {isUnlocked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-white/90 text-sm">
              <span>Fase {currentLevel}/{game.levels}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span>{highestScore}</span>
              </div>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(currentLevel / game.levels) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isUnlocked) {
    return (
      <Link to={`/game/${game.id}`}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
