import React, { useState } from 'react';
import type { Game } from '../types/index';
import { useGameStore } from '../stores/gameStore';
import { useSeasonStore } from '../stores/seasonStore';
import { useTeamStore } from '../stores/teamStore';

interface GameFormProps {
  onClose: () => void;
  editingGame?: Game;
  defaultWeek?: number;
}

export const GameForm: React.FC<GameFormProps> = ({ onClose, editingGame, defaultWeek }) => {
  const addGame = useGameStore(state => state.addGame);
  const updateGame = useGameStore(state => state.updateGame);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const teams = useTeamStore(state => state.teams);
  
  const [formData, setFormData] = useState<Partial<Game>>(editingGame || {
    date: new Date().toISOString().split('T')[0],
    week: defaultWeek || 1,
    opponent: '',
    location: 'Home',
    result: 'W',
    score: { for: 0, against: 0 },
    conferenceGame: false,
    rivalry: false,
    stats: {},
    opponentStats: {},
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const gameData: Game = {
      id: editingGame?.id || `game-${Date.now()}`,
      date: formData.date!,
      week: formData.week!,
      opponent: formData.opponent!,
      location: formData.location!,
      result: formData.result!,
      score: formData.score!,
      conferenceGame: formData.conferenceGame,
      rivalry: formData.rivalry,
      stats: formData.stats || {},
      opponentStats: formData.opponentStats || {},
      notes: formData.notes,
    };

    if (editingGame) {
      updateGame(editingGame.id, gameData);
    } else {
      addGame(gameData);
      // Update season with new game
      if (currentSeason) {
        const seasonStore = useSeasonStore.getState();
        const updatedGames = [...currentSeason.games, gameData.id];
        const wins = gameData.result === 'W' ? 1 : 0;
        const losses = gameData.result === 'L' ? 1 : 0;
        
        seasonStore.updateSeason(currentSeason.id, {
          games: updatedGames,
          overallRecord: {
            wins: currentSeason.overallRecord.wins + wins,
            losses: currentSeason.overallRecord.losses + losses,
          },
          conferenceRecord: gameData.conferenceGame ? {
            wins: currentSeason.conferenceRecord.wins + wins,
            losses: currentSeason.conferenceRecord.losses + losses,
          } : currentSeason.conferenceRecord,
        });
      }
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {editingGame ? 'Edit Game' : 'Add New Game'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                required
                className="input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Week</label>
              <input
                type="number"
                required
                min="1"
                max="16"
                className="input"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Opponent</label>
              <select
                required
                className="input"
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
              >
                <option value="">Select opponent</option>
                {teams.filter(t => t.id !== 'kansas-state').map(team => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Location</label>
              <select
                required
                className="input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value as Game['location'] })}
              >
                <option value="Home">Home</option>
                <option value="Away">Away</option>
                <option value="Neutral">Neutral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Result</label>
              <select
                required
                className="input"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value as Game['result'] })}
              >
                <option value="W">Win</option>
                <option value="L">Loss</option>
              </select>
            </div>
            
            <div>
              <label className="label">Our Score</label>
              <input
                type="number"
                required
                min="0"
                className="input"
                value={formData.score?.for || 0}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  score: { ...formData.score!, for: parseInt(e.target.value) }
                })}
              />
            </div>
            
            <div>
              <label className="label">Their Score</label>
              <input
                type="number"
                required
                min="0"
                className="input"
                value={formData.score?.against || 0}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  score: { ...formData.score!, against: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
                checked={formData.conferenceGame || false}
                onChange={(e) => setFormData({ ...formData, conferenceGame: e.target.checked })}
              />
              <span className="text-sm font-medium">Conference Game</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
                checked={formData.rivalry || false}
                onChange={(e) => setFormData({ ...formData, rivalry: e.target.checked })}
              />
              <span className="text-sm font-medium">Rivalry Game</span>
            </label>
          </div>

          <div>
            <h3 className="font-semibold text-secondary-800 mb-2">Our Stats (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Passing Yards</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.passingYards || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, passingYards: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Passing TDs</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.passingTDs || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, passingTDs: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Rushing Yards</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.rushingYards || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, rushingYards: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Rushing TDs</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.rushingTDs || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, rushingTDs: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Turnovers</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.turnovers || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, turnovers: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Interceptions Thrown</label>
                <input
                  type="number"
                  className="input"
                  value={formData.stats?.interceptions || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    stats: { ...formData.stats, interceptions: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-secondary-800 mb-2">Opponent Stats (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Passing Yards</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.passingYards || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, passingYards: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Passing TDs</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.passingTDs || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, passingTDs: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Rushing Yards</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.rushingYards || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, rushingYards: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Rushing TDs</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.rushingTDs || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, rushingTDs: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Turnovers</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.turnovers || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, turnovers: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
              
              <div>
                <label className="label">Interceptions Thrown</label>
                <input
                  type="number"
                  className="input"
                  value={formData.opponentStats?.interceptions || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    opponentStats: { ...formData.opponentStats, interceptions: parseInt(e.target.value) || undefined }
                  })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Game highlights, key plays, injuries, etc."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
            >
              {editingGame ? 'Update Game' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};