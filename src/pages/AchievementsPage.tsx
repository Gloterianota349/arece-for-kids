import { Header } from '@/components/Header';
import { useGame } from '@/contexts/GameContext';
import { achievements } from '@/data/gameData';
import { Trophy, Lock, Star, Gamepad2, Users, BookOpen, Sparkles } from 'lucide-react';

export default function AchievementsPage() {
  const { playerState, getAchievementProgress } = useGame();
  
  const unlockedCount = playerState.achievements.length;
  const totalAchievements = achievements.length;
  
  const categoryIcons = {
    games: Gamepad2,
    collection: Users,
    learning: BookOpen,
    special: Sparkles,
  };
  
  const categoryNames = {
    games: 'Jogos',
    collection: 'Coleção',
    learning: 'Aprendizado',
    special: 'Especial',
  };
  
  const categoryColors = {
    games: 'from-blue-400 to-cyan-500',
    collection: 'from-purple-400 to-pink-500',
    learning: 'from-green-400 to-emerald-500',
    special: 'from-yellow-400 to-orange-500',
  };

  const groupedAchievements = {
    games: achievements.filter(a => a.category === 'games'),
    collection: achievements.filter(a => a.category === 'collection'),
    learning: achievements.filter(a => a.category === 'learning'),
    special: achievements.filter(a => a.category === 'special'),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-glow">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Conquistas
          </h1>
          <p className="text-muted-foreground text-lg">
            Suas medalhas e realizações!
          </p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="font-bold text-yellow-600">{unlockedCount}</span>
              <span className="text-yellow-700">de {totalAchievements}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-4">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievements by Category */}
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const color = categoryColors[category as keyof typeof categoryColors];
          const name = categoryNames[category as keyof typeof categoryNames];
          
          return (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-pearl text-2xl text-foreground">{name}</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement, index) => {
                  const isUnlocked = playerState.achievements.includes(achievement.id);
                  const progress = getAchievementProgress(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`
                        relative rounded-2xl p-5 transition-all duration-300
                        animate-fade-in
                        ${isUnlocked 
                          ? 'bg-card shadow-card' 
                          : 'bg-muted/50 opacity-60'
                        }
                      `}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                          ${isUnlocked 
                            ? `bg-gradient-to-br ${color}` 
                            : 'bg-muted'
                          }
                        `}>
                          {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progresso</span>
                              <span>
                                {isUnlocked ? achievement.maxProgress : progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${color}`}
                                style={{ 
                                  width: `${isUnlocked ? 100 : (progress / achievement.maxProgress) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isUnlocked && (
                        <div className="absolute top-3 right-3">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Motivation */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-6 py-3 rounded-full">
            <span className="text-2xl">🌟</span>
            <p className="text-foreground">
              Continue jogando e aprendendo para desbloquear mais conquistas!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
