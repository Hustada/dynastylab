import React, { useState } from 'react';
import { useRecruitStore } from '../stores/recruitStore';
import { useSeasonStore } from '../stores/seasonStore';
import { RecruitForm } from './RecruitForm';
import type { Recruit } from '../types/index';

export const RecruitTracker: React.FC = () => {
  const recruits = useRecruitStore(state => state.recruits);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const currentYear = currentSeason?.year || 2024;
  
  const [showForm, setShowForm] = useState(false);
  const [editingRecruit, setEditingRecruit] = useState<Recruit | undefined>();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStatus, setSelectedStatus] = useState<Recruit['status'] | 'All'>('All');

  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
  const statuses: (Recruit['status'] | 'All')[] = ['All', 'Interested', 'Committed', 'Signed'];

  const filteredRecruits = recruits.filter(recruit => {
    const yearMatch = recruit.signedYear === selectedYear;
    const statusMatch = selectedStatus === 'All' || recruit.status === selectedStatus;
    return yearMatch && statusMatch;
  });

  const handleEdit = (recruit: Recruit) => {
    setEditingRecruit(recruit);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecruit(undefined);
  };

  const getStarEmojis = (stars: number) => '⭐'.repeat(stars);

  const getStatusColor = (status: Recruit['status']) => {
    switch(status) {
      case 'Interested': return 'badge-warning';
      case 'Committed': return 'badge-primary';
      case 'Signed': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  const recruitStats = {
    total: filteredRecruits.length,
    committed: filteredRecruits.filter(r => r.status === 'Committed').length,
    signed: filteredRecruits.filter(r => r.status === 'Signed').length,
    avgStars: filteredRecruits.length > 0 
      ? (filteredRecruits.reduce((sum, r) => sum + r.stars, 0) / filteredRecruits.length).toFixed(1)
      : '0.0'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">Recruiting Board</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          Add Recruit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-secondary-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label text-xs">Recruiting Class</label>
            <select
              className="input h-9"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status</label>
            <select
              className="input h-9"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Recruit['status'] | 'All')}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex items-end space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-800">{recruitStats.total}</p>
              <p className="text-xs text-secondary-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{recruitStats.committed}</p>
              <p className="text-xs text-secondary-600">Committed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{recruitStats.signed}</p>
              <p className="text-xs text-secondary-600">Signed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{recruitStats.avgStars}</p>
              <p className="text-xs text-secondary-600">Avg Stars</p>
            </div>
          </div>
        </div>
      </div>

      {filteredRecruits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">
            No recruits for {selectedYear} class
            {selectedStatus !== 'All' && ` with ${selectedStatus} status`}
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md"
          >
            Add Your First Recruit
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredRecruits.map((recruit) => (
                <tr key={recruit.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">
                      {recruit.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                    {recruit.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-amber-500 font-mono">
                      {getStarEmojis(recruit.stars)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                    {recruit.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(recruit.status)}`}>
                      {recruit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(recruit)}
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
        <RecruitForm 
          onClose={handleCloseForm}
          editingRecruit={editingRecruit}
          defaultYear={selectedYear}
        />
      )}
    </div>
  );
};