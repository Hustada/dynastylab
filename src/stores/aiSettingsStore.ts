import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIContentSettings {
  // Core content - always enabled for user's team
  coreContent: {
    gameRecaps: boolean;
    recruitingNews: boolean;
    teamAnalysis: boolean;
  };
  
  // Extended coverage - user configurable
  extendedCoverage: {
    rivalTeamNews: boolean;
    conferenceRoundups: boolean;
    nationalStorylines: boolean;
    opponentPreviews: boolean;
  };
  
  // Smart features
  smartFeatures: {
    autoEnableOpponentContent: boolean;
    autoEnableRankingContent: boolean;
    autoEnablePlayoffContent: boolean;
  };
  
  // Manual overrides for specific teams
  teamSpecificSettings: {
    [teamId: string]: {
      generateContent: boolean;
      contentTypes: ('news' | 'forum' | 'recruiting')[];
    };
  };
}

interface AISettingsStore {
  settings: AIContentSettings;
  updateExtendedCoverage: (key: keyof AIContentSettings['extendedCoverage'], value: boolean) => void;
  updateSmartFeatures: (key: keyof AIContentSettings['smartFeatures'], value: boolean) => void;
  setTeamSpecificSetting: (teamId: string, generateContent: boolean, contentTypes?: ('news' | 'forum' | 'recruiting')[]) => void;
  removeTeamSpecificSetting: (teamId: string) => void;
  shouldGenerateContentForTeam: (teamId: string, userTeamId: string | null, isRival?: boolean, isOpponent?: boolean, isRanked?: boolean) => boolean;
  getContentTypesForTeam: (teamId: string) => ('news' | 'forum' | 'recruiting')[];
  resetToDefaults: () => void;
}

const defaultSettings: AIContentSettings = {
  coreContent: {
    gameRecaps: true,
    recruitingNews: true,
    teamAnalysis: true,
  },
  extendedCoverage: {
    rivalTeamNews: true,
    conferenceRoundups: false,
    nationalStorylines: false,
    opponentPreviews: true,
  },
  smartFeatures: {
    autoEnableOpponentContent: true,
    autoEnableRankingContent: true,
    autoEnablePlayoffContent: true,
  },
  teamSpecificSettings: {},
};

export const useAISettingsStore = create<AISettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateExtendedCoverage: (key, value) => set((state) => ({
        settings: {
          ...state.settings,
          extendedCoverage: {
            ...state.settings.extendedCoverage,
            [key]: value,
          },
        },
      })),
      
      updateSmartFeatures: (key, value) => set((state) => ({
        settings: {
          ...state.settings,
          smartFeatures: {
            ...state.settings.smartFeatures,
            [key]: value,
          },
        },
      })),
      
      setTeamSpecificSetting: (teamId, generateContent, contentTypes = ['news', 'forum', 'recruiting']) => 
        set((state) => ({
          settings: {
            ...state.settings,
            teamSpecificSettings: {
              ...state.settings.teamSpecificSettings,
              [teamId]: { generateContent, contentTypes },
            },
          },
        })),
      
      removeTeamSpecificSetting: (teamId) => set((state) => {
        const { [teamId]: _, ...rest } = state.settings.teamSpecificSettings;
        return {
          settings: {
            ...state.settings,
            teamSpecificSettings: rest,
          },
        };
      }),
      
      shouldGenerateContentForTeam: (teamId, userTeamId, isRival = false, isOpponent = false, isRanked = false) => {
        const { settings } = get();
        
        // Always generate content for user's team
        if (teamId === userTeamId) return true;
        
        // Check team-specific overrides first
        if (settings.teamSpecificSettings[teamId]) {
          return settings.teamSpecificSettings[teamId].generateContent;
        }
        
        // Check extended coverage settings
        if (isRival && settings.extendedCoverage.rivalTeamNews) return true;
        if (isOpponent && settings.extendedCoverage.opponentPreviews) return true;
        
        // Check smart features
        if (isOpponent && settings.smartFeatures.autoEnableOpponentContent) return true;
        if (isRanked && settings.smartFeatures.autoEnableRankingContent) return true;
        
        return false;
      },
      
      getContentTypesForTeam: (teamId) => {
        const { settings } = get();
        const teamSettings = settings.teamSpecificSettings[teamId];
        return teamSettings?.contentTypes || ['news', 'forum', 'recruiting'];
      },
      
      resetToDefaults: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'cfb-ai-settings-storage',
    }
  )
);