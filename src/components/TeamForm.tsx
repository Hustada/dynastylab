import React, { useState } from 'react';
import type { Team } from '../types/index';
import { useTeamStore } from '../stores/teamStore';

interface TeamFormProps {
  onClose: () => void;
  editingTeam?: Team;
}

export const TeamForm: React.FC<TeamFormProps> = ({ onClose, editingTeam }) => {
  const addTeam = useTeamStore(state => state.addTeam);
  const updateTeam = useTeamStore(state => state.updateTeam);
  
  const [formData, setFormData] = useState<Partial<Team>>(editingTeam || {
    name: '',
    mascot: '',
    conference: 'Big 12',
    primaryColor: '#1E40AF',
    secondaryColor: '#FFFFFF',
    logo: '',
    stadium: '',
    isRival: false,
    rivalryName: '',
    historicalRecord: { wins: 0, losses: 0 },
  });

  const conferences = [
    'ACC', 'Big 12', 'Big Ten', 'Pac-12', 'SEC',
    'American', 'Conference USA', 'MAC', 'Mountain West', 'Sun Belt',
    'Independent'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const teamData: Team = {
      id: editingTeam?.id || `team-${Date.now()}`,
      name: formData.name!,
      mascot: formData.mascot!,
      conference: formData.conference!,
      primaryColor: formData.primaryColor!,
      secondaryColor: formData.secondaryColor!,
      logo: formData.logo,
      stadium: formData.stadium,
      isRival: formData.isRival!,
      rivalryName: formData.isRival ? formData.rivalryName : undefined,
      historicalRecord: formData.isRival ? formData.historicalRecord : undefined,
      lastPlayed: formData.lastPlayed,
      notes: formData.notes,
    };

    if (editingTeam) {
      updateTeam(editingTeam.id, teamData);
    } else {
      addTeam(teamData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {editingTeam ? 'Edit Team' : 'Add New Team'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Team Name *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Mascot *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.mascot}
                onChange={(e) => setFormData({ ...formData, mascot: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Conference *</label>
              <select
                required
                className="input"
                value={formData.conference}
                onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
              >
                {conferences.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Stadium</label>
              <input
                type="text"
                className="input"
                value={formData.stadium || ''}
                onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="h-10 w-20"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                />
                <input
                  type="text"
                  className="input flex-1"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="label">Secondary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="h-10 w-20"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                />
                <input
                  type="text"
                  className="input flex-1"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Logo (Emoji)</label>
              <input
                type="text"
                className="input"
                placeholder="🦅"
                maxLength={2}
                value={formData.logo || ''}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-secondary-200 pt-4">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
                checked={formData.isRival || false}
                onChange={(e) => setFormData({ ...formData, isRival: e.target.checked })}
              />
              <span className="text-sm font-medium text-secondary-700">
                This is a rival team
              </span>
            </label>

            {formData.isRival && (
              <div className="space-y-4 pl-7">
                <div>
                  <label className="label">Rivalry Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., The Iron Bowl"
                    value={formData.rivalryName || ''}
                    onChange={(e) => setFormData({ ...formData, rivalryName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Historical Wins</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={formData.historicalRecord?.wins || 0}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        historicalRecord: {
                          ...formData.historicalRecord!,
                          wins: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Historical Losses</label>
                    <input
                      type="number"
                      min="0"
                      className="input"
                      value={formData.historicalRecord?.losses || 0}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        historicalRecord: {
                          ...formData.historicalRecord!,
                          losses: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Additional team information..."
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
              {editingTeam ? 'Update Team' : 'Add Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};