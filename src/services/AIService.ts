import type { Game, Player, Recruit, Season, Team, Coach } from '../types/index';
import { newsWriters, type NewsWriter, type NewsArticle, type ForumPost } from '../utils/AIContentGenerator';
import { generateForumResponse as generateOpenAIResponse } from './OpenAIService';

// Fan archetypes for forum personalities
export const fanArchetypes = {
  'eternal-optimist': {
    name: 'Eternal Optimist',
    traits: ['always positive', 'sees silver linings', 'believes in the team'],
    responseStyle: 'enthusiastic and hopeful',
    topics: ['team potential', 'player development', 'bright future'],
    examplePhrases: [
      "This is our year!",
      "I love what I'm seeing from this team",
      "Trust the process, good things are coming",
      "Every loss is a learning opportunity"
    ]
  },
  'stats-nerd': {
    name: 'Stats Nerd',
    traits: ['data-driven', 'analytical', 'loves metrics'],
    responseStyle: 'technical with numbers and analysis',
    topics: ['advanced stats', 'efficiency metrics', 'statistical trends'],
    examplePhrases: [
      "The numbers tell an interesting story",
      "According to PFF grades",
      "Our SP+ rating suggests",
      "Regression to the mean indicates"
    ]
  },
  'old-timer': {
    name: 'Old Timer',
    traits: ['nostalgic', 'compares to past', 'traditional values'],
    responseStyle: 'reminiscent with historical references',
    topics: ['past glory days', 'how things used to be', 'tradition'],
    examplePhrases: [
      "Back in my day",
      "I remember when",
      "This reminds me of the '98 team",
      "We need to get back to fundamentals"
    ]
  },
  'doom-and-gloom': {
    name: 'Doom and Gloom',
    traits: ['pessimistic', 'critical', 'expects the worst'],
    responseStyle: 'negative and critical',
    topics: ['what went wrong', 'coaching mistakes', 'team weaknesses'],
    examplePhrases: [
      "Same old story",
      "Here we go again",
      "I've seen this movie before",
      "When will we learn?"
    ]
  },
  'recruiting-guru': {
    name: 'Recruiting Guru',
    traits: ['knows all prospects', 'tracks commitments', 'evaluates talent'],
    responseStyle: 'insider knowledge about recruits',
    topics: ['recruiting rankings', 'prospect evaluations', 'commitment predictions'],
    examplePhrases: [
      "Sources tell me",
      "This kid is the real deal",
      "Crystal ball prediction",
      "Fits our system perfectly"
    ]
  },
  'casual-fan': {
    name: 'Casual Fan',
    traits: ['moderate knowledge', 'emotional reactions', 'social aspect'],
    responseStyle: 'friendly and conversational',
    topics: ['game day experience', 'general observations', 'team support'],
    examplePhrases: [
      "Great game today!",
      "Anyone going to the tailgate?",
      "That was exciting!",
      "Go team!"
    ]
  },
  'rival-troll': {
    name: 'Rival Troll',
    traits: ['antagonistic', 'sarcastic', 'provocative'],
    responseStyle: 'mocking and confrontational',
    topics: ['rival comparisons', 'past failures', 'trash talk'],
    examplePhrases: [
      "Rent free in your heads",
      "Scoreboard",
      "Remember when you thought",
      "Cope harder"
    ]
  },
  'coach-critic': {
    name: 'Coach Critic',
    traits: ['questions decisions', 'armchair quarterback', 'tactical focus'],
    responseStyle: 'analytical but critical of coaching',
    topics: ['play calling', 'game management', 'personnel decisions'],
    examplePhrases: [
      "Why didn't we run there?",
      "Terrible clock management",
      "That's on the coaches",
      "Fire the coordinator"
    ]
  }
};

// Weekly analysis engine
export class WeeklyAnalysisEngine {
  constructor(private apiKey?: string) {}

  async analyzeWeeklyData(
    games: Game[],
    team: Team,
    season: Season,
    players: Player[],
    recruits: Recruit[]
  ): Promise<{
    keyTrends: string[];
    standoutPerformances: string[];
    concerns: string[];
    outlook: string;
  }> {
    // Analyze recent games (last 1-2 weeks)
    const recentGames = games.slice(-2);
    const keyTrends: string[] = [];
    const standoutPerformances: string[] = [];
    const concerns: string[] = [];
    
    // Analyze game trends
    const recentWins = recentGames.filter(g => g.result === 'W').length;
    const totalPoints = recentGames.reduce((sum, g) => sum + g.score.for, 0);
    const pointsAllowed = recentGames.reduce((sum, g) => sum + g.score.against, 0);
    const totalTurnovers = recentGames.reduce((sum, g) => sum + (g.stats.turnovers || 0), 0);
    
    if (recentWins === recentGames.length) {
      keyTrends.push(`${team.mascot} on ${recentGames.length}-game winning streak`);
    } else if (recentWins === 0) {
      keyTrends.push(`${team.mascot} struggling with ${recentGames.length}-game losing streak`);
    }
    
    if (totalPoints / recentGames.length > 35) {
      keyTrends.push('Offense hitting stride with explosive performances');
    }
    
    if (pointsAllowed / recentGames.length < 20) {
      keyTrends.push('Defense dominating opponents');
    }
    
    // Identify standout performances
    recentGames.forEach(game => {
      if (game.stats.passingYards && game.stats.passingYards > 300) {
        standoutPerformances.push(`QB threw for ${game.stats.passingYards} yards vs ${game.opponent}`);
      }
      if (game.stats.rushingYards && game.stats.rushingYards > 200) {
        standoutPerformances.push(`Ground game dominated with ${game.stats.rushingYards} rushing yards`);
      }
    });
    
    // Identify concerns
    if (totalTurnovers > 4) {
      concerns.push('Ball security issues with multiple turnovers');
    }
    
    if (season.conferenceRecord.losses > season.conferenceRecord.wins) {
      concerns.push('Struggling in conference play');
    }
    
    // Generate outlook
    const outlook = season.overallRecord.wins >= 8 
      ? 'Playoff hopes alive with strong finish needed'
      : season.overallRecord.wins >= 6
      ? 'Bowl eligibility within reach'
      : 'Building for the future with young talent';
    
    return { keyTrends, standoutPerformances, concerns, outlook };
  }

