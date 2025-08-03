import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAISettingsStore } from '../stores/aiSettingsStore';
import { useTeamStore } from '../stores/teamStore';
import { useGameStore } from '../stores/gameStore';
import { useSeasonStore } from '../stores/seasonStore';

export const AISettings: React.FC = () => {
  const settings = useAISettingsStore(state => state.settings);
  const updateExtendedCoverage = useAISettingsStore(state => state.updateExtendedCoverage);
  const updateSmartFeatures = useAISettingsStore(state => state.updateSmartFeatures);
  const setTeamSpecificSetting = useAISettingsStore(state => state.setTeamSpecificSetting);
  const removeTeamSpecificSetting = useAISettingsStore(state => state.removeTeamSpecificSetting);
  
  const userTeamId = useTeamStore(state => state.userTeamId);
  const teams = useTeamStore(state => state.teams);
  const games = useGameStore(state => state.games);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  
  // Derive values to avoid infinite loops
  const userTeam = useMemo(() => teams.find(t => t.id === userTeamId), [teams, userTeamId]);
  const rivals = useMemo(() => teams.filter(t => t.isRival), [teams]);
  
  const [showTeamOverrides, setShowTeamOverrides] = useState(false);
  const [selectedConference, setSelectedConference] = useState<string>('all');
  const [autoApprove, setAutoApprove] = useState(() => {
    return localStorage.getItem('dynastylab-auto-approve') === 'true';
  });
  
  // Get upcoming opponents
  const upcomingGames = games
    .filter(g => new Date(g.date) > new Date())
    .slice(0, 5);
  const upcomingOpponents = upcomingGames.map(g => g.opponent);
  
  // Get unique conferences
  const conferences = [...new Set(teams.map(t => t.conference))].sort();
  
  // Filter teams by conference
  const filteredTeams = selectedConference === 'all' 
    ? teams 
    : teams.filter(t => t.conference === selectedConference);
    
  const isTeamRanked = currentSeason?.ranking !== undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-2xl font-bold text-primary-800 mb-6">AI Content Settings</h2>
        
        {/* Core Content Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-secondary-800 mb-3">
            My Team Content 
            {userTeam && (
              <span className="ml-2 text-sm font-normal text-[var(--team-primary)]">
                ({userTeam.name})
              </span>
            )}
          </h3>
          <p className="text-sm text-secondary-600 mb-4">
            These features are always enabled for your team to ensure the best experience
          </p>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 text-secondary-700">
              <input type="checkbox" checked disabled className="w-4 h-4 text-primary-600 rounded" />
              <span>Game Recaps & Analysis</span>
            </label>
            <label className="flex items-center space-x-3 text-secondary-700">
              <input type="checkbox" checked disabled className="w-4 h-4 text-primary-600 rounded" />
              <span>Recruiting News & Updates</span>
            </label>
            <label className="flex items-center space-x-3 text-secondary-700">
              <input type="checkbox" checked disabled className="w-4 h-4 text-primary-600 rounded" />
              <span>Season Analysis & Commentary</span>
            </label>
          </div>
        </div>

        {/* Extended Coverage Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-secondary-800 mb-3">Extended Coverage</h3>
          <p className="text-sm text-secondary-600 mb-4">
            Control what additional content is generated beyond your team
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.extendedCoverage.rivalTeamNews}
                  onChange={(e) => updateExtendedCoverage('rivalTeamNews', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Rival Team News</span>
                  <p className="text-xs text-secondary-600">Generate content for your rivals ({rivals.length} teams)</p>
                </div>
              </div>
              {rivals.length > 0 && (
                <span className="text-xs text-secondary-500">
                  {rivals.map(r => r.name).join(', ')}
                </span>
              )}
            </label>
            
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.extendedCoverage.conferenceRoundups}
                  onChange={(e) => updateExtendedCoverage('conferenceRoundups', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Conference Roundups</span>
                  <p className="text-xs text-secondary-600">Weekly {userTeam?.conference || 'conference'} news and standings</p>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.extendedCoverage.nationalStorylines}
                  onChange={(e) => updateExtendedCoverage('nationalStorylines', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">National Storylines</span>
                  <p className="text-xs text-secondary-600">Top 25 rankings, playoff race, major upsets</p>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.extendedCoverage.opponentPreviews}
                  onChange={(e) => updateExtendedCoverage('opponentPreviews', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Opponent Previews</span>
                  <p className="text-xs text-secondary-600">Scouting reports for upcoming games</p>
                </div>
              </div>
              {upcomingOpponents.length > 0 && (
                <span className="text-xs text-secondary-500">
                  Next: {upcomingOpponents[0]}
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Smart Features Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-secondary-800 mb-3">Smart Features</h3>
          <p className="text-sm text-secondary-600 mb-4">
            Automatically adjust content based on your season context
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.smartFeatures.autoEnableOpponentContent}
                  onChange={(e) => updateSmartFeatures('autoEnableOpponentContent', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Auto-Enable Opponent Content</span>
                  <p className="text-xs text-secondary-600">Generate content for teams you're about to play</p>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.smartFeatures.autoEnableRankingContent}
                  onChange={(e) => updateSmartFeatures('autoEnableRankingContent', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Ranking-Based Content</span>
                  <p className="text-xs text-secondary-600">
                    More national coverage when ranked
                    {isTeamRanked && <span className="text-[var(--team-primary)]"> (Currently #{currentSeason?.ranking})</span>}
                  </p>
                </div>
              </div>
            </label>
            
            <label className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={settings.smartFeatures.autoEnablePlayoffContent}
                  onChange={(e) => updateSmartFeatures('autoEnablePlayoffContent', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="font-medium text-secondary-800">Playoff Race Coverage</span>
                  <p className="text-xs text-secondary-600">Enhanced coverage during playoff contention</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Team-Specific Overrides */}
        <div>
          <button
            onClick={() => setShowTeamOverrides(!showTeamOverrides)}
            className="flex items-center justify-between w-full p-3 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors"
          >
            <span className="font-medium text-secondary-800">
              Team-Specific Overrides ({Object.keys(settings.teamSpecificSettings).length})
            </span>
            <span className="text-secondary-600">
              {showTeamOverrides ? '−' : '+'}
            </span>
          </button>
          
          {showTeamOverrides && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm text-secondary-600">Filter by conference:</label>
                <select
                  value={selectedConference}
                  onChange={(e) => setSelectedConference(e.target.value)}
                  className="input input-sm"
                >
                  <option value="all">All Conferences</option>
                  {conferences.map(conf => (
                    <option key={conf} value={conf}>{conf}</option>
                  ))}
                </select>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredTeams.map(team => {
                  const isUserTeam = team.id === userTeam?.id;
                  const hasOverride = !!settings.teamSpecificSettings[team.id];
                  const isEnabled = hasOverride && settings.teamSpecificSettings[team.id].generateContent;
                  
                  return (
                    <div 
                      key={team.id} 
                      className={`p-2 rounded border ${
                        isUserTeam ? 'border-[var(--team-primary)] bg-[var(--team-primary)]/5' : 
                        hasOverride ? 'border-secondary-300 bg-secondary-50' : 
                        'border-secondary-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isUserTeam || isEnabled}
                            disabled={isUserTeam}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTeamSpecificSetting(team.id, true);
                              } else {
                                removeTeamSpecificSetting(team.id);
                              }
                            }}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm font-medium">{team.name}</span>
                          <span className="text-xs text-secondary-500">{team.conference}</span>
                        </div>
                        {isUserTeam && (
                          <span className="text-xs text-[var(--team-primary)] font-medium">Your Team</span>
                        )}
                        {team.isRival && (
                          <span className="text-xs text-error font-medium">Rival</span>
                        )}
                        {upcomingOpponents.includes(team.name) && (
                          <span className="text-xs text-warning font-medium">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-secondary-200 p-4">
        <h3 className="text-sm font-semibold text-secondary-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              rivals.forEach(rival => setTeamSpecificSetting(rival.id, true));
            }}
            className="btn btn-secondary btn-xs"
          >
            Enable All Rivals
          </button>
          <button
            onClick={() => {
              const conferenceTeams = teams.filter(t => t.conference === userTeam?.conference && t.id !== userTeam?.id);
              conferenceTeams.forEach(team => setTeamSpecificSetting(team.id, true));
            }}
            className="btn btn-secondary btn-xs"
          >
            Enable Conference Teams
          </button>
          <button
            onClick={() => {
              Object.keys(settings.teamSpecificSettings).forEach(teamId => {
                if (teamId !== userTeam?.id) {
                  removeTeamSpecificSetting(teamId);
                }
              });
            }}
            className="btn btn-secondary btn-xs"
          >
            Clear All Overrides
          </button>
        </div>
      </div>

      {/* Import Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">📸</span>
          Import Settings
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => {
                const newValue = e.target.checked;
                setAutoApprove(newValue);
                localStorage.setItem('dynastylab-auto-approve', newValue.toString());
              }}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium">Auto-approve screenshot imports</div>
              <p className="text-sm text-gray-600 mt-1">
                Skip the review step and automatically import data from screenshots. 
                You can always review extracted data in the Import Data page before processing.
              </p>
            </div>
          </label>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> When disabled, you'll be able to review all extracted data 
              before it's imported into your dynasty. This is recommended when first using the 
              screenshot import feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};