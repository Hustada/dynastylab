import React, { useState } from 'react';
import { useTeamStore } from '../stores/teamStore';
import { useGameStore } from '../stores/gameStore';
import { useRecruitStore } from '../stores/recruitStore';
import { useSeasonStore } from '../stores/seasonStore';
import { 
  generateSportsArticle, 
  generateTickerItem, 
  generateCoachingDiscussion,
  generateRecruitingPost,
  generateForumResponse,
  generateArticleImage 
} from '../services/OpenAIService';

export function AIFeatureTest() {
  const getUserTeam = useTeamStore(state => state.getUserTeam);
  const userTeam = getUserTeam();
  const games = useGameStore(state => state.games);
  const recruits = useRecruitStore(state => state.recruits);
  const currentSeason = useSeasonStore(state => state.currentSeason);
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ [key: string]: string }>({});
  
  const runTest = async (testName: string, testFn: () => Promise<string>) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: `Error: ${error}` }));
    }
    setIsLoading(false);
  };
  
  if (!userTeam) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">AI Feature Test</h2>
        <p className="text-red-600">Please select a team to test AI features.</p>
      </div>
    );
  }
  
  // Create a mock season if none exists for testing
  const testSeason = currentSeason || {
    id: 'test-season',
    year: 2024,
    teamName: userTeam.name,
    conference: userTeam.conference,
    games: [],
    conferenceRecord: { wins: 0, losses: 0 },
    overallRecord: { wins: 0, losses: 0 },
    ranking: null,
    coachId: 'test-coach',
    captains: [],
    preseasonGoals: []
  };
  
  const lastGame = games.filter(g => g.teamId === userTeam.id).slice(-1)[0] || {
    id: 'mock-game',
    teamId: userTeam.id,
    seasonId: testSeason.id,
    week: 1,
    opponent: 'Mock State',
    location: 'Home',
    score: { for: 31, against: 24 },
    result: 'W' as const,
    stats: {
      passingYards: 285,
      rushingYards: 156,
      turnovers: 1
    }
  };
  
  const recentCommits = recruits.filter(r => r.status === 'Committed').slice(-3).length > 0 
    ? recruits.filter(r => r.status === 'Committed').slice(-3)
    : [{
        id: 'mock-recruit',
        name: 'John Smith',
        position: 'QB',
        stars: 4,
        hometown: 'Miami',
        state: 'FL',
        status: 'Committed' as const
      }];
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">AI Feature Test Suite</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm">
          <strong>Current Team:</strong> {userTeam.name} {userTeam.mascot}<br />
          <strong>Record:</strong> {testSeason.overallRecord.wins}-{testSeason.overallRecord.losses}<br />
          <strong>Last Game:</strong> {lastGame.result} vs {lastGame.opponent} ({lastGame.score.for}-{lastGame.score.against})
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Test 1: Sports Article */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">1. Generate Sports Article</h3>
          <p className="text-sm text-gray-600 mb-2">Tests article generation with different writer personalities</p>
          <button
            onClick={() => runTest('article', async () => {
              if (!lastGame) return 'No games available to write about';
              return await generateSportsArticle(lastGame, userTeam, 'analytical', 'Sam Analytics');
            })}
            disabled={isLoading || !lastGame}
            className="btn-primary"
          >
            Generate Article
          </button>
          {results.article && (
            <div className="mt-4 p-4 bg-gray-50 rounded max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{results.article}</pre>
            </div>
          )}
        </div>
        
        {/* Test 2: News Ticker */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">2. Generate News Ticker Item</h3>
          <p className="text-sm text-gray-600 mb-2">Tests breaking news generation</p>
          <button
            onClick={() => runTest('ticker', async () => {
              return await generateTickerItem(userTeam, games.filter(g => g.teamId === userTeam.id), recruits, testSeason);
            })}
            disabled={isLoading}
            className="btn-primary"
          >
            Generate Ticker
          </button>
          {results.ticker && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm font-semibold">BREAKING: {results.ticker}</p>
            </div>
          )}
        </div>
        
        {/* Test 3: Forum Response */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">3. Generate Forum Response</h3>
          <p className="text-sm text-gray-600 mb-2">Tests AI fan responses with different archetypes</p>
          <button
            onClick={() => runTest('forum', async () => {
              const response = await generateForumResponse(
                "What do you think about our chances this season?",
                "Season Predictions Thread",
                userTeam,
                'eternal-optimist',
                games.filter(g => g.teamId === userTeam.id).slice(-5)
              );
              return response.content;
            })}
            disabled={isLoading}
            className="btn-primary"
          >
            Generate Response
          </button>
          {results.forum && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm"><strong>Eternal Optimist:</strong> {results.forum}</p>
            </div>
          )}
        </div>
        
        {/* Test 4: Coaching Discussion */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">4. Generate Coaching Discussion</h3>
          <p className="text-sm text-gray-600 mb-2">Tests hot seat and coaching commentary</p>
          <button
            onClick={() => runTest('coaching', async () => {
              const record = `${testSeason.overallRecord.wins}-${testSeason.overallRecord.losses}`;
              return await generateCoachingDiscussion(
                'Coach Smith',
                record,
                testSeason.overallRecord.losses > 6,
                userTeam,
                games.filter(g => g.teamId === userTeam.id).slice(-5)
              );
            })}
            disabled={isLoading}
            className="btn-primary"
          >
            Generate Discussion
          </button>
          {results.coaching && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <pre className="whitespace-pre-wrap text-sm">{results.coaching}</pre>
            </div>
          )}
        </div>
        
        {/* Test 5: Recruiting Post */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">5. Generate Recruiting Post</h3>
          <p className="text-sm text-gray-600 mb-2">Tests recruiting excitement posts</p>
          <button
            onClick={() => runTest('recruiting', async () => {
              const recruit = recentCommits[0] || {
                name: 'John Doe',
                stars: 4,
                position: 'QB',
                hometown: 'Austin',
                state: 'TX',
                status: 'Considering' as const
              };
              return await generateRecruitingPost(recruit, userTeam, recentCommits.length);
            })}
            disabled={isLoading}
            className="btn-primary"
          >
            Generate Post
          </button>
          {results.recruiting && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <pre className="whitespace-pre-wrap text-sm">{results.recruiting}</pre>
            </div>
          )}
        </div>
        
        {/* Test 6: Article Image */}
        <div className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">6. Generate Article Image</h3>
          <p className="text-sm text-gray-600 mb-2">Tests DALL-E image generation</p>
          <button
            onClick={() => runTest('image', async () => {
              const imageUrl = await generateArticleImage(
                `${userTeam.name} ${userTeam.mascot} football team celebrating victory, college football stadium`
              );
              return imageUrl || 'Failed to generate image';
            })}
            disabled={isLoading}
            className="btn-primary"
          >
            Generate Image
          </button>
          {results.image && results.image !== 'Failed to generate image' && (
            <div className="mt-4">
              <img src={results.image} alt="Generated article" className="max-w-full rounded" />
            </div>
          )}
          {results.image === 'Failed to generate image' && (
            <div className="mt-4 p-4 bg-red-50 rounded">
              <p className="text-sm text-red-600">{results.image}</p>
            </div>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg">Generating AI content...</p>
          </div>
        </div>
      )}
    </div>
  );
}