import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PlayerState, GameProgress } from '@/types/game';
import { characters, games, achievements } from '@/data/gameData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AchievementProgress {
  [achievementId: string]: number;
}

interface GameContextType {
  playerState: PlayerState;
  achievementProgress: AchievementProgress;
  unlockWithCode: (code: string) => boolean;
  selectCharacter: (characterId: string) => void;
  updateGameProgress: (gameId: string, level: number, score: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  incrementAchievementProgress: (achievementId: string, amount?: number) => void;
  addCoins: (amount: number) => void;
  addPoints: (amount: number) => void;
  setNickname: (name: string) => void;
  isGameUnlocked: (gameId: string) => boolean;
  isCharacterUnlocked: (characterId: string) => boolean;
  getCharacterById: (id: string) => typeof characters[0] | undefined;
  getGameById: (id: string) => typeof games[0] | undefined;
  getAchievements: () => typeof achievements;
  getAchievementProgress: (achievementId: string) => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'arece_player_state';
const ACHIEVEMENT_PROGRESS_KEY = 'arece_achievement_progress';

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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
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

  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress>(() => {
    const saved = localStorage.getItem(ACHIEVEMENT_PROGRESS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Sync with database when user is logged in
  const syncFromDatabase = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error);
        return;
      }

      if (data) {
        setPlayerState({
          nickname: data.nickname || '',
          selectedCharacter: data.selected_character || 'gota',
          unlockedCharacters: data.unlocked_characters || ['gota'],
          unlockedGames: data.unlocked_games || ['memory'],
          achievements: data.achievements || [],
          gameProgress: (data.game_progress as unknown as GameProgress[]) || [],
          coins: data.coins || 0,
          totalPoints: data.total_points || 0,
        });
        setAchievementProgress((data.achievement_progress as unknown as AchievementProgress) || {});
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save to database when user is logged in
  const syncToDatabase = useCallback(async () => {
    if (!user) return;

    try {
      // Use type assertion to bypass strict type checking for JSON columns
      const updateData = {
        nickname: playerState.nickname,
        selected_character: playerState.selectedCharacter,
        unlocked_characters: playerState.unlockedCharacters,
        unlocked_games: playerState.unlockedGames,
        achievements: playerState.achievements,
        achievement_progress: JSON.parse(JSON.stringify(achievementProgress)),
        game_progress: JSON.parse(JSON.stringify(playerState.gameProgress)),
        coins: playerState.coins,
        total_points: playerState.totalPoints,
      };

      const { error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Update error:', error);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [user, playerState, achievementProgress]);

  // Load from database when user logs in
  useEffect(() => {
    syncFromDatabase();
  }, [syncFromDatabase]);

  // Save to localStorage always
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerState));
  }, [playerState]);

  useEffect(() => {
    localStorage.setItem(ACHIEVEMENT_PROGRESS_KEY, JSON.stringify(achievementProgress));
  }, [achievementProgress]);

  // Debounced save to database
  useEffect(() => {
    if (!user || isLoading) return;
    
    const timeoutId = setTimeout(() => {
      syncToDatabase();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [playerState, achievementProgress, user, isLoading, syncToDatabase]);

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
    // Only update progress if score > 0 (player passed the level)
    if (score <= 0) return;
    
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
        // Set progress to max when unlocked
        setAchievementProgress(prev => ({
          ...prev,
          [achievementId]: achievement.maxProgress,
        }));
        toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`);
      }
    }
  };

  const updateAchievementProgress = (achievementId: string, progress: number) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    setAchievementProgress(prev => {
      const newProgress = Math.min(progress, achievement.maxProgress);
      return { ...prev, [achievementId]: newProgress };
    });
    
    if (progress >= achievement.maxProgress) {
      unlockAchievement(achievementId);
    }
  };

  const incrementAchievementProgress = (achievementId: string, amount: number = 1) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    const currentProgress = achievementProgress[achievementId] || 0;
    const newProgress = currentProgress + amount;
    
    setAchievementProgress(prev => ({
      ...prev,
      [achievementId]: Math.min(newProgress, achievement.maxProgress),
    }));
    
    if (newProgress >= achievement.maxProgress && !playerState.achievements.includes(achievementId)) {
      unlockAchievement(achievementId);
    }
  };

  const getAchievementProgress = (achievementId: string): number => {
    return achievementProgress[achievementId] || 0;
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
    progress: achievementProgress[a.id] || 0,
  }));

  // Check character-related achievements on character unlock
  useEffect(() => {
    const unlockedCount = playerState.unlockedCharacters.length;
    
    // First character achievement
    if (unlockedCount >= 1 && !playerState.achievements.includes('first_character')) {
      unlockAchievement('first_character');
    }
    
    // Collector achievement (5 characters)
    if (unlockedCount >= 5 && !playerState.achievements.includes('collector')) {
      unlockAchievement('collector');
    }
    
    // Legendary hunter
    const hasLegendary = playerState.unlockedCharacters.some(charId => {
      const char = characters.find(c => c.id === charId);
      return char?.rarity === 'legendary';
    });
    if (hasLegendary && !playerState.achievements.includes('legendary_hunter')) {
      unlockAchievement('legendary_hunter');
    }
  }, [playerState.unlockedCharacters]);

  return (
    <GameContext.Provider
      value={{
        playerState,
        achievementProgress,
        unlockWithCode,
        selectCharacter,
        updateGameProgress,
        unlockAchievement,
        updateAchievementProgress,
        incrementAchievementProgress,
        addCoins,
        addPoints,
        setNickname,
        isGameUnlocked,
        isCharacterUnlocked,
        getCharacterById,
        getGameById,
        getAchievements,
        getAchievementProgress,
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
