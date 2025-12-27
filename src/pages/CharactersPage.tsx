import { useState } from 'react';
import { Header } from '@/components/Header';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterModal } from '@/components/CharacterModal';
import { characters } from '@/data/gameData';
import { useGame } from '@/contexts/GameContext';
import { Character } from '@/types/game';
import { Users, Star, Crown, Sparkles, Lock } from 'lucide-react';

export default function CharactersPage() {
  const { playerState } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const basicChars = characters.filter(c => c.rarity === 'basic');
  const commonChars = characters.filter(c => c.rarity === 'common');
  const epicChars = characters.filter(c => c.rarity === 'epic');
  const legendaryChars = characters.filter(c => c.rarity === 'legendary');
  
  const unlockedCount = playerState.unlockedCharacters.length;
  const totalChars = characters.length;

  const RaritySection = ({ 
    title, 
    chars, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    chars: Character[]; 
    icon: any; 
    color: string;
  }) => (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-pearl text-2xl text-foreground">{title}</h2>
        <span className="text-muted-foreground">
          ({chars.filter(c => playerState.unlockedCharacters.includes(c.id)).length}/{chars.length})
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {chars.map((char, index) => (
          <div 
            key={char.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CharacterCard 
              character={char} 
              onClick={() => setSelectedCharacter(char)}
              size="medium"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-glow">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-pearl text-4xl md:text-5xl text-primary mb-2">
            Personagens
          </h1>
          <p className="text-muted-foreground text-lg">
            Colecione os heróis da Amazônia!
          </p>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-accent" />
              <span className="font-bold text-accent">{unlockedCount}</span>
              <span className="text-muted-foreground">de {totalChars}</span>
            </div>
          </div>
          
          {/* Collection Progress Bar */}
          <div className="max-w-md mx-auto mt-4">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalChars) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Legendary */}
        <RaritySection 
          title="Lendário" 
          chars={legendaryChars} 
          icon={Crown}
          color="bg-gradient-to-r from-yellow-400 to-orange-500"
        />

        {/* Epic */}
        <RaritySection 
          title="Épico" 
          chars={epicChars} 
          icon={Sparkles}
          color="bg-gradient-to-r from-purple-400 to-violet-600"
        />

        {/* Common */}
        <RaritySection 
          title="Comum" 
          chars={commonChars} 
          icon={Star}
          color="bg-gradient-to-r from-green-400 to-emerald-500"
        />

        {/* Basic */}
        <RaritySection 
          title="Básico" 
          chars={basicChars} 
          icon={Star}
          color="bg-gradient-to-r from-gray-400 to-gray-500"
        />

        {/* Tip */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/20 px-6 py-3 rounded-full">
            <span className="text-2xl">💡</span>
            <p className="text-foreground">
              Cada produto Arecê traz um código para desbloquear personagens!
            </p>
          </div>
        </div>
      </main>

      <CharacterModal 
        character={selectedCharacter}
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}
