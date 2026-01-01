import { Link } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Gamepad2, Users, BookOpen, Trophy, Key, Sparkles, Leaf, Shield, Star } from 'lucide-react';
import { CharacterCard } from '@/components/CharacterCard';
import { characters, games } from '@/data/gameData';
import { toast } from 'sonner';

const Index = () => {
  const { playerState, setNickname, getCharacterById } = useGame();
  const [inputName, setInputName] = useState(playerState.nickname);
  const [showNameInput, setShowNameInput] = useState(!playerState.nickname);
  
  const selectedChar = getCharacterById(playerState.selectedCharacter || 'gota');

  const handleSaveName = () => {
    if (inputName.trim()) {
      setNickname(inputName.trim());
      setShowNameInput(false);
      toast.success(`Bem-vindo(a), ${inputName}! 🎉`);
    }
  };

  const menuItems = [
    { path: '/games', label: 'Jogar', icon: Gamepad2, color: 'from-blue-400 to-cyan-500', description: 'Divirta-se com jogos incríveis!' },
    { path: '/characters', label: 'Personagens', icon: Users, color: 'from-purple-400 to-pink-500', description: 'Colecione heróis amazônicos!' },
    { path: '/learn', label: 'Aprender', icon: BookOpen, color: 'from-green-400 to-emerald-500', description: 'Descubra curiosidades!' },
    { path: '/achievements', label: 'Conquistas', icon: Trophy, color: 'from-yellow-400 to-orange-500', description: 'Veja suas medalhas!' },
    { path: '/redeem', label: 'Código', icon: Key, color: 'from-red-400 to-rose-500', description: 'Desbloqueie novidades!' },
  ];

  return (
    <div className="min-h-screen bg-background bg-pattern-leaves">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        
        <div className="container mx-auto text-center relative z-10">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow pulse-glow">
              <span className="text-5xl">🌿</span>
            </div>
            <h1 className="font-pearl text-5xl md:text-7xl text-primary text-shadow-md">
              Arecê
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Aventura na Amazônia
            </p>
          </div>

          {/* Welcome / Name Input */}
          {showNameInput ? (
            <div className="max-w-md mx-auto bg-card rounded-3xl p-8 shadow-card animate-scale-in">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="font-pearl text-2xl text-foreground mb-4">
                Olá, aventureiro!
              </h2>
              <p className="text-muted-foreground mb-6">
                Como podemos te chamar?
              </p>
              <div className="flex gap-2">
                <Input
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  className="text-lg py-6 rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <Button 
                  onClick={handleSaveName}
                  className="bg-primary hover:bg-primary/90 px-6 rounded-xl"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Player Card */}
              <div className="max-w-md mx-auto bg-card rounded-3xl p-6 shadow-card mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-5xl floating">{selectedChar?.emoji || '💧'}</div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                    <h2 className="font-pearl text-2xl text-foreground">{playerState.nickname}!</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-secondary text-xl">{playerState.totalPoints}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Menu Grid */}
      {!showNameInput && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`
                      bg-gradient-to-br ${item.color} rounded-3xl p-6
                      transition-all duration-300 transform 
                      hover:scale-105 hover:-translate-y-2
                      shadow-card hover:shadow-glow
                      animate-fade-in
                    `}>
                      <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-pearl text-xl text-white text-shadow-sm">{item.label}</h3>
                      <p className="text-white/80 text-sm mt-1 hidden md:block">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Games Preview */}
      {!showNameInput && (
        <section className="py-12 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-pearl text-3xl text-primary flex items-center gap-2">
                <Gamepad2 className="w-8 h-8" />
                Jogos em Destaque
              </h2>
              <Link to="/games">
                <Button variant="ghost" className="text-primary">
                  Ver todos →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {games.slice(0, 5).map((game, index) => (
                <Link
                  key={game.id}
                  to={playerState.unlockedGames.includes(game.id) ? `/game/${game.id}` : '/redeem'}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`
                    bg-gradient-to-br ${game.color} rounded-2xl p-4 h-32
                    flex flex-col justify-between
                    transition-all duration-300 transform hover:scale-105
                    shadow-card relative overflow-hidden
                    ${!playerState.unlockedGames.includes(game.id) ? 'opacity-70' : ''}
                  `}>
                    <span className="text-4xl">{game.icon}</span>
                    <p className="font-bold text-white text-sm text-shadow-sm">{game.name}</p>
                    {!playerState.unlockedGames.includes(game.id) && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Message */}
      {!showNameInput && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <h2 className="font-pearl text-3xl md:text-4xl text-foreground mb-4">
                Proteção Natural da Amazônia
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                Os produtos Arecê são feitos com óleo de Copaíba, um ingrediente natural 
                da Floresta Amazônica que protege você dos mosquitos de forma gentil e eficaz.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-card rounded-full px-6 py-3 shadow-soft flex items-center gap-2">
                  <span className="text-2xl">🌿</span>
                  <span className="font-medium">100% Natural</span>
                </div>
                <div className="bg-card rounded-full px-6 py-3 shadow-soft flex items-center gap-2">
                  <span className="text-2xl">👶</span>
                  <span className="font-medium">Seguro para Crianças</span>
                </div>
                <div className="bg-card rounded-full px-6 py-3 shadow-soft flex items-center gap-2">
                  <span className="text-2xl">🌎</span>
                  <span className="font-medium">Sustentável</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🌿</span>
            <span className="font-pearl text-2xl">Arecê</span>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            Cosméticos naturais com propriedades insetífugas derivadas da Copaíba
          </p>
          <p className="text-primary-foreground/60 text-xs mt-4">
            © 2024 Arecê. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
