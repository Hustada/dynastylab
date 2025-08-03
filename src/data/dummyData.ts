import type { Game, Player, Team, Season, Coach, Recruit } from '../types/index';
import { division1Teams } from './division1Teams';

// Use real Division 1 teams
export const dummyTeams: Team[] = division1Teams;

// Player data
export const dummyPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'Jake Thompson',
    position: 'QB',
    class: 'JR',
    jerseyNumber: 7,
    hometown: 'Dallas, TX',
    statsBySeason: {
      '2024': { passingYards: 3245, passingTDs: 28, interceptions: 8 },
      '2023': { passingYards: 2890, passingTDs: 22, interceptions: 12 }
    },
    awards: ['2024 All-Conference Second Team'],
  },
  {
    id: 'player-2',
    name: 'Marcus Johnson',
    position: 'RB',
    class: 'SR',
    jerseyNumber: 22,
    hometown: 'Houston, TX',
    statsBySeason: {
      '2024': { rushingYards: 1245, rushingTDs: 15, receptions: 28 },
      '2023': { rushingYards: 987, rushingTDs: 11, receptions: 22 }
    },
    awards: ['2024 All-Conference First Team', '2023 Freshman of the Year'],
  },
  {
    id: 'player-3',
    name: 'DeAndre Williams',
    position: 'WR',
    class: 'SO',
    jerseyNumber: 88,
    hometown: 'Miami, FL',
    statsBySeason: {
      '2024': { receptions: 67, receivingYards: 989, receivingTDs: 9 }
    },
  },
  {
    id: 'player-4',
    name: 'Chris Miller',
    position: 'LB',
    class: 'JR',
    jerseyNumber: 52,
    hometown: 'Chicago, IL',
    statsBySeason: {
      '2024': { tackles: 98, sacks: 7.5, forcedFumbles: 2 }
    },
  },
  {
    id: 'player-5',
    name: 'Tyler Anderson',
    position: 'OL',
    class: 'SR',
    jerseyNumber: 75,
    hometown: 'Denver, CO',
    statsBySeason: {},
    awards: ['2024 Team Captain'],
  },
];

