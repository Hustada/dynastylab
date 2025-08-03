import OpenAI from 'openai';
import type { Game, Team, Season, Player, Recruit } from '../types/index';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
});

export interface AIGeneratedContent {
  content: string;
  author?: string;
  archetype?: string;
}

// Generate image using DALL-E
export async function generateArticleImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return response.data[0]?.url;
  } catch (error) {
    console.error('Failed to generate image:', error);
    return undefined;
  }
}

// Generate sports article using GPT
export async function generateSportsArticle(
  game: Game,
  team: Team,
  writerPersonality: string,
  writerName: string
): Promise<string> {
  const won = game.result === 'W';
  const margin = Math.abs(game.score.for - game.score.against);
  const isBlowout = margin > 20;
  const isClose = margin <= 7;
  
  const prompt = `You are ${writerName}, a ${writerPersonality} college football writer covering the ${team.name} ${team.mascot}. 
  
Write a detailed 8-12 paragraph article about this game:
- ${team.name} ${won ? 'defeated' : 'lost to'} ${game.opponent} ${game.score.for}-${game.score.against}
- Location: ${game.location}
- Stats: ${game.stats.passingYards || 0} passing yards, ${game.stats.rushingYards || 0} rushing yards, ${game.stats.turnovers || 0} turnovers

Writing style guidelines:
- ${writerPersonality === 'enthusiastic' ? 'Be passionate and optimistic, use exciting language' : ''}
- ${writerPersonality === 'critical' ? 'Be analytical and critical, point out flaws even in wins' : ''}
- ${writerPersonality === 'analytical' ? 'Focus on statistics, efficiency metrics, and strategic analysis' : ''}
- ${isClose && won ? 'Emphasize the dramatic finish and clutch plays' : ''}
- ${isBlowout && won ? 'Celebrate the dominant performance' : ''}
- ${!won && isBlowout ? 'Be critical of the poor performance' : ''}

Include:
1. Dramatic opening paragraph
2. Key turning point in the game
3. Offensive performance analysis
4. Defensive performance analysis
5. Coaching decisions and strategy
6. Player performances (create realistic player names)
7. What this means for the season
8. Looking ahead

Make it sound like authentic sports journalism with specific details and analysis.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1000
    });

    return response.choices[0].message.content || 'Article generation failed.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template if API fails
    return `The ${team.mascot} ${won ? 'secured a' : 'suffered a'} ${margin}-point ${won ? 'victory' : 'defeat'} against ${game.opponent}. [API Error - Using Fallback]`;
  }
}

// Generate forum responses using GPT
export async function generateForumResponse(
  userPost: string,
  threadContext: string,
  team: Team,
  archetype: string,
  recentGames?: Game[]
): Promise<AIGeneratedContent> {
  const recentRecord = recentGames ? 
    `Recent record: ${recentGames.filter(g => g.result === 'W').length}-${recentGames.filter(g => g.result === 'L').length}` : 
    '';

  const prompt = `You are a ${team.mascot} fan on a sports forum with this personality: ${archetype}

Thread context: ${threadContext}
User posted: "${userPost}"
${recentRecord}

Respond as this type of fan:
- ${archetype === 'eternal-optimist' ? 'Always positive, finds silver linings, believes in the team no matter what' : ''}
- ${archetype === 'stats-nerd' ? 'Focuses on statistics, analytics, efficiency metrics' : ''}
- ${archetype === 'old-timer' ? 'References past seasons, compares to historical teams, nostalgic' : ''}
- ${archetype === 'doomer' ? 'Pessimistic, expects the worst, critical of everything' : ''}
- ${archetype === 'reasonable' ? 'Balanced takes, sees both sides, rational analysis' : ''}

Keep response under 100 words. Be authentic to the archetype. Use forum-style casual language.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 150
    });

    return {
      content: response.choices[0].message.content || 'I agree with that take.',
      archetype
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback response
    return {
      content: 'Interesting point. What does everyone else think?',
      archetype
    };
  }
}

// Generate dynamic news ticker items
export async function generateTickerItem(
  team: Team,
  games: Game[],
  recruits: Recruit[],
  season: Season
): Promise<string> {
  const lastGame = games[games.length - 1];
  const recentCommits = recruits.filter(r => r.status === 'Committed').slice(-3);
  
  const context = `Team: ${team.name} ${team.mascot}
Current record: ${season.overallRecord.wins}-${season.overallRecord.losses}
Last game: ${lastGame ? `${lastGame.result === 'W' ? 'Won' : 'Lost'} vs ${lastGame.opponent} ${lastGame.score.for}-${lastGame.score.against}` : 'No games yet'}
Recent commits: ${recentCommits.map(r => `${r.stars}⭐ ${r.position} ${r.name}`).join(', ')}
${season.ranking ? `Currently ranked #${season.ranking}` : 'Unranked'}`;

  const prompt = `Generate a single breaking news ticker item (under 20 words) for a college football team based on this context:
${context}

Make it exciting and newsworthy. Examples: recruiting news, game results, rankings, injury updates, etc.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 50
    });

    return response.choices[0].message.content?.trim() || 'Breaking: Check back for updates';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `${team.mascot} ${season.overallRecord.wins}-${season.overallRecord.losses} • Check back for updates`;
  }
}

// Generate coach hot seat discussion
export async function generateCoachingDiscussion(
  coachName: string,
  record: string,
  hotSeat: boolean,
  team: Team,
  recentGames: Game[]
): Promise<string> {
  const losses = recentGames.filter(g => g.result === 'L').length;
  const blowoutLosses = recentGames.filter(g => 
    g.result === 'L' && Math.abs(g.score.for - g.score.against) > 20
  ).length;

  const prompt = `Write a forum post about ${team.name} coach ${coachName} (Record: ${record}).
${hotSeat ? 'Coach is on the hot seat.' : 'Coach is not currently on hot seat.'}
Recent performance: ${losses} losses in last ${recentGames.length} games, ${blowoutLosses} blowouts.

Write as a passionate fan. 50-75 words. ${hotSeat ? 'Be critical but fair' : 'Be supportive but honest'}.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100
    });

    return response.choices[0].message.content || `${coachName}'s future remains uncertain.`;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `${coachName} needs to turn things around quickly. The fanbase is getting restless.`;
  }
}

// Generate recruiting pitch
export async function generateRecruitingPost(
  recruit: Recruit,
  team: Team,
  currentCommits: number
): Promise<string> {
  const prompt = `Write an excited forum post about ${recruit.stars}-star ${recruit.position} ${recruit.name} from ${recruit.hometown}, ${recruit.state} ${recruit.status === 'Committed' ? 'committing to' : 'considering'} ${team.name}.
Current recruiting class has ${currentCommits} commits.

Write as an enthusiastic fan. 40-60 words. Include why this is important for the program.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 80
    });

    return response.choices[0].message.content || `Great pickup for the ${team.mascot}!`;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `${recruit.name} would be a huge get for our ${recruit.position} room. Fingers crossed!`;
  }
}