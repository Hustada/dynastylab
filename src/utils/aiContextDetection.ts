import type { Game, Team, Season } from '../types/index';
import { useAISettingsStore } from '../stores/aiSettingsStore';

export interface AIContentContext {
  isUserTeam: boolean;
  isRival: boolean;
  isUpcomingOpponent: boolean;
  isRecentOpponent: boolean;
  isRanked: boolean;
  isConferenceTeam: boolean;
  isPlayoffContender: boolean;
  weeksUntilGame?: number;
}

export function getTeamAIContext(
  team: Team,
  userTeamId: string | null,
  games: Game[],
  currentSeason: Season | null,
  allTeams: Team[]
): AIContentContext {
  const context: AIContentContext = {
    isUserTeam: team.id === userTeamId,
    isRival: team.isRival || false,
    isUpcomingOpponent: false,
    isRecentOpponent: false,
    isRanked: false,
    isConferenceTeam: false,
    isPlayoffContender: false,
  };

  if (!userTeamId || !currentSeason) return context;

  const userTeam = allTeams.find(t => t.id === userTeamId);
  if (!userTeam) return context;

  // Check if team is in same conference
  context.isConferenceTeam = team.conference === userTeam.conference;

  // Check if team is an upcoming opponent
  const today = new Date();
  const upcomingGames = games
    .filter(g => new Date(g.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextGameVsTeam = upcomingGames.find(g => g.opponent === team.name);
  if (nextGameVsTeam) {
    context.isUpcomingOpponent = true;
    const weeksUntil = Math.ceil(
      (new Date(nextGameVsTeam.date).getTime() - today.getTime()) / 
      (1000 * 60 * 60 * 24 * 7)
    );
    context.weeksUntilGame = weeksUntil;
  }

  // Check if team was a recent opponent
  const recentGames = games
    .filter(g => new Date(g.date) <= today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  context.isRecentOpponent = recentGames.some(g => g.opponent === team.name);

  // Check if team is ranked (would need to be stored in team data or season data)
  // For now, we'll use a simple heuristic
  if (currentSeason.ranking && currentSeason.ranking <= 25) {
    context.isRanked = true;
  }

  // Check if team is a playoff contender
  const winPercentage = currentSeason.overallRecord.wins / 
    (currentSeason.overallRecord.wins + currentSeason.overallRecord.losses);
  
  if (winPercentage >= 0.75 && currentSeason.overallRecord.wins >= 6) {
    context.isPlayoffContender = true;
  }

  return context;
}

export function shouldGenerateContent(
  team: Team,
  context: AIContentContext,
  userTeamId: string | null,
  aiSettings: ReturnType<typeof useAISettingsStore.getState>
): boolean {
  return aiSettings.shouldGenerateContentForTeam(
    team.id,
    userTeamId,
    context.isRival,
    context.isUpcomingOpponent,
    context.isRanked
  );
}

export function getContentPriority(context: AIContentContext): number {
  let priority = 0;

  if (context.isUserTeam) return 100; // Highest priority
  if (context.isUpcomingOpponent && context.weeksUntilGame) {
    // Higher priority for games coming soon
    priority += 50 - (context.weeksUntilGame * 5);
  }
  if (context.isRival) priority += 30;
  if (context.isRecentOpponent) priority += 20;
  if (context.isRanked) priority += 15;
  if (context.isConferenceTeam) priority += 10;
  if (context.isPlayoffContender) priority += 25;

  return priority;
}

export function filterTeamsByAISettings(
  teams: Team[],
  userTeamId: string | null,
  games: Game[],
  currentSeason: Season | null
): Team[] {
  if (!userTeamId || !currentSeason) return [];

  const aiSettings = useAISettingsStore.getState();
  const teamsWithContext = teams.map(team => ({
    team,
    context: getTeamAIContext(team, userTeamId, games, currentSeason, teams),
  }));

  // Filter teams that should have content generated
  const filteredTeams = teamsWithContext
    .filter(({ team, context }) => shouldGenerateContent(team, context, userTeamId, aiSettings))
    .sort((a, b) => getContentPriority(b.context) - getContentPriority(a.context))
    .map(({ team }) => team);

  return filteredTeams;
}