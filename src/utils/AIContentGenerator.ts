import type { Game, Player, Recruit, Season, Team, Coach } from '../types/index';
import { generateSportsArticle, generateTickerItem, generateArticleImage } from '../services/OpenAIService';

// Forum name generators based on team mascot/identity (unique names with similar feel)
export const getForumName = (team: Team): string => {
  const forumNames: Record<string, string> = {
    // SEC
    'alabama': 'Crimson Chronicles',
    'arkansas': 'Razorback Rally', 
    'auburn': 'Tiger Tailgate',
    'florida': 'Swamp Central',
    'georgia': 'Bulldog Nation Hub',
    'kentucky': 'Wildcat Watch',
    'lsu': 'Bayou Breakdown',
    'mississippi-state': 'Cowbell Corner',
    'missouri': 'Tiger Town Talk',
    'oklahoma': 'Boomer Base',
    'ole-miss': 'Rebel Rendezvous',
    'south-carolina': 'Gamecock Grounds',
    'tennessee': 'Rocky Top Forum',
    'texas': 'Longhorn Lounge',
    'texas-am': 'Aggie Assembly',
    'vanderbilt': 'Commodore Connect',
    
    // Big Ten
    'michigan': 'Maize & Blue Central',
    'michigan-state': 'Green & White Hub',
    'ohio-state': 'Scarlet & Gray Station',
    'penn-state': 'Nittany Nation',
    'wisconsin': 'Badger Den',
    'iowa': 'Hawkeye Haven',
    'nebraska': 'Cornhusker Corner',
    'minnesota': 'Golden Gopher Grounds',
    'illinois': 'Fighting Illini Forum',
    'indiana': 'Hoosier Huddle',
    'purdue': 'Boilermaker Base',
    'northwestern': 'Purple Pride Plaza',
    'maryland': 'Turtle Talk',
    'rutgers': 'Scarlet Knight Central',
    'oregon': 'Duck Dynasty Forum',
    'washington': 'Husky Hangout',
    'usc': 'Trojan Territory',
    'ucla': 'Bruin Base',
    
    // Big 12
    'texas-tech': 'Red Raider Rally',
    'oklahoma-state': 'Cowboy Central',
    'baylor': 'Bear Cave',
    'tcu': 'Horned Frog Hub',
    'kansas': 'Jayhawk Junction',
    'kansas-state': 'Wildcat Way',
    'iowa-state': 'Cyclone Station',
    'west-virginia': 'Mountaineer Manor',
    'cincinnati': 'Bearcat Boulevard',
    'houston': 'Cougar Corner',
    'ucf': 'Knight Watch',
    'byu': 'Cougar Connection',
    'colorado': 'Buffalo Base',
    'arizona': 'Desert Wildcat Den',
    'arizona-state': 'Sun Devil Central',
    'utah': 'Ute Territory',
    
    // ACC
    'clemson': 'Tiger Town Forum',
    'florida-state': 'Seminole Central',
    'miami': 'Hurricane Hub', 
    'virginia-tech': 'Hokie Haven',
    'north-carolina': 'Tar Heel Talk',
    'nc-state': 'Wolfpack Way',
    'duke': 'Blue Devil Den',
    'georgia-tech': 'Yellow Jacket Junction',
    'louisville': 'Cardinal Central',
    'pitt': 'Panther Plaza',
    'syracuse': 'Orange Outlook',
    'wake-forest': 'Demon Deacon Depot',
    'boston-college': 'Eagle Eyrie',
    'virginia': 'Cavalier Corner',
    'california': 'Golden Bear Grove',
    'stanford': 'Cardinal Corner',
    'smu': 'Mustang Meadows',
    
    // Independent/Other
    'notre-dame': 'Irish Impact',
    'army': 'Black Knight Brigade',
    'navy': 'Midshipman Marina',
    
    // Default fallback pattern
  };
  
  return forumNames[team.id] || `${team.mascot} Nation`;
};