  async generateDynamicArticle(
    type: 'game-recap' | 'recruiting' | 'analysis',
    data: any,
    writer: NewsWriter,
    team: Team
  ): Promise<string> {
    // This would connect to OpenAI API if apiKey is provided
    // For now, we'll generate dynamic content based on the data
    
    if (type === 'game-recap') {
      return this.generateGameRecapArticle(data.game, team, writer);
    } else if (type === 'recruiting') {
      return this.generateRecruitingArticle(data.recruit, team, writer);
    } else {
      return this.generateAnalysisArticle(data, team, writer);
    }
  }

  private generateGameRecapArticle(game: Game, team: Team, writer: NewsWriter): string {
    const won = game.result === 'W';
    const margin = Math.abs(game.score.for - game.score.against);
    const paragraphs: string[] = [];
    
    // Opening paragraph
    if (writer.personality === 'enthusiastic' && won) {
      paragraphs.push(
        `What a performance! The ${team.mascot} put on an absolute clinic against ${game.opponent}, ` +
        `cruising to a ${game.score.for}-${game.score.against} victory that had the home crowd on their feet all night long. ` +
        `This was ${team.name} football at its finest, with all three phases clicking in perfect harmony.`
      );
    } else if (writer.personality === 'critical' && !won) {
      paragraphs.push(
        `Another week, another disappointment. The ${team.mascot} fell flat on their faces against ${game.opponent}, ` +
        `losing ${game.score.against}-${game.score.for} in a game that exposed every weakness this team has been trying to hide. ` +
        `The questions are mounting, and the answers are nowhere to be found.`
      );
    } else {
      paragraphs.push(
        `The ${team.mascot} ${won ? 'defeated' : 'fell to'} ${game.opponent} by a score of ` +
        `${won ? `${game.score.for}-${game.score.against}` : `${game.score.against}-${game.score.for}`} ` +
        `in a ${margin > 14 ? 'decisive' : 'hard-fought'} ${game.location.toLowerCase()} ${game.rivalry ? 'rivalry ' : ''}game. ` +
        `The ${won ? 'victory' : 'defeat'} ${won ? 'improves' : 'drops'} the ${team.mascot} record on the season.`
      );
    }
    
    // Game flow paragraph
    paragraphs.push(
      `The game started with both teams trading blows in the first quarter. ` +
      `${team.name} ${game.stats.turnovers > 0 ? `struggled with ball security, committing ${game.stats.turnovers} turnovers that ` : ''}` +
      `${won ? 'managed to overcome adversity and' : 'couldn\'t maintain consistency and'} ` +
      `${won ? 'pull away' : 'keep pace'} as the game progressed. ` +
      `The ${won ? 'turning point' : 'final nail in the coffin'} came in the ${won ? 'third' : 'fourth'} quarter when ` +
      `${won ? `the ${team.mascot} offense found its rhythm` : `${game.opponent} put the game out of reach`}.`
    );
    
    // Statistical breakdown
    const totalYards = (game.stats.passingYards || 0) + (game.stats.rushingYards || 0);
    paragraphs.push(
      `Statistically, the ${team.mascot} ${totalYards > 400 ? 'dominated' : totalYards > 300 ? 'performed adequately' : 'struggled'} ` +
      `on offense, accumulating ${game.stats.passingYards || 0} yards through the air and ${game.stats.rushingYards || 0} yards on the ground. ` +
      `${game.stats.passingTDs ? `The passing game accounted for ${game.stats.passingTDs} touchdowns, ` : ''}` +
      `${game.stats.rushingTDs ? `while the ground attack added ${game.stats.rushingTDs} more scores. ` : ''}` +
      `${game.stats.turnovers ? `However, ${game.stats.turnovers} turnovers proved ${won ? 'nearly' : ''} costly. ` : ''}` +
      `The defense ${won ? 'stepped up when it mattered most' : 'had its moments but couldn\'t make enough stops'}.`
    );
    
    // Looking ahead paragraph
    paragraphs.push(
      `With this ${won ? 'victory' : 'loss'}, the ${team.mascot} ${won ? 'build momentum' : 'must regroup'} ` +
      `as they prepare for their next challenge. ${writer.catchphrases[Math.floor(Math.random() * writer.catchphrases.length)]}, ` +
      `and this team ${won ? 'seems to be hitting their stride' : 'has work to do'} at the right time. ` +
      `The coaching staff will ${won ? 'look to build on this performance' : 'need to address the issues that plagued them'} ` +
      `in practice this week. ${won ? 'If they can maintain this level of play' : 'If they can clean up the mistakes'}, ` +
      `the ${team.mascot} ${won ? 'could be a force to be reckoned with' : 'still have a chance to salvage their season'}.`
    );
    
    // Add more paragraphs for a full-length article
    if (won && margin > 20) {
      paragraphs.push(
        `Individual performances worth noting included stellar play from both sides of the ball. ` +
        `The offensive line dominated the line of scrimmage, opening holes for the running backs and giving the quarterback ample time in the pocket. ` +
        `Multiple players had career days, and the depth of this roster was on full display as backups contributed meaningful snaps.`
      );
      
      paragraphs.push(
        `Special teams also played a crucial role in the victory. Field position was consistently in ${team.name}'s favor, ` +
        `and the coverage units were exceptional. This complete team effort is exactly what head coach had been preaching all week in practice. ` +
        `When all three phases are clicking like this, the ${team.mascot} are tough to beat.`
      );
    }
    
    // Injury/roster update paragraph
    paragraphs.push(
      `From a roster standpoint, the ${team.mascot} ${won ? 'emerged relatively healthy' : 'may have suffered some key injuries'} from this contest. ` +
      `The depth chart will be evaluated throughout the week as the medical staff assesses any bumps and bruises. ` +
      `With the season ${game.week > 8 ? 'entering the home stretch' : 'still in its early stages'}, ` +
      `maintaining health will be crucial for ${team.name}'s ${won ? 'continued success' : 'hopes of turning things around'}.`
    );
    
    // Fan reaction paragraph
    paragraphs.push(
      `The ${team.name} faithful ${won ? 'left the stadium buzzing with excitement' : 'filed out quietly, disappointment evident on their faces'}. ` +
      `${game.location === 'Home' ? `The home crowd of ${Math.floor(Math.random() * 20000) + 40000} ` : 'Those who made the trip '}` +
      `${won ? 'got their money\'s worth' : 'deserved better'} as they watched their ${team.mascot} ` +
      `${won ? 'put together a complete performance' : 'struggle to find answers'}. ` +
      `Social media ${won ? 'erupted with celebration' : 'was filled with frustration'} as fans ` +
      `${won ? 'praised the team\'s effort' : 'called for changes'}.`
    );
    
    // Closing thoughts
    paragraphs.push(
      `As the dust settles on this week ${game.week} ${won ? 'triumph' : 'setback'}, ` +
      `the ${team.mascot} must quickly shift their focus to next week's opponent. ` +
      `The season is a marathon, not a sprint, and every game presents new challenges and opportunities. ` +
      `${writer.personality === 'optimistic' ? 'This team has shown flashes of brilliance' : 'There\'s still time to right the ship'}, ` +
      `but consistency will be key moving forward. One thing is certain: ${team.name} fans will be watching closely ` +
      `to see how their team responds in the coming weeks.`
    );
    
    return paragraphs.join('\n\n');
  }

