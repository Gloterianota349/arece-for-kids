export type CharacterRarity = 'basic' | 'common' | 'epic' | 'legendary';

export interface Character {
  id: string;
  name: string;
  description: string;
  rarity: CharacterRarity;
  emoji: string;
  unlockCode: string;
  ability: string;
  story: string;
  unlocked: boolean;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCode: string;
  unlocked: boolean;
  color: string;
  levels: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'games' | 'collection' | 'learning' | 'special';
}

export interface GameProgress {
  gameId: string;
  currentLevel: number;
  highScores: number[];
  completed: boolean;
}

export interface PlayerState {
  nickname: string;
  selectedCharacter: string | null;
  unlockedCharacters: string[];
  unlockedGames: string[];
  achievements: string[];
  gameProgress: GameProgress[];
  coins: number;
  totalPoints: number;
}

export interface EducationalContent {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: string[];
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface WordSearchCell {
  letter: string;
  isFound: boolean;
  isSelected: boolean;
}
