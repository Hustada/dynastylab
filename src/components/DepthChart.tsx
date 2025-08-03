import React, { useState } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useTeamStore } from '../stores/teamStore';
import type { Player } from '../types/index';

// Define position groups and their typical depth positions
const positionGroups = {
  'Offense': {
    'Quarterbacks': ['QB1', 'QB2', 'QB3'],
    'Running Backs': ['RB1', 'RB2', 'RB3', 'FB1'],
    'Offensive Line': ['LT1', 'LT2', 'LG1', 'LG2', 'C1', 'C2', 'RG1', 'RG2', 'RT1', 'RT2'],
    'Wide Receivers': ['WR1', 'WR2', 'WR3', 'WR4', 'WR5', 'SLOT1', 'SLOT2'],
    'Tight Ends': ['TE1', 'TE2', 'TE3']
  },
  'Defense': {
    'Defensive Line': ['LE1', 'LE2', 'DT1', 'DT2', 'DT3', 'DT4', 'RE1', 'RE2'],
    'Linebackers': ['LOLB1', 'LOLB2', 'MLB1', 'MLB2', 'ROLB1', 'ROLB2'],
    'Defensive Backs': ['CB1', 'CB2', 'CB3', 'CB4', 'FS1', 'FS2', 'SS1', 'SS2']
  },
  'Special Teams': {
    'Specialists': ['K1', 'K2', 'P1', 'P2', 'LS1', 'KR1', 'KR2', 'PR1', 'PR2']
  }
};

// Map generic positions to depth chart positions
const positionMapping: Record<string, string[]> = {
  'QB': ['QB1', 'QB2', 'QB3'],
  'RB': ['RB1', 'RB2', 'RB3'],
  'FB': ['FB1'],
  'OL': ['LT1', 'LT2', 'LG1', 'LG2', 'C1', 'C2', 'RG1', 'RG2', 'RT1', 'RT2'],
  'WR': ['WR1', 'WR2', 'WR3', 'WR4', 'WR5', 'SLOT1', 'SLOT2'],
  'TE': ['TE1', 'TE2', 'TE3'],
  'DL': ['LE1', 'LE2', 'DT1', 'DT2', 'DT3', 'DT4', 'RE1', 'RE2'],
  'LB': ['LOLB1', 'LOLB2', 'MLB1', 'MLB2', 'ROLB1', 'ROLB2'],
  'DB': ['CB1', 'CB2', 'CB3', 'CB4', 'FS1', 'FS2', 'SS1', 'SS2'],
  'K': ['K1', 'K2'],
  'P': ['P1', 'P2'],
  'LS': ['LS1']
};