  private generateRecruitingArticle(recruit: Recruit, team: Team, writer: NewsWriter): string {
    const paragraphs: string[] = [];
    
    // Opening with excitement level based on star rating
    const excitement = recruit.stars >= 4 ? 'Major recruiting victory!' : 'Solid addition to the class!';
    paragraphs.push(
      `${excitement} The ${team.name} coaching staff has secured a commitment from ${recruit.stars}-star ${recruit.position} ` +
      `${recruit.name} out of ${recruit.hometown}, ${recruit.state}. The ${recruit.height}, ${recruit.weight} prospect ` +
      `chose the ${team.mascot} over several other prominent programs, citing the coaching staff's vision and ` +
      `the opportunity to compete for playing time as key factors in his decision.`
    );
    
    // Evaluation paragraph
    paragraphs.push(
      `${writer.catchphrases[1]} when evaluating ${recruit.name}'s skill set. ` +
      `${recruit.stars >= 4 ? 'Elite' : recruit.stars === 3 ? 'Solid' : 'Developmental'} ` +
      `athleticism combined with excellent football IQ makes him a perfect fit for the ${team.mascot} system. ` +
      `Scouts have praised his ${recruit.position === 'QB' ? 'arm strength and decision-making' : 
        recruit.position === 'RB' ? 'vision and burst through the hole' :
        recruit.position === 'WR' ? 'route running and hands' :
        recruit.position === 'OL' ? 'footwork and power at the point of attack' :
        recruit.position === 'DL' ? 'first step and ability to disrupt the backfield' :
        recruit.position === 'LB' ? 'sideline-to-sideline speed and tackling ability' :
        recruit.position === 'DB' ? 'coverage skills and ball awareness' :
        'versatility and competitive drive'}. ` +
      `At ${recruit.height} and ${recruit.weight}, he has ${recruit.stars >= 4 ? 'ideal' : 'good'} size for the position.`
    );
    
    // High school career paragraph
    paragraphs.push(
      `During his high school career at ${recruit.hometown} High School, ${recruit.name} put up impressive numbers ` +
      `and earned ${recruit.stars >= 4 ? 'numerous accolades including all-state honors' : 'all-district recognition'}. ` +
      `His junior season saw him ${
        recruit.position === 'QB' ? 'throw for over 3,000 yards and 35 touchdowns' :
        recruit.position === 'RB' ? 'rush for 1,500 yards and 20 touchdowns' :
        recruit.position === 'WR' ? 'haul in 65 catches for 1,200 yards and 15 touchdowns' :
        'dominate on both sides of the ball'
      }. ` +
      `College coaches took notice, and the recruiting battle intensified throughout his senior campaign.`
    );
    
    // Recruitment process paragraph
    paragraphs.push(
      `The recruitment of ${recruit.name} was a ${recruit.stars >= 4 ? 'highly competitive' : 'steady'} process that saw ` +
      `${recruit.stars >= 4 ? 'multiple Power 5 programs vying for his services' : 'several schools showing strong interest'}. ` +
      `The ${team.mascot} coaching staff made him a priority early in the process, ` +
      `${recruit.stars >= 4 ? 'offering him before his junior season' : 'extending an offer after impressive camp performances'}. ` +
      `Multiple visits to campus, including an official visit ${recruit.stars >= 4 ? 'for a marquee game' : 'during the season'}, ` +
      `helped solidify the relationship between ${recruit.name} and the program.`
    );
    
    // Impact on the class paragraph
    paragraphs.push(
      `This commitment ${recruit.stars >= 4 ? 'significantly bolsters' : 'adds depth to'} the ${team.mascot}'s ` +
      `${new Date().getFullYear()} recruiting class. ${recruit.name} becomes the ` +
      `${Math.floor(Math.random() * 10) + 10}th commitment in the class and the ` +
      `${Math.floor(Math.random() * 3) + 1}${recruit.stars >= 4 ? 'st' : 'rd'} at his position. ` +
      `His addition ${recruit.stars >= 4 ? 'could help attract other top targets' : 'fills a need'} as the ${team.mascot} ` +
      `look to ${recruit.stars >= 4 ? 'climb the national rankings' : 'build a balanced class'}.`
    );
    
    // Future outlook paragraph
    paragraphs.push(
      `Looking ahead, ${recruit.name} projects as a ${
        recruit.stars >= 4 ? 'potential early contributor who could see the field as a freshman' :
        recruit.stars === 3 ? 'player who will compete for playing time after a year of development' :
        'developmental prospect with upside'
      }. ` +
      `His skill set fits well with what the ${team.mascot} like to do ${
        ['QB', 'RB', 'WR'].includes(recruit.position) ? 'offensively' : 'defensively'
      }, ` +
      `and the coaching staff is excited about his potential impact. With early enrollment ${
        Math.random() > 0.5 ? 'planned for January' : 'not in the plans'
      }, ` +
      `${recruit.name} will ${Math.random() > 0.5 ? 'get a head start on learning the system' : 'arrive on campus this summer'}.`
    );
    
    // Coach and player quotes paragraph
    paragraphs.push(
      `"We're thrilled to welcome ${recruit.name.split(' ')[0]} to the ${team.mascot} family," said the ${team.name} coaching staff. ` +
      `"He embodies everything we look for in a student-athlete: talent, character, and a burning desire to compete at the highest level. ` +
      `We believe he's going to be a special player for us." ${recruit.name} echoed the excitement, stating, ` +
      `"I knew from my first visit that this was home. The coaches, the players, the facilities - everything about ${team.name} ` +
      `felt right. I can't wait to get to work and help bring championships to this program."`
    );
    
    // Closing paragraph
    paragraphs.push(
      `With ${recruit.name} now firmly in the fold, the ${team.mascot} coaching staff will continue their efforts on the recruiting trail. ` +
      `Several other targets remain on the board, and momentum from this commitment could prove valuable in those pursuits. ` +
      `As National Signing Day approaches, ${team.name} fans have plenty of reason for optimism about the future of their program. ` +
      `The addition of talented players like ${recruit.name} ensures that the ${team.mascot} will continue to compete ` +
      `at the highest level for years to come.`
    );
    
    return paragraphs.join('\n\n');
  }

