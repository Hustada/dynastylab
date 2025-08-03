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
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {result.analysis.screenType.split('-').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')}
                    </h3>
                    <p className="text-sm text-gray-600">{result.fileName}</p>
                    
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
            ))}
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