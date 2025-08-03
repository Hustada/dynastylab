
# 🧠 Claude-Ready Markdown Spec – Deep Dynasty Tracking System for CFB25 Companion App

This file defines a step-by-step implementation plan for tracking **deep dynasty stats**, legacy records, and immersive features that simulate a true NCAA Football dynasty experience.

---

## ✅ Goal

Track everything a hardcore dynasty-mode user would expect:
- Season-level stats
- Coaching careers
- Program records
- Prestige arcs
- Rivalries
- Recruiting and player legacy
- Story-driven timelines

---

## 🧱 Step 1: Data Type Definitions (`src/types/deepStats.ts`)

### Season
```ts
export type Season = {
  year: number;
  team: string;
  record: string; // "10–3"
  finalRanking?: number;
  conference?: string;
  conferenceStanding?: string;
  bowlGame?: string;
  bowlResult?: string;
  playoffAppearance?: boolean;
  playoffResult?: string;
  heismanFinalists?: string[];
  notableEvents?: string[];
};
```

### Team Season Stats
```ts
export type TeamStats = {
  year: number;
  pointsPerGame: number;
  yardsPerGame: number;
  passYardsPerGame: number;
  rushYardsPerGame: number;
  turnoverMargin: number;
  sacks: number;
  interceptions: number;
  thirdDownPct: number;
  redZonePct: number;
};
```

### Coach Career Stats
```ts
export type Coach = {
  name: string;
  careerRecord: string; // "81–42"
  seasonsCoached: number;
  championships: number;
  playoffAppearances: number;
  bowlRecord: string;
  coachingStyle: string;
  hotSeat: boolean;
  scandalCount?: number;
  notes?: string;
};
```

### All-Time Program History
```ts
export type TeamHistory = {
  programName: string;
  allTimeRecord: string; // "789–375–45"
  championships: number;
  playoffAppearances: number;
  bowlWins: number;
  heismanWinners: string[];
  longestWinStreak: number;
  worstLoss: string;
  bestSeason?: string;
  rivalries: RivalryRecord[];
};
```

### Rivalries
```ts
export type RivalryRecord = {
  opponent: string;
  allTimeSeries: string;
  currentStreak: string;
  notableGames: string[];
};
```

### Prestige Tracker
```ts
export type ProgramPrestige = {
  year: number;
  prestigeScore: number; // 1–100
  changeReason?: string;
};
```

---

## 🧪 Step 2: UI Modules

### `LegacyDashboard.tsx`
- Overview of:
  - Total games coached
  - All-time record
  - Rivalry streaks
  - Win/loss trends

### `ProgramHistory.tsx`
- Render yearly performance
- Conference titles, bowl wins
- Link to Heisman, recruiting class highlights

### `CoachRoom.tsx` (Extend)
- Career summary + stat blocks
- Hot seat history
- Scandal count, job offers, coaching tree

### `RivalryCenter.tsx`
- Show all tracked rivalries
- Streaks, drama, AI-generated “Top 5 Rivalry Games”

---

## 🎙️ Step 3: Commentary Prompts for Deep Story

### Dynasty Recap
```
Write a 10-year dynasty recap for Nebraska. They won 3 conference titles, lost in a playoff semifinal, and had 2 Heisman finalists. Include ups and downs, coaching changes, and how the team is viewed nationally now.
```

### Coach Legacy
```
Summarize Coach Grimes’s career after 15 years at Nebraska. He started with a rebuild and finished with a championship. Include record, style, and fictional quotes from former players.
```

### Rivalry Lore Article
```
Write a rivalry feature on Nebraska vs Michigan. Nebraska has won 5 straight. Include references to past blowouts, comebacks, and fan expectations for next year.
```

---

## 💾 Step 4: Persistence & State

- Save each `Season`, `TeamStats`, `Coach`, and `TeamHistory` object in localStorage via Zustand or Context
- Optionally export JSON bundles for backup:
  - `dynasty-seasons.json`
  - `team-history.json`
  - `coach-records.json`

---

## ✅ Final Tips

- Claude can help generate mock data from real stats or summaries
- Use `Timeline.tsx` to link all narrative-worthy events together
- Show charts or decade summaries in `LegacyDashboard`

---

Once this is implemented, you’ll have a system that gives you:
- Story-driven immersion
- ESPN-style commentary
- Historical depth
- Full user control of the dynasty universe