  private generateAnalysisArticle(data: any, team: Team, writer: NewsWriter): string {
    const { season, keyTrends, outlook } = data;
    const paragraphs: string[] = [];
    
    // Opening with current state
    paragraphs.push(
      `${writer.catchphrases[0]} as we examine the ${team.mascot}'s season through ${season.games.length} games. ` +
      `With a record of ${season.overallRecord.wins}-${season.overallRecord.losses} ` +
      `(${season.conferenceRecord.wins}-${season.conferenceRecord.losses} in conference), ` +
      `the data reveals interesting patterns about this team's trajectory. ` +
      `${season.ranking ? `Currently ranked #${season.ranking} nationally, ` : 'While unranked, '}` +
      `the ${team.mascot} find themselves at a critical juncture of their season.`
    );
    
    // Trends analysis
    paragraphs.push(
      `Several key trends have emerged from our comprehensive analysis. ${keyTrends.join('. ')}. ` +
      `These patterns suggest a team that is ${
        season.overallRecord.wins > season.overallRecord.losses ? 'finding its identity' : 'searching for consistency'
      }. ` +
      `The advanced metrics paint a picture of a program ${
        season.ranking ? 'on the rise' : 'with room for growth'
      }, ` +
      `particularly when examining performance in ${
        season.conferenceRecord.wins > 2 ? 'conference play' : 'non-conference matchups'
      }.`
    );
    
    // Offensive analysis
    paragraphs.push(
      `Offensively, the ${team.mascot} have shown ${
        Math.random() > 0.5 ? 'explosive potential' : 'steady improvement'
      } throughout the season. ` +
      `Averaging ${Math.floor(Math.random() * 100) + 350} yards per game, the unit ranks ${
        Math.floor(Math.random() * 50) + 30
      }th nationally in total offense. ` +
      `The ${Math.random() > 0.5 ? 'passing' : 'rushing'} game has been particularly ${
        Math.random() > 0.5 ? 'effective' : 'inconsistent'
      }, ` +
      `accounting for ${Math.floor(Math.random() * 30) + 55}% of the total yardage. ` +
      `Red zone efficiency sits at ${Math.floor(Math.random() * 20) + 70}%, ` +
      `${Math.random() > 0.5 ? 'an area of strength' : 'leaving room for improvement'} as the season progresses.`
    );
    
    // Defensive analysis
    paragraphs.push(
      `Defensively, the statistics tell a ${
        Math.random() > 0.5 ? 'compelling story of improvement' : 'tale of inconsistency'
      }. ` +
      `The ${team.mascot} defense allows an average of ${Math.floor(Math.random() * 100) + 300} yards per game, ` +
      `ranking ${Math.floor(Math.random() * 50) + 40}th nationally. ` +
      `Third down defense has been ${Math.random() > 0.5 ? 'a strength' : 'an area of concern'}, ` +
      `with opponents converting ${Math.floor(Math.random() * 15) + 30}% of their attempts. ` +
      `The pass rush has generated ${Math.floor(Math.random() * 20) + 15} sacks through ${season.games.length} games, ` +
      `while the secondary has ${Math.floor(Math.random() * 10) + 5} interceptions.`
    );
    
    // Special teams and field position
    paragraphs.push(
      `An often overlooked aspect of the game, special teams and field position have played a crucial role in the ${team.mascot}'s ` +
      `${season.overallRecord.wins > season.overallRecord.losses ? 'success' : 'struggles'} this season. ` +
      `Starting field position differential of ${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 10) + 3} yards ` +
      `has ${Math.random() > 0.5 ? 'provided an advantage' : 'been a challenge to overcome'}. ` +
      `The kicking game has converted ${Math.floor(Math.random() * 20) + 70}% of field goal attempts, ` +
      `while punt return units average ${Math.floor(Math.random() * 8) + 6} yards per return.`
    );
    
    // Strength of schedule
    paragraphs.push(
      `Context matters when evaluating performance, and the ${team.mascot}'s strength of schedule ranks ` +
      `${Math.floor(Math.random() * 50) + 25}th nationally. ` +
      `They've faced ${Math.floor(Math.random() * 3) + 2} ranked opponents thus far, ` +
      `posting a ${Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 3)} record in those contests. ` +
      `The remaining schedule includes ${Math.floor(Math.random() * 3) + 1} currently ranked teams, ` +
      `presenting both challenges and opportunities for resume-building victories.`
    );
    
    // Injury impact and depth
    paragraphs.push(
      `Roster health and depth have been ${Math.random() > 0.5 ? 'relatively stable' : 'tested'} throughout the campaign. ` +
      `The ${team.mascot} have had to navigate ${Math.random() > 0.5 ? 'minor' : 'significant'} injuries at key positions, ` +
      `forcing younger players into expanded roles. This adversity has ${
        Math.random() > 0.5 ? 'accelerated development' : 'exposed depth concerns'
      } ` +
      `that will need to be addressed through recruiting and player development. ` +
      `The silver lining is the experience gained by backups who may contribute more significantly next season.`
    );
    
    // Coaching and adjustments
    paragraphs.push(
      `From a coaching perspective, the staff has shown ${
        Math.random() > 0.5 ? 'adaptability' : 'stubbornness'
      } in their approach. ` +
      `In-game adjustments have been ${Math.random() > 0.5 ? 'effective' : 'questionable'}, ` +
      `particularly in ${Math.random() > 0.5 ? 'second half' : 'crucial'} situations. ` +
      `The team's record in one-score games (${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}) ` +
      `speaks to their ability to ${Math.random() > 0.5 ? 'execute under pressure' : 'close out tight contests'}. ` +
      `Penalty discipline, averaging ${Math.floor(Math.random() * 4) + 4} flags per game, ` +
      `${Math.random() > 0.5 ? 'has been impressive' : 'remains an area for improvement'}.`
    );
    
    // Playoff/bowl implications
    paragraphs.push(
      `Looking at the bigger picture, the ${team.mascot}'s postseason aspirations remain ${
        season.overallRecord.wins >= 8 ? 'very much alive' : season.overallRecord.wins >= 6 ? 'within reach' : 'a long shot'
      }. ` +
      `Current projections have them ${
        season.ranking && season.ranking <= 12 ? 'in the College Football Playoff conversation' :
        season.overallRecord.wins >= 6 ? 'headed to a respectable bowl game' :
        'needing to win out for bowl eligibility'
      }. ` +
      `The computer models give them a ${Math.floor(Math.random() * 30) + 40}% chance of achieving their stated goals, ` +
      `assuming current performance levels maintain through the remainder of the schedule.`
    );
    
    // Future outlook and conclusion
    paragraphs.push(
      `As we project forward, ${outlook}. The combination of ${
        Math.random() > 0.5 ? 'experienced veterans' : 'emerging young talent'
      } ` +
      `and ${Math.random() > 0.5 ? 'strong recruiting' : 'coaching stability'} ` +
      `positions the ${team.mascot} ${
        season.overallRecord.wins > season.overallRecord.losses ? 'favorably' : 'with work to do'
      } ` +
      `for both the remainder of this season and beyond. ` +
      `${writer.catchphrases[2]}, and the data suggests this program is ${
        Math.random() > 0.5 ? 'trending upward' : 'at a crossroads'
      }. ` +
      `How they finish this season will set the tone for what's to come in ${team.name} football.`
    );
    
    return paragraphs.join('\n\n');
  }
}

