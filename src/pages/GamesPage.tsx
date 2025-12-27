import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { games } from '@/data/gameData';
import { useGame } from '@/contexts/GameContext';
import { Gamepad2, Lock, Unlock } from 'lucide-react';

export default function GamesPage() {
  const { playerState } = useGame();
  
  const unlockedCount = playerState.unlockedGames.length;
  const totalGames = games.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-glow">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Jogos
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha um jogo e comece a aventura!
          </p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
              <Unlock className="w-4 h-4 text-accent" />
              <span className="font-bold text-accent">{unlockedCount}</span>
              <span className="text-muted-foreground">desbloqueados</span>
            </div>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="font-bold">{totalGames - unlockedCount}</span>
              <span className="text-muted-foreground">bloqueados</span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {games.map((game, index) => (
            <div 
              key={game.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-6 py-3 rounded-full">
            <span className="text-2xl">💡</span>
            <p className="text-foreground">
              Compre produtos Arecê e use o código para desbloquear novos jogos!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
