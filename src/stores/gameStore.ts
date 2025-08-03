import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game } from '../types/index';

interface GameStore {
  games: Game[];
  addGame: (game: Game) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  getGameById: (id: string) => Game | undefined;
  getGamesBySeasonId: (seasonId: string) => Game[];
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: [],
      
      addGame: (game) => set((state) => ({ 
        games: [...state.games, game] 
      })),
      
      updateGame: (id, updatedGame) => set((state) => ({
        games: state.games.map((game) =>
          game.id === id ? { ...game, ...updatedGame } : game
        ),
      })),
      
      deleteGame: (id) => set((state) => ({
        games: state.games.filter((game) => game.id !== id),
      })),
      
      getGameById: (id) => {
        return get().games.find((game) => game.id === id);
      },
      
      getGamesBySeasonId: (seasonId) => {
        // This will be implemented when we link games to seasons
        return get().games;
      },
    }),
    {
      name: 'cfb-game-storage',
    }
  )
);