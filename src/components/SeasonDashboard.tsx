import React from 'react';
import { useSeasonStore } from '../stores/seasonStore';
import { useGameStore } from '../stores/gameStore';
import { useTeamStore } from '../stores/teamStore';
import { usePlayerStore } from '../stores/playerStore';
import { useRecruitStore } from '../stores/recruitStore';
import { useCoachStore } from '../stores/coachStore';
import { 
  generateSampleGames, 
  generateSamplePlayers, 
  generateSampleRecruits, 
  generateSampleSeason,
  generateSampleCoach 
} from '../utils/sampleDataGenerator';

export const SeasonDashboard: React.FC = () => {
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const games = useGameStore(state => state.games);
  const userTeam = useTeamStore(state => state.getUserTeam());
  const addGame = useGameStore(state => state.addGame);
  const addPlayer = usePlayerStore(state => state.addPlayer);
  const addRecruit = useRecruitStore(state => state.addRecruit);
  const addSeason = useSeasonStore(state => state.addSeason);
  const setCurrentSeason = useSeasonStore(state => state.setCurrentSeason);
  const addCoach = useCoachStore(state => state.addCoach);
  const setCurrentCoach = useCoachStore(state => state.setCurrentCoach);
  
  const generateSampleData = () => {
    if (!userTeam) {
      alert('Please select a team first!');
      return;
    }
    
    // Generate and add coach
    const coach = generateSampleCoach();
    addCoach(coach);
    setCurrentCoach(coach.name);
    
    // Generate and add games
    const sampleGames = generateSampleGames(userTeam.name);
    sampleGames.forEach(game => addGame(game));
    
    // Generate and add season
    const season = generateSampleSeason(userTeam.id, sampleGames);
    addSeason(season);
    setCurrentSeason(season.year);
    
    // Generate and add players
    const players = generateSamplePlayers();
    players.forEach(player => addPlayer(player));
    
    // Generate and add recruits
    const recruits = generateSampleRecruits();
    recruits.forEach(recruit => addRecruit(recruit));
    
    alert('Sample data generated! Check out the News and Forum sections to see AI-generated content.');
  };

  if (!currentSeason) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-secondary-700 mb-4">
          No Active Season
        </h2>
        <p className="text-secondary-600 mb-4">
          Start a new season to begin tracking your dynasty
        </p>
        <button className="btn btn-primary btn-md">
          Start New Season
        </button>
      </div>
    );
  }

  const seasonGames = games.filter(game => 
    currentSeason.games.includes(game.id)
  );

  const recentGames = seasonGames
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const nextGame = seasonGames
    .filter(game => new Date(game.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Season Header */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--team-primary)]">
              {currentSeason.year} Season
            </h1>
            <p className="text-secondary-600">
              {userTeam?.name || currentSeason.teamName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {currentSeason.ranking && (
              <div className="text-right">
                <p className="text-sm text-secondary-600">National Ranking</p>
                <p className="text-3xl font-bold text-[var(--team-secondary)]">
                  #{currentSeason.ranking}
                </p>
              </div>
            )}
            {games.length === 0 && (
              <button 
                onClick={generateSampleData}
                className="btn bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white btn-md"
              >
                Generate Sample Data
              </button>
            )}
          </div>
        </div>

        {/* Record Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Overall Record</p>
            <p className="stat-value text-[var(--team-primary)]">
              {currentSeason.overallRecord.wins}-{currentSeason.overallRecord.losses}
            </p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Conference Record</p>
            <p className="stat-value text-[var(--team-primary)]">
              {currentSeason.conferenceRecord.wins}-{currentSeason.conferenceRecord.losses}
            </p>
          </div>
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Win Percentage</p>
            <p className="stat-value text-[var(--team-primary)]">
              {(
                (currentSeason.overallRecord.wins /
                  (currentSeason.overallRecord.wins + currentSeason.overallRecord.losses)) *
                100
              ).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Next Game */}
      {nextGame && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-[var(--team-primary)] mb-4">
            Next Game
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">
                Week {nextGame.week} - {nextGame.location} vs {nextGame.opponent}
              </p>
              <p className="text-secondary-600">
                {new Date(nextGame.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {nextGame.rivalry && (
              <span className="badge badge-error">Rivalry Game</span>
            )}
          </div>
        </div>
      )}

      {/* Recent Games */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h2 className="text-xl font-semibold text-secondary-800 mb-4">
          Recent Games
        </h2>
        <div className="space-y-3">
          {recentGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    game.result === 'W' ? 'bg-success' : 'bg-error'
                  }`}
                >
                  {game.result}
                </div>
                <div>
                  <p className="font-medium">
                    Week {game.week} - {game.location} vs {game.opponent}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {game.score.for} - {game.score.against}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {game.rivalry && (
                  <span className="badge badge-error text-xs">Rivalry</span>
                )}
                {game.conferenceGame && (
                  <span className="badge badge-primary text-xs">Conference</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Season Goals */}
      {currentSeason.preseasonGoals && currentSeason.preseasonGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">
            Season Goals
          </h2>
          <ul className="space-y-2">
            {currentSeason.preseasonGoals.map((goal, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-secondary-400">•</span>
                <span className="text-secondary-700">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};