// Game data - Full 2024 season (using real team names)
export const dummyGames: Game[] = [
  {
    id: 'game-1',
    date: '2024-09-02',
    week: 1,
    opponent: 'Rice',
    location: 'Home',
    result: 'W',
    score: { for: 45, against: 17 },
    stats: {
      passingYards: 342,
      passingTDs: 4,
      rushingYards: 189,
      rushingTDs: 2,
      turnovers: 1,
    },
    notes: 'Great season opener! Jake threw 4 TDs in his first game as starter.',
  },
  {
    id: 'game-2',
    date: '2024-09-09',
    week: 2,
    opponent: 'Texas Tech',
    location: 'Away',
    result: 'L',
    score: { for: 24, against: 31 },
    rivalry: true,
    conferenceGame: true,
    stats: {
      passingYards: 287,
      passingTDs: 2,
      rushingYards: 98,
      rushingTDs: 1,
      turnovers: 3,
      interceptions: 2,
    },
    notes: 'Tough loss to our rivals. Too many turnovers in the 4th quarter.',
  },
  {
    id: 'game-3',
    date: '2024-09-16',
    week: 3,
    opponent: 'Baylor',
    location: 'Home',
    result: 'W',
    score: { for: 38, against: 20 },
    conferenceGame: true,
    stats: {
      passingYards: 310,
      passingTDs: 3,
      rushingYards: 205,
      rushingTDs: 2,
      turnovers: 0,
    },
    notes: 'Bounce back win! Marcus had 150+ rushing yards.',
  },
  {
    id: 'game-4',
    date: '2024-09-23',
    week: 4,
    opponent: 'Arizona State',
    location: 'Neutral',
    result: 'W',
    score: { for: 42, against: 35 },
    stats: {
      passingYards: 398,
      passingTDs: 5,
      rushingYards: 145,
      rushingTDs: 1,
      turnovers: 1,
    },
    notes: 'High-scoring thriller! Jake had a career day with 5 passing TDs.',
  },
  {
    id: 'game-5',
    date: '2024-09-30',
    week: 5,
    opponent: 'Kansas',
    location: 'Home',
    result: 'W',
    score: { for: 52, against: 14 },
    conferenceGame: true,
    stats: {
      passingYards: 425,
      passingTDs: 5,
      rushingYards: 234,
      rushingTDs: 3,
      turnovers: 0,
    },
    notes: 'Dominant performance! Defense forced 4 turnovers.',
  },
  {
    id: 'game-6',
    date: '2024-10-07',
    week: 6,
    opponent: 'TCU',
    location: 'Away',
    result: 'W',
    score: { for: 31, against: 28 },
    conferenceGame: true,
    stats: {
      passingYards: 289,
      passingTDs: 2,
      rushingYards: 167,
      rushingTDs: 2,
      turnovers: 1,
    },
    notes: 'Close win on the road. Game-winning FG with 0:03 left!',
  },
  {
    id: 'game-7',
    date: '2024-10-14',
    week: 7,
    opponent: 'Air Force',
    location: 'Home',
    result: 'L',
    score: { for: 21, against: 24 },
    conferenceGame: false,
    stats: {
      passingYards: 198,
      passingTDs: 1,
      rushingYards: 89,
      rushingTDs: 2,
      turnovers: 2,
      interceptions: 1,
    },
    notes: 'Upset loss at home. Offense struggled in the red zone.',
  },
  {
    id: 'game-8',
    date: '2024-10-21',
    week: 8,
    opponent: 'Iowa State',
    location: 'Away',
    result: 'W',
    score: { for: 35, against: 17 },
    conferenceGame: true,
    stats: {
      passingYards: 312,
      passingTDs: 3,
      rushingYards: 198,
      rushingTDs: 2,
      turnovers: 0,
    },
    notes: 'Strong road win. Defense held them to 17 points.',
  },
  {
    id: 'game-9',
    date: '2024-10-28',
    week: 9,
    opponent: 'West Virginia',
    location: 'Home',
    result: 'W',
    score: { for: 45, against: 38 },
    conferenceGame: true,
    stats: {
      passingYards: 456,
      passingTDs: 5,
      rushingYards: 134,
      rushingTDs: 1,
      turnovers: 2,
    },
    notes: 'Shootout victory! Over 900 yards of total offense in the game.',
  },
  {
    id: 'game-10',
    date: '2024-11-04',
    week: 10,
    opponent: 'Cincinnati',
    location: 'Away',
    result: 'W',
    score: { for: 28, against: 14 },
    conferenceGame: true,
    stats: {
      passingYards: 267,
      passingTDs: 2,
      rushingYards: 178,
      rushingTDs: 2,
      turnovers: 1,
    },
    notes: 'Solid win to stay in conference championship hunt.',
  },
  {
    id: 'game-11',
    date: '2024-11-11',
    week: 11,
    opponent: 'UNLV',
    location: 'Home',
    result: 'W',
    score: { for: 41, against: 24 },
    conferenceGame: false,
    stats: {
      passingYards: 334,
      passingTDs: 4,
      rushingYards: 201,
      rushingTDs: 1,
      turnovers: 0,
    },
    notes: 'Senior day victory! Great send-off for the seniors.',
  },
  {
    id: 'game-12',
    date: '2024-11-18',
    week: 12,
    opponent: 'Oklahoma State',
    location: 'Away',
    result: 'L',
    score: { for: 31, against: 35 },
    conferenceGame: true,
    rivalry: true,
    stats: {
      passingYards: 389,
      passingTDs: 3,
      rushingYards: 112,
      rushingTDs: 1,
      turnovers: 2,
      interceptions: 1,
    },
    notes: 'Heartbreaking loss to end regular season. OT thriller.',
  },
  {
    id: 'game-13',
    date: '2024-12-07',
    week: 13,
    opponent: 'Texas Tech',
    location: 'Neutral',
    result: 'W',
    score: { for: 38, against: 31 },
    conferenceGame: true,
    rivalry: true,
    stats: {
      passingYards: 412,
      passingTDs: 4,
      rushingYards: 156,
      rushingTDs: 1,
      turnovers: 1,
    },
    notes: 'Conference Championship WIN! Revenge against Tech!',
  },
  {
    id: 'game-14',
    date: '2024-12-28',
    week: 14,
    opponent: 'UCLA',
    location: 'Neutral',
    result: 'W',
    score: { for: 42, against: 35 },
    bowlGame: 'Fiesta Bowl',
    stats: {
      passingYards: 445,
      passingTDs: 5,
      rushingYards: 189,
      rushingTDs: 1,
      turnovers: 0,
    },
    notes: 'Bowl victory! Jake throws for 5 TDs in his final game.',
  },
];

// Season data
export const dummySeason: Season = {
  id: 'season-2024',
  year: 2024,
  teamName: 'Kansas State Wildcats',
  conference: 'Big 12',
  games: ['game-1', 'game-2', 'game-3', 'game-4', 'game-5', 'game-6', 'game-7', 'game-8', 'game-9', 'game-10', 'game-11', 'game-12', 'game-13', 'game-14'],
  conferenceRecord: { wins: 7, losses: 2 },
  overallRecord: { wins: 11, losses: 3 },
  ranking: 15,
  coachId: 'coach-1',
  captains: ['player-2', 'player-5'],
  preseasonGoals: [
    'Win 10+ games',
    'Beat Texas Tech',
    'Win conference championship',
    'Make playoff'
  ],
};