// Forum response generator with context awareness
export class ForumResponseGenerator {
  constructor(private apiKey?: string) {}

  async generateContextAwareResponse(
    userPost: string,
    thread: ForumPost,
    threadHistory: any[],
    team: Team,
    recentGames: Game[],
    season: Season
  ): Promise<{
    responses: Array<{
      author: string;
      archetype: string;
      content: string;
      delay: number;
    }>;
  }> {
    const responses: Array<{
      author: string;
      archetype: string;
      content: string;
      delay: number;
    }> = [];
    
    // Analyze post sentiment and content
    const postLower = userPost.toLowerCase();
    const sentiment = this.analyzeSentiment(postLower);
    const topics = this.extractTopics(postLower, thread.category);
    
    // Determine which archetypes would likely respond
    const respondingArchetypes = this.selectRespondingArchetypes(sentiment, topics, thread.category);
    
    // Generate responses for each archetype
    for (const archetypeKey of respondingArchetypes) {
      const archetype = fanArchetypes[archetypeKey as keyof typeof fanArchetypes];
      const response = this.generateArchetypeResponse(
        archetypeKey,
        archetype,
        userPost,
        thread,
        team,
        sentiment,
        topics,
        recentGames,
        season
      );
      
      if (response) {
        responses.push({
          author: this.generateArchetypeUsername(team, archetypeKey),
          archetype: archetype.name,
          content: response,
          delay: Math.random() * 3000 + 2000 // 2-5 seconds
        });
      }
    }
    
    return { responses };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'question' {
    const positiveWords = ['great', 'awesome', 'love', 'excited', 'win', 'dominate', 'best'];
    const negativeWords = ['terrible', 'hate', 'fire', 'awful', 'lose', 'suck', 'worst'];
    const questionWords = ['?', 'what', 'why', 'how', 'when', 'where', 'who'];
    
    const hasPositive = positiveWords.some(word => text.includes(word));
    const hasNegative = negativeWords.some(word => text.includes(word));
    const hasQuestion = questionWords.some(word => text.includes(word));
    
    if (hasQuestion) return 'question';
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  private extractTopics(text: string, category: string): string[] {
    const topics: string[] = [category];
    
    if (text.includes('coach') || text.includes('staff')) topics.push('coaching');
    if (text.includes('recruit') || text.includes('commit')) topics.push('recruiting');
    if (text.includes('playoff') || text.includes('bowl')) topics.push('postseason');
    if (text.includes('qb') || text.includes('quarterback')) topics.push('quarterback');
    if (text.includes('defense') || text.includes('offense')) topics.push('strategy');
    
    return topics;
  }

  private selectRespondingArchetypes(
    sentiment: string,
    topics: string[],
    category: string
  ): string[] {
    const archetypes: string[] = [];
    
    // Different archetypes respond to different situations
    if (sentiment === 'positive') {
      archetypes.push('eternal-optimist');
      if (Math.random() > 0.5) archetypes.push('casual-fan');
      if (Math.random() > 0.7) archetypes.push('doom-and-gloom'); // contrarian
    } else if (sentiment === 'negative') {
      archetypes.push('doom-and-gloom');
      if (Math.random() > 0.5) archetypes.push('eternal-optimist'); // counterpoint
      if (Math.random() > 0.6) archetypes.push('old-timer');
    } else if (sentiment === 'question') {
      if (topics.includes('recruiting')) archetypes.push('recruiting-guru');
      if (topics.includes('strategy') || topics.includes('coaching')) archetypes.push('coach-critic');
      archetypes.push('stats-nerd');
      if (Math.random() > 0.5) archetypes.push('casual-fan');
    }
    
    // Limit responses to 0-3
    return archetypes.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  private generateArchetypeResponse(
    archetypeKey: string,
    archetype: any,
    userPost: string,
    thread: ForumPost,
    team: Team,
    sentiment: string,
    topics: string[],
    recentGames: Game[],
    season: Season
  ): string {
    const lastGame = recentGames[recentGames.length - 1];
    
    switch (archetypeKey) {
      case 'eternal-optimist':
        return this.generateOptimistResponse(userPost, team, sentiment, lastGame, season);
      
      case 'stats-nerd':
        return this.generateStatsNerdResponse(userPost, team, topics, recentGames, season);
      
      case 'old-timer':
        return this.generateOldTimerResponse(userPost, team, sentiment, topics);
      
      case 'doom-and-gloom':
        return this.generateDoomResponse(userPost, team, sentiment, lastGame, season);
      
      case 'recruiting-guru':
        return this.generateRecruitingGuruResponse(userPost, team, topics);
      
      case 'coach-critic':
        return this.generateCoachCriticResponse(userPost, team, topics, lastGame);
      
      case 'casual-fan':
        return this.generateCasualFanResponse(userPost, team, sentiment, thread.category);
      
      default:
        return '';
    }
  }

  private generateOptimistResponse(
    userPost: string,
    team: Team,
    sentiment: string,
    lastGame: Game | undefined,
    season: Season
  ): string {
    if (sentiment === 'negative') {
      return `Hey now, let's not lose faith! Sure, ${lastGame && lastGame.result === 'L' ? 'that loss stung' : 'things look tough'}, ` +
        `but this ${team.mascot} team has shown they can bounce back. We're still ${season.overallRecord.wins}-${season.overallRecord.losses} ` +
        `and there's a lot of football left to play. Trust the process! Go ${team.mascot}! 💪`;
    } else {
      return `Exactly! This is what I've been saying all along! This ${team.mascot} team is special. ` +
        `${lastGame && lastGame.result === 'W' ? `That win over ${lastGame.opponent} proved it.` : ''} ` +
        `${season.ranking ? `We're ranked #${season.ranking} for a reason!` : 'Rankings don\'t tell the whole story!'} ` +
        `I believe this is our year! #${team.name.replace(/\s+/g, '')}Forever`;
    }
  }

  private generateStatsNerdResponse(
    userPost: string,
    team: Team,
    topics: string[],
    recentGames: Game[],
    season: Season
  ): string {
    const totalYards = recentGames.reduce((sum, g) => sum + (g.stats.passingYards || 0) + (g.stats.rushingYards || 0), 0);
    const avgYards = Math.round(totalYards / recentGames.length);
    
    return `Interesting point. Let me add some context with the numbers: Over the last ${recentGames.length} games, ` +
      `we're averaging ${avgYards} total yards per game. Our efficiency metrics show ${
        recentGames[0]?.stats.thirdDownConversions || 'improved'
      } third down conversion rate. ` +
      `${season.conferenceRecord.wins > season.conferenceRecord.losses 
        ? `In conference play, we're outscoring opponents by an average of ${Math.floor(Math.random() * 10) + 5} points.` 
        : `The concerning trend is our -${Math.floor(Math.random() * 5) + 2} turnover margin in conference games.`
      } ` +
      `Based on advanced analytics, our win probability for the remaining schedule is ${Math.floor(Math.random() * 20) + 60}%.`;
  }

  private generateOldTimerResponse(
    userPost: string,
    team: Team,
    sentiment: string,
    topics: string[]
  ): string {
    const years = ['\'85', '\'92', '\'98', '\'03', '\'07'];
    const randomYear = years[Math.floor(Math.random() * years.length)];
    
    if (topics.includes('coaching')) {
      return `You know, this reminds me of the ${randomYear} season when we had similar coaching questions. ` +
        `Back then, Coach Thompson (or was it Williams?) made the tough call to switch up the offense mid-season. ` +
        `These young fans don't remember, but we went on to win 8 straight after that. ` +
        `Sometimes you gotta trust the process. I've seen a lot of ${team.mascot} football in my day, and this too shall pass.`;
    } else {
      return `Been following this team since ${randomYear}, and let me tell you - ` +
        `${sentiment === 'positive' ? 'this feels like one of those special seasons' : 'we\'ve been through worse'}. ` +
        `I remember when we ${sentiment === 'positive' ? 'won the conference with a freshman QB' : 'lost 10 straight and still came back strong'}. ` +
        `The kids these days have all the talent in the world, they just need to play ${team.mascot} football - ` +
        `tough, physical, and smart. That's how we've always done it.`;
    }
  }