// Generate forum usernames based on team
export const generateForumUsername = (team: Team, index: number): string => {
  const prefixes = [
    team.mascot,
    team.name.split(' ')[0],
    team.primaryColor.substring(1, 4).toUpperCase(),
    'Die_Hard',
    'True',
    'Loyal',
    'Big',
    'Crazy',
    '4Ever',
  ];
  
  const suffixes = [
    'Fan',
    '4Life',
    'Forever',
    `_${Math.floor(Math.random() * 100)}`,
    `${new Date().getFullYear() - Math.floor(Math.random() * 30)}`,
    'Believer',
    'Nation',
    'Pride',
    '_Guy',
    '_Gal',
  ];
  
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}${suffix}`;
};

// News Writers with distinct personalities
export const newsWriters: NewsWriter[] = [
  {
    id: 'mike-davidson',
    name: 'Mike Davidson',
    title: 'Senior Beat Writer',
    personality: 'veteran',
    writingStyle: 'analytical',
    bias: 'realistic',
    yearsExperience: 15,
    avatar: '👨‍💼',
    specialties: ['game analysis', 'team strategy'],
    catchphrases: ['The numbers don\'t lie', 'Film study reveals', 'Looking at the tape']
  },
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins', 
    title: 'Recruiting Insider',
    personality: 'enthusiastic',
    writingStyle: 'conversational',
    bias: 'optimistic',
    yearsExperience: 8,
    avatar: '👩‍💻',
    specialties: ['recruiting', 'player development'],
    catchphrases: ['Sources close to the program', 'Big get for the program', 'This kid is special']
  },
  {
    id: 'tommy-taylor',
    name: 'Tommy Taylor',
    title: 'Sports Editor',
    personality: 'critical',
    writingStyle: 'direct',
    bias: 'skeptical',
    yearsExperience: 12,
    avatar: '👨‍📰',
    specialties: ['coaching decisions', 'program direction'],
    catchphrases: ['Questions remain', 'Time will tell', 'Not so fast']
  },
  {
    id: 'jessica-wong',
    name: 'Jessica Wong',
    title: 'Staff Writer',
    personality: 'balanced',
    writingStyle: 'descriptive',
    bias: 'neutral',
    yearsExperience: 5,
    avatar: '👩‍✏️',
    specialties: ['game recaps', 'player profiles'],
    catchphrases: ['Both sides of the ball', 'The tale of two halves', 'Credit where it\'s due']
  },
  {
    id: 'marcus-williams',
    name: 'Marcus Williams',
    title: 'Senior Analyst',
    personality: 'data-driven',
    writingStyle: 'technical',
    bias: 'analytical',
    yearsExperience: 10,
    avatar: '👨‍💻',
    specialties: ['analytics', 'advanced stats'],
    catchphrases: ['The metrics suggest', 'Statistically speaking', 'Efficiency ratings show']
  }
];

// Get writer based on article type and context
function selectWriter(type: string, team: Team, isPositive: boolean): NewsWriter {
  if (type === 'recruiting') return newsWriters.find(w => w.id === 'sarah-jenkins')!;
  if (type === 'analysis') return newsWriters.find(w => w.id === 'marcus-williams')!;
  
  // For game recaps, vary the writer
  if (isPositive) {
    return Math.random() > 0.5 
      ? newsWriters.find(w => w.id === 'mike-davidson')!
      : newsWriters.find(w => w.id === 'jessica-wong')!;
  } else {
    return newsWriters.find(w => w.id === 'tommy-taylor')!;
  }
}

// Generate image prompt for DALL-E based on article
function generateImagePrompt(article: NewsArticle, team: Team): string {
  const baseStyle = "sports photography, professional lighting, high quality, dynamic composition";
  
  if (article.type === 'game-recap') {
    if (article.headline.includes('Dominate')) {
      return `Triumphant college football players in ${team.primaryColor} uniforms celebrating victory, ${baseStyle}`;
    } else if (article.headline.includes('Fall')) {
      return `Dejected college football players walking off field after tough loss, dramatic lighting, ${baseStyle}`;
    } else {
      return `Intense college football action shot, players in ${team.primaryColor} jerseys, ${baseStyle}`;
    }
  } else if (article.type === 'recruiting') {
    return `Young athlete signing letter of intent, ${team.primaryColor} hat on table, recruitment ceremony, ${baseStyle}`;
  } else if (article.type === 'analysis') {
    return `College football stadium packed with fans in ${team.primaryColor}, aerial view, ${baseStyle}`;
  }
  
  return `College football team ${team.mascot} in action, ${baseStyle}`;
}

// News ticker items generator
export async function generateNewsTicker(
  games: Game[],
  recruits: Recruit[], 
  season: Season,
  team: Team
): Promise<string[]> {
  const ticker: string[] = [];
  
  // Latest game result with actual stats
  const lastGame = games[games.length - 1];
  if (lastGame) {
    ticker.push(`${team.mascot} ${lastGame.result === 'W' ? 'defeat' : 'fall to'} ${lastGame.opponent} ${lastGame.score.for}-${lastGame.score.against}${lastGame.location === 'Away' ? ' on the road' : lastGame.location === 'Home' ? ' at home' : ''}`);
    
    // Add a stat from the game
    if (lastGame.stats.passingYards && lastGame.stats.passingYards > 300) {
      ticker.push(`QB throws for ${lastGame.stats.passingYards} yards in ${lastGame.result === 'W' ? 'victory' : 'defeat'}`);
    } else if (lastGame.stats.rushingYards && lastGame.stats.rushingYards > 200) {
      ticker.push(`${team.mascot} rush for ${lastGame.stats.rushingYards} yards vs ${lastGame.opponent}`);
    }
  }
  
  // Current record with context
  const winPct = (season.overallRecord.wins / (season.overallRecord.wins + season.overallRecord.losses) * 100).toFixed(0);
  ticker.push(`${team.name} sitting at ${season.overallRecord.wins}-${season.overallRecord.losses} (${winPct}%) • ${season.conferenceRecord.wins}-${season.conferenceRecord.losses} in conference`);
  
  // Recent commits with more detail
  const recentCommits = recruits.filter(r => r.status === 'Committed').slice(-2);
  recentCommits.forEach(commit => {
    ticker.push(`BREAKING: ${commit.stars}⭐ ${commit.position} ${commit.name} (${commit.hometown}, ${commit.state}) commits to ${team.name}`);
  });
  
  // Ranking update with movement
  if (season.ranking) {
    const rankMovement = games.length > 3 ? (Math.random() > 0.5 ? '↑' : '↓') + Math.floor(Math.random() * 3 + 1) : '';
    ticker.push(`${team.mascot} ${rankMovement ? `move ${rankMovement} to` : 'remain at'} #${season.ranking} in latest poll`);
  }
  
  // Winning/losing streak
  const streak = calculateStreak(games);
  if (Math.abs(streak) >= 3) {
    ticker.push(`${team.mascot} ${streak > 0 ? `riding ${streak}-game win streak` : `looking to snap ${Math.abs(streak)}-game skid`}`);
  }
  
  // Conference standings
  if (season.conferenceRecord.wins > 0 || season.conferenceRecord.losses > 0) {
    ticker.push(`${team.name} ${season.conferenceRecord.wins > season.conferenceRecord.losses ? 'atop' : 'fighting in'} ${team.conference} standings`);
  }
  
  // Try to add one dynamic AI-generated ticker item
  try {
    const aiTicker = await generateTickerItem(team, games, recruits, season);
    if (aiTicker) {
      ticker.push(aiTicker);
    }
  } catch (error) {
    console.log('OpenAI ticker generation failed, using templates only');
  }
  
  return ticker;
}

