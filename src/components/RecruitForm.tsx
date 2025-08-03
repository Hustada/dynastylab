import React, { useState } from 'react';
import type { Recruit } from '../types/index';
import { useRecruitStore } from '../stores/recruitStore';
import { usePlayerStore } from '../stores/playerStore';

interface RecruitFormProps {
  onClose: () => void;
  editingRecruit?: Recruit;
  defaultYear?: number;
}

export const RecruitForm: React.FC<RecruitFormProps> = ({ onClose, editingRecruit, defaultYear }) => {
  const { addRecruit, updateRecruit, commitRecruit, signRecruit } = useRecruitStore();
  const players = usePlayerStore(state => state.players);
  
  const [formData, setFormData] = useState<Partial<Recruit>>(editingRecruit || {
    name: '',
    stars: 3,
    position: 'QB',
    state: '',
    status: 'Interested',
    signedYear: defaultYear || 2024,
  });

  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const statuses: Recruit['status'][] = ['Interested', 'Committed', 'Signed'];
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recruitData: Recruit = {
      id: editingRecruit?.id || `recruit-${Date.now()}`,
      name: formData.name!,
      stars: formData.stars!,
      position: formData.position!,
      state: formData.state!,
      status: formData.status!,
      signedYear: formData.signedYear!,
      playerId: formData.playerId,
    };

    if (editingRecruit) {
      updateRecruit(editingRecruit.id, recruitData);
    } else {
      addRecruit(recruitData);
    }
    
    onClose();
  };

  const handleQuickStatusChange = (status: Recruit['status']) => {
    if (!editingRecruit) return;
    
    if (status === 'Committed') {
      commitRecruit(editingRecruit.id);
    } else if (status === 'Signed' && formData.playerId) {
      signRecruit(editingRecruit.id, formData.playerId);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {editingRecruit ? 'Edit Recruit' : 'Add New Recruit'}
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
          </div>

          <div>
            <label className="label">Star Rating *</label>
            <div className="flex space-x-2 mt-2 mb-4">
              {[2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, stars: star as 2 | 3 | 4 | 5 })}
                  className={`px-3 py-2 rounded-md border-2 transition-colors ${
                    formData.stars === star
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 hover:border-secondary-400'
                  }`}
                >
                  {'⭐'.repeat(star)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">State *</label>
              <select
                required
                className="input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Select state</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Class Year *</label>
              <input
                type="number"
                required
                min="2024"
                max="2030"
                className="input"
                value={formData.signedYear}
                onChange={(e) => setFormData({ ...formData, signedYear: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">Status *</label>
            <select
              required
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Recruit['status'] })}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {formData.status === 'Signed' && (
            <div>
              <label className="label">Link to Player (Optional)</label>
              <select
                className="input"
                value={formData.playerId || ''}
                onChange={(e) => setFormData({ ...formData, playerId: e.target.value || undefined })}
              >
                <option value="">Not linked to roster</option>
                {players
                  .filter(p => p.class === 'FR')
                  .map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} - {player.position}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-secondary-600 mt-1">
                Link this recruit to a freshman on your roster
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            {editingRecruit && (
              <div className="flex space-x-2">
                {editingRecruit.status === 'Interested' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange('Committed')}
                    className="btn btn-primary btn-sm"
                  >
                    Commit Now
                  </button>
                )}
                {editingRecruit.status === 'Committed' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange('Signed')}
                    className="btn btn-success btn-sm"
                  >
                    Sign Now
                  </button>
                )}
              </div>
            )}
            
            <div className="flex space-x-3 ml-auto">
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
                {editingRecruit ? 'Update Recruit' : 'Add Recruit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};