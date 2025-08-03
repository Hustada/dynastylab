import React from 'react';
import { Link } from 'react-router-dom';
import type { ScreenshotAnalysisResult } from '../services/ScreenshotOrchestrator';

interface ImportSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  results: Array<{
    fileName: string;
    analysis: ScreenshotAnalysisResult;
  }>;
}

export function ImportSuccess({ isOpen, onClose, results }: ImportSuccessProps) {
  if (!isOpen) return null;

  // Calculate statistics
  const stats = {
    totalScreenshots: results.length,
    playersImported: results.filter(r => 
      r.analysis.screenType === 'roster-overview' || 
      r.analysis.screenType === 'player-stats'
    ).reduce((acc, r) => {
      if (r.analysis.screenType === 'player-stats') return acc + 1;
      return acc + (Array.isArray(r.analysis.extractedData) ? r.analysis.extractedData.length : 0);
    }, 0),
    gamesImported: results.filter(r => r.analysis.screenType === 'game-result' || r.analysis.screenType === 'schedule')
      .reduce((acc, r) => acc + (Array.isArray(r.analysis.extractedData) ? r.analysis.extractedData.length : 1), 0),
    recruitsImported: results.filter(r => r.analysis.screenType === 'recruiting-board')
      .reduce((acc, r) => acc + (r.analysis.extractedData?.commits?.length || 0), 0),
    screenTypes: [...new Set(results.map(r => r.analysis.screenType))],
    generatedContent: results.flatMap(r => r.analysis.generatedContent || [])
  };

  const getScreenTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'season-standings': '📊',
      'team-stats': '📈',
      'game-result': '🏈',
      'schedule': '📅',
      'roster-overview': '👥',
      'depth-chart': '📋',
      'recruiting-board': '⭐',
      'coach-info': '🎯',
      'trophy-case': '🏆',
      'unknown': '❓'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center">
            <div className="text-4xl mr-4">✅</div>
            <div>
              <h2 className="text-2xl font-bold">Import Successful!</h2>
              <p className="mt-1 text-green-100">
                Your dynasty data has been imported
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">
                {stats.totalScreenshots}
              </div>
              <div className="text-sm text-gray-600">Screenshots Processed</div>
            </div>
            
            {stats.playersImported > 0 && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.playersImported}
                </div>
                <div className="text-sm text-gray-600">Players Added</div>
              </div>
            )}
            
            {stats.gamesImported > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {stats.gamesImported}
                </div>
                <div className="text-sm text-gray-600">Games Imported</div>
              </div>
            )}
            
            {stats.recruitsImported > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.recruitsImported}
                </div>
                <div className="text-sm text-gray-600">Recruits Added</div>
              </div>
            )}
          </div>

          {/* Imported Items List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What was imported:</h3>
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScreenTypeIcon(result.analysis.screenType)}
                    </span>
                    <span className="text-sm font-medium">
                      {result.analysis.screenType.split('-').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Imported
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              {/* Show relevant navigation based on imported data */}
              {stats.screenTypes.includes('player-stats') && (
                <Link to="/players" className="block hover:text-blue-900">
                  → View your player stats in the Players section
                </Link>
              )}
              {stats.playersImported > 0 && !stats.screenTypes.includes('player-stats') && (
                <Link to="/players" className="block hover:text-blue-900">
                  → View your imported roster in the Players section
                </Link>
              )}
              {stats.gamesImported > 0 && (
                <Link to="/games" className="block hover:text-blue-900">
                  → Check your game history in the Games section
                </Link>
              )}
              {stats.recruitsImported > 0 && (
                <Link to="/recruits" className="block hover:text-blue-900">
                  → Review your recruiting class in the Recruits section
                </Link>
              )}
              {stats.screenTypes.includes('season-standings') && (
                <Link to="/" className="block hover:text-blue-900">
                  → View updated standings on the Dashboard
                </Link>
              )}
              {stats.screenTypes.includes('depth-chart') && (
                <Link to="/depth-chart" className="block hover:text-blue-900">
                  → Check your updated depth chart
                </Link>
              )}
              
              {/* Only show AI news link if content was generated */}
              {stats.generatedContent.length > 0 && (
                <>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-2">
                      🎉 AI Content Generated:
                    </p>
                    {stats.generatedContent.includes('game-recap') && (
                      <Link to="/news" className="block hover:text-blue-900">
                        → Read game recap article
                      </Link>
                    )}
                    {stats.generatedContent.includes('player-spotlight') && (
                      <Link to="/news" className="block hover:text-blue-900">
                        → Read player spotlight article
                      </Link>
                    )}
                    {stats.generatedContent.includes('recruiting-update') && (
                      <Link to="/news" className="block hover:text-blue-900">
                        → Read recruiting news update
                      </Link>
                    )}
                    {stats.generatedContent.includes('ranking-analysis') && (
                      <Link to="/news" className="block hover:text-blue-900">
                        → Read ranking analysis
                      </Link>
                    )}
                  </div>
                </>
              )}
              
              {/* If no content was generated, don't mislead the user */}
              {stats.generatedContent.length === 0 && (
                <p className="text-xs text-gray-500 italic mt-3">
                  No AI content triggers met for this import
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                onClose();
                // Navigate to import page to add more
                window.location.href = '/import';
              }}
              className="btn-secondary"
            >
              Import More
            </button>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}