// Helper function to calculate win/loss streak
function calculateStreak(games: Game[]): number {
  if (games.length === 0) return 0;
  
  let streak = 0;
  const recentGames = [...games].reverse();
  const firstResult = recentGames[0].result;
  
  for (const game of recentGames) {
    if (game.result === firstResult) {
      streak += firstResult === 'W' ? 1 : -1;
    } else {
      break;
    }
  }
  
  return streak;
}

// News headline generators with writer personalities
export const generateNewsHeadlines = async (
  games: Game[],
  recruits: Recruit[],
  season: Season,
  team: Team,
  players: Player[]
): Promise<NewsArticle[]> => {
  const articles: NewsArticle[] = [];
  const recentGames = games.slice(-3).reverse();
  
  // Generate articles based on recent games
  for (const game of recentGames) {
    const isWin = game.result === 'W';
    const isBlowout = Math.abs(game.score.for - game.score.against) > 20;
    const isClose = Math.abs(game.score.for - game.score.against) <= 7;
    const writer = selectWriter('game-recap', team, isWin);
    
    let headline = '';
    let subheadline = '';
    
    // Adjust headline based on writer personality
    if (writer.personality === 'critical' && !isWin) {
      headline = `${team.mascot} Exposed in ${game.score.against}-${game.score.for} Loss to ${game.opponent}`;
      subheadline = 'Troubling signs emerge as team struggles on both sides of the ball';
    } else if (writer.personality === 'enthusiastic' && isWin) {
      headline = `${team.mascot} Spectacular in ${game.score.for}-${game.score.against} Victory Over ${game.opponent}!`;
      subheadline = 'Another dominant performance shows this team is for real';
    } else if (writer.personality === 'analytical') {
      headline = `By the Numbers: ${team.mascot} ${isWin ? 'Defeat' : 'Fall to'} ${game.opponent} ${game.score.for}-${game.score.against}`;
      subheadline = `Statistical breakdown reveals ${isWin ? 'efficient performance' : 'areas of concern'}`;
    } else {
      // Default headlines
      if (isWin && isBlowout) {
        headline = `${team.mascot} Dominate ${game.opponent} in ${game.score.for}-${game.score.against} Victory`;
        subheadline = `${team.name} cruises to easy win in ${game.location === 'Home' ? 'front of home crowd' : game.location === 'Away' ? 'hostile territory' : 'neutral site showdown'}`;
      } else if (isWin && isClose) {
        headline = `${team.mascot} Edge ${game.opponent} in Thrilling ${game.score.for}-${game.score.against} Victory`;
        subheadline = 'Last-minute heroics seal the deal for ' + team.name;
      } else {
        headline = `${team.mascot} Fall to ${game.opponent} ${game.score.against}-${game.score.for}`;
        subheadline = game.rivalry ? 'Rivalry loss stings for ' + team.name : 'Tough road loss for the ' + team.mascot;
      }
    }
    
    const content = await generateGameRecap(game, team, isWin ? (isBlowout ? 'blowout-win' : 'close-win') : 'loss', writer);
    
    const imagePrompt = generateImagePrompt({ type: 'game-recap', headline } as NewsArticle, team);
    let imageUrl: string | undefined;
    
    // Try to generate image, but don't block if it fails
    try {
      imageUrl = await generateArticleImage(imagePrompt);
    } catch (error) {
      console.log('Failed to generate article image:', error);
    }
    
    articles.push({
      id: `news-${game.id}`,
      headline,
      subheadline,
      content,
      date: game.date,
      type: 'game-recap',
      author: writer.name,
      authorTitle: writer.title,
      imagePrompt,
      imageUrl
    });
  }
  
  // Generate recruiting news
  const recentCommits = recruits.filter(r => r.status === 'Committed').slice(-2);
  const recruitingWriter = newsWriters.find(w => w.id === 'sarah-jenkins')!;
  
  recentCommits.forEach(recruit => {
    const article = {
      id: `news-recruit-${recruit.id}`,
      headline: `${recruit.stars}-Star ${recruit.position} ${recruit.name} Commits to ${team.name}`,
      subheadline: `${recruitingWriter.catchphrases[2]}! ${team.mascot} land talented prospect from ${recruit.state}`,
      content: generateRecruitingArticle(recruit, team, recruitingWriter),
      date: new Date().toISOString().split('T')[0],
      type: 'recruiting' as const,
      author: recruitingWriter.name,
      authorTitle: recruitingWriter.title,
      imagePrompt: generateImagePrompt({ type: 'recruiting' } as NewsArticle, team)
    };
    
    articles.push(article);
  });
  
  // Season outlook article
  if (season.overallRecord.wins >= 8) {
    const analyst = newsWriters.find(w => w.id === 'marcus-williams')!;
    articles.push({
      id: 'news-season-outlook',
      headline: `${analyst.catchphrases[0]}: ${team.mascot} Playoff Chances Improving`,
      subheadline: `At ${season.overallRecord.wins}-${season.overallRecord.losses}, statistical models show promising outlook`,
      content: generateSeasonOutlook(season, team, analyst),
      date: new Date().toISOString().split('T')[0],
      type: 'analysis',
      author: analyst.name,
      authorTitle: analyst.title,
      imagePrompt: generateImagePrompt({ type: 'analysis' } as NewsArticle, team)
    });
  }
  
  return articles.slice(0, 6);
};

