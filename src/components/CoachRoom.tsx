import React, { useState } from 'react';
import { useCoachStore } from '../stores/coachStore';
import { useSeasonStore } from '../stores/seasonStore';
import type { Coach } from '../types/index';

export const CoachRoom: React.FC = () => {
  const { coaches, currentCoachName, addCoach, updateCoach, setCurrentCoach } = useCoachStore();
  const currentCoach = useCoachStore(state => state.getCurrentCoach());
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Coach>>(currentCoach || {
    name: '',
    startYear: currentSeason?.year || 2024,
    record: '0-0',
    style: 'Spread',
    hotSeat: false,
  });

  const coachingStyles = [
    'Spread',
    'Pro Style',
    'Air Raid',
    'Option',
    'Power Run',
    'West Coast',
    'Multiple',
    '3-3-5 Defense',
    '4-2-5 Defense',
    '3-4 Defense',
    '4-3 Defense'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordParts = formData.record!.split('-');
    const wins = parseInt(recordParts[0]) || 0;
    const losses = parseInt(recordParts[1]) || 0;
    
    const coachData: Coach = {
      id: formData.name!.toLowerCase().replace(/\s+/g, '-'),
      coachName: formData.name!,
      name: formData.name!,
      startYear: formData.startYear!,
      endYear: formData.endYear,
      record: formData.record!,
      wins,
      losses,
      championships: 0, // Can be updated later
      style: formData.style!,
      hotSeat: formData.hotSeat!,
      reasonLeft: formData.reasonLeft,
    };

    if (currentCoach) {
      updateCoach(currentCoach.name, coachData);
    } else {
      addCoach(coachData);
      setCurrentCoach(coachData.name);
    }
    
    setIsEditing(false);
    setFormData(coachData);
  };

  const calculateWinPercentage = (record: string) => {
    const [wins, losses] = record.split('-').map(Number);
    const total = wins + losses;
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  const getHotSeatStatus = (coach: Coach) => {
    const winPct = parseFloat(calculateWinPercentage(coach.record));
    const yearsCoached = (currentSeason?.year || 2024) - coach.startYear;
    
    if (coach.hotSeat) return { status: 'Hot Seat', color: 'text-red-600' };
    if (winPct >= 70 && yearsCoached >= 2) return { status: 'Secure', color: 'text-green-600' };
    if (winPct >= 50) return { status: 'Stable', color: 'text-primary-600' };
    return { status: 'Pressure Building', color: 'text-amber-600' };
  };

  if (!currentCoach && !isEditing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-secondary-700 mb-4">
          No Coach Assigned
        </h2>
        <p className="text-secondary-600 mb-4">
          Add your current coach to track their progress
        </p>
        <button 
          onClick={() => setIsEditing(true)}
          className="btn btn-primary btn-md"
        >
          Add Coach
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">
          {currentCoach ? 'Edit Coach' : 'Add New Coach'}
        </h2>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-secondary-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Coach Name *</label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Start Year *</label>
              <input
                type="number"
                required
                min="2020"
                max="2050"
                className="input"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Overall Record *</label>
              <input
                type="text"
                required
                pattern="\d+-\d+"
                placeholder="0-0"
                className="input"
                value={formData.record}
                onChange={(e) => setFormData({ ...formData, record: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Coaching Style *</label>
              <select
                required
                className="input"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              >
                {coachingStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="hotSeat"
              className="w-4 h-4 text-primary-600 rounded"
              checked={formData.hotSeat || false}
              onChange={(e) => setFormData({ ...formData, hotSeat: e.target.checked })}
            />
            <label htmlFor="hotSeat" className="text-sm font-medium text-secondary-700">
              Currently on the hot seat
            </label>
          </div>

          {formData.endYear !== undefined && (
            <div>
              <label className="label">Reason for Leaving</label>
              <input
                type="text"
                className="input"
                placeholder="Fired, retired, took another job..."
                value={formData.reasonLeft || ''}
                onChange={(e) => setFormData({ ...formData, reasonLeft: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(currentCoach || {});
              }}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
            >
              {currentCoach ? 'Update Coach' : 'Add Coach'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const status = getHotSeatStatus(currentCoach!);
  const yearsCoached = (currentSeason?.year || 2024) - currentCoach!.startYear;

  return (
    <div className="space-y-6">
      {/* Coach Overview Card */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-800">
              {currentCoach!.name}
            </h1>
            <p className="text-secondary-600">
              Head Coach • {currentCoach!.style}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary btn-sm"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Overall Record</p>
            <p className="stat-value">{currentCoach!.record}</p>
            <p className="text-sm text-secondary-600">
              {calculateWinPercentage(currentCoach!.record)}% Win Rate
            </p>
          </div>
          
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Years Coached</p>
            <p className="stat-value">{yearsCoached}</p>
            <p className="text-sm text-secondary-600">
              Since {currentCoach!.startYear}
            </p>
          </div>
          
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Job Security</p>
            <p className={`stat-value ${status.color}`}>
              {status.status}
            </p>
          </div>
          
          <div className="bg-secondary-50 rounded-lg p-4">
            <p className="stat-label">Coaching Style</p>
            <p className="text-lg font-semibold text-secondary-800">
              {currentCoach!.style}
            </p>
          </div>
        </div>
      </div>

      {/* Previous Coaches */}
      {coaches.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">
            Coaching History
          </h2>
          <div className="space-y-3">
            {coaches.filter(c => c.name !== currentCoachName).map((coach) => (
              <div key={coach.name} className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0">
                <div>
                  <p className="font-medium text-secondary-900">
                    {coach.name}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {coach.startYear}-{coach.endYear || 'Present'} • {coach.record} • {coach.style}
                  </p>
                  {coach.reasonLeft && (
                    <p className="text-sm text-secondary-500 italic">
                      {coach.reasonLeft}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCurrentCoach(coach.name)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Set as Current
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot Seat Meter */}
      {currentCoach!.hotSeat && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            🔥 Hot Seat Warning
          </h3>
          <p className="text-red-700">
            The administration is closely watching performance. Improvement is needed to secure job status.
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-red-800 mb-1">Pressure Level</p>
            <div className="w-full bg-red-200 rounded-full h-3">
              <div 
                className="bg-red-600 h-3 rounded-full"
                style={{ width: '75%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};