  private generateDoomResponse(
    userPost: string,
    team: Team,
    sentiment: string,
    lastGame: Game | undefined,
    season: Season
  ): string {
    if (sentiment === 'positive') {
      return `Oh great, another sunshine pumper. Wake me up when we actually beat a ranked team on the road. ` +
        `${lastGame?.result === 'W' ? `Sure we beat ${lastGame.opponent}, but they're terrible this year.` : ''} ` +
        `Mark my words, this team will find a way to disappoint us like they always do. ` +
        `${season.conferenceRecord.losses > 0 ? `Already ${season.conferenceRecord.losses} conference losses and counting...` : 'Just wait until conference play really heats up...'}`;
    } else {
      return `Finally someone who sees it like it is! I've been saying this all season - ` +
        `this team is NOT ready for primetime. ${lastGame?.stats.turnovers ? `${lastGame.stats.turnovers} turnovers last game!` : 'The mistakes are killing us!'} ` +
        `Same old ${team.mascot}, different year. Until we make SERIOUS changes, we'll keep getting the same results. ` +
        `But sure, keep drinking the kool-aid everyone. 🙄`;
    }
  }

  private generateRecruitingGuruResponse(
    userPost: string,
    team: Team,
    topics: string[]
  ): string {
    const positions = ['QB', 'WR', 'RB', 'OL', 'DL', 'LB', 'DB'];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const stars = Math.floor(Math.random() * 2) + 3;
    
    return `Great question about recruiting! Just got off the phone with my sources - ` +
      `we're in great shape with that ${stars}-star ${randomPosition} from ${
        ['Texas', 'Florida', 'California', 'Georgia', 'Ohio'][Math.floor(Math.random() * 5)]
      }. ` +
      `He's down to us and two other schools. Official visit went VERY well last weekend. ` +
      `Also hearing good things about our position with the JUCO transfer market. ` +
      `This staff is building something special on the trail. The ${new Date().getFullYear() + 1} class could be historic for ${team.name}. ` +
      `Can't say too much more right now, but stay tuned... 👀`;
  }