// Forum post generators
export const generateForumPosts = (
  games: Game[],
  recruits: Recruit[],
  season: Season,
  team: Team,
  coach: Coach,
  players: Player[]
): ForumPost[] => {
  const posts: ForumPost[] = [];
  const lastGame = games[games.length - 1];
  const recentGames = games.slice(-5);
  const forumName = getForumName(team);
  
  // Calculate win streak
  const streak = calculateStreak(games);
  const winPct = games.length > 0 ? (games.filter(g => g.result === 'W').length / games.length * 100).toFixed(0) : '0';
  
  // Post-game reactions based on actual results
  if (lastGame) {
    const margin = Math.abs(lastGame.score.for - lastGame.score.against);
    const isBlowout = margin > 20;
    const isClose = margin <= 7;
    const isUpset = lastGame.location === 'Away' && lastGame.result === 'W' && margin > 14;
    
    if (lastGame.result === 'W') {
      // Win reactions vary by game type
      if (isBlowout) {
        posts.push({
          id: `forum-${Date.now()}-1`,
          title: `${lastGame.opponent} Game Thread - TOTAL DOMINATION! ${lastGame.score.for}-${lastGame.score.against}`,
          author: generateForumUsername(team, 0),
          content: `STATEMENT WIN! We absolutely destroyed ${lastGame.opponent}. ${lastGame.stats.rushingYards > 200 ? `${lastGame.stats.rushingYards} rushing yards!` : `${lastGame.stats.passingYards} through the air!`} This team is SPECIAL!`,
          replies: Math.floor(Math.random() * 100) + 150,
          views: Math.floor(Math.random() * 2000) + 3000,
          lastActivity: '1 hour ago',
          category: 'game-thread',
          isPinned: true
        });
      } else if (isClose) {
        posts.push({
          id: `forum-${Date.now()}-1`,
          title: `${lastGame.opponent} Game Thread - CARDIAC ${team.mascot.toUpperCase()}! ${lastGame.score.for}-${lastGame.score.against}`,
          author: generateForumUsername(team, 0),
          content: `My heart can't take these close games! What a finish! ${lastGame.stats.turnovers === 0 ? 'Zero turnovers was the key.' : 'We survived despite the turnovers.'} Great team win!`,
          replies: Math.floor(Math.random() * 80) + 80,
          views: Math.floor(Math.random() * 1500) + 2000,
          lastActivity: '2 hours ago',
          category: 'game-thread',
          isPinned: true
        });
      } else {
        posts.push({
          id: `forum-${Date.now()}-1`,
          title: `${lastGame.opponent} Game Thread - ${team.mascot} WIN ${lastGame.score.for}-${lastGame.score.against}!`,
          author: generateForumUsername(team, 0),
          content: `Solid ${lastGame.location === 'Away' ? 'road' : lastGame.location === 'Home' ? 'home' : 'neutral site'} win! ${streak > 2 ? `That's ${Math.abs(streak)} in a row!` : 'Back in the win column!'} ${(lastGame.stats.passingYards || 0) + (lastGame.stats.rushingYards || 0) > 450 ? 'Offense was clicking!' : 'Defense stepped up big time!'}`,
          replies: Math.floor(Math.random() * 60) + 40,
          views: Math.floor(Math.random() * 1000) + 1200,
          lastActivity: '3 hours ago',
          category: 'game-thread',
          isPinned: true
        });
      }
      
      // Player performance thread for wins
      if (lastGame.stats.passingTDs >= 3 || lastGame.stats.rushingTDs >= 2) {
        posts.push({
          id: `forum-${Date.now()}-2`,
          title: `${lastGame.stats.passingTDs >= 3 ? 'QB went OFF today!' : 'Ground game was UNSTOPPABLE!'}`,
          author: generateForumUsername(team, 1),
          content: `${lastGame.stats.passingTDs >= 3 ? `${lastGame.stats.passingTDs} passing TDs and ${lastGame.stats.passingYards} yards!` : `${lastGame.stats.rushingTDs} rushing TDs and ${lastGame.stats.rushingYards} yards on the ground!`} This is what we've been waiting for!`,
          replies: Math.floor(Math.random() * 40) + 20,
          views: Math.floor(Math.random() * 600) + 400,
          lastActivity: '4 hours ago',
          category: 'game-thread'
        });
      }
    } else {
      // Loss reactions vary by severity
      if (isBlowout) {
        posts.push({
          id: `forum-${Date.now()}-3`,
          title: `${lastGame.opponent} Game Thread - Embarrassing. ${lastGame.score.against}-${lastGame.score.for}`,
          author: generateForumUsername(team, 2),
          content: `That was pathetic. ${lastGame.stats.turnovers >= 3 ? `${lastGame.stats.turnovers} turnovers!` : `Only ${(lastGame.stats.passingYards || 0) + (lastGame.stats.rushingYards || 0)} total yards?`} ${coach.hotSeat ? 'This coaching staff is in over their heads.' : 'Major changes needed NOW.'}`,
          replies: Math.floor(Math.random() * 150) + 200,
          views: Math.floor(Math.random() * 3000) + 4000,
          lastActivity: '30 minutes ago',
          category: 'game-thread'
        });
        
        posts.push({
          id: `forum-${Date.now()}-4`,
          title: coach.hotSeat ? '🔥 HOT SEAT WATCH 🔥' : 'What is wrong with this team?',
          author: generateForumUsername(team, 3),
          content: coach.hotSeat ? 
            `${coach.coachName} is ${coach.wins}-${coach.losses} overall. ${coach.championships === 0 ? 'ZERO championships.' : `Only ${coach.championships} championship${coach.championships > 1 ? 's' : ''}.`} How much longer?` :
            `Getting blown out ${lastGame.location === 'Home' ? 'AT HOME' : 'on the road'} is unacceptable. ${streak < -2 ? `${Math.abs(streak)} losses in a row!` : 'This can\'t continue.'}`,
          replies: Math.floor(Math.random() * 200) + 300,
          views: Math.floor(Math.random() * 4000) + 5000,
          lastActivity: '15 minutes ago',
          category: 'coaching'
        });
      } else if (isClose) {
        posts.push({
          id: `forum-${Date.now()}-3`,
          title: `Gut-wrenching loss to ${lastGame.opponent} ${lastGame.score.against}-${lastGame.score.for}`,
          author: generateForumUsername(team, 2),
          content: `So close yet so far. ${lastGame.stats.turnovers > 0 ? `Those ${lastGame.stats.turnovers} turnover${lastGame.stats.turnovers > 1 ? 's' : ''} killed us.` : 'Just couldn\'t make plays when it mattered.'} This one hurts.`,
          replies: Math.floor(Math.random() * 80) + 60,
          views: Math.floor(Math.random() * 1200) + 1000,
          lastActivity: '1 hour ago',
          category: 'game-thread'
        });
      } else {
        posts.push({
          id: `forum-${Date.now()}-3`,
          title: `${lastGame.opponent} ${lastGame.score.against}, ${team.name} ${lastGame.score.for} - Post Game Thread`,
          author: generateForumUsername(team, 2),
          content: `Disappointing loss. ${(lastGame.stats.passingYards || 0) + (lastGame.stats.rushingYards || 0) < 300 ? 'Offense was anemic.' : 'Defense couldn\'t get stops.'} ${season.overallRecord.losses >= 4 ? 'Season slipping away...' : 'Need to bounce back fast.'}`,
          replies: Math.floor(Math.random() * 60) + 50,
          views: Math.floor(Math.random() * 800) + 800,
          lastActivity: '2 hours ago',
          category: 'game-thread'
        });
      }
    }
  }
  
  // Recruiting posts based on actual recruits
  const commits = recruits.filter(r => r.status === 'Committed');
  const targets = recruits.filter(r => r.stars >= 4 && r.status === 'Interested');
  const recentCommit = commits[commits.length - 1];
  
  if (recentCommit) {
    posts.push({
      id: `forum-${Date.now()}-5`,
      title: `🎉 BOOM! ${recentCommit.stars}⭐ ${recentCommit.position} ${recentCommit.name} COMMITS!`,
      author: generateForumUsername(team, 4),
      content: `LET'S GO! Welcome to the ${team.mascot} family! Kid from ${recentCommit.hometown}, ${recentCommit.state}. ${commits.length >= 10 ? `That's ${commits.length} commits in this class!` : 'Building something special!'} ${recentCommit.stars >= 4 ? 'HUGE get!' : 'Love this pickup!'}`,
      replies: Math.floor(Math.random() * 100) + 50,
      views: Math.floor(Math.random() * 1500) + 1000,
      lastActivity: '5 hours ago',
      category: 'recruiting',
      isPinned: true
    });
  }
  
  if (targets.length > 0) {
    const topTarget = targets[0];
    posts.push({
      id: `forum-${Date.now()}-6`,
      title: `[Recruiting] Tracking ${topTarget.stars}⭐ ${topTarget.position} ${topTarget.name}`,
      author: generateForumUsername(team, 5),
      content: `Elite prospect from ${topTarget.state}. ${topTarget.stars === 5 ? 'This would be a PROGRAM-CHANGING recruit!' : `Top ${topTarget.position} in the region.`} Hearing we're in good shape but several other schools want him.`,
      replies: Math.floor(Math.random() * 80) + 40,
      views: Math.floor(Math.random() * 1200) + 800,
      lastActivity: '6 hours ago',
      category: 'recruiting'
    });
  }
  
  // Season discussion with real context
  const bowlEligible = season.overallRecord.wins >= 6;
  const conferenceContender = season.conferenceRecord.wins >= Math.floor((season.conferenceRecord.wins + season.conferenceRecord.losses) * 0.7);
  
  posts.push({
    id: `forum-${Date.now()}-7`,
    title: `${season.year} Season Thread - ${season.overallRecord.wins}-${season.overallRecord.losses} (${season.conferenceRecord.wins}-${season.conferenceRecord.losses} ${team.conference})`,
    author: generateForumUsername(team, 6),
    content: `${season.ranking ? `Ranked #${season.ranking}! ` : ''}${bowlEligible ? 'Bowl eligible! ' : season.overallRecord.wins >= 4 ? 'Fighting for bowl eligibility. ' : 'Long season... '}${conferenceContender ? `Still in the ${team.conference} race!` : `${winPct}% win rate. ${season.overallRecord.wins >= 8 ? 'Special season developing!' : season.overallRecord.wins <= 3 ? 'Rough year.' : 'Work to do.'}`}`,
    replies: Math.floor(Math.random() * 200) + 234,
    views: Math.floor(Math.random() * 3000) + 4567,
    lastActivity: '8 hours ago',
    category: 'general',
    isPinned: true
  });
  
  // Conference/rival specific posts
  const conferenceRecord = `${season.conferenceRecord.wins}-${season.conferenceRecord.losses}`;
  posts.push({
    id: `forum-${Date.now()}-8`,
    title: `${team.conference} Standings Update - We're ${conferenceRecord}`,
    author: generateForumUsername(team, 7),
    content: `${season.conferenceRecord.wins > season.conferenceRecord.losses ? `Sitting pretty in the ${team.conference}! ` : season.conferenceRecord.wins === 0 && season.conferenceRecord.losses > 0 ? `Winless in conference... ` : `Middle of the pack. `}${games.some(g => g.rivalry) ? 'Rivalry game coming up - MUST WIN!' : `Big conference matchups ahead.`}`,
    replies: Math.floor(Math.random() * 60) + 45,
    views: Math.floor(Math.random() * 800) + 890,
    lastActivity: '10 hours ago',
    category: 'general'
  });
  
  // Coaching discussion based on actual performance
  if (coach.hotSeat || season.overallRecord.losses >= 6) {
    posts.push({
      id: `forum-${Date.now()}-9`,
      title: coach.hotSeat ? `🔥 ${coach.coachName} Hot Seat Thread 🔥` : 'Honest question about our coaching...',
      author: generateForumUsername(team, 8),
      content: `${coach.coachName} is ${coach.wins}-${coach.losses} all-time. ${coach.hotSeat ? 'The seat is SCORCHING.' : 'Are we headed in the right direction?'} ${coach.championships > 0 ? `Yes, ${coach.championships} championship${coach.championships > 1 ? 's' : ''}, but what have you done lately?` : 'Still waiting for that breakthrough season.'}`,
      replies: Math.floor(Math.random() * 150) + 156,
      views: Math.floor(Math.random() * 2000) + 2341,
      lastActivity: '4 hours ago',
      category: 'coaching'
    });
  }
  
  // Team-specific tradition/culture post
  posts.push({
    id: `forum-${Date.now()}-10`,
    title: `${team.stadium} ${games.filter(g => g.location === 'Home' && g.result === 'W').length > games.filter(g => g.location === 'Home' && g.result === 'L').length ? 'is a FORTRESS!' : 'needs to get LOUDER!'}`,
    author: generateForumUsername(team, 9),
    content: `Home record: ${games.filter(g => g.location === 'Home' && g.result === 'W').length}-${games.filter(g => g.location === 'Home' && g.result === 'L').length}. ${games.filter(g => g.location === 'Home' && g.result === 'W').length > games.filter(g => g.location === 'Home' && g.result === 'L').length ? `Love our home field advantage! ${team.mascot} nation shows up!` : `We need to protect our house better. Get out there and support!`}`,
    replies: Math.floor(Math.random() * 100) + 78,
    views: Math.floor(Math.random() * 1500) + 1234,
    lastActivity: '12 hours ago',
    category: 'off-topic'
  });
  
  // Add some randomness to reply counts and views
  posts.forEach(post => {
    // Add some variance to make it more realistic
    post.views = Math.floor(post.views * (0.8 + Math.random() * 0.4));
    post.replies = Math.floor(post.replies * (0.7 + Math.random() * 0.6));
  });
  
  return posts;
};

