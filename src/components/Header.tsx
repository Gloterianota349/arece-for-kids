import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Gamepad2, Users, BookOpen, Menu, X, Settings, Trophy, Key, ChevronDown, LogIn, LogOut, Book } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerState, getCharacterById } = useGame();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const selectedChar = getCharacterById(playerState.selectedCharacter || 'gota');

  const handleSignOut = async () => {
    await signOut();
    toast.success('Até logo! 👋');
    navigate('/');
  };
  
  // Desktop navigation (without achievements and code - moved to profile dropdown)
  const desktopNavItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/games', label: 'Jogos', icon: Gamepad2 },
    { path: '/characters', label: 'Personagens', icon: Users },
    { path: '/learn', label: 'Aprender', icon: BookOpen },
    { path: '/stories', label: 'Histórias', icon: Book },
  ];

  // Mobile navigation
  const mobileNavItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/games', label: 'Jogos', icon: Gamepad2 },
    { path: '/characters', label: 'Personagens', icon: Users },
    { path: '/learn', label: 'Aprender', icon: BookOpen },
    { path: '/stories', label: 'Histórias', icon: Book },
    { path: '/achievements', label: 'Conquistas', icon: Trophy },
    { path: '/redeem', label: 'Código', icon: Key },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  // Profile dropdown items (desktop only)
  const profileMenuItems = [
    { path: '/settings', label: 'Configurações', icon: Settings },
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
            {desktopNavItems.map(item => {
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
            {/* Mobile Avatar (no dropdown) */}
            <div className="flex sm:hidden items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
              <span className="text-lg">{selectedChar?.emoji || '💧'}</span>
              <span className="text-sm font-medium text-foreground">
                {playerState.nickname || 'Jogador'}
              </span>
            </div>

            {/* Desktop Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors cursor-pointer">
                  <span className="text-lg">{selectedChar?.emoji || '💧'}</span>
                  <span className="text-sm font-medium text-foreground">
                    {playerState.nickname || 'Jogador'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {profileMenuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 w-full ${
                          isActive ? 'text-primary font-medium' : ''
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center gap-2 w-full">
                      <LogIn className="w-4 h-4" />
                      <span>Entrar</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
              {mobileNavItems.map(item => {
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
              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-primary hover:bg-primary/10"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