export const DepthChart: React.FC = () => {
  const players = usePlayerStore(state => state.players);
  const updatePlayer = usePlayerStore(state => state.updatePlayer);
  const userTeam = useTeamStore(state => state.getUserTeam());
  
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<'Offense' | 'Defense' | 'Special Teams'>('Offense');
  
  // Get player by depth position
  const getPlayerByDepthPosition = (depthPosition: string): Player | undefined => {
    return players.find(p => p.depthPosition === depthPosition);
  };
  
  // Get available players for a position
  const getAvailablePlayersForPosition = (basePosition: string): Player[] => {
    // Map depth positions back to base positions
    const basePositionMap: Record<string, string> = {
      'QB1': 'QB', 'QB2': 'QB', 'QB3': 'QB',
      'RB1': 'RB', 'RB2': 'RB', 'RB3': 'RB',
      'FB1': 'FB',
      'LT1': 'OL', 'LT2': 'OL', 'LG1': 'OL', 'LG2': 'OL', 
      'C1': 'OL', 'C2': 'OL', 'RG1': 'OL', 'RG2': 'OL', 
      'RT1': 'OL', 'RT2': 'OL',
      'WR1': 'WR', 'WR2': 'WR', 'WR3': 'WR', 'WR4': 'WR', 
      'WR5': 'WR', 'SLOT1': 'WR', 'SLOT2': 'WR',
      'TE1': 'TE', 'TE2': 'TE', 'TE3': 'TE',
      'LE1': 'DL', 'LE2': 'DL', 'DT1': 'DL', 'DT2': 'DL',
      'DT3': 'DL', 'DT4': 'DL', 'RE1': 'DL', 'RE2': 'DL',
      'LOLB1': 'LB', 'LOLB2': 'LB', 'MLB1': 'LB', 'MLB2': 'LB',
      'ROLB1': 'LB', 'ROLB2': 'LB',
      'CB1': 'DB', 'CB2': 'DB', 'CB3': 'DB', 'CB4': 'DB',
      'FS1': 'DB', 'FS2': 'DB', 'SS1': 'DB', 'SS2': 'DB',
      'K1': 'K', 'K2': 'K', 'P1': 'P', 'P2': 'P', 'LS1': 'LS',
      'KR1': 'RB', 'KR2': 'WR', 'PR1': 'WR', 'PR2': 'RB'
    };
    
    const position = basePositionMap[basePosition] || basePosition;
    return players.filter(p => p.position === position);
  };
  
  // Handle player assignment
  const handlePlayerAssignment = (depthPosition: string, playerId: string) => {
    // Clear the previous player from this position
    const currentPlayer = getPlayerByDepthPosition(depthPosition);
    if (currentPlayer) {
      updatePlayer(currentPlayer.id, { depthPosition: undefined });
    }
    
    // Clear the new player's previous position if they had one
    const newPlayer = players.find(p => p.id === playerId);
    if (newPlayer && newPlayer.depthPosition) {
      // Don't clear, just reassign
    }
    
    // Assign the new player to this position
    if (playerId && playerId !== 'none') {
      updatePlayer(playerId, { depthPosition });
    }
    
    setEditingPosition(null);
  };
  
  const renderPositionSlot = (depthPosition: string, positionLabel: string) => {
    const player = getPlayerByDepthPosition(depthPosition);
    const isEditing = editingPosition === depthPosition;
    const availablePlayers = getAvailablePlayersForPosition(depthPosition);
    
    return (
      <div key={depthPosition} className="border border-secondary-200 rounded-lg p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-secondary-700">{positionLabel}</span>
          {!isEditing && (
            <button
              onClick={() => setEditingPosition(depthPosition)}
              className="text-xs text-[var(--team-primary)] hover:text-[var(--team-primary)]/80"
            >
              Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <select
              className="select select-sm w-full"
              defaultValue={player?.id || 'none'}
              onChange={(e) => handlePlayerAssignment(depthPosition, e.target.value)}
            >
              <option value="none">-- Empty --</option>
              {availablePlayers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.overall || 'N/A'} OVR)
                  {p.depthPosition && p.depthPosition !== depthPosition && ` - Currently ${p.depthPosition}`}
                </option>
              ))}
            </select>
            <button
              onClick={() => setEditingPosition(null)}
              className="btn btn-xs btn-ghost"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            {player ? (
              <div>
                <p className="font-medium text-primary-800">{player.name}</p>
                <p className="text-xs text-secondary-600">
                  #{player.jerseyNumber || '--'} • {player.class} • {player.overall || 'N/A'} OVR
                </p>
              </div>
            ) : (
              <p className="text-sm text-secondary-400 italic">Empty</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold drop-shadow-md">
          {userTeam ? `${userTeam.name} Depth Chart` : 'Team Depth Chart'}
        </h1>
        <p className="text-white/90 mt-2">
          Organize your roster by position and depth
        </p>
      </div>
      
      {/* Group Selector */}
      <div className="bg-white border-x border-b border-secondary-200 p-4">
        <div className="flex space-x-4">
          {(['Offense', 'Defense', 'Special Teams'] as const).map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGroup === group
                  ? 'bg-[var(--team-primary)] text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>
      
      {/* Depth Chart Grid */}
      <div className="bg-secondary-50 border-x border-b border-secondary-200 rounded-b-lg p-6">
        <div className="space-y-8">
          {Object.entries(positionGroups[selectedGroup]).map(([groupName, positions]) => (
            <div key={groupName}>
              <h3 className="text-lg font-bold text-primary-800 mb-4">{groupName}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {positions.map(pos => {
                  // Create a more readable label
                  const label = pos.replace(/[0-9]/g, '').replace('SLOT', 'Slot');
                  const depth = pos.match(/[0-9]/)?.[0] || '';
                  const displayLabel = depth === '1' ? label : `${label} ${depth}`;
                  
                  return renderPositionSlot(pos, displayLabel);
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-secondary-200">
          <h3 className="font-semibold text-secondary-700 mb-2">Depth Chart Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-secondary-600">Total Starters:</span>
              <span className="ml-2 font-medium text-primary-800">
                {players.filter(p => p.depthPosition?.includes('1')).length}
              </span>
            </div>
            <div>
              <span className="text-secondary-600">Backups:</span>
              <span className="ml-2 font-medium text-primary-800">
                {players.filter(p => p.depthPosition && !p.depthPosition.includes('1')).length}
              </span>
            </div>
            <div>
              <span className="text-secondary-600">Unassigned:</span>
              <span className="ml-2 font-medium text-primary-800">
                {players.filter(p => !p.depthPosition).length}
              </span>
            </div>
            <div>
              <span className="text-secondary-600">Total Roster:</span>
              <span className="ml-2 font-medium text-primary-800">
                {players.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};