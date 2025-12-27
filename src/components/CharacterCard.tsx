import { Character } from '@/types/game';
import { useGame } from '@/contexts/GameContext';
import { Lock, Star, Crown, Sparkles } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function CharacterCard({ character, onClick, size = 'medium' }: CharacterCardProps) {
  const { isCharacterUnlocked } = useGame();
  const isUnlocked = isCharacterUnlocked(character.id);
  
  const sizeClasses = {
    small: 'w-24 h-32',
    medium: 'w-32 h-44',
    large: 'w-40 h-56',
  };
  
  const emojiSizes = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-6xl',
  };
  
  const rarityColors = {
    basic: 'from-gray-300 to-gray-400 border-gray-400',
    common: 'from-green-400 to-emerald-500 border-emerald-400',
    epic: 'from-purple-400 to-violet-600 border-purple-400',
    legendary: 'from-yellow-400 via-orange-500 to-red-500 border-yellow-400',
  };
  
  const rarityGlow = {
    basic: '',
    common: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    epic: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    legendary: 'shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse',
  };
  
  const RarityIcon = {
    basic: Star,
    common: Star,
    epic: Sparkles,
    legendary: Crown,
  }[character.rarity];

  return (
    <div
      onClick={onClick}
      className={`
        relative ${sizeClasses[size]} rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
        ${isUnlocked ? `bg-gradient-to-br ${rarityColors[character.rarity]} ${rarityGlow[character.rarity]}` : 'bg-gray-300'}
        border-2 ${isUnlocked ? rarityColors[character.rarity].split(' ').pop() : 'border-gray-400'}
      `}
    >
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2 z-10">
        <RarityIcon 
          className={`w-5 h-5 ${
            character.rarity === 'legendary' ? 'text-yellow-300' :
            character.rarity === 'epic' ? 'text-purple-200' :
            character.rarity === 'common' ? 'text-green-200' :
            'text-gray-200'
          }`}
        />
      </div>
      
      {/* Character Emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isUnlocked ? (
          <span className={`${emojiSizes[size]} filter drop-shadow-lg floating`}>
            {character.emoji}
          </span>
        ) : (
          <Lock className="w-10 h-10 text-gray-500" />
        )}
      </div>
      
      {/* Character Name */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-2">
        <p className={`
          text-center font-bold text-white truncate
          ${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'}
        `}>
          {isUnlocked ? character.name : '???'}
        </p>
      </div>
      
      {/* Legendary Sparkles */}
      {isUnlocked && character.rarity === 'legendary' && (
        <>
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute bottom-8 right-4 w-1.5 h-1.5 bg-orange-300 rounded-full animate-ping animation-delay-300" />
          <div className="absolute top-1/3 left-2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-500" />
        </>
      )}
    </div>
  );
}
