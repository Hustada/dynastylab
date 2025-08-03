export type Game = {
  id: string;
  date: string;
  week: number;
  opponent: string;
  location: 'Home' | 'Away' | 'Neutral';
  result: 'W' | 'L';
  score: { for: number; against: number };
  rivalry?: boolean;
  conferenceGame?: boolean;
  bowlGame?: string;
  playoffGame?: boolean;
  stats: {
    passingYards?: number;
    passingTDs?: number;
    rushingYards?: number;
    rushingTDs?: number;
    turnovers?: number;
    sacks?: number;
    interceptions?: number;
  };
  opponentStats?: {
    passingYards?: number;
    passingTDs?: number;
    rushingYards?: number;
    rushingTDs?: number;
    turnovers?: number;
    sacks?: number;
    interceptions?: number;
  };
  screenshotUploaded?: boolean;
  ocrExtracted?: boolean;
  bypassed?: boolean;
  notes?: string;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  class: 'FR' | 'SO' | 'JR' | 'SR' | 'RS';
  jerseyNumber?: number;
  hometown?: string;
  statsBySeason: Record<string, any>;
  awards?: string[];
  storyNotes?: string;
  overall?: number;
  depthPosition?: string; // Position on depth chart (e.g., "QB1", "RB2", etc.)
};

export type Coach = {
  id: string;
  coachName: string;
  name: string; // Alias for compatibility
  startYear: number;
  endYear?: number;
  record: string;
  wins: number;
  losses: number;
  championships: number;
  style: string;
  hotSeat: boolean;
  reasonLeft?: string;
};

export type Recruit = {
  id: string;
  name: string;
  stars: 2 | 3 | 4 | 5;
  position: string;
  state: string;
  hometown?: string;
  status: 'Interested' | 'Committed' | 'Signed';
  signedYear: number;
  playerId?: string;
  otherOffers?: string[];
};

export type DynastyEvent = {
  id: string;
  year: number;
  title: string;
  type: 'Game' | 'Season' | 'Player' | 'Scandal' | 'Milestone' | 'Comeback';
  description: string;
  impact: string;
};

export type Season = {
  id: string;
  year: number;
  teamName: string;
  conference: string;
  division?: string;
  games: string[]; // Array of Game IDs
  conferenceRecord: { wins: number; losses: number };
  overallRecord: { wins: number; losses: number };
  ranking?: number;
  bowlGame?: string;
  championshipWon?: 'Conference' | 'Division' | 'National';
  coachId: string;
  captains?: string[]; // Array of Player IDs
  preseasonGoals?: string[];
  seasonSummary?: string;
};

export type Team = {
  id: string;
  name: string;
  mascot: string;
  conference: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string; // URL or base64
  stadium?: string;
  isRival: boolean;
  rivalryName?: string; // e.g., "The Iron Bowl"
  historicalRecord?: { wins: number; losses: number };
  lastPlayed?: string;
  notes?: string;
};