// Coach data
export const dummyCoach: Coach = {
  name: 'Mike Peterson',
  startYear: 2022,
  record: '19-8',
  style: 'Spread Offense',
  hotSeat: false,
};

// Helper function to generate random game
export function generateRandomGame(weekNumber: number, seasonYear: number): Game {
  const opponents = dummyTeams.filter(t => t.id !== 'kansas-state');
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];
  const isWin = Math.random() > 0.4;
  const homeScore = Math.floor(Math.random() * 35) + 14;
  const awayScore = Math.floor(Math.random() * 35) + 14;
  
  return {
    id: `game-gen-${Date.now()}-${Math.random()}`,
    date: new Date(seasonYear, 8 + Math.floor(weekNumber / 4), (weekNumber % 4) * 7 + 1).toISOString().split('T')[0],
    week: weekNumber,
    opponent: opponent.name,
    location: Math.random() > 0.5 ? 'Home' : 'Away',
    result: isWin ? 'W' : 'L',
    score: {
      for: isWin ? Math.max(homeScore, awayScore) : Math.min(homeScore, awayScore),
      against: isWin ? Math.min(homeScore, awayScore) : Math.max(homeScore, awayScore),
    },
    conferenceGame: opponent.conference === 'Big 12',
    rivalry: opponent.isRival,
    stats: {
      passingYards: Math.floor(Math.random() * 200) + 200,
      passingTDs: Math.floor(Math.random() * 4) + 1,
      rushingYards: Math.floor(Math.random() * 150) + 100,
      rushingTDs: Math.floor(Math.random() * 3),
      turnovers: Math.floor(Math.random() * 3),
      interceptions: Math.floor(Math.random() * 2),
    },
  };
}

// Helper function to generate a season of games
export function generateSeason(year: number): { games: Game[], season: Season } {
  const games: Game[] = [];
  for (let week = 1; week <= 12; week++) {
    games.push(generateRandomGame(week, year));
  }
  
  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;
  const confGames = games.filter(g => g.conferenceGame);
  const confWins = confGames.filter(g => g.result === 'W').length;
  const confLosses = confGames.filter(g => g.result === 'L').length;
  
  const season: Season = {
    id: `season-${year}`,
    year,
    teamName: 'Kansas State Wildcats',
    conference: 'Big 12',
    games: games.map(g => g.id),
    conferenceRecord: { wins: confWins, losses: confLosses },
    overallRecord: { wins, losses },
    ranking: wins >= 9 ? Math.floor(Math.random() * 15) + 10 : undefined,
    coachId: 'coach-1',
    captains: ['player-2', 'player-5'],
  };
  
  return { games, season };
}

// Recruit data
export const dummyRecruits: Recruit[] = [
  {
    id: 'recruit-1',
    name: 'Jaylen Smith',
    stars: 4,
    position: 'QB',
    state: 'TX',
    status: 'Committed',
    signedYear: 2025,
  },
  {
    id: 'recruit-2',
    name: 'Michael Johnson',
    stars: 5,
    position: 'WR',
    state: 'FL',
    status: 'Interested',
    signedYear: 2025,
  },
  {
    id: 'recruit-3',
    name: 'David Williams',
    stars: 3,
    position: 'OL',
    state: 'CA',
    status: 'Committed',
    signedYear: 2025,
  },
  {
    id: 'recruit-4',
    name: 'Anthony Davis',
    stars: 4,
    position: 'LB',
    state: 'GA',
    status: 'Interested',
    signedYear: 2025,
  },
  {
    id: 'recruit-5',
    name: 'Brandon Thomas',
    stars: 3,
    position: 'RB',
    state: 'OH',
    status: 'Signed',
    signedYear: 2024,
    playerId: 'player-3',
  },
  {
    id: 'recruit-6',
    name: 'Chris Martinez',
    stars: 4,
    position: 'CB',
    state: 'TX',
    status: 'Committed',
    signedYear: 2025,
  },
  {
    id: 'recruit-7',
    name: 'Jordan Lee',
    stars: 5,
    position: 'DL',
    state: 'AL',
    status: 'Interested',
    signedYear: 2026,
  },
  {
    id: 'recruit-8',
    name: 'Tyler Brown',
    stars: 3,
    position: 'S',
    state: 'PA',
    status: 'Interested',
    signedYear: 2026,
  },
];