import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SeasonDashboard } from './components/SeasonDashboard';
import { Schedule } from './components/Schedule';
import { GameList } from './components/GameList';
import { PlayerManager } from './components/PlayerManager';
import { CoachRoom } from './components/CoachRoom';
import { TeamList } from './components/TeamList';
import { RecruitTracker } from './components/RecruitTracker';
import { Timeline } from './components/Timeline';
import { NewsHub } from './components/NewsHub';
import { FanForum } from './components/FanForum';
import { AISettings } from './components/AISettings';
import { AIFeatureTest } from './components/AIFeatureTest';
import { useEffect } from 'react';
import { useTeamStore } from './stores/teamStore';
import { useSeasonStore } from './stores/seasonStore';
import { usePlayerStore } from './stores/playerStore';
import { useGameStore } from './stores/gameStore';
import { useCoachStore } from './stores/coachStore';
import { useRecruitStore } from './stores/recruitStore';
import { dummyTeams, dummySeason, dummyPlayers, dummyGames, dummyCoach, dummyRecruits } from './data/dummyData';
import { applyTeamTheme } from './utils/teamTheme';

function App() {
  // Initialize stores with dummy data on first load
  useEffect(() => {
    const teamStore = useTeamStore.getState();
    const seasonStore = useSeasonStore.getState();
    const playerStore = usePlayerStore.getState();
    const gameStore = useGameStore.getState();
    const coachStore = useCoachStore.getState();
    const recruitStore = useRecruitStore.getState();

    // Check if we have old dummy teams and clear them
    const hasOldTeams = teamStore.teams.some(team => 
      team.id === 'team-1' || 
      team.id === 'team-2' || 
      team.id === 'team-3' ||
      team.id === 'team-4' ||
      team.id === 'team-5'
    );
    
    // Clear and reinitialize if we have old teams or no teams
    if (teamStore.teams.length === 0 || hasOldTeams) {
      // Clear all teams first if we have old data
      if (hasOldTeams) {
        localStorage.removeItem('cfb-team-storage');
        window.location.reload(); // Force a reload to clear the state
      } else {
        // Add new teams
        dummyTeams.forEach(team => teamStore.addTeam(team));
        teamStore.setUserTeam('kansas-state');
      }
    }

    if (seasonStore.seasons.length === 0) {
      seasonStore.addSeason(dummySeason);
    }

    if (playerStore.players.length === 0) {
      dummyPlayers.forEach(player => playerStore.addPlayer(player));
    }

    if (gameStore.games.length === 0) {
      dummyGames.forEach(game => gameStore.addGame(game));
    }

    if (coachStore.coaches.length === 0) {
      coachStore.addCoach(dummyCoach);
    }

    if (recruitStore.recruits.length === 0) {
      dummyRecruits.forEach(recruit => recruitStore.addRecruit(recruit));
    }
  }, []);

  // Apply team theme when user team changes
  const userTeam = useTeamStore(state => state.getUserTeam());
  useEffect(() => {
    applyTeamTheme(userTeam);
  }, [userTeam]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SeasonDashboard />} />
          <Route path="/news" element={<NewsHub />} />
          <Route path="/forum" element={<FanForum />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/games" element={<GameList />} />
          <Route path="/players" element={<PlayerManager />} />
          <Route path="/coaches" element={<CoachRoom />} />
          <Route path="/teams" element={<TeamList />} />
          <Route path="/recruits" element={<RecruitTracker />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/ai-settings" element={<AISettings />} />
          <Route path="/ai-test" element={<AIFeatureTest />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
