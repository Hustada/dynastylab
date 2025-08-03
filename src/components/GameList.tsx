import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSeasonStore } from '../stores/seasonStore';
import { GameForm } from './GameForm';
import type { Game } from '../types/index';

export const GameList: React.FC = () => {
  const games = useGameStore(state => state.games);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();

  const seasonGames = currentSeason 
    ? games.filter(game => currentSeason.games.includes(game.id))
    : games;

  const sortedGames = [...seasonGames].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGame(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">Games</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          Add Game
        </button>
      </div>

      {sortedGames.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">No games recorded yet</p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md"
          >
            Add Your First Game
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Opponent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {sortedGames.map((game) => (
                <tr key={game.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {game.week}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                    {new Date(game.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    <div className="flex items-center space-x-2">
                      <span>{game.opponent}</span>
                      {game.rivalry && (
                        <span className="badge badge-error text-xs">Rivalry</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                    {game.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      game.result === 'W' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {game.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {game.score.for} - {game.score.against}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-600">
                    <div className="flex flex-wrap gap-1">
                      {game.stats.passingYards && (
                        <span className="text-xs">Pass: {game.stats.passingYards}yds</span>
                      )}
                      {game.stats.rushingYards && (
                        <span className="text-xs">Rush: {game.stats.rushingYards}yds</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(game)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <GameForm 
          onClose={handleCloseForm}
          editingGame={editingGame}
        />
      )}
    </div>
  );
};