import React, { useState } from 'react';
import type { Player } from '../types/index';
import { usePlayerStore } from '../stores/playerStore';

interface PlayerFormProps {
  onClose: () => void;
  editingPlayer?: Player;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onClose, editingPlayer }) => {
  const addPlayer = usePlayerStore(state => state.addPlayer);
  const updatePlayer = usePlayerStore(state => state.updatePlayer);
  
  const [formData, setFormData] = useState<Partial<Player>>(editingPlayer || {
    name: '',
    position: 'QB',
    class: 'FR',
    jerseyNumber: undefined,
    hometown: '',
    awards: [],
    storyNotes: '',
  });

  const [newAward, setNewAward] = useState('');

  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const classes: Player['class'][] = ['FR', 'SO', 'JR', 'SR', 'RS'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const playerData: Player = {
      id: editingPlayer?.id || `player-${Date.now()}`,
      name: formData.name!,
      position: formData.position!,
      class: formData.class!,
      jerseyNumber: formData.jerseyNumber,
      hometown: formData.hometown,
      statsBySeason: editingPlayer?.statsBySeason || {},
      awards: formData.awards,
      storyNotes: formData.storyNotes,
    };

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, playerData);
    } else {
      addPlayer(playerData);
    }
    
    onClose();
  };

  const addAward = () => {
    if (newAward.trim()) {
      setFormData({
        ...formData,
        awards: [...(formData.awards || []), newAward.trim()]
      });
      setNewAward('');
    }
  };

  const removeAward = (index: number) => {
    setFormData({
      ...formData,
      awards: formData.awards?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Jersey Number</label>
              <input
                type="number"
                min="0"
                max="99"
                className="input"
                value={formData.jerseyNumber || ''}
                onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Position *</label>
              <select
                required
                className="input"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Class *</label>
              <select
                required
                className="input"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value as Player['class'] })}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Hometown</label>
            <input
              type="text"
              className="input"
              placeholder="City, State"
              value={formData.hometown || ''}
              onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
            />
          </div>

          {/* Awards Section */}
          <div>
            <label className="label">Awards & Honors</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="e.g., All-Conference First Team"
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
              />
              <button
                type="button"
                onClick={addAward}
                className="btn btn-secondary btn-md"
              >
                Add
              </button>
            </div>
            {formData.awards && formData.awards.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.awards.map((award, idx) => (
                  <span key={idx} className="badge badge-primary text-sm flex items-center gap-1">
                    {award}
                    <button
                      type="button"
                      onClick={() => removeAward(idx)}
                      className="text-primary-800 hover:text-primary-900 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Story Notes</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Recruiting story, background, personality traits..."
              value={formData.storyNotes || ''}
              onChange={(e) => setFormData({ ...formData, storyNotes: e.target.value })}
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
              {editingPlayer ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};