import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team } from '../types/index';

interface TeamStore {
  teams: Team[];
  userTeamId: string | null;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  setUserTeam: (id: string) => void;
  getUserTeam: () => Team | undefined;
  getTeamById: (id: string) => Team | undefined;
  getRivals: () => Team[];
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      teams: [],
      userTeamId: null,
      
      addTeam: (team) => set((state) => ({ 
        teams: [...state.teams, team] 
      })),
      
      updateTeam: (id, updatedTeam) => set((state) => ({
        teams: state.teams.map((team) =>
          team.id === id ? { ...team, ...updatedTeam } : team
        ),
      })),
      
      deleteTeam: (id) => set((state) => ({
        teams: state.teams.filter((team) => team.id !== id),
        userTeamId: state.userTeamId === id ? null : state.userTeamId,
      })),
      
      setUserTeam: (id) => set(() => ({ 
        userTeamId: id 
      })),
      
      getUserTeam: () => {
        const { teams, userTeamId } = get();
        return teams.find((team) => team.id === userTeamId);
      },
      
      getTeamById: (id) => {
        return get().teams.find((team) => team.id === id);
      },
      
      getRivals: () => {
        return get().teams.filter((team) => team.isRival);
      },
    }),
    {
      name: 'cfb-team-storage',
    }
  )
);