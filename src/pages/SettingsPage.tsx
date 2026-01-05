import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { characters } from '@/data/gameData';

export default function SettingsPage() {
  const { playerState, setNickname, selectCharacter } = useGame();
  const [nickname, setNicknameLocal] = useState(playerState.nickname || '');
  const [saved, setSaved] = useState(false);

  const unlockedCharacters = characters.filter(c => 
    playerState.unlockedCharacters.includes(c.id)
  );

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      setNickname(nickname.trim());
      setSaved(true);
      toast.success('Apelido salvo com sucesso!');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSelectAvatar = (characterId: string) => {
    selectCharacter(characterId);
    toast.success('Avatar atualizado!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalize seu perfil
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Nickname Section */}
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-pearl text-2xl text-foreground">Apelido</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nickname" className="text-muted-foreground">
                  Como você quer ser chamado?
                </Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNicknameLocal(e.target.value)}
                    placeholder="Digite seu apelido"
                    className="flex-1"
                    maxLength={20}
                  />
                  <Button 
                    onClick={handleSaveNickname}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!nickname.trim()}
                  >
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span className="ml-2">{saved ? 'Salvo!' : 'Salvar'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <h2 className="font-pearl text-2xl text-foreground">Escolher Avatar</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Selecione um personagem desbloqueado para usar como avatar
            </p>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {unlockedCharacters.map(char => {
                const isSelected = playerState.selectedCharacter === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelectAvatar(char.id)}
                    className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isSelected 
                        ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                        : 'bg-muted hover:bg-muted/80 hover:scale-105'
                      }
                    `}
                  >
                    <span className="text-3xl block text-center">{char.emoji}</span>
                    <p className="text-xs text-center mt-1 truncate text-foreground">
                      {char.name}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {unlockedCharacters.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Desbloqueie personagens para escolher seu avatar!
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="font-pearl text-2xl text-foreground">Estatísticas</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-primary">{playerState.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-secondary">{playerState.unlockedGames.length}</p>
                <p className="text-sm text-muted-foreground">Jogos Desbloqueados</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-accent">{playerState.unlockedCharacters.length}</p>
                <p className="text-sm text-muted-foreground">Personagens</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-500">{playerState.achievements.length}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
