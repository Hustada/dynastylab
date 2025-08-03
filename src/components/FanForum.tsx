import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useRecruitStore } from '../stores/recruitStore';
import { useSeasonStore } from '../stores/seasonStore';
import { useTeamStore } from '../stores/teamStore';
import { useCoachStore } from '../stores/coachStore';
import { usePlayerStore } from '../stores/playerStore';
import { generateForumPosts, getForumName, generateForumUsername, type ForumPost } from '../utils/AIContentGenerator';
import type { Game, Team } from '../types/index';
import { ThreadRow } from './ThreadRow';
import { useAISettingsStore } from '../stores/aiSettingsStore';
import { filterTeamsByAISettings } from '../utils/aiContextDetection';
import { Link } from 'react-router-dom';
import { generateForumResponse } from '../services/OpenAIService';

interface ForumThread extends ForumPost {
  posts: ForumReply[];
}

interface ForumReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isUserPost?: boolean;
  parentId?: string;
  replies?: ForumReply[];
  depth?: number;
}

interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  onlineUsers: number;
  registeredUsers: number;
}

export const FanForum: React.FC = () => {
  const games = useGameStore(state => state.games);
  const recruits = useRecruitStore(state => state.recruits);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const userTeam = useTeamStore(state => state.getUserTeam());
  const coaches = useCoachStore(state => state.coaches);
  const players = usePlayerStore(state => state.players);
  const teams = useTeamStore(state => state.teams);
  const { settings } = useAISettingsStore();
  
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [userReply, setUserReply] = useState('');
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'replies' | 'views'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [threadPage, setThreadPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<ForumReply | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState<ForumPost['category']>('general');
  const postsPerPage = 20;
  const [forumStats, setForumStats] = useState<ForumStats>({
    totalThreads: 0,
    totalPosts: 0,
    onlineUsers: Math.floor(Math.random() * 200) + 50,
    registeredUsers: Math.floor(Math.random() * 5000) + 10000
  });
  
  // Add state for selected forum team
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Generate initial forum posts
  const generatedPosts = useMemo(() => {
    if (!currentSeason || !selectedTeam || coaches.length === 0) return [];
    
    // Check if this team should have AI-generated content
    const aiSettings = useAISettingsStore.getState();
    const shouldGenerateContent = aiSettings.shouldGenerateContentForTeam(
      selectedTeam.id,
      userTeam?.id || null,
      selectedTeam.isRival,
      games.some(g => g.opponent === selectedTeam.name && new Date(g.date) > new Date()),
      currentSeason.ranking !== undefined
    );
    
    if (!shouldGenerateContent) {
      return []; // Forum exists but no AI content
    }
    
    const seasonGames = games.filter(g => currentSeason.games.includes(g.id));
    return generateForumPosts(seasonGames, recruits, currentSeason, selectedTeam, coaches[0], players);
  }, [games, recruits, currentSeason, selectedTeam, userTeam, coaches, players]);
  
  // Initialize forum threads with generated posts
  useEffect(() => {
    const threads = generatedPosts.map(post => ({
      ...post,
      posts: generateInitialReplies(post, userTeam!)
    }));
    setForumThreads(threads);
    
    // Update forum stats
    const totalPosts = threads.reduce((sum, t) => sum + t.replies + 1, 0);
    setForumStats(prev => ({
      ...prev,
      totalThreads: threads.length,
      totalPosts
    }));
  }, [generatedPosts, userTeam]);
  
  // Update forum activity when game data changes
  useEffect(() => {
    if (forumThreads.length > 0 && games.length > 0) {
      const latestGame = games[games.length - 1];
      const gameThread = forumThreads.find(t => t.category === 'game-thread');
      
      if (gameThread && !gameThread.posts.some(p => p.content.includes(latestGame.opponent))) {
        // Add new AI responses about the latest game
        const newReplies = generateGameReactions(latestGame, userTeam!);
        setForumThreads(threads => 
          threads.map(t => 
            t.id === gameThread.id 
              ? { ...t, posts: [...t.posts, ...newReplies], replies: t.replies + newReplies.length }
              : t
          )
        );
      }
    }
  }, [games, forumThreads, userTeam]);
  
  // Handle creating a new thread
  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim() || !userTeam) return;
    
    const newThread: ForumThread = {
      id: `thread-user-${Date.now()}`,
      title: newThreadTitle,
      author: 'You',
      content: newThreadContent,
      replies: 0,
      views: 1,
      lastActivity: 'Just now',
      category: newThreadCategory,
      isPinned: false,
      posts: []
    };
    
    // Add the new thread
    setForumThreads(prev => [newThread, ...prev]);
    
    // Update forum stats
    setForumStats(prev => ({
      ...prev,
      totalThreads: prev.totalThreads + 1,
      totalPosts: prev.totalPosts + 1
    }));
    
    // Clear form and close modal
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadCategory('general');
    setShowNewThreadModal(false);
    
    // Generate AI responses to the new thread after a delay
    setTimeout(async () => {
      const responses = await generateInitialThreadResponses(newThread, userTeam);
      if (responses.length > 0) {
        setForumThreads(threads => 
          threads.map(t => t.id === newThread.id 
            ? { ...t, posts: responses, replies: responses.length }
            : t
          )
        );
      }
    }, Math.random() * 5000 + 3000); // 3-8 seconds delay
  };
  
  const handlePostReply = (parentReply?: ForumReply) => {
    const content = parentReply ? nestedReplyContent : userReply;
    if (!selectedThread || !content.trim() || !userTeam) return;
    
    const newUserPost: ForumReply = {
      id: `reply-${Date.now()}`,
      author: 'You',
      content: parentReply ? `@${parentReply.author} ${content}` : content,
      timestamp: 'Just now',
      likes: 0,
      isUserPost: true,
      parentId: parentReply?.id,
      depth: (parentReply?.depth || 0) + 1
    };
    
    // Update the thread with user's reply
    let updatedPosts = [...selectedThread.posts];
    
    if (parentReply) {
      // Add nested reply
      updatedPosts = addNestedReply(updatedPosts, parentReply.id, newUserPost);
    } else {
      // Add top-level reply
      updatedPosts.push(newUserPost);
    }
    
    const updatedThread = {
      ...selectedThread,
      posts: updatedPosts,
      replies: selectedThread.replies + 1,
      lastActivity: 'Just now'
    };
    
    setSelectedThread(updatedThread);
    setForumThreads(threads => 
      threads.map(t => t.id === selectedThread.id ? updatedThread : t)
    );
    
    // Generate AI responses based on user's post
    setTimeout(async () => {
      const aiResponses = await generateAIResponses(content, selectedThread, userTeam, parentReply);
      if (aiResponses.length > 0) {
        let postsWithResponses = [...updatedThread.posts];
        
        aiResponses.forEach(response => {
          if (parentReply) {
            // Add AI responses as nested replies
            postsWithResponses = addNestedReply(postsWithResponses, parentReply.id, response);
          } else {
            // Sometimes AI responds to the user's top-level post
            if (Math.random() > 0.5 && newUserPost) {
              response.parentId = newUserPost.id;
              response.depth = 1;
              response.content = `@You ${response.content}`;
            }
            postsWithResponses.push(response);
          }
        });
        
        const threadWithResponses = {
          ...updatedThread,
          posts: postsWithResponses,
          replies: updatedThread.replies + aiResponses.length,
          lastActivity: 'Just now'
        };
        
        setSelectedThread(threadWithResponses);
        setForumThreads(threads => 
          threads.map(t => t.id === selectedThread.id ? threadWithResponses : t)
        );
      }
    }, Math.random() * 3000 + 2000); // Random delay 2-5 seconds
    
    if (parentReply) {
      setNestedReplyContent('');
      setReplyingTo(null);
    } else {
      setUserReply('');
    }
  };
  
  // Initialize selected team to user team
  useEffect(() => {
    if (userTeam && !selectedTeam) {
      setSelectedTeam(userTeam);
    }
  }, [userTeam, selectedTeam]);
  
  const forumName = selectedTeam ? getForumName(selectedTeam) : 'Fan Forum';
  
  // Helper function to add nested reply
  const addNestedReply = (posts: ForumReply[], parentId: string, newReply: ForumReply): ForumReply[] => {
    return posts.map(post => {
      if (post.id === parentId) {
        return {
          ...post,
          replies: [...(post.replies || []), newReply]
        };
      } else if (post.replies) {
        return {
          ...post,
          replies: addNestedReply(post.replies, parentId, newReply)
        };
      }
      return post;
    });
  };
  
  // Render replies recursively
  const renderReplies = (replies: ForumReply[], allPosts: ForumReply[], depth = 0): JSX.Element[] => {
    return replies.map(post => {
      const nestedReplies = allPosts.filter(p => p.parentId === post.id);
      const isReplying = replyingTo?.id === post.id;
      
      return (
        <div key={post.id}>
          <div 
            className={`border-l-2 ${post.isUserPost ? 'border-[var(--team-primary)]' : 'border-secondary-200'} pl-4 ${depth > 0 ? `ml-${Math.min(depth * 8, 24)}` : ''}`}
            style={depth > 0 ? { marginLeft: `${Math.min(depth * 2, 6)}rem` } : {}}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-[var(--team-primary)]">
                  {post.author}
                  {post.isUserPost && <span className="ml-2 text-xs text-[var(--team-secondary)]">(You)</span>}
                </p>
                <p className="text-xs text-secondary-500">{post.timestamp}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setReplyingTo(isReplying ? null : post)}
                  className="text-xs text-secondary-500 hover:text-[var(--team-primary)]"
                >
                  Reply
                </button>
                <button className="text-xs text-secondary-500 hover:text-[var(--team-primary)]">
                  👍 {post.likes > 0 && post.likes}
                </button>
              </div>
            </div>
            <p className="text-secondary-700 mb-2">{post.content}</p>
            
            {/* Inline reply form */}
            {isReplying && (
              <div className="mt-3 mb-3 bg-secondary-50 p-3 rounded">
                <textarea
                  className="input h-16 resize-none mb-2 text-sm"
                  placeholder={`Reply to ${post.author}...`}
                  value={nestedReplyContent}
                  onChange={(e) => setNestedReplyContent(e.target.value)}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePostReply(post)}
                    disabled={!nestedReplyContent.trim()}
                    className="btn bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white btn-xs"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setNestedReplyContent('');
                    }}
                    className="btn btn-ghost btn-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Render nested replies */}
          {nestedReplies.length > 0 && (
            <div className="mt-2">
              {renderReplies(nestedReplies, allPosts, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Group teams by conference for easier selection
  const teamsByConference = useMemo(() => {
    const grouped: Record<string, Team[]> = {};
    teams.forEach(team => {
      if (!grouped[team.conference]) {
        grouped[team.conference] = [];
      }
      grouped[team.conference].push(team);
    });
    return grouped;
  }, [teams]);
  
  // Sort threads based on selected option
  const sortedThreads = useMemo(() => {
    const sorted = [...forumThreads];
    switch (sortBy) {
      case 'replies':
        return sorted.sort((a, b) => b.replies - a.replies);
      case 'views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'latest':
      default:
        return sorted; // Already sorted by latest activity
    }
  }, [forumThreads, sortBy]);
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Team Selector */}
      <div className="bg-white rounded-t-lg border border-secondary-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-secondary-700">Select Forum:</label>
            <select
              value={selectedTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                setSelectedTeam(team || null);
                setCurrentPage(1);
                setSelectedThread(null);
              }}
              className="input input-sm w-64"
            >
              <option value="">Choose a team...</option>
              {Object.entries(teamsByConference).map(([conference, confTeams]) => (
                <optgroup key={conference} label={conference}>
                  {confTeams.sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.id === userTeam?.id ? '(Your Team)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {selectedTeam && !generatedPosts.length && (
            <span className="text-sm text-secondary-500">
              AI content not enabled for this team. <Link to="/ai-settings" className="text-[var(--team-primary)] hover:underline">Enable in settings</Link>
            </span>
          )}
        </div>
      </div>
      
      {selectedTeam ? (
        <>
          {/* Forum Header */}
          <div className="bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] text-white p-6 shadow-lg">
            <h1 className="text-3xl font-bold mb-2 drop-shadow-md">
              {forumName}
            </h1>
            <p className="text-white/90">
              The premier {selectedTeam.mascot} community • Est. 1998
            </p>
          </div>
      
      {/* Forum Stats Bar */}
      <div className="bg-white border-x border-b border-secondary-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6 text-sm">
            <span className="text-secondary-600">
              <strong className="text-[var(--team-primary)]">{forumStats.totalThreads.toLocaleString()}</strong> Threads
            </span>
            <span className="text-secondary-600">
              <strong className="text-[var(--team-primary)]">{forumStats.totalPosts.toLocaleString()}</strong> Posts
            </span>
            <span className="text-secondary-600">
              <strong className="text-[var(--team-primary)]">{forumStats.registeredUsers.toLocaleString()}</strong> Members
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600">● {forumStats.onlineUsers} Online</span>
          </div>
        </div>
      </div>
      
      {/* Thread List or Thread View */}
      {!selectedThread ? (
        <div className="bg-white border-x border-b border-secondary-200 rounded-b-lg">
          {/* Action Bar */}
          <div className="border-b border-secondary-200 p-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setShowNewThreadModal(true)}
                className="btn bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white btn-sm"
              >
                + New Thread
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-secondary-600">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="select select-sm"
                >
                  <option value="latest">Latest Activity</option>
                  <option value="replies">Most Replies</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Pinned Threads */}
          {sortedThreads.filter(t => t.isPinned).length > 0 && (
            <div className="border-b border-secondary-200">
              <div className="px-4 py-2 bg-secondary-50">
                <span className="text-xs font-semibold text-secondary-600 uppercase">Pinned</span>
              </div>
              {sortedThreads.filter(t => t.isPinned).map(thread => (
                <ThreadRow key={thread.id} thread={thread} onClick={() => setSelectedThread(thread)} />
              ))}
            </div>
          )}
          
          {/* Regular Threads */}
          <div>
            {sortedThreads.filter(t => !t.isPinned).map(thread => (
              <ThreadRow key={thread.id} thread={thread} onClick={() => setSelectedThread(thread)} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-secondary-200 flex justify-between items-center">
            <div className="text-sm text-secondary-600">
              Showing 1-{sortedThreads.length} of {sortedThreads.length} threads
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-secondary" disabled>Previous</button>
              <button className="btn btn-sm btn-secondary" disabled>Next</button>
            </div>
          </div>
        </div>
      ) : (
        /* Thread Detail View */
        <div className="card p-6">
          <button
            onClick={() => setSelectedThread(null)}
            className="btn btn-ghost btn-sm mb-6"
          >
            ← Back to Forum
          </button>
          
          {/* Thread Header */}
          <div className="border-b border-secondary-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-[var(--team-primary)] mb-2">
              {selectedThread.title}
            </h2>
            <div className="flex items-center text-sm text-secondary-500 space-x-4">
              <span>{selectedThread.replies} replies</span>
              <span>{selectedThread.views} views</span>
            </div>
          </div>
          
          {/* Original Post */}
          <div className="bg-secondary-50 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-[var(--team-primary)]">{selectedThread.author}</p>
                <p className="text-xs text-secondary-500">Original Poster</p>
              </div>
              <span className="text-xs text-secondary-500">{selectedThread.lastActivity}</span>
            </div>
            <p className="text-secondary-700">{selectedThread.content}</p>
          </div>
          
          {/* Pagination Info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-secondary-600">
              Showing {((threadPage - 1) * postsPerPage) + 1}-{Math.min(threadPage * postsPerPage, selectedThread.posts.length)} of {selectedThread.posts.length} replies
            </p>
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(selectedThread.posts.length / postsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setThreadPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    page === threadPage 
                      ? 'bg-[var(--team-primary)] text-white' 
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
          
          {/* Replies */}
          <div className="space-y-4 mb-6">
            {renderReplies(selectedThread.posts
              .slice((threadPage - 1) * postsPerPage, threadPage * postsPerPage)
              .filter(post => !post.parentId), // Only show top-level posts
              selectedThread.posts
            )}
          </div>
          
          {/* Reply Form */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="font-semibold text-[var(--team-primary)] mb-3">Post a Reply</h3>
            <textarea
              className="input h-24 resize-none mb-3"
              placeholder="Share your thoughts..."
              value={userReply}
              onChange={(e) => setUserReply(e.target.value)}
            />
            <button
              onClick={handlePostReply}
              disabled={!userReply.trim()}
              className="btn btn-primary btn-md"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}
      
      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-[var(--team-primary)] mb-4">Create New Thread</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Category
                </label>
                <select 
                  value={newThreadCategory}
                  onChange={(e) => setNewThreadCategory(e.target.value as ForumPost['category'])}
                  className="select w-full"
                >
                  <option value="general">General Discussion</option>
                  <option value="game-thread">Game Thread</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="coaching">Coaching</option>
                  <option value="off-topic">Off Topic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Thread Title
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter a descriptive title..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Post Content
                </label>
                <textarea
                  className="input h-32 resize-none w-full"
                  placeholder="What's on your mind?"
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewThreadModal(false);
                  setNewThreadTitle('');
                  setNewThreadContent('');
                  setNewThreadCategory('general');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                className="btn bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white"
              >
                Create Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="bg-white rounded-b-lg border-x border-b border-secondary-200 p-12 text-center">
      <p className="text-secondary-600">Select a team above to view their forum</p>
    </div>
  )}
    </div>
  );
};

// Helper functions for generating dynamic content
function generateInitialReplies(thread: ForumPost, team: Team): ForumReply[] {
  const replies: ForumReply[] = [];
  // Generate ALL replies as stated in the thread
  const replyCount = thread.replies;
  
  for (let i = 0; i < replyCount; i++) {
    const daysAgo = Math.floor(i / 10); // Spread replies over time
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    let timestamp: string;
    if (i < 3) { // Most recent replies
      timestamp = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    } else if (i < 10) {
      timestamp = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    } else {
      timestamp = `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    }
    
    replies.push({
      id: `reply-${thread.id}-${i}`,
      author: generateForumUsername(team, i + Math.floor(Math.random() * 100)),
      content: generateReplyContent(thread.category, thread.title, i),
      timestamp,
      likes: Math.floor(Math.random() * 50) * (i < 10 ? 1 : 0.5)
    });
  }
  
  return replies;
}

function generateReplyContent(category: string, threadTitle: string, index: number): string {
  const threadLower = threadTitle.toLowerCase();
  
  // Dynamic replies based on thread content
  if (category === 'game-thread') {
    if (threadLower.includes('domination') || threadLower.includes('destroyed')) {
      const blowoutWinReplies = [
        'Complete domination from start to finish!',
        'That\'s how you make a statement!',
        'Other teams better take notice.',
        'Most complete game we\'ve played all year.',
        'This is the team we expected to see!',
        'Playoff committee watching? 👀',
        'Keep playing like this and we\'re unstoppable.'
      ];
      return blowoutWinReplies[index % blowoutWinReplies.length];
    } else if (threadLower.includes('cardiac') || threadLower.includes('thrilling')) {
      const closeWinReplies = [
        'My heart is still racing! What a finish!',
        'These close games are aging me 10 years.',
        'Ugly wins count the same as pretty ones!',
        'Champions find ways to win these games.',
        'That\'s what separates good teams from great ones.',
        'I need a drink after that one... wow.',
        'Character win right there. Love this team!'
      ];
      return closeWinReplies[index % closeWinReplies.length];
    } else if (threadLower.includes('embarrassing') || threadLower.includes('pathetic')) {
      const blowoutLossReplies = [
        'Absolutely unacceptable performance.',
        'Someone needs to be held accountable for this.',
        'I\'ve seen enough. Changes need to be made.',
        'This is not the standard we expect.',
        'Worst game I\'ve seen in years.',
        'The other team wanted it more. Plain and simple.',
        'Back to the drawing board. This ain\'t it.'
      ];
      return blowoutLossReplies[index % blowoutLossReplies.length];
    } else if (threadLower.includes('gut-wrenching') || threadLower.includes('so close')) {
      const closeLossReplies = [
        'That one is going to sting for a while.',
        'We had our chances. Just couldn\'t finish.',
        'One or two plays away from winning that game.',
        'Proud of the effort, disappointed in the result.',
        'We\'ll bounce back. This team has heart.',
        'Learning experience for a young team.',
        'Credit to them, they made plays when it mattered.'
      ];
      return closeLossReplies[index % closeLossReplies.length];
    }
  } else if (category === 'recruiting' && threadLower.includes('commits')) {
    const commitReplies = [
      'BOOM! Love this pickup!',
      'Welcome to the family!',
      'This class is getting LOADED!',
      'Recruiting momentum is real!',
      'Trust the process! Great eval by the staff.',
      'Future is bright with kids like this!',
      'Championship recruiting right here!'
    ];
    return commitReplies[index % commitReplies.length];
  } else if (category === 'coaching' && threadLower.includes('hot seat')) {
    const hotSeatReplies = [
      'The clock is ticking...',
      'He\'s had enough time. Results matter.',
      'I\'m willing to give him one more year.',
      'Who would we even hire if we let him go?',
      'The buyout is too expensive right now.',
      'Players have quit on him. It\'s obvious.',
      'Administration needs to make a decision.'
    ];
    return hotSeatReplies[index % hotSeatReplies.length];
  } else if (category === 'general' && threadLower.includes('bowl')) {
    const bowlReplies = [
      'Bowl streak stays alive!',
      'Any bowl game is a good season.',
      'Let\'s aim higher than just a bowl.',
      'Extra practices will help the young guys.',
      'Momentum heading into next season!',
      'Bowl game = successful season in my book.',
      'Now let\'s finish strong!'
    ];
    return bowlReplies[index % bowlReplies.length];
  }
  
  // Default contextual replies
  const defaultReplies: Record<string, string[]> = {
    'game-thread': [
      'What a game! Proud of our guys.',
      'We need to clean up those mistakes.',
      'Defense played their hearts out.',
      'Offensive line was the difference today.',
      'Special teams need work, but we\'ll take the W.',
      'One game at a time. Stay focused.',
      'This team is growing every week.'
    ],
    'recruiting': [
      'In coaches we trust!',
      'Building something special here.',
      'Love the direction of this class.',
      'Competition breeds excellence.',
      'Can\'t wait to see these kids on campus.',
      'Recruiting wins championships.',
      'The future is bright!'
    ],
    'general': [
      'This season has been a rollercoaster.',
      'Proud to be a fan of this team.',
      'We\'re heading in the right direction.',
      'One game at a time, folks.',
      'The best is yet to come!',
      'Through thick and thin, I bleed our colors.',
      'Can\'t wait for next game!'
    ],
    'coaching': [
      'Coaches earned their paychecks today.',
      'Still some questionable play calls.',
      'Development has been impressive.',
      'Staff is doing more with less.',
      'Recruiting is picking up steam.',
      'In-game adjustments were key.',
      'Building a culture takes time.'
    ],
    'off-topic': [
      'Best fanbase in the country!',
      'See you all at the tailgate!',
      'Weather looks perfect for game day.',
      'Anyone selling extra tickets?',
      'Love this community!',
      'Game day can\'t come soon enough!',
      'Go team!'
    ]
  };
  
  const categoryReplies = defaultReplies[category] || defaultReplies['general'];
  return categoryReplies[index % categoryReplies.length];
}

function generateGameReactions(game: Game, team: Team): ForumReply[] {
  const reactions: ForumReply[] = [];
  const won = game.result === 'W';
  const close = Math.abs(game.score.for - game.score.against) <= 7;
  
  reactions.push({
    id: `reaction-${Date.now()}-1`,
    author: generateForumUsername(team, 20),
    content: won 
      ? `What a game! ${game.score.for}-${game.score.against} over ${game.opponent}. ${close ? 'My heart can\'t take these close ones!' : 'Total domination!'}`
      : `Tough loss to ${game.opponent}. ${close ? 'We were so close!' : 'We got outplayed today.'}`,
    timestamp: '10 minutes ago',
    likes: Math.floor(Math.random() * 20) + 5
  });
  
  if (game.stats.turnovers && game.stats.turnovers > 2) {
    reactions.push({
      id: `reaction-${Date.now()}-2`,
      author: generateForumUsername(team, 21),
      content: `${game.stats.turnovers} turnovers! You can't win games like that. Fundamentals!`,
      timestamp: '8 minutes ago',
      likes: Math.floor(Math.random() * 15) + 3
    });
  }
  
  return reactions;
}

async function generateAIResponses(userPost: string, thread: ForumThread, team: Team, parentReply?: ForumReply): Promise<ForumReply[]> {
  const responses: ForumReply[] = [];
  
  // Get recent games for context
  const games = useGameStore.getState().games;
  const recentGames = games.filter(g => g.teamId === team.id).slice(-5);
  
  // Decide how many responses (0-3)
  const responseCount = parentReply ? 
    (Math.random() > 0.6 ? 1 : 0) : 
    (userPost.includes('?') ? 2 : Math.random() > 0.5 ? 1 : 0);
  
  // Define fan archetypes
  const archetypes = ['eternal-optimist', 'stats-nerd', 'old-timer', 'doomer', 'reasonable'];
  
  for (let i = 0; i < responseCount; i++) {
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const threadContext = `${thread.title} - ${thread.snippet}`;
    
    try {
      const aiResponse = await generateForumResponse(
        userPost,
        threadContext,
        team,
        archetype,
        recentGames
      );
      
      const author = generateForumUsername(team, Math.floor(Math.random() * 50) + 30);
      
      responses.push({
        id: `ai-response-${Date.now()}-${i}`,
        author,
        content: aiResponse.content,
        timestamp: '1 minute ago',
        likes: 0,
        isUserPost: false,
        depth: parentReply ? (parentReply.depth || 0) + 1 : 0,
        parentId: parentReply?.id
      });
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Fallback to a simple response
      const author = generateForumUsername(team, Math.floor(Math.random() * 50) + 30);
      responses.push({
        id: `fallback-response-${Date.now()}-${i}`,
        author,
        content: 'Interesting take. What does everyone else think?',
        timestamp: '1 minute ago',
        likes: 0,
        isUserPost: false,
        depth: parentReply ? (parentReply.depth || 0) + 1 : 0,
        parentId: parentReply?.id
      });
    }
  }
  
  return responses;
}

// Generate initial responses to user-created threads
async function generateInitialThreadResponses(thread: ForumThread, team: Team): Promise<ForumReply[]> {
  const responses: ForumReply[] = [];
  const titleLower = thread.title.toLowerCase();
  const contentLower = thread.content.toLowerCase();
  
  // Determine response count based on thread content
  let responseCount = 0;
  
  // Hot topics get more responses
  if (thread.category === 'coaching' && (titleLower.includes('fire') || titleLower.includes('hot seat'))) {
    responseCount = Math.floor(Math.random() * 3) + 2; // 2-4 responses (reduced for API cost)
  } else if (thread.category === 'recruiting' && (titleLower.includes('commit') || titleLower.includes('5 star'))) {
    responseCount = Math.floor(Math.random() * 2) + 1; // 1-2 responses
  } else if (contentLower.includes('?')) {
    responseCount = 2; // 2 responses for questions
  } else {
    responseCount = 1; // 1 response for general
  }
  
  // Get recent games for context
  const games = useGameStore.getState().games;
  const recentGames = games.filter(g => g.teamId === team.id).slice(-5);
  
  // Define fan archetypes
  const archetypes = ['eternal-optimist', 'stats-nerd', 'old-timer', 'doomer', 'reasonable'];
  
  // Generate diverse responses
  for (let i = 0; i < responseCount; i++) {
    const delay = i * 10; // Stagger timestamps
    const author = generateForumUsername(team, Math.floor(Math.random() * 100));
    const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const threadContext = `${thread.title} - ${thread.content}`;
    
    try {
      const aiResponse = await generateForumResponse(
        thread.content,
        threadContext,
        team,
        archetype,
        recentGames
      );
      
      responses.push({
        id: `init-response-${Date.now()}-${i}`,
        author: author,
        content: aiResponse.content,
        timestamp: delay === 0 ? '2 minutes ago' : `${delay + 2} minutes ago`,
        likes: Math.floor(Math.random() * 15),
        isUserPost: false,
        depth: 0
      });
    } catch (error) {
      console.error('Failed to generate initial thread response:', error);
      // Fallback response
      responses.push({
        id: `init-fallback-${Date.now()}-${i}`,
        author: author,
        content: 'Great topic! Looking forward to the discussion.',
        timestamp: delay === 0 ? '2 minutes ago' : `${delay + 2} minutes ago`,
        likes: Math.floor(Math.random() * 15),
        isUserPost: false,
        depth: 0
      });
    }
  }
  
  return responses;
}