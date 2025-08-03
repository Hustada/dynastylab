import React, { useState } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { PlayerForm } from './PlayerForm';
import { DepthChart } from './DepthChart';
import type { Player } from '../types/index';

export const PlayerManager: React.FC = () => {
  const players = usePlayerStore(state => state.players);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [selectedPosition, setSelectedPosition] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'roster' | 'depth'>('roster');

  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const classes = ['All', 'FR', 'SO', 'JR', 'SR', 'RS'];

  const filteredPlayers = players.filter(player => {
    const positionMatch = selectedPosition === 'All' || player.position === selectedPosition;
    const classMatch = selectedClass === 'All' || player.class === selectedClass;
    return positionMatch && classMatch;
  });

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlayer(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">
          {viewMode === 'roster' ? 'Roster Management' : 'Depth Chart'}
        </h2>
        <div className="flex items-center space-x-3">
          <div className="btn-group">
            <button 
              onClick={() => setViewMode('roster')}
              className={`btn btn-sm ${viewMode === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Roster View
            </button>
            <button 
              onClick={() => setViewMode('depth')}
              className={`btn btn-sm ${viewMode === 'depth' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Depth Chart
            </button>
          </div>
          {viewMode === 'roster' && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-md"
            >
              Add Player
            </button>
          )}
        </div>
      </div>

      {viewMode === 'depth' ? (
        <DepthChart />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-secondary-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label text-xs">Position</label>
            <select
              className="input h-9"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Class</label>
            <select
              className="input h-9"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto">
            <p className="text-sm text-secondary-600">
              {filteredPlayers.length} players
            </p>
          </div>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">
            {selectedPosition !== 'All' || selectedClass !== 'All' 
              ? 'No players match your filters'
              : 'No players on roster yet'
            }
          </p>
          {selectedPosition === 'All' && selectedClass === 'All' && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-md"
            >
              Add Your First Player
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-secondary-900">
                    {player.name}
                  </h3>
                  <p className="text-sm text-secondary-600">
                    #{player.jerseyNumber} • {player.position} • {player.class}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(player)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Edit
                </button>
              </div>

              {player.hometown && (
                <p className="text-sm text-secondary-600 mb-2">
                  <span className="font-medium">From:</span> {player.hometown}
                </p>
              )}

              {/* Current Season Stats */}
              {player.statsBySeason && player.statsBySeason['2024'] && (
                <div className="border-t border-secondary-100 pt-2 mt-2">
                  <p className="text-xs font-medium text-secondary-700 mb-1">2024 Stats</p>
                  <div className="text-sm text-secondary-600">
                    {player.position === 'QB' && player.statsBySeason['2024'].passingYards && (
                      <p>{player.statsBySeason['2024'].passingYards} Pass Yds, {player.statsBySeason['2024'].passingTDs} TDs</p>
                    )}
                    {(player.position === 'RB' || player.position === 'WR') && player.statsBySeason['2024'].rushingYards && (
                      <p>{player.statsBySeason['2024'].rushingYards} Rush Yds, {player.statsBySeason['2024'].rushingTDs} TDs</p>
                    )}
                    {player.position === 'WR' && player.statsBySeason['2024'].receptions && (
                      <p>{player.statsBySeason['2024'].receptions} Rec, {player.statsBySeason['2024'].receivingYards} Yds</p>
                    )}
                    {(player.position === 'LB' || player.position === 'DL') && player.statsBySeason['2024'].tackles && (
                      <p>{player.statsBySeason['2024'].tackles} Tackles, {player.statsBySeason['2024'].sacks} Sacks</p>
                    )}
                  </div>
                </div>
              )}

              {/* Awards */}
              {player.awards && player.awards.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {player.awards.map((award, idx) => (
                      <span key={idx} className="badge badge-primary text-xs">
                        {award}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {showForm && (
        <PlayerForm 
          onClose={handleCloseForm}
          editingPlayer={editingPlayer}
        />
      )}
    </div>
  );
};