  private generateCoachCriticResponse(
    userPost: string,
    team: Team,
    topics: string[],
    lastGame: Game | undefined
  ): string {
    if (lastGame?.result === 'L') {
      return `THANK YOU! Someone else who sees the coaching issues! That 4th quarter was a masterclass in what NOT to do. ` +
        `${lastGame.stats.turnovers ? 'Zero adjustments after the turnovers.' : 'The play calling was predictable.'} ` +
        `Why are we still running that vanilla defense against spread teams? ` +
        `And don't get me started on the clock management... my high school coach could've handled that better. ` +
        `At some point, talent isn't enough. You need coaches who can actually COACH.`;
    } else {
      return `Look, I'm glad we won, but let's not pretend the coaching was perfect. ` +
        `${lastGame ? `That 3rd and short call in the 2nd quarter? Terrible.` : 'Some questionable decisions out there.'} ` +
        `We're winning despite the coaching, not because of it. Against better teams, those mistakes will cost us. ` +
        `I just want to see us maximize our potential, and right now, I don't think we are.`;
    }
  }

  private generateCasualFanResponse(
    userPost: string,
    team: Team,
    sentiment: string,
    category: string
  ): string {
    const responses = {
      'positive': [
        `Love the positivity! Go ${team.mascot}! 🎉`,
        `Right there with you! This team is fun to watch!`,
        `Agreed! Can't wait for the next game! Who's tailgating?`,
        `Yes!! ${team.name} all the way! 💪`
      ],
      'negative': [
        `I hear you, tough times but we gotta stick together!`,
        `Win or lose, still proud to be a ${team.mascot} fan!`,
        `Every team has ups and downs. We'll bounce back!`,
        `Chin up! Next game is a new opportunity!`
      ],
      'neutral': [
        `Good points all around! Go ${team.mascot}!`,
        `Interesting discussion! Love this forum!`,
        `Anyone else going to the game this weekend?`,
        `Great to see so much passion for our ${team.mascot}!`
      ],
      'question': [
        `Good question! I was wondering the same thing.`,
        `Not sure, but excited to find out! Go ${team.mascot}!`,
        `I think someone posted about this last week?`,
        `Following this thread for answers! 👀`
      ]
    };
    
    const sentimentResponses = responses[sentiment as keyof typeof responses] || responses.neutral;
    return sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
  }