// Helper functions for content generation with writer personalities
async function generateGameRecap(game: Game, team: Team, type: string, writer: NewsWriter): Promise<string> {
  // Try to use OpenAI first
  try {
    const article = await generateSportsArticle(game, team, writer.personality, writer.name);
    return article;
  } catch (error) {
    console.log('Falling back to template generation');
    // Fallback to template generation
  }
  
  const paragraphs = [];
  const catchphrase = writer.catchphrases[Math.floor(Math.random() * writer.catchphrases.length)];
  const won = game.result === 'W';
  const margin = Math.abs(game.score.for - game.score.against);
  const isClose = margin <= 7;
  const isBlowout = margin > 20;
  
  // 1. Dramatic intro paragraph (hook or drama setup)
  if (isClose && won) {
    paragraphs.push(
      `${team.stadium || 'The home stadium'} erupted in pandemonium as the final seconds ticked off the clock. After ${game.rivalry ? 'years of frustration in this bitter rivalry' : 'a hard-fought battle'}, the ${team.mascot} had done it. ${team.name} ${game.score.for}, ${game.opponent} ${game.score.against}. The scoreboard told only part of the story of a game that will be remembered for years to come.`
    );
  } else if (isClose && !won) {
    paragraphs.push(
      `The silence was deafening. ${team.stadium || 'The stadium'} sat in stunned disbelief as ${game.opponent} celebrated on the ${team.mascot}' home turf. A ${game.score.against}-${game.score.for} defeat that felt like a punch to the gut, leaving ${team.name} players slumped on the sideline and fans filing out in dismay. This one is going to sting for a while.`
    );
  } else if (isBlowout && won) {
    paragraphs.push(
      `Statement made. Message sent. The ${team.mascot} didn't just beat ${game.opponent} on ${new Date(game.date).toLocaleDateString()} – they demolished them. The ${game.score.for}-${game.score.against} final score reflected total domination in every phase of the game, a performance that announced to the college football world that ${team.name} means business.`
    );
  } else {
    paragraphs.push(
      `${catchphrase}. The ${team.mascot} ${won ? 'secured a' : 'suffered a'} ${game.score.for}-${game.score.against} ${won ? 'victory over' : 'defeat to'} ${game.opponent} in ${game.location === 'Home' ? 'front of the home crowd' : game.location === 'Away' ? 'hostile territory' : 'a neutral site battle'}. It was a game that ${won ? 'showcased the team\'s resilience' : 'exposed areas needing immediate attention'}.`
    );
  }
  // 2. Defining moment or swing play
  if (game.stats.turnovers && game.stats.turnovers >= 2) {
    paragraphs.push(
      `The game's momentum shifted dramatically in the ${won ? 'third' : 'second'} quarter when ${won ? `the ${team.mascot} defense came alive with back-to-back turnovers` : `costly turnovers derailed what had been a promising drive`}. ${game.stats.interceptions ? `${game.stats.interceptions} interception${game.stats.interceptions > 1 ? 's' : ''}` : 'The turnovers'} ${won ? 'set up short fields and swung the game decisively' : 'proved to be the difference in a game of slim margins'}.`
    );
  } else if (isClose) {
    paragraphs.push(
      `The pivotal moment came with ${Math.floor(Math.random() * 5) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} remaining in the fourth quarter. ${won ? `Facing a crucial third down, the ${team.mascot} offense delivered when it mattered most` : `The ${team.mascot} had their chances, but couldn't convert when it counted`}. That single play encapsulated the entire contest – a game decided by the thinnest of margins and the ability to execute under pressure.`
    );
  } else {
    paragraphs.push(
      `From the opening drive, it was clear which team came to play. ${won ? `The ${team.mascot} imposed their will early and often` : `${game.opponent} set the tone immediately`}, ${won ? 'establishing dominance on both lines of scrimmage' : 'leaving the home team searching for answers'}. By halftime, the ${won ? 'rout was on' : 'deficit felt insurmountable'}.`
    );
  }
  // 3. Offensive leaders (key stat line)
  const totalOffense = (game.stats.passingYards || 0) + (game.stats.rushingYards || 0);
  paragraphs.push(
    `Offensively, the ${team.mascot} ${totalOffense > 400 ? 'put on a clinic' : totalOffense > 300 ? 'moved the ball effectively' : 'struggled to find rhythm'}, ` +
    `finishing with ${totalOffense} total yards. The passing game accounted for ${game.stats.passingYards || 0} yards${game.stats.passingTDs ? ` and ${game.stats.passingTDs} touchdown${game.stats.passingTDs > 1 ? 's' : ''}` : ''}, ` +
    `while the ground attack ${game.stats.rushingYards > 150 ? 'pounded away for' : 'managed'} ${game.stats.rushingYards || 0} yards${game.stats.rushingTDs ? ` and ${game.stats.rushingTDs} score${game.stats.rushingTDs > 1 ? 's' : ''}` : ''}. ` +
    `${writer.personality === 'analytical' ? `The yards-per-play average of ${(totalOffense / 65).toFixed(1)} ${totalOffense > 400 ? 'showcased offensive efficiency' : 'left room for improvement'}.` : `${totalOffense > 400 ? 'It was a thing of beauty to watch.' : 'The unit will need to be better moving forward.'}`}`
  );
  // 4. Defensive story (INTs, sacks, clutch plays)
  if (game.opponentStats) {
    const oppTotal = (game.opponentStats.passingYards || 0) + (game.opponentStats.rushingYards || 0);
    paragraphs.push(
      `Defensively, the ${team.mascot} ${oppTotal < 300 ? 'were outstanding' : oppTotal < 400 ? 'bent but didn\'t break' : 'struggled to contain'} ${game.opponent}'s attack. ` +
      `They ${game.stats.interceptions ? `came up with ${game.stats.interceptions} crucial interception${game.stats.interceptions > 1 ? 's' : ''}${game.stats.sacks ? ' and' : ''}` : ''}${game.stats.sacks ? ` registered ${game.stats.sacks} sack${game.stats.sacks > 1 ? 's' : ''}` : ''} ` +
      `while ${oppTotal < 300 ? 'suffocating' : 'allowing'} ${oppTotal} total yards. ` +
      `${won ? 'When the game was on the line, this unit rose to the occasion.' : 'The inability to get crucial stops proved costly.'}`
    );
  } else {
    paragraphs.push(
      `The defensive effort ${won ? 'proved to be the difference' : 'fell short when it mattered most'}. ` +
      `${game.stats.interceptions || game.stats.sacks ? `Despite forcing ${game.stats.interceptions || 0} turnover${(game.stats.interceptions || 0) > 1 ? 's' : ''} and recording ${game.stats.sacks || 0} sack${(game.stats.sacks || 0) > 1 ? 's' : ''}, ` : ''}` +
      `the unit ${won ? 'made the plays necessary to secure victory' : 'couldn\'t make the stops needed in crucial moments'}. ` +
      `${isClose ? 'In a game of inches, every play mattered.' : won ? 'It was a dominant performance.' : 'Adjustments are clearly needed.'}`
    );
  }
  // 5. Coach/player quotes (fictional but themed)
  if (writer.personality === 'veteran' || writer.personality === 'balanced') {
    paragraphs.push(
      `"${won ? 'I\'m proud of how our guys fought today' : 'We didn\'t execute when it mattered'}," the head coach said in the post-game press conference. ` +
      `"${won && isClose ? 'Character wins like this define seasons' : won && isBlowout ? 'This is the standard we expect' : !won && isClose ? 'Credit to them, they made one more play than we did' : 'We\'ve got to look in the mirror and get better'}." ` +
      `${won ? 'Players echoed their coach\'s sentiment' : 'The locker room was subdued'}, with ${won ? 'team leaders emphasizing the importance of staying humble and hungry' : 'veterans taking responsibility for the defeat'}.`
    );
  }
  // 6. Season context (rank, record, rivalries)
  paragraphs.push(
    `This ${won ? 'victory' : 'defeat'} ${won ? 'improves' : 'drops'} the ${team.mascot} to ${game.week > 1 ? 'an overall record that' : 'a start that'} ` +
    `${won ? 'keeps them in the hunt' : 'puts added pressure on upcoming games'}. ` +
    `${game.conferenceGame ? `In conference play, every game carries massive implications, and this result ${won ? 'strengthens their position' : 'complicates the path forward'}.` : ''}` +
    `${game.rivalry ? ` For a rivalry game of this magnitude, the ${won ? 'bragging rights alone make this victory sweet' : 'sting of defeat will linger until next year\'s meeting'}.` : ''}` +
    `${game.playoffGame ? ` With playoff implications on the line, this ${won ? 'win keeps championship dreams alive' : 'loss deals a devastating blow to postseason hopes'}.` : ''}`
  );
  
  // 7. Next game preview or implications  
  paragraphs.push(
    `Looking ahead, the ${team.mascot} ${won ? 'will look to build on this momentum' : 'must quickly turn the page'} as they prepare for their next challenge. ` +
    `The schedule doesn't get any easier, and ${won ? 'maintaining this level of play' : 'addressing the issues exposed today'} will be crucial. ` +
    `${writer.personality === 'critical' ? 'Questions remain about this team\'s ceiling' : writer.personality === 'enthusiastic' ? 'The potential for something special is there' : 'Time will tell how this team responds'}, ` +
    `but one thing is certain: in college football, every week brings new opportunities and new challenges.`
  );
  
  // 8. Final wrap-up tone (hype, doubt, momentum)
  if (won && writer.personality === 'enthusiastic') {
    paragraphs.push(
      `${catchphrase}! The ${team.mascot} are rolling, and the energy around this program is palpable. ` +
      `${isClose ? 'Games like this build championship character' : 'Dominant performances like this send a message'}. ` +
      `The faithful are believing, the team is buying in, and the best may be yet to come. ${team.mascot} nation, enjoy this one!`
    );
  } else if (!won && writer.personality === 'critical') {
    paragraphs.push(
      `${catchphrase}. Another week, another disappointment. The ${team.mascot} faithful deserve better than what they witnessed today. ` +
      `Until fundamental changes are made, expect more of the same. The talent is there, but talent without execution is just potential – and potential doesn't win football games.`
    );
  } else {
    paragraphs.push(
      `As the ${team.mascot} ${won ? 'celebrate' : 'regroup from'} this week ${game.week} ${won ? 'triumph' : 'setback'}, ` +
      `the bigger picture remains in focus. The season is far from over, and how this team responds in the coming weeks will define their legacy. ` +
      `For now, the ${team.mascot} ${won ? 'can savor this victory' : 'must learn from this defeat'} while keeping their eyes on the ultimate prize. ` +
      `In college football, it's not how you start – it's how you finish.`
    );
  }
  
  return paragraphs.filter(p => p).join('\n\n');
}

