import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useRecruitStore } from '../stores/recruitStore';
import { useSeasonStore } from '../stores/seasonStore';
import { useTeamStore } from '../stores/teamStore';
import { usePlayerStore } from '../stores/playerStore';
import { generateNewsHeadlines, generateNewsTicker, newsWriters, type NewsArticle, type ArticleComment } from '../utils/AIContentGenerator';
import { aiService, fanArchetypes } from '../services/AIService';
import type { Game, Team, Season } from '../types/index';
import { useAISettingsStore } from '../stores/aiSettingsStore';
import { filterTeamsByAISettings } from '../utils/aiContextDetection';

export const NewsHub: React.FC = () => {
  const games = useGameStore(state => state.games);
  const recruits = useRecruitStore(state => state.recruits);
  const currentSeason = useSeasonStore(state => state.getCurrentSeason());
  const userTeam = useTeamStore(state => state.getUserTeam());
  const players = usePlayerStore(state => state.players);
  const teams = useTeamStore(state => state.teams);
  const { settings } = useAISettingsStore();
  
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate news articles
  useEffect(() => {
    const loadArticles = async () => {
      if (!currentSeason || !userTeam) {
        setNewsArticles([]);
        return;
      }
      
      setIsLoading(true);
      const seasonGames = games.filter(g => currentSeason.games.includes(g.id));
      
      // Get teams that should have AI content generated
      const aiActiveTeams = filterTeamsByAISettings(teams, userTeam.id, games, currentSeason);
      
      // Filter games to only include those involving AI-active teams
      const relevantGames = seasonGames.filter(game => {
        // Always include user team games
        if (game.opponent === userTeam.name) return true;
        
        // Check if opponent is AI-active
        const opponentTeam = teams.find(t => t.name === game.opponent);
        return opponentTeam && aiActiveTeams.some(t => t.id === opponentTeam.id);
      });
      
      // Filter recruits similarly
      const relevantRecruits = recruits.filter(recruit => {
        // Always include user team recruits
        if (recruit.status === 'Committed' && settings.coreContent.recruitingNews) return true;
        
        // For now, only show user team recruiting
        return false;
      });
      
      try {
        const articles = await generateNewsHeadlines(relevantGames, relevantRecruits, currentSeason, userTeam, players);
        setNewsArticles(articles);
      } catch (error) {
        console.error('Failed to generate articles:', error);
      }
      setIsLoading(false);
    };
    
    loadArticles();
  }, [games, recruits, currentSeason, userTeam, players, teams, settings]);
  
  // Generate ticker items
  useEffect(() => {
    const loadTicker = async () => {
      if (!currentSeason || !userTeam) {
        setTickerItems([]);
        return;
      }
      
      const seasonGames = games.filter(g => currentSeason.games.includes(g.id));
      try {
        const ticker = await generateNewsTicker(seasonGames, recruits, currentSeason, userTeam);
        setTickerItems(ticker);
      } catch (error) {
        console.error('Failed to generate ticker:', error);
      }
    };
    
    loadTicker();
  }, [games, recruits, currentSeason, userTeam]);
  
  const [selectedArticle, setSelectedArticle] = React.useState<NewsArticle | null>(null);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [articleComments, setArticleComments] = useState<Record<string, ArticleComment[]>>({});
  const [replyingTo, setReplyingTo] = useState<ArticleComment | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  
  // Rotate ticker items
  useEffect(() => {
    if (tickerItems.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [tickerItems]);
  
  // Handle comment posting
  const handlePostComment = async (article: NewsArticle, parentComment?: ArticleComment) => {
    const content = parentComment ? nestedReplyContent : userComment;
    if (!content.trim() || !userTeam) return;
    
    const newUserComment: ArticleComment = {
      id: `comment-${Date.now()}`,
      articleId: article.id,
      author: 'You',
      content: parentComment ? `@${parentComment.author} ${content}` : content,
      timestamp: 'Just now',
      likes: 0,
      isUserComment: true,
      parentId: parentComment?.id,
      depth: (parentComment?.depth || 0) + 1
    };
    
    // Add user comment immediately
    if (parentComment) {
      setArticleComments(prev => ({
        ...prev,
        [article.id]: addNestedComment(prev[article.id] || [], parentComment.id, newUserComment)
      }));
    } else {
      setArticleComments(prev => ({
        ...prev,
        [article.id]: [...(prev[article.id] || []), newUserComment]
      }));
    }
    
    // Clear input
    if (parentComment) {
      setNestedReplyContent('');
      setReplyingTo(null);
    } else {
      setUserComment('');
    }
    
    // Generate AI responses based on article context and user comment
    const seasonGames = games.filter(g => currentSeason?.games.includes(g.id) || false);
    if (currentSeason && seasonGames.length > 0) {
      setTimeout(async () => {
        const responses = await generateArticleCommentResponses(
          content,
          article,
          userTeam,
          seasonGames,
          currentSeason,
          parentComment
        );
        
        if (responses.length > 0) {
          responses.forEach(response => {
            if (parentComment) {
              setArticleComments(prev => ({
                ...prev,
                [article.id]: addNestedComment(prev[article.id] || [], parentComment.id, response)
              }));
            } else {
              // Sometimes have the article author respond
              if (Math.random() > 0.7 && !parentComment) {
                response.author = article.author;
                response.isAuthorComment = true;
                response.content = generateAuthorResponse(content, article, userTeam);
              }
              setArticleComments(prev => ({
                ...prev,
                [article.id]: [...(prev[article.id] || []), response]
              }));
            }
          });
        }
      }, Math.random() * 3000 + 2000); // 2-5 seconds delay
    }
  };
  
  // Generate AI comment responses
  const generateArticleCommentResponses = async (
    userComment: string,
    article: NewsArticle,
    team: Team,
    recentGames: Game[],
    season: Season,
    parentComment?: ArticleComment
  ): Promise<ArticleComment[]> => {
    const responses: ArticleComment[] = [];
    const commentLower = userComment.toLowerCase();
    
    // Determine response likelihood based on article type and comment
    const responseCount = Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
    
    if (responseCount === 0) return responses;
    
    // Generate appropriate responses based on article context
    const result = await aiService.generateForumResponses(
      userComment,
      { // Create a pseudo-thread from the article
        id: article.id,
        title: article.headline,
        author: article.author,
        content: article.content,
        replies: 0,
        views: 0,
        lastActivity: 'now',
        category: article.type === 'game-recap' ? 'game-thread' : 
                  article.type === 'recruiting' ? 'recruiting' : 'general'
      },
      [],
      team,
      recentGames,
      season
    );
    
    result.responses.slice(0, responseCount).forEach((resp: any) => {
      responses.push({
        id: `comment-${Date.now()}-${Math.random()}`,
        articleId: article.id,
        author: resp.author,
        archetype: resp.archetype,
        content: parentComment ? `@${parentComment.author} ${resp.content}` : resp.content,
        timestamp: 'Just now',
        likes: Math.floor(Math.random() * 10),
        parentId: parentComment?.id,
        depth: parentComment ? (parentComment.depth || 0) + 1 : 0
      });
    });
    
    return responses;
  };
  
  // Helper function to add nested comment
  const addNestedComment = (comments: ArticleComment[], parentId: string, newComment: ArticleComment): ArticleComment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        };
      } else if (comment.replies) {
        return {
          ...comment,
          replies: addNestedComment(comment.replies, parentId, newComment)
        };
      }
      return comment;
    });
  };
  
  // Generate author response
  const generateAuthorResponse = (userComment: string, article: NewsArticle, team: Team): string => {
    const writer = newsWriters.find(w => w.name === article.author);
    const commentLower = userComment.toLowerCase();
    
    if (writer?.personality === 'enthusiastic' && (commentLower.includes('great') || commentLower.includes('love'))) {
      return `Thanks for reading! Glad you enjoyed the piece. ${team.mascot} nation is the best!`;
    } else if (writer?.personality === 'critical' && commentLower.includes('disagree')) {
      return `I appreciate the feedback, but the numbers don't lie. Time will tell if I'm right.`;
    } else if (writer?.personality === 'analytical' && commentLower.includes('stats')) {
      return `Great observation! The advanced metrics actually support this even more than the basic stats show.`;
    } else if (commentLower.includes('?')) {
      return `Good question! I'll be covering that in more detail in my next piece. Stay tuned!`;
    }
    
    return `Thanks for reading and commenting! Always appreciate hearing from ${team.mascot} fans.`;
  };
  
  // Render comments recursively
  const renderComments = (comments: ArticleComment[], allComments: ArticleComment[], article: NewsArticle, depth = 0): JSX.Element[] => {
    return comments.map(comment => {
      const nestedComments = allComments.filter(c => c.parentId === comment.id);
      const isReplying = replyingTo?.id === comment.id;
      
      return (
        <div key={comment.id}>
          <div 
            className={`border-l-2 ${
              comment.isUserComment ? 'border-[var(--team-primary)]' : 
              comment.isAuthorComment ? 'border-accent-500' : 
              'border-secondary-200'
            } pl-4`}
            style={depth > 0 ? { marginLeft: `${Math.min(depth * 2, 6)}rem` } : {}}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-primary-800">
                  {comment.author}
                  {comment.isUserComment && <span className="ml-2 text-xs text-[var(--team-primary)]">(You)</span>}
                  {comment.isAuthorComment && <span className="ml-2 text-xs text-accent-600 font-bold">Author</span>}
                  {comment.archetype && !comment.isAuthorComment && (
                    <span className="ml-2 text-xs text-secondary-500">
                      • {comment.archetype}
                    </span>
                  )}
                </p>
                <p className="text-xs text-secondary-500">{comment.timestamp}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setReplyingTo(isReplying ? null : comment)}
                  className="text-xs text-secondary-500 hover:text-[var(--team-primary)]"
                >
                  Reply
                </button>
                <button className="text-xs text-secondary-500 hover:text-[var(--team-primary)]">
                  👍 {comment.likes > 0 && comment.likes}
                </button>
              </div>
            </div>
            <p className="text-secondary-700 mb-2">{comment.content}</p>
            
            {/* Inline reply form */}
            {isReplying && (
              <div className="mt-3 mb-3 bg-secondary-50 p-3 rounded">
                <textarea
                  className="input h-16 resize-none mb-2 text-sm"
                  placeholder={`Reply to ${comment.author}...`}
                  value={nestedReplyContent}
                  onChange={(e) => setNestedReplyContent(e.target.value)}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePostComment(article, comment)}
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
          
          {/* Render nested comments */}
          {nestedComments.length > 0 && (
            <div className="mt-2">
              {renderComments(nestedComments, allComments, article, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };
  
  if (!userTeam) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Please select a team to view news</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* News Ticker */}
      {tickerItems.length > 0 && (
        <div className="bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] text-white p-3 rounded-lg mb-6 overflow-hidden shadow-lg">
          <div className="flex items-center">
            <span className="font-bold mr-4 text-white bg-black/20 px-3 py-1 rounded">BREAKING</span>
            <div className="flex-1 overflow-hidden">
              <p className="whitespace-nowrap animate-pulse">
                {tickerItems[currentTickerIndex]}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--team-primary)] mb-2">
          {userTeam.name} News Center
        </h1>
        <p className="text-secondary-600">
          Latest news, analysis, and recruiting updates for the {userTeam.mascot}
        </p>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--team-primary)]"></div>
          <p className="text-secondary-600 mt-2">Generating news content...</p>
        </div>
      )}
      
      {/* News Grid */}
      {!selectedArticle && !isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsArticles.map((article, index) => (
            <div
              key={article.id}
              className={`card p-6 cursor-pointer transition-all border-2 border-transparent hover:border-[var(--team-primary)] hover:shadow-lg ${
                index === 0 ? 'md:col-span-2' : ''
              }`}
              onClick={() => setSelectedArticle(article)}
            >
              {/* Article Image for featured article */}
              {index === 0 && article.imageUrl && (
                <div className="mb-4 -mx-6 -mt-6">
                  <img 
                    src={article.imageUrl} 
                    alt={article.headline}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                </div>
              )}
              
              {/* Article Type Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-team-primary">
                  {article.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className="text-sm text-secondary-500">
                  {new Date(article.date).toLocaleDateString()}
                </span>
              </div>
              
              {/* Headline */}
              <h2 className={`font-bold text-primary-800 mb-2 ${
                index === 0 ? 'text-3xl' : 'text-xl'
              }`}>
                {article.headline}
              </h2>
              
              {/* Subheadline */}
              <p className={`text-secondary-600 ${
                index === 0 ? 'text-lg mb-4' : 'text-sm mb-3'
              }`}>
                {article.subheadline}
              </p>
              
              {/* Preview */}
              {index === 0 && (
                <p className="text-secondary-700 line-clamp-3">
                  {article.content}
                </p>
              )}
              
              {/* Author with Avatar */}
              <div className="flex items-center mt-3">
                <span className="text-lg mr-2">
                  {newsWriters.find(w => w.name === article.author)?.avatar || '✍️'}
                </span>
                <div>
                  <p className="text-sm font-medium text-secondary-700">
                    {article.author}
                  </p>
                  {article.authorTitle && (
                    <p className="text-xs text-secondary-500">
                      {article.authorTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedArticle ? (
        /* Article Detail View */
        <div className="card p-8 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedArticle(null)}
            className="btn btn-ghost btn-sm mb-6"
          >
            ← Back to News
          </button>
          
          <div className="mb-4">
            <span className={`badge ${
              selectedArticle.type === 'game-recap' ? 'badge-primary' :
              selectedArticle.type === 'recruiting' ? 'badge-success' :
              selectedArticle.type === 'analysis' ? 'badge-warning' :
              'badge-secondary'
            }`}>
              {selectedArticle.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-primary-800 mb-3">
            {selectedArticle.headline}
          </h1>
          
          <p className="text-lg text-secondary-600 mb-4">
            {selectedArticle.subheadline}
          </p>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {newsWriters.find(w => w.name === selectedArticle.author)?.avatar || '✍️'}
              </span>
              <div>
                <p className="font-medium text-secondary-700">
                  {selectedArticle.author}
                </p>
                <p className="text-sm text-secondary-500">
                  {selectedArticle.authorTitle} • {new Date(selectedArticle.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Article Image */}
            {(selectedArticle.imageUrl || selectedArticle.imagePrompt) && (
              <div className="ml-4">
                {selectedArticle.imageUrl ? (
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.headline}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-secondary-200 rounded-lg flex items-center justify-center">
                    <span className="text-secondary-400 text-xs text-center">
                      [Image: {selectedArticle.type}]
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            {selectedArticle.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-secondary-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Comments Section */}
          <div className="mt-12 border-t border-secondary-200 pt-8">
            <h3 className="text-xl font-bold text-[var(--team-primary)] mb-6">
              Comments ({articleComments[selectedArticle.id]?.length || 0})
            </h3>
            
            {/* Comment Form */}
            <div className="mb-8">
              <textarea
                className="input h-24 resize-none mb-3"
                placeholder="Share your thoughts on this article..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
              />
              <button
                onClick={() => handlePostComment(selectedArticle)}
                disabled={!userComment.trim()}
                className="btn bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white btn-md"
              >
                Post Comment
              </button>
            </div>
            
            {/* Comments List */}
            <div className="space-y-4">
              {renderComments(
                articleComments[selectedArticle.id]?.filter(c => !c.parentId) || [],
                articleComments[selectedArticle.id] || [],
                selectedArticle
              )}
              
              {(!articleComments[selectedArticle.id] || articleComments[selectedArticle.id].length === 0) && (
                <p className="text-center text-secondary-500 py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
      
      {/* No Articles Message */}
      {newsArticles.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
          <p className="text-secondary-600 mb-4">
            No news articles available yet
          </p>
          <p className="text-sm text-secondary-500">
            Play some games and sign recruits to generate news!
          </p>
        </div>
      )}
    </div>
  );
};