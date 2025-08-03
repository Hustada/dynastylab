import OpenAI from 'openai';
import { useGameStore } from '../stores/gameStore';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useRecruitStore } from '../stores/recruitStore';
import { useCoachStore } from '../stores/coachStore';
import type { Game, Season, Player, Recruit, Coach } from '../types/index';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true
});

// Types for screenshot analysis
export type ScreenType = 
  | 'season-standings'
  | 'team-stats'
  | 'game-result'
  | 'schedule'
  | 'roster-overview'
  | 'depth-chart'
  | 'recruiting-board'
  | 'coach-info'
  | 'trophy-case'
  | 'top25-rankings'
  | 'player-stats'
  | 'unknown';

export interface ScreenshotAnalysisResult {
  screenType: ScreenType;
  confidence: number;
  extractedData: any;
  detectedTeam?: string;
  suggestedActions: string[];
  relatedScreens?: ScreenType[];
}

export interface OrchestratorEvent {
  type: 'screen-identified' | 'data-extracted' | 'data-routed' | 'content-triggered' | 'error';
  screenType?: ScreenType;
  data?: any;
  message: string;
  timestamp: Date;
}

// Event callbacks for UI updates
type EventCallback = (event: OrchestratorEvent) => void;

export class ScreenshotOrchestrator {
  private eventCallbacks: EventCallback[] = [];

  constructor() {
    console.log('Screenshot Orchestrator initialized');
  }

  // Subscribe to orchestrator events
  public subscribe(callback: EventCallback) {
    this.eventCallbacks.push(callback);
    return () => {
      this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
    };
  }

  private emit(event: OrchestratorEvent) {
    this.eventCallbacks.forEach(callback => callback(event));
  }

  // Main orchestration method
  public async processScreenshot(imageUrl: string, skipRouting: boolean = false): Promise<ScreenshotAnalysisResult> {
    try {
      // Step 1: Identify screen type
      const screenType = await this.identifyScreenType(imageUrl);
      this.emit({
        type: 'screen-identified',
        screenType: screenType.screenType,
        message: `Identified as ${screenType.screenType} screen`,
        timestamp: new Date()
      });

      // Step 2: Extract data based on screen type
      const extractedData = await this.extractDataForScreenType(imageUrl, screenType.screenType, screenType.detectedTeam);
      this.emit({
        type: 'data-extracted',
        screenType: screenType.screenType,
        data: extractedData,
        message: `Extracted data from ${screenType.screenType}${screenType.detectedTeam ? ` for ${screenType.detectedTeam}` : ''}`,
        timestamp: new Date()
      });

      // Only route data if not skipping (for review mode)
      if (!skipRouting) {
        // Step 3: Route data to appropriate stores
        await this.routeData(screenType.screenType, extractedData);
        this.emit({
          type: 'data-routed',
          screenType: screenType.screenType,
          message: `Data routed to appropriate stores`,
          timestamp: new Date()
        });

        // Step 4: Trigger content generation if needed
        await this.triggerContentGeneration(screenType.screenType, extractedData);
        this.emit({
          type: 'content-triggered',
          screenType: screenType.screenType,
          message: `Content generation triggered`,
          timestamp: new Date()
        });
      }

      return {
        screenType: screenType.screenType,
        confidence: screenType.confidence,
        extractedData,
        detectedTeam: screenType.detectedTeam,
        suggestedActions: this.getSuggestedActions(screenType.screenType),
        relatedScreens: this.getRelatedScreens(screenType.screenType)
      };
    } catch (error) {
      this.emit({
        type: 'error',
        message: `Error processing screenshot: ${error}`,
        timestamp: new Date()
      });
      throw error;
    }
  }
  
  // Public method to route data after review
  public async routeExtractedData(screenType: ScreenType, data: any): Promise<void> {
    await this.routeData(screenType, data);
    await this.triggerContentGeneration(screenType, data);
  }