  private generateArchetypeUsername(team: Team, archetypeKey: string): string {
    const suffixes = ['4Life', '_Nation', `_${new Date().getFullYear()}`, '_Forever', '_Fan'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const usernames: Record<string, string[]> = {
      'eternal-optimist': [`Believe_In_${team.mascot}`, `${team.mascot}_Faith`, `Always${team.name.replace(/\s+/g, '')}`],
      'stats-nerd': [`${team.name.replace(/\s+/g, '')}Analytics`, `NumbersCruncher`, `StatGuy_${team.mascot}`],
      'old-timer': [`${team.mascot}_Since85`, `OldSchool${team.name.replace(/\s+/g, '')}`, `Longtime${team.mascot}`],
      'doom-and-gloom': [`Realistic${team.mascot}Fan`, `${team.name.replace(/\s+/g, '')}Cynic`, `ToldYouSo`],
      'recruiting-guru': [`${team.mascot}Recruiting`, `InsideInfo`, `RecruitScoop_${team.name.replace(/\s+/g, '')}`],
      'coach-critic': [`FireThe${['OC', 'DC'][Math.floor(Math.random() * 2)]}`, `${team.mascot}PlayCaller`, `XsAndOs`],
      'casual-fan': [`Go${team.mascot}Go`, `${team.name.replace(/\s+/g, '')}4Ever`, `Proud${team.mascot}`],
      'rival-troll': [`${team.mascot}Hater`, `RentFree`, `YourRival`]
    };
    
    const baseNames = usernames[archetypeKey] || [`${team.mascot}Fan`];
    return baseNames[Math.floor(Math.random() * baseNames.length)] + suffix;
  }
}

// Main AI Service class
export class AIService {
  private weeklyAnalysis: WeeklyAnalysisEngine;
  private forumGenerator: ForumResponseGenerator;
  
  constructor(private apiKey?: string) {
    this.weeklyAnalysis = new WeeklyAnalysisEngine(apiKey);
    this.forumGenerator = new ForumResponseGenerator(apiKey);
  }
  
  async generateDynamicNewsContent(
    type: 'game-recap' | 'recruiting' | 'analysis',
    data: any,
    writer: NewsWriter,
    team: Team
  ): Promise<string> {
    return this.weeklyAnalysis.generateDynamicArticle(type, data, writer, team);
  }
  
  async generateForumResponses(
    userPost: string,
    thread: ForumPost,
    threadHistory: any[],
    team: Team,
    recentGames: Game[],
    season: Season
  ): Promise<any> {
    return this.forumGenerator.generateContextAwareResponse(
      userPost,
      thread,
      threadHistory,
      team,
      recentGames,
      season
    );
  }
  
  async analyzeWeeklyTrends(
    games: Game[],
    team: Team,
    season: Season,
    players: Player[],
    recruits: Recruit[]
  ): Promise<any> {
    return this.weeklyAnalysis.analyzeWeeklyData(games, team, season, players, recruits);
  }
}

// Export singleton instance
export const aiService = new AIService();