function generateRecruitingArticle(recruit: Recruit, team: Team, writer: NewsWriter): string {
  const catchphrase = writer.catchphrases[Math.floor(Math.random() * writer.catchphrases.length)];
  
  if (writer.personality === 'enthusiastic') {
    return `${catchphrase}! The ${team.name} coaching staff has landed an absolute STUD in ${recruit.stars}-star ${recruit.position} ${recruit.name} from ${recruit.state}!\n\n` +
      `This is HUGE for the program! ${recruit.name} is exactly the type of playmaker that can take this team to the next level. ${team.mascot} fans should be pumped!\n\n` +
      `The momentum on the recruiting trail is real, folks. This staff is building something special!`;
  }
  
  return `The ${team.name} coaching staff has landed a major commitment from ${recruit.stars}-star ${recruit.position} ${recruit.name} out of ${recruit.state}.\n\n` +
    `"We're thrilled to add ${recruit.name} to our ${team.mascot} family," said the coaching staff. "His talent and character are exactly what we're looking for."\n\n` +
    `This commitment continues the strong recruiting momentum for ${team.name} as they build toward the future.`;
}

function generateSeasonOutlook(season: Season, team: Team, writer: NewsWriter): string {
  const catchphrase = writer.catchphrases[Math.floor(Math.random() * writer.catchphrases.length)];
  
  if (writer.personality === 'data-driven') {
    return `${catchphrase}, the ${team.mascot} sit at ${season.overallRecord.wins}-${season.overallRecord.losses} with a 73.2% win percentage.\n\n` +
      `Conference performance (${season.conferenceRecord.wins}-${season.conferenceRecord.losses}) projects to a ${season.conferenceRecord.wins >= 5 ? '78% probability of conference title contention' : '42% chance of bowl eligibility improvement'}.\n\n` +
      `${season.ranking ? `Current ranking (#${season.ranking}) combined with strength of schedule metrics suggests a 31% probability of New Year\'s Six bowl selection.` : `Despite being unranked, computer models show a 67% chance of receiving votes in the next poll.`}`;
  }
  
  return `At ${season.overallRecord.wins}-${season.overallRecord.losses}, the ${team.mascot} are having a season to remember.\n\n` +
    `With a conference record of ${season.conferenceRecord.wins}-${season.conferenceRecord.losses}, the team ${season.conferenceRecord.wins >= 5 ? 'is in the hunt for a conference title' : 'has shown they can compete with anyone'}.\n\n` +
    `${season.ranking ? `Currently ranked #${season.ranking}, the ${team.mascot} have put themselves in position for a major bowl game.` : `While not ranked yet, this team has shown they belong among the nation's best.`}`;
}

// Type definitions
export interface NewsWriter {
  id: string;
  name: string;
  title: string;
  personality: 'veteran' | 'enthusiastic' | 'critical' | 'balanced' | 'data-driven';
  writingStyle: 'analytical' | 'conversational' | 'direct' | 'descriptive' | 'technical';
  bias: 'optimistic' | 'realistic' | 'skeptical' | 'neutral' | 'analytical';
  yearsExperience: number;
  avatar: string;
  specialties: string[];
  catchphrases: string[];
}

export interface ArticleComment {
  id: string;
  articleId: string;
  author: string;
  archetype?: string;
  content: string;
  timestamp: string;
  likes: number;
  isUserComment?: boolean;
  isAuthorComment?: boolean;
  parentId?: string;
  replies?: ArticleComment[];
  depth?: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  subheadline: string;
  content: string;
  date: string;
  type: 'game-recap' | 'recruiting' | 'analysis' | 'opinion';
  author: string;
  authorTitle?: string;
  imagePrompt?: string;
  imageUrl?: string;
  comments?: ArticleComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  views: number;
  lastActivity: string;
  category: 'game-thread' | 'recruiting' | 'general' | 'coaching' | 'off-topic';
  isPinned?: boolean;
}