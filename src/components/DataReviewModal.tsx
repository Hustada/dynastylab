import React, { useState } from 'react';
import type { ScreenshotAnalysisResult } from '../services/ScreenshotOrchestrator';
import { useTeamStore } from '../stores/teamStore';

interface DataReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  results: Array<{
    fileName: string;
    analysis: ScreenshotAnalysisResult;
  }>;
  autoApprove: boolean;
  onAutoApproveChange: (value: boolean) => void;
}

export function DataReviewModal({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  results,
  autoApprove,
  onAutoApproveChange
}: DataReviewModalProps) {
  const teams = useTeamStore(state => state.teams);
  const [teamOverrides, setTeamOverrides] = useState<Record<number, string>>({});
  
  if (!isOpen) return null;

  const renderExtractedData = (data: any, screenType: string) => {
    // Format data based on screen type for better readability
    switch (screenType) {
      case 'season-standings':
        return (
          <div className="space-y-1">
            <p><strong>Team:</strong> {data.teamName} ({data.conference})</p>
            <p><strong>Overall Record:</strong> {data.overallRecord?.wins}-{data.overallRecord?.losses}</p>
            <p><strong>Conference:</strong> {data.conferenceRecord?.wins}-{data.conferenceRecord?.losses}</p>
            {data.ranking && <p><strong>Ranking:</strong> #{data.ranking}</p>}
          </div>
        );
      
      case 'game-result':
        return (
          <div className="space-y-1">
            <p><strong>vs:</strong> {data.opponent} ({data.location})</p>
            <p><strong>Score:</strong> {data.score?.for}-{data.score?.against} ({data.result})</p>
            <p><strong>Stats:</strong> {data.stats?.passingYards} pass yds, {data.stats?.rushingYards} rush yds</p>
          </div>
        );
      
      case 'roster-overview':
        return (
          <div className="space-y-1">
            <p><strong>Players Found:</strong> {Array.isArray(data) ? data.length : 0}</p>
            {Array.isArray(data) && data.slice(0, 3).map((player: any, idx: number) => (
              <p key={idx} className="text-sm">
                • {player.name} - {player.position} ({player.overall} OVR)
              </p>
            ))}
            {Array.isArray(data) && data.length > 3 && (
              <p className="text-sm text-gray-500">...and {data.length - 3} more</p>
            )}
          </div>
        );
      
      case 'recruiting-board':
        return (
          <div className="space-y-1">
            <p><strong>Commits:</strong> {data.commits?.length || 0}</p>
            {data.classRanking && <p><strong>Class Rank:</strong> #{data.classRanking}</p>}
            {data.commits?.slice(0, 2).map((recruit: any, idx: number) => (
              <p key={idx} className="text-sm">
                • {recruit.name} - {recruit.stars}⭐ {recruit.position}
              </p>
            ))}
          </div>
        );
      
      case 'coach-info':
        return (
          <div className="space-y-1">
            <p><strong>Coach:</strong> {data.name}</p>
            <p><strong>Record:</strong> {data.wins}-{data.losses}</p>
            <p><strong>Years:</strong> {data.yearsAtSchool}</p>
            <p><strong>Hot Seat:</strong> {data.hotSeat ? 'Yes 🔥' : 'No ✅'}</p>
          </div>
        );
      
      default:
        return (
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getDataDestination = (screenType: string) => {
    const destinations: Record<string, { section: string; icon: string; description: string }> = {
      'season-standings': {
        section: 'Dashboard',
        icon: '📊',
        description: 'Season records and rankings'
      },
      'team-stats': {
        section: 'Dashboard',
        icon: '📈',
        description: 'Team statistics'
      },
      'game-result': {
        section: 'Games',
        icon: '🏈',
        description: 'Game history and results'
      },
      'schedule': {
        section: 'Games',
        icon: '📅',
        description: 'Season schedule'
      },
      'roster-overview': {
        section: 'Players',
        icon: '👥',
        description: 'Team roster'
      },
      'player-stats': {
        section: 'Players',
        icon: '🌟',
        description: 'Individual player statistics'
      },
      'depth-chart': {
        section: 'Depth Chart',
        icon: '📋',
        description: 'Position depth'
      },
      'recruiting-board': {
        section: 'Recruits',
        icon: '⭐',
        description: 'Recruiting class'
      },
      'coach-info': {
        section: 'Coaches',
        icon: '🎯',
        description: 'Coaching staff info'
      },
      'trophy-case': {
        section: 'Dashboard',
        icon: '🏆',
        description: 'Championships and awards'
      },
      'top25-rankings': {
        section: 'Dashboard',
        icon: '🏅',
        description: 'National rankings'
      },
      'unknown': {
        section: 'Review Required',
        icon: '❓',
        description: 'Manual review needed'
      }
    };
    
    return destinations[screenType] || destinations['unknown'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-2xl font-bold">Review Extracted Data</h2>
          <p className="mt-2 text-blue-100">
            Please review the data extracted from your screenshots before importing
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Summary of where data will go */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2">📍 Data Routing Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(
                results.reduce((acc, r) => {
                  const dest = getDataDestination(r.analysis.screenType);
                  const key = dest.section;
                  if (!acc[key]) {
                    acc[key] = { icon: dest.icon, count: 0, types: new Set() };
                  }
                  acc[key].count++;
                  acc[key].types.add(r.analysis.screenType);
                  return acc;
                }, {} as Record<string, { icon: string; count: number; types: Set<string> }>)
              ).map(([section, info]) => (
                <div key={section} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{info.icon}</span>
                  <div>
                    <span className="font-medium text-green-800">{section}</span>
                    <span className="text-green-600 ml-1">({info.count} item{info.count > 1 ? 's' : ''})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            {results.map((result, index) => {
              const destination = getDataDestination(result.analysis.screenType);
              return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {result.analysis.screenType.split('-').map(w => 
                          w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ')}
                      </h3>
                      <span className="text-2xl">{destination.icon}</span>
                    </div>
                    <p className="text-sm text-gray-600">{result.fileName}</p>
                    
                    {/* Data destination indicator */}
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                      <span className="text-xs font-medium text-blue-700">
                        Will be saved to:
                      </span>
                      <span className="text-xs font-bold text-blue-900">
                        {destination.section}
                      </span>
                      <span className="text-xs text-blue-600">
                        ({destination.description})
                      </span>
                    </div>
                    
                    {/* Team detection/override */}
                    {result.analysis.screenType !== 'top25-rankings' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium">Team:</span>
                        {result.analysis.detectedTeam ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 font-medium">
                              {teamOverrides[index] || result.analysis.detectedTeam}
                            </span>
                            <button
                              onClick={() => {
                                const newTeam = prompt('Enter team name:', teamOverrides[index] || result.analysis.detectedTeam);
                                if (newTeam) {
                                  setTeamOverrides({ ...teamOverrides, [index]: newTeam });
                                }
                              }}
                              className="text-xs text-blue-500 hover:text-blue-600 underline"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={teamOverrides[index] || ''}
                              onChange={(e) => setTeamOverrides({ ...teamOverrides, [index]: e.target.value })}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="">Select team...</option>
                              {teams.map(team => (
                                <option key={team.id} value={team.name}>
                                  {team.name} {team.mascot}
                                </option>
                              ))}
                            </select>
                            <span className="text-xs text-yellow-600">⚠️ Team not detected</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className={`text-sm font-medium ${getConfidenceColor(result.analysis.confidence)}`}>
                      {getConfidenceLabel(result.analysis.confidence)}
                    </span>
                    <p className="text-xs text-gray-500">
                      {Math.round(result.analysis.confidence * 100)}% confident
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded p-3">
                  {renderExtractedData(result.analysis.extractedData, result.analysis.screenType)}
                </div>

                {result.analysis.suggestedActions.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Suggestions:</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      {result.analysis.suggestedActions.map((action, idx) => (
                        <li key={idx}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )})}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => onAutoApproveChange(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium">Auto-approve future imports</span>
                <p className="text-sm text-gray-600">
                  Skip this review step and automatically import data (you can change this in settings)
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <div className="space-x-3">
            <button
              onClick={onReject}
              className="btn-secondary"
            >
              Reject & Re-process
            </button>
            <button
              onClick={onConfirm}
              className="btn-primary"
            >
              Confirm & Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}