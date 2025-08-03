import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Season } from '../types/index';

interface SeasonStore {
  seasons: Season[];
  currentSeasonId: string | null;
  addSeason: (season: Season) => void;
  updateSeason: (id: string, season: Partial<Season>) => void;
  deleteSeason: (id: string) => void;
  setCurrentSeason: (id: string) => void;
  getCurrentSeason: () => Season | undefined;
  getSeasonById: (id: string) => Season | undefined;
}

export const useSeasonStore = create<SeasonStore>()(
  persist(
    (set, get) => ({
      seasons: [],
      currentSeasonId: null,
      
      addSeason: (season) => set((state) => ({ 
        seasons: [...state.seasons, season],
        // Set as current season if it's the first one
        currentSeasonId: state.seasons.length === 0 ? season.id : state.currentSeasonId
      })),
      
      updateSeason: (id, updatedSeason) => set((state) => ({
        seasons: state.seasons.map((season) =>
          season.id === id ? { ...season, ...updatedSeason } : season
        ),
      })),
      
      deleteSeason: (id) => set((state) => ({
        seasons: state.seasons.filter((season) => season.id !== id),
        currentSeasonId: state.currentSeasonId === id ? null : state.currentSeasonId,
      })),
      
      setCurrentSeason: (id) => set(() => ({ 
        currentSeasonId: id 
      })),
      
      getCurrentSeason: () => {
        const { seasons, currentSeasonId } = get();
        return seasons.find((season) => season.id === currentSeasonId);
      },
      
      getSeasonById: (id) => {
        return get().seasons.find((season) => season.id === id);
      },
    }),
    {
      name: 'cfb-season-storage',
    }
  )
);