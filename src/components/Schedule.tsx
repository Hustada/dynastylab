import React, { useState } from 'react';
import { useSeasonStore } from '../stores/seasonStore';
import { useGameStore } from '../stores/gameStore';
import { useTeamStore } from '../stores/teamStore';
import { GameForm } from './GameForm';
import type { Game } from '../types/index';

export const Schedule: React.FC = () => {
  const seasons = useSeasonStore(state => state.seasons);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const games = useGameStore(state => state.games);
  const teams = useTeamStore(state => state.teams);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentSeason?.year || currentYear);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>();

  // Get or create season for selected year
  const selectedSeason = seasons.find(s => s.year === selectedYear);
  const seasonGames = selectedSeason 
    ? games.filter(g => selectedSeason.games.includes(g.id))
    : [];

  // Group games by week
  const gamesByWeek = seasonGames.reduce((acc, game) => {
    if (!acc[game.week]) acc[game.week] = [];
    acc[game.week].push(game);
    return acc;
  }, {} as Record<number, Game[]>);

  // Generate weeks 1-16 (regular season + conference championship + bowls)
  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

  const handleAddGame = (week: number) => {
    setSelectedWeek(week);
    setEditingGame(undefined);
    setShowGameForm(true);
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setSelectedWeek(game.week);
    setShowGameForm(true);
  };

  const handleCloseForm = () => {
    setShowGameForm(false);
    setEditingGame(undefined);
    setSelectedWeek(undefined);
  };

  const getWeekLabel = (week: number) => {
    if (week <= 12) return `Week ${week}`;
    if (week === 13) return 'Conference Championship';
    if (week === 14) return 'Bowl Week 1';
    if (week === 15) return 'Bowl Week 2';
    if (week === 16) return 'Playoff / National Championship';
    return `Week ${week}`;
  };

  const getGameDate = (week: number, year: number): string => {
    // Approximate dates - season starts in early September
    const seasonStart = new Date(year, 8, 1); // September 1st
    const weekOffset = (week - 1) * 7;
    const gameDate = new Date(seasonStart);
    gameDate.setDate(seasonStart.getDate() + weekOffset);
    
    // Adjust for bowl season
    if (week === 13) gameDate.setMonth(11, 7); // Early December
    if (week >= 14) gameDate.setMonth(11, 20 + (week - 14) * 7); // Late December+
    
    return gameDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const createNewSeason = () => {
    const seasonStore = useSeasonStore.getState();
    const userTeam = useTeamStore.getState().getUserTeam();
    
    const newSeason = {
      id: `season-${selectedYear}`,
      year: selectedYear,
      teamName: userTeam?.name || 'My Team',
      conference: userTeam?.conference || 'Independent',
      games: [],
      conferenceRecord: { wins: 0, losses: 0 },
      overallRecord: { wins: 0, losses: 0 },
      coachId: 'coach-1',
      captains: [],
    };
    
    seasonStore.addSeason(newSeason);
    seasonStore.setCurrentSeason(newSeason.id);
  };

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-primary-800">Season Schedule</h2>
          <select
            className="input h-10 w-32"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
                {year === currentYear && ' (Current)'}
              </option>
            ))}
          </select>
        </div>
        
        {!selectedSeason && (
          <button
            onClick={createNewSeason}
            className="btn btn-primary btn-md"
          >
            Create {selectedYear} Season
          </button>
        )}
      </div>

      {!selectedSeason ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">
            No season exists for {selectedYear}
          </p>
          <button
            onClick={createNewSeason}
            className="btn btn-primary btn-md"
          >
            Create New Season
          </button>
        </div>
      ) : (
        <>
          {/* Season Stats */}
          <div className="bg-white rounded-lg border border-secondary-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                <div>
                  <p className="text-sm text-secondary-600">Overall Record</p>
                  <p className="text-xl font-bold text-primary-800">
                    {selectedSeason.overallRecord.wins}-{selectedSeason.overallRecord.losses}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Conference Record</p>
                  <p className="text-xl font-bold text-primary-800">
                    {selectedSeason.conferenceRecord.wins}-{selectedSeason.conferenceRecord.losses}
                  </p>
                </div>
                {selectedSeason.ranking && (
                  <div>
                    <p className="text-sm text-secondary-600">Ranking</p>
                    <p className="text-xl font-bold text-accent-600">
                      #{selectedSeason.ranking}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedSeason.id === currentSeason?.id && (
                <span className="badge badge-primary">Current Season</span>
              )}
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.map(week => {
              const weekGames = gamesByWeek[week] || [];
              const hasGame = weekGames.length > 0;
              const game = weekGames[0]; // Assuming one game per week
              
              return (
                <div
                  key={week}
                  className={`card p-4 ${
                    hasGame ? 'hover:shadow-md cursor-pointer' : ''
                  }`}
                  onClick={() => hasGame && handleEditGame(game)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-primary-800">
                        {getWeekLabel(week)}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {getGameDate(week, selectedYear)}
                      </p>
                    </div>
                    {!hasGame && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddGame(week);
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {hasGame ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">
                          {game.location === 'Home' ? 'vs' : game.location === 'Away' ? '@' : 'vs'} {game.opponent}
                        </p>
                        <span className={`font-bold ${
                          game.result === 'W' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {game.result}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700">
                        {game.score.for} - {game.score.against}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {game.conferenceGame && (
                          <span className="badge badge-primary text-xs">Conference</span>
                        )}
                        {game.rivalry && (
                          <span className="badge badge-error text-xs">Rivalry</span>
                        )}
                        {game.bowlGame && (
                          <span className="badge badge-success text-xs">{game.bowlGame}</span>
                        )}
                        {game.playoffGame && (
                          <span className="badge badge-warning text-xs">Playoff</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-secondary-400 text-sm">No game scheduled</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Future Games Notice */}
          {seasonGames.some(g => new Date(g.date) > new Date()) && (
            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <span className="font-medium">Note:</span> Future games are displayed based on their scheduled dates.
              </p>
            </div>
          )}
        </>
      )}

      {/* Game Form with Week Pre-selected */}
      {showGameForm && (
        <GameForm 
          onClose={handleCloseForm}
          editingGame={editingGame}
          defaultWeek={selectedWeek}
        />
      )}
    </div>
  );
};