  // Identify what type of screen this is
  private async identifyScreenType(imageUrl: string): Promise<{ screenType: ScreenType; confidence: number; detectedTeam?: string }> {
    const prompt = `Analyze this CFB 25 screenshot and identify:
    1. What type of screen this is
    2. What team is shown (if visible)
    
    Possible screen types:
    - season-standings: Conference standings with W-L records
    - team-stats: Team statistics page  
    - game-result: Post-game summary screen
    - schedule: Season schedule with game results
    - roster-overview: Team roster listing with player stats
    - depth-chart: Position depth chart
    - recruiting-board: Recruiting targets and commits
    - coach-info: Coaching staff information
    - trophy-case: Awards and championships
    - top25-rankings: National top 25 rankings (NOT team specific)
    - player-stats: Individual player statistics page
    - unknown: Cannot identify
    
    Look for team indicators:
    - Team name in headers or titles
    - Team colors in UI
    - Team logos
    - Jersey numbers with team affiliation
    
    Respond with JSON only: 
    { 
      "screenType": "type", 
      "confidence": 0.0-1.0,
      "detectedTeam": "Team Name" or null if not team-specific
    }`;

    try {
      // Check if we're in development mode or if API key is missing
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'demo-key') {
        console.warn('No OpenAI API key found, using mock data');
        return {
          screenType: 'roster-overview',
          confidence: 0.92,
          detectedTeam: 'Washington'
        };
      }

      // Convert image URL to base64 if it's a blob URL
      let base64Image = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        base64Image = await this.blobToBase64(blob);
      }

