import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recruit } from '../types/index';

interface RecruitStore {
  recruits: Recruit[];
  addRecruit: (recruit: Recruit) => void;
  updateRecruit: (id: string, recruit: Partial<Recruit>) => void;
  deleteRecruit: (id: string) => void;
  getRecruitById: (id: string) => Recruit | undefined;
  getRecruitsByYear: (year: number) => Recruit[];
  getRecruitsByStatus: (status: Recruit['status']) => Recruit[];
  commitRecruit: (id: string) => void;
  signRecruit: (id: string, playerId: string) => void;
}

export const useRecruitStore = create<RecruitStore>()(
  persist(
    (set, get) => ({
      recruits: [],
      
      addRecruit: (recruit) => set((state) => ({ 
        recruits: [...state.recruits, recruit] 
      })),
      
      updateRecruit: (id, updatedRecruit) => set((state) => ({
        recruits: state.recruits.map((recruit) =>
          recruit.id === id ? { ...recruit, ...updatedRecruit } : recruit
        ),
      })),
      
      deleteRecruit: (id) => set((state) => ({
        recruits: state.recruits.filter((recruit) => recruit.id !== id),
      })),
      
      getRecruitById: (id) => {
        return get().recruits.find((recruit) => recruit.id === id);
      },
      
      getRecruitsByYear: (year) => {
        return get().recruits.filter((recruit) => recruit.signedYear === year);
      },
      
      getRecruitsByStatus: (status) => {
        return get().recruits.filter((recruit) => recruit.status === status);
      },
      
      commitRecruit: (id) => set((state) => ({
        recruits: state.recruits.map((recruit) =>
          recruit.id === id ? { ...recruit, status: 'Committed' } : recruit
        ),
      })),
      
      signRecruit: (id, playerId) => set((state) => ({
        recruits: state.recruits.map((recruit) =>
          recruit.id === id ? { ...recruit, status: 'Signed', playerId } : recruit
        ),
      })),
    }),
    {
      name: 'cfb-recruit-storage',
    }
  )
);