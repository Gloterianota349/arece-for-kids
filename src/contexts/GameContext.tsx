import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerState, GameProgress } from '@/types/game';
import { characters, games, achievements, UNLOCK_CODES } from '@/data/gameData';
import { toast } from 'sonner';

interface GameContextType {
  playerState: PlayerState;
  unlockWithCode: (code: string) => boolean;
  selectCharacter: (characterId: string) => void;
  updateGameProgress: (gameId: string, level: number, score: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  addCoins: (amount: number) => void;
  addPoints: (amount: number) => void;
  setNickname: (name: string) => void;
  isGameUnlocked: (gameId: string) => boolean;
  isCharacterUnlocked: (characterId: string) => boolean;
  getCharacterById: (id: string) => typeof characters[0] | undefined;
  getGameById: (id: string) => typeof games[0] | undefined;
  getAchievements: () => typeof achievements;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'arece_player_state';

const defaultPlayerState: PlayerState = {
  nickname: '',
  selectedCharacter: 'gota',
  unlockedCharacters: ['gota'],
  unlockedGames: ['memory'],
  achievements: [],
  gameProgress: [],
  coins: 0,
  totalPoints: 0,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultPlayerState;
      }
    }
    return defaultPlayerState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerState));
  }, [playerState]);

  const unlockWithCode = (code: string): boolean => {
    const upperCode = code.toUpperCase().trim();
    
    // Check games
    for (const game of games) {
      if (game.unlockCode === upperCode && !playerState.unlockedGames.includes(game.id)) {
        setPlayerState(prev => ({
          ...prev,
          unlockedGames: [...prev.unlockedGames, game.id],
        }));
        toast.success(`🎮 Jogo "${game.name}" desbloqueado!`);
        return true;
      }
    }
    
    // Check characters
    for (const char of characters) {
      if (char.unlockCode === upperCode && !playerState.unlockedCharacters.includes(char.id)) {
        setPlayerState(prev => ({
          ...prev,
          unlockedCharacters: [...prev.unlockedCharacters, char.id],
        }));
        
        const rarityEmoji = {
          basic: '⭐',
          common: '⭐⭐',
          epic: '💜',
          legendary: '👑',
        };
        
        toast.success(`${rarityEmoji[char.rarity]} Personagem "${char.name}" desbloqueado!`);
        return true;
      }
    }
    
    toast.error('Código inválido ou já utilizado!');
    return false;
  };

  const selectCharacter = (characterId: string) => {
    if (playerState.unlockedCharacters.includes(characterId)) {
      setPlayerState(prev => ({ ...prev, selectedCharacter: characterId }));
    }
  };

  const updateGameProgress = (gameId: string, level: number, score: number) => {
    setPlayerState(prev => {
      const existingProgress = prev.gameProgress.find(p => p.gameId === gameId);
      
      if (existingProgress) {
        const newHighScores = [...existingProgress.highScores];
        if (!newHighScores[level - 1] || score > newHighScores[level - 1]) {
          newHighScores[level - 1] = score;
        }
        
        return {
          ...prev,
          gameProgress: prev.gameProgress.map(p =>
            p.gameId === gameId
              ? {
                  ...p,
                  currentLevel: Math.max(p.currentLevel, level),
                  highScores: newHighScores,
                  completed: level >= 5,
                }
              : p
          ),
        };
      } else {
        const newProgress: GameProgress = {
          gameId,
          currentLevel: level,
          highScores: [score],
          completed: level >= 5,
        };
        return {
          ...prev,
          gameProgress: [...prev.gameProgress, newProgress],
        };
      }
    });
  };

  const unlockAchievement = (achievementId: string) => {
    if (!playerState.achievements.includes(achievementId)) {
      setPlayerState(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementId],
      }));
      
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`);
      }
    }
  };

  const updateAchievementProgress = (achievementId: string, progress: number) => {
    // This would need a more complex state structure to track progress
    // For now, we just unlock when max is reached
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && progress >= achievement.maxProgress) {
      unlockAchievement(achievementId);
    }
  };

  const addCoins = (amount: number) => {
    setPlayerState(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const addPoints = (amount: number) => {
    setPlayerState(prev => ({ ...prev, totalPoints: prev.totalPoints + amount }));
  };

  const setNickname = (name: string) => {
    setPlayerState(prev => ({ ...prev, nickname: name }));
  };

  const isGameUnlocked = (gameId: string) => playerState.unlockedGames.includes(gameId);
  const isCharacterUnlocked = (characterId: string) => playerState.unlockedCharacters.includes(characterId);
  const getCharacterById = (id: string) => characters.find(c => c.id === id);
  const getGameById = (id: string) => games.find(g => g.id === id);
  const getAchievements = () => achievements.map(a => ({
    ...a,
    unlocked: playerState.achievements.includes(a.id),
  }));

  return (
    <GameContext.Provider
      value={{
        playerState,
        unlockWithCode,
        selectCharacter,
        updateGameProgress,
        unlockAchievement,
        updateAchievementProgress,
        addCoins,
        addPoints,
        setNickname,
        isGameUnlocked,
        isCharacterUnlocked,
        getCharacterById,
        getGameById,
        getAchievements,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
