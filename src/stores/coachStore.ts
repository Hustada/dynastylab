import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coach } from '../types/index';

interface CoachStore {
  coaches: Coach[];
  currentCoachName: string | null;
  addCoach: (coach: Coach) => void;
  updateCoach: (name: string, coach: Partial<Coach>) => void;
  deleteCoach: (name: string) => void;
  setCurrentCoach: (name: string) => void;
  getCurrentCoach: () => Coach | undefined;
  getCoachByName: (name: string) => Coach | undefined;
}

export const useCoachStore = create<CoachStore>()(
  persist(
    (set, get) => ({
      coaches: [],
      currentCoachName: null,
      
      addCoach: (coach) => set((state) => ({ 
        coaches: [...state.coaches, coach],
        currentCoachName: state.coaches.length === 0 ? coach.name : state.currentCoachName
      })),
      
      updateCoach: (name, updatedCoach) => set((state) => ({
        coaches: state.coaches.map((coach) =>
          coach.name === name ? { ...coach, ...updatedCoach } : coach
        ),
      })),
      
      deleteCoach: (name) => set((state) => ({
        coaches: state.coaches.filter((coach) => coach.name !== name),
        currentCoachName: state.currentCoachName === name ? null : state.currentCoachName,
      })),
      
      setCurrentCoach: (name) => set(() => ({ 
        currentCoachName: name 
      })),
      
      getCurrentCoach: () => {
        const { coaches, currentCoachName } = get();
        return coaches.find((coach) => coach.name === currentCoachName);
      },
      
      getCoachByName: (name) => {
        return get().coaches.find((coach) => coach.name === name);
      },
    }),
    {
      name: 'cfb-coach-storage',
    }
  )
);