      // Call GPT-4 Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { 
                type: "image_url", 
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      });

      const result = response.choices[0].message.content;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          return {
            screenType: parsed.screenType || 'unknown',
            confidence: parsed.confidence || 0.5,
            detectedTeam: parsed.detectedTeam || null
          };
        } catch (e) {
          console.error('Failed to parse GPT-4 response:', e);
        }
      }

      // Fallback if parsing fails
      return {
        screenType: 'unknown',
        confidence: 0.5,
        detectedTeam: null
      };

    } catch (error) {
      console.error('Error identifying screen type:', error);
      // Fallback to mock data for testing
      return {
        screenType: 'roster-overview',
        confidence: 0.92,
        detectedTeam: 'Washington'
      };
    }
  }
  
  // Helper function to convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Extract data based on identified screen type
  private async extractDataForScreenType(imageUrl: string, screenType: ScreenType, detectedTeam?: string): Promise<any> {
    const extractionPrompts: Record<ScreenType, string> = {
      'season-standings': `Extract from this conference standings screen:
        - Team name and conference
        - Overall record (W-L)
        - Conference record
        - Current ranking if visible
        - Division/conference position
        Return as JSON with these fields.`,
      
      'team-stats': `Extract team statistics:
        - Points per game
        - Total yards per game
        - Passing yards per game
        - Rushing yards per game
        - Points allowed per game
        - Turnover margin
        - Third down percentage
        Return as JSON.`,
      
      'game-result': `Extract game result data:
        - Your team name and score
        - Opponent name and score
        - Game location (Home/Away/Neutral)
        - Key stats (total yards, turnovers, time of possession)
        - Quarter scores if visible
        Return as JSON.`,
      
      'schedule': `Extract schedule information:
        - List of games with:
          - Week number
          - Opponent
          - Result (W/L) and score
          - Home/Away
        - Current week if highlighted
        Return as JSON array of games.`,
      
      'roster-overview': `Extract roster information:
        - Top players by position
        - Overall ratings
        - Class year (FR/SO/JR/SR)
        - Key attributes if visible
        Return as JSON array of players.`,
      
      'depth-chart': `Extract depth chart:
        - Position groups
        - Starters and backups
        - Player ratings
        Return as nested JSON by position.`,
      
      'recruiting-board': `Extract recruiting data:
        - Committed recruits (name, position, stars, hometown)
        - Top targets if visible
        - Class ranking if shown
        Return as JSON.`,
      
      'coach-info': `Extract coaching information:
        - Head coach name
        - Win-loss record
        - Years at school
        - Contract details if visible
        - Hot seat status
        Return as JSON.`,
      
      'trophy-case': `Extract achievements:
        - Championships won
        - Bowl victories
        - Conference titles
        - Individual awards
        Return as JSON arrays.`,
      
      'top25-rankings': `Extract top 25 rankings:
        - List of teams with rank, name, record, points
        - Week number if visible
        - Poll type (AP, Coaches, CFP)
        Return as JSON array.`,
      
      'player-stats': `Extract individual player statistics:
        - Player name and position
        - Season/career stats
        - Key performance metrics
        - Awards or milestones
        Return as JSON.`,
      
      'unknown': 'Unable to determine extraction requirements.'
    };

    const prompt = extractionPrompts[screenType];
    
    // In production, this would use GPT-4 Vision
    // For now, return mock data based on screen type
    return this.getMockDataForScreenType(screenType);
  }

  // Route extracted data to appropriate stores
  private async routeData(screenType: ScreenType, data: any): Promise<void> {
    switch (screenType) {
      case 'season-standings':
        const seasonStore = useSeasonStore.getState();
        if (data.overallRecord) {
          seasonStore.updateCurrentSeason({
            overallRecord: data.overallRecord,
            conferenceRecord: data.conferenceRecord,
            ranking: data.ranking
          });
        }
        break;
      
      case 'game-result':
      case 'schedule':
        const gameStore = useGameStore.getState();
        if (Array.isArray(data)) {
          data.forEach((game: Game) => gameStore.addGame(game));
        } else if (data.gameId) {
          gameStore.addGame(data);
        }
        break;
      
      case 'roster-overview':
      case 'depth-chart':
        const playerStore = usePlayerStore.getState();
        if (Array.isArray(data)) {
          data.forEach((player: Player) => playerStore.addPlayer(player));
        }
        break;
      
      case 'recruiting-board':
        const recruitStore = useRecruitStore.getState();
        if (data.commits) {
          data.commits.forEach((recruit: Recruit) => recruitStore.addRecruit(recruit));
        }
        break;
      
      case 'coach-info':
        const coachStore = useCoachStore.getState();
        if (data.coachId) {
          coachStore.updateCoach(data.coachId, data);
        }
        break;
    }
  }

  // Trigger AI content generation based on significant events
  private async triggerContentGeneration(screenType: ScreenType, data: any): Promise<void> {
    const triggers = {
      'game-result': () => {
        if (data.result && (data.marginOfVictory > 20 || data.upsetVictory)) {
          // Trigger article generation for significant games
          console.log('Triggering article for significant game result');
        }
      },
      'season-standings': () => {
        if (data.ranking && data.ranking <= 10) {
          // Trigger ranking analysis
          console.log('Triggering content for top 10 ranking');
        }
      },
      'recruiting-board': () => {
        if (data.fiveStarCommit) {
          // Trigger recruiting excitement content
          console.log('Triggering content for 5-star commit');
        }
      },
      'coach-info': () => {
        if (data.hotSeat === true) {
          // Trigger hot seat discussion
          console.log('Triggering hot seat content');
        }
      }
    };

    const trigger = triggers[screenType];
    if (trigger) {
      trigger();
    }
  }

  // Get suggested next actions based on current screen
  private getSuggestedActions(screenType: ScreenType): string[] {
    const suggestions: Record<ScreenType, string[]> = {
      'season-standings': [
        'Upload team stats for complete season overview',
        'Add recent game results for trend analysis'
      ],
      'game-result': [
        'Upload season schedule to track all games',
        'Add player stats for MVP analysis'
      ],
      'roster-overview': [
        'Upload depth chart for position analysis',
        'Add recruiting board to track pipeline'
      ],
      'recruiting-board': [
        'Upload team needs analysis',
        'Add current roster for position gaps'
      ],
      'coach-info': [
        'Upload season record for contract evaluation',
        'Add historical records for legacy tracking'
      ],
      'schedule': [
        'Upload individual game results for details',
        'Add team stats for performance trends'
      ],
      'depth-chart': [
        'Upload roster overview for ratings',
        'Add recruiting targets for future depth'
      ],
      'team-stats': [
        'Upload game results to match stats',
        'Add opponent stats for comparisons'
      ],
      'trophy-case': [
        'Upload season standings for context',
        'Add historical records for legacy'
      ],
      'unknown': [
        'Try a clearer screenshot',
        'Ensure UI elements are visible'
      ]
    };

    return suggestions[screenType] || [];
  }

  // Get related screens that would provide complementary data
  private getRelatedScreens(screenType: ScreenType): ScreenType[] {
    const relations: Record<ScreenType, ScreenType[]> = {
      'season-standings': ['team-stats', 'schedule', 'trophy-case'],
      'game-result': ['schedule', 'team-stats', 'roster-overview'],
      'roster-overview': ['depth-chart', 'recruiting-board'],
      'recruiting-board': ['roster-overview', 'depth-chart'],
      'coach-info': ['season-standings', 'trophy-case'],
      'schedule': ['game-result', 'season-standings'],
      'depth-chart': ['roster-overview', 'recruiting-board'],
      'team-stats': ['season-standings', 'game-result'],
      'trophy-case': ['season-standings', 'coach-info'],
      'unknown': []
    };

    return relations[screenType] || [];
  }

  // Mock data for development
  private getMockDataForScreenType(screenType: ScreenType): any {
    const mockData: Record<ScreenType, any> = {
      'season-standings': {
        teamName: 'Miami',
        conference: 'ACC',
        overallRecord: { wins: 8, losses: 2 },
        conferenceRecord: { wins: 5, losses: 1 },
        ranking: 12,
        divisionPosition: 1
      },
      'game-result': {
        gameId: `game-${Date.now()}`,
        teamId: 'miami',
        opponent: 'Florida State',
        location: 'Home',
        score: { for: 31, against: 24 },
        result: 'W',
        marginOfVictory: 7,
        stats: {
          passingYards: 285,
          rushingYards: 156,
          turnovers: 1
        }
      },
      'roster-overview': [
        {
          id: `player-${Date.now()}-1`,
          name: 'T.Vaasver',
          position: 'WR',
          jerseyNumber: 3,
          class: 'SR',
          overall: 89,
          receptions: 255,
          receivingYards: 4536
        },
        {
          id: `player-${Date.now()}-2`,
          name: 'J.Washington',
          position: 'HB',
          jerseyNumber: 7,
          class: 'JR',
          overall: 85,
          rushingYards: 851
        },
        {
          id: `player-${Date.now()}-3`,
          name: 'R.Dillon',
          position: 'TE',
          jerseyNumber: 38,
          class: 'SR',
          overall: 82,
          receptions: 369
        },
        {
          id: `player-${Date.now()}-4`,
          name: 'A.Williams',
          position: 'WR',
          jerseyNumber: 1,
          class: 'SO',
          overall: 78,
          receptions: 347
        }
      ],
      'recruiting-board': {
        commits: [
          {
            id: `recruit-${Date.now()}`,
            name: 'Marcus Thompson',
            position: 'WR',
            stars: 4,
            hometown: 'Orlando',
            state: 'FL',
            status: 'Committed'
          }
        ],
        classRanking: 15
      },
      'coach-info': {
        coachId: 'coach-1',
        name: 'Mario Cristobal',
        wins: 24,
        losses: 12,
        yearsAtSchool: 3,
        hotSeat: false
      },
      'schedule': [],
      'depth-chart': {},
      'team-stats': {},
      'trophy-case': {},
      'unknown': {}
    };

    return mockData[screenType] || {};
  }
}

// Singleton instance
export const orchestrator = new ScreenshotOrchestrator();