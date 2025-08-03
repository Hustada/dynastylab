import type { Game, Player, Recruit, Season, Coach } from '../types/index';

// Generate sample games for testing
export function generateSampleGames(teamName: string): Game[] {
  const opponents = ['Georgia', 'Florida', 'LSU', 'Auburn', 'Tennessee', 'Texas A&M', 'Ole Miss', 'Mississippi State'];
  const games: Game[] = [];
  
  // Generate 8 games with varied results
  const gameData = [
    { opponent: 'Georgia', result: 'L', scoreFor: 17, scoreAgainst: 24, location: 'Away', week: 1 },
    { opponent: 'Florida', result: 'W', scoreFor: 35, scoreAgainst: 31, location: 'Home', week: 2 },
    { opponent: 'LSU', result: 'W', scoreFor: 42, scoreAgainst: 21, location: 'Home', week: 3 },
    { opponent: 'Auburn', result: 'L', scoreFor: 14, scoreAgainst: 17, location: 'Away', week: 4 },
    { opponent: 'Tennessee', result: 'W', scoreFor: 28, scoreAgainst: 24, location: 'Home', week: 5 },
    { opponent: 'Texas A&M', result: 'W', scoreFor: 31, scoreAgainst: 28, location: 'Away', week: 6 },
    { opponent: 'Ole Miss', result: 'L', scoreFor: 21, scoreAgainst: 38, location: 'Home', week: 7 },
    { opponent: 'Mississippi State', result: 'W', scoreFor: 45, scoreAgainst: 14, location: 'Away', week: 8 }
  ];
  
  gameData.forEach((data, index) => {
    const game: Game = {
      id: `game-${Date.now()}-${index}`,
      date: new Date(2024, 8 + Math.floor(index / 4), (index % 4) * 7 + 1).toISOString().split('T')[0],
      week: data.week,
      opponent: data.opponent,
      location: data.location as 'Home' | 'Away',
      result: data.result as 'W' | 'L',
      score: { for: data.scoreFor, against: data.scoreAgainst },
      rivalry: data.opponent === 'Auburn',
      conferenceGame: true,
      stats: {
        passingYards: Math.floor(Math.random() * 200) + 150,
        passingTDs: Math.floor(Math.random() * 3) + 1,
        rushingYards: Math.floor(Math.random() * 150) + 100,
        rushingTDs: Math.floor(Math.random() * 3),
        turnovers: Math.floor(Math.random() * 3),
        sacks: Math.floor(Math.random() * 4),
        interceptions: Math.floor(Math.random() * 2)
      },
      opponentStats: {
        passingYards: Math.floor(Math.random() * 200) + 150,
        passingTDs: Math.floor(Math.random() * 3) + 1,
        rushingYards: Math.floor(Math.random() * 150) + 100,
        rushingTDs: Math.floor(Math.random() * 3),
        turnovers: Math.floor(Math.random() * 3)
      }
    };
    games.push(game);
  });
  
  return games;
}

// Generate sample players
export function generateSamplePlayers(): Player[] {
  return [
    {
      id: 'player-1',
      name: 'Jake Thompson',
      position: 'QB',
      class: 'JR',
      jerseyNumber: 7,
      hometown: 'Dallas, TX',
      overall: 88,
      depthPosition: 'QB1',
      statsBySeason: {
        '2024': {
          games: 8,
          passingYards: 2145,
          passingTDs: 18,
          interceptions: 6
        }
      },
      awards: ['SEC Offensive Player of the Week (Week 3)']
    },
    {
      id: 'player-2',
      name: 'Marcus Williams',
      position: 'RB',
      class: 'SO',
      jerseyNumber: 22,
      hometown: 'Atlanta, GA',
      overall: 85,
      depthPosition: 'RB1',
      statsBySeason: {
        '2024': {
          games: 8,
          rushingYards: 856,
          rushingTDs: 9,
          receivingYards: 234,
          receivingTDs: 2
        }
      }
    },
    {
      id: 'player-3',
      name: 'Chris Johnson',
      position: 'WR',
      class: 'SR',
      jerseyNumber: 81,
      hometown: 'Miami, FL',
      overall: 87,
      depthPosition: 'WR1',
      statsBySeason: {
        '2024': {
          games: 8,
          receptions: 45,
          receivingYards: 678,
          receivingTDs: 6
        }
      },
      awards: ['All-SEC Second Team (2023)']
    },
    {
      id: 'player-4',
      name: 'David Miller',
      position: 'LB',
      class: 'JR',
      jerseyNumber: 44,
      hometown: 'Houston, TX',
      overall: 86,
      depthPosition: 'MLB1',
      statsBySeason: {
        '2024': {
          games: 8,
          tackles: 67,
          sacks: 4.5,
          interceptions: 1
        }
      }
    }
  ];
}

// Generate sample recruits
export function generateSampleRecruits(): Recruit[] {
  return [
    {
      id: 'recruit-1',
      name: 'Darius Jackson',
      stars: 5,
      position: 'QB',
      state: 'TX',
      hometown: 'Houston',
      status: 'Committed',
      signedYear: 2025,
      otherOffers: ['Texas', 'Oklahoma', 'LSU', 'Ohio State']
    },
    {
      id: 'recruit-2',
      name: 'Anthony Davis',
      stars: 4,
      position: 'WR',
      state: 'FL',
      hometown: 'Tampa',
      status: 'Committed',
      signedYear: 2025,
      otherOffers: ['Florida', 'Florida State', 'Miami']
    },
    {
      id: 'recruit-3',
      name: 'Michael Thompson',
      stars: 4,
      position: 'LB',
      state: 'GA',
      hometown: 'Atlanta',
      status: 'Interested',
      signedYear: 2025,
      otherOffers: ['Georgia', 'Alabama', 'Clemson', 'Auburn']
    },
    {
      id: 'recruit-4',
      name: 'James Wilson',
      stars: 3,
      position: 'OL',
      state: 'AL',
      hometown: 'Birmingham',
      status: 'Committed',
      signedYear: 2025,
      otherOffers: ['Auburn', 'Tennessee']
    }
  ];
}

// Generate sample season
export function generateSampleSeason(teamId: string, games: Game[]): Season {
  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;
  
  return {
    id: 'season-2024',
    year: 2024,
    teamName: teamId,
    conference: 'SEC',
    division: 'West',
    games: games.map(g => g.id),
    conferenceRecord: { wins: wins - 1, losses: losses },
    overallRecord: { wins, losses },
    ranking: wins >= 6 ? 15 : undefined,
    coachId: 'coach-main',
    preseasonGoals: ['Win 9+ games', 'Beat Auburn', 'Win bowl game'],
    seasonSummary: 'Season in progress...'
  };
}

// Generate sample coach
export function generateSampleCoach(): Coach {
  return {
    id: 'coach-main',
    coachName: 'Mike Stevens',
    name: 'Mike Stevens',
    startYear: 2022,
    record: '18-12',
    wins: 18,
    losses: 12,
    championships: 0,
    style: 'Spread',
    hotSeat: false
  };
}