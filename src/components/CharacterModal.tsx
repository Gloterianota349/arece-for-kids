import { Character } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Star, Crown, Sparkles, Zap, Check } from 'lucide-react';

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterModal({ character, isOpen, onClose }: CharacterModalProps) {
  const { isCharacterUnlocked, selectCharacter, playerState } = useGame();
  
  if (!character) return null;
  
  const isUnlocked = isCharacterUnlocked(character.id);
  const isSelected = playerState.selectedCharacter === character.id;
  
  const rarityColors = {
    basic: 'from-gray-400 to-gray-500',
    common: 'from-green-400 to-emerald-500',
    epic: 'from-purple-400 to-violet-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-500',
  };
  
  const rarityLabels = {
    basic: 'Básico',
    common: 'Comum',
    epic: 'Épico',
    legendary: 'Lendário',
  };
  
  const rarityStars = {
    basic: 1,
    common: 2,
    epic: 3,
    legendary: 4,
  };
  
  const RarityIcon = {
    basic: Star,
    common: Star,
    epic: Sparkles,
    legendary: Crown,
  }[character.rarity];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-2 border-border">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${rarityColors[character.rarity]} p-8 relative`}>
          {isUnlocked ? (
            <>
              <div className="text-8xl text-center filter drop-shadow-2xl floating">
                {character.emoji}
              </div>
              {character.rarity === 'legendary' && (
                <>
                  <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-200 rounded-full animate-ping" />
                  <div className="absolute top-8 right-8 w-2 h-2 bg-orange-200 rounded-full animate-ping animation-delay-300" />
                  <div className="absolute bottom-4 left-8 w-2 h-2 bg-white rounded-full animate-ping animation-delay-500" />
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-24">
              <Lock className="w-20 h-20 text-white/60" />
            </div>
          )}
          
          {/* Rarity Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
            <RarityIcon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">{rarityLabels[character.rarity]}</span>
          </div>
        </div>

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-pearl text-center">
              {isUnlocked ? character.name : '???'}
            </DialogTitle>
          </DialogHeader>

          {isUnlocked ? (
            <div className="space-y-4 mt-4">
              {/* Stars */}
              <div className="flex justify-center gap-1">
                {Array.from({ length: rarityStars[character.rarity] }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-6 h-6 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>
              
              {/* Description */}
              <p className="text-center text-muted-foreground">
                {character.description}
              </p>
              
              {/* Ability */}
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-foreground">Habilidade Especial</span>
                </div>
                <p className="text-sm text-muted-foreground">{character.ability}</p>
              </div>
              
              {/* Story */}
              <div className="bg-accent/30 rounded-xl p-4">
                <p className="text-sm text-foreground italic">"{character.story}"</p>
              </div>
              
              {/* Select Button */}
              <Button 
                onClick={() => {
                  selectCharacter(character.id);
                  onClose();
                }}
                disabled={isSelected}
                className={`w-full ${isSelected ? 'bg-accent' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Selecionado
                  </>
                ) : (
                  'Selecionar Personagem'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4 text-center">
              <p className="text-muted-foreground">
                Este personagem está bloqueado!
              </p>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-foreground">
                  Use um código do produto Arecê para desbloquear este personagem {rarityLabels[character.rarity].toLowerCase()}.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
