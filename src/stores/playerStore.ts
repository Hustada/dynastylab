import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player } from '../types/index';

interface PlayerStore {
  players: Player[];
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayersByPosition: (position: string) => Player[];
  getPlayersByClass: (playerClass: Player['class']) => Player[];
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      players: [],
      
      addPlayer: (player) => set((state) => ({ 
        players: [...state.players, player] 
      })),
      
      updatePlayer: (id, updatedPlayer) => set((state) => ({
        players: state.players.map((player) =>
          player.id === id ? { ...player, ...updatedPlayer } : player
        ),
      })),
      
      deletePlayer: (id) => set((state) => ({
        players: state.players.filter((player) => player.id !== id),
      })),
      
      getPlayerById: (id) => {
        return get().players.find((player) => player.id === id);
      },
      
      getPlayersByPosition: (position) => {
        return get().players.filter((player) => player.position === position);
      },
      
      getPlayersByClass: (playerClass) => {
        return get().players.filter((player) => player.class === playerClass);
      },
    }),
    {
      name: 'cfb-player-storage',
    }
  )
);