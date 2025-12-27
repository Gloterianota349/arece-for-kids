import { Link, useLocation } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Home, Gamepad2, Users, BookOpen, Trophy, Key, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const { playerState, getCharacterById } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const selectedChar = getCharacterById(playerState.selectedCharacter || 'gota');
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/games', label: 'Jogos', icon: Gamepad2 },
    { path: '/characters', label: 'Personagens', icon: Users },
    { path: '/learn', label: 'Aprender', icon: BookOpen },
    { path: '/achievements', label: 'Conquistas', icon: Trophy },
    { path: '/redeem', label: 'Código', icon: Key },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-xl">🌿</span>
            </div>
            <span className="font-pearl text-2xl text-primary hidden sm:block">Arecê</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-soft' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Player Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
              <span className="text-lg">{selectedChar?.emoji || '💧'}</span>
              <span className="text-sm font-medium text-foreground">
                {playerState.nickname || 'Jogador'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-secondary/20 px-3 py-1.5 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-secondary">{playerState.totalPoints}</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-soft' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
