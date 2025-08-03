import React, { useState } from 'react';
import { useTeamStore } from '../stores/teamStore';
import { TeamForm } from './TeamForm';
import type { Team } from '../types/index';

export const TeamList: React.FC = () => {
  const { teams, userTeamId, setUserTeam } = useTeamStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [filter, setFilter] = useState<'all' | 'conference' | 'rivals'>('all');

  const userTeam = teams.find(t => t.id === userTeamId);
  
  const filteredTeams = teams.filter(team => {
    if (filter === 'all') return true;
    if (filter === 'conference') return team.conference === userTeam?.conference;
    if (filter === 'rivals') return team.isRival;
    return true;
  });

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeam(undefined);
  };

  const conferences = [...new Set(teams.map(t => t.conference))].sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">Team Management</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          Add Team
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg border border-secondary-200 p-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            filter === 'all' 
              ? 'bg-primary-100 text-primary-800 font-medium' 
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          All Teams ({teams.length})
        </button>
        <button
          onClick={() => setFilter('conference')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            filter === 'conference' 
              ? 'bg-primary-100 text-primary-800 font-medium' 
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Conference ({teams.filter(t => t.conference === userTeam?.conference).length})
        </button>
        <button
          onClick={() => setFilter('rivals')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            filter === 'rivals' 
              ? 'bg-primary-100 text-primary-800 font-medium' 
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Rivals ({teams.filter(t => t.isRival).length})
        </button>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">No teams match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div 
              key={team.id} 
              className={`card p-4 hover:shadow-md transition-shadow ${
                team.id === userTeamId ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  {team.logo && (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}
                    >
                      {team.logo}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-secondary-900">
                      {team.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {team.mascot}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(team)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-secondary-600">
                  <span className="font-medium">Conference:</span> {team.conference}
                </p>
                
                {team.stadium && (
                  <p className="text-secondary-600">
                    <span className="font-medium">Stadium:</span> {team.stadium}
                  </p>
                )}

                {team.isRival && (
                  <div className="mt-2">
                    <span className="badge badge-error">
                      Rival {team.rivalryName ? `- ${team.rivalryName}` : ''}
                    </span>
                    {team.historicalRecord && (
                      <p className="text-xs text-secondary-600 mt-1">
                        Record: {team.historicalRecord.wins}W - {team.historicalRecord.losses}L
                      </p>
                    )}
                  </div>
                )}

                {team.id === userTeamId ? (
                  <div className="mt-2">
                    <span className="badge" style={{
                      backgroundColor: team.primaryColor,
                      color: 'white'
                    }}>
                      Your Team
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setUserTeam(team.id)}
                    className="text-xs font-medium mt-2 transition-colors"
                    style={{ color: team.primaryColor }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Set as Your Team
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TeamForm 
          onClose={handleCloseForm}
          editingTeam={editingTeam}
        />
      )}
    </div>
  );
};