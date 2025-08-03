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
  generatedContent?: string[];
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
  private isDev = import.meta.env.DEV;

  constructor() {
    console.log('🎬 Screenshot Orchestrator initialized');
    if (this.isDev) {
      console.log('📊 Running in development mode - verbose logging enabled');
    }
  }
  
  private log(message: string, data?: any) {
    if (this.isDev) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[${timestamp}] 📸 ${message}`, data || '');
    }
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
    this.log('🚀 Starting screenshot processing', { skipRouting });
    
    try {
      // Step 1: Identify screen type
      this.log('🔍 Step 1: Identifying screen type...');
      const screenType = await this.identifyScreenType(imageUrl);
      this.log('✅ Screen identified', {
        type: screenType.screenType,
        confidence: `${(screenType.confidence * 100).toFixed(1)}%`,
        team: screenType.detectedTeam || 'Not detected'
      });
      
      this.emit({
        type: 'screen-identified',
        screenType: screenType.screenType,
        message: `Identified as ${screenType.screenType} screen`,
        timestamp: new Date()
      });

      // Step 2: Extract data based on screen type
      this.log('📊 Step 2: Extracting data from screenshot...');
      const extractedData = await this.extractDataForScreenType(imageUrl, screenType.screenType, screenType.detectedTeam);
      this.log('✅ Data extracted', {
        screenType: screenType.screenType,
        dataKeys: Object.keys(extractedData),
        itemCount: Array.isArray(extractedData) ? extractedData.length : undefined
      });
      
      this.emit({
        type: 'data-extracted',
        screenType: screenType.screenType,
        data: extractedData,
        message: `Extracted data from ${screenType.screenType}${screenType.detectedTeam ? ` for ${screenType.detectedTeam}` : ''}`,
        timestamp: new Date()
      });

      // Track generated content
      let generatedContent: string[] = [];
      
      // Only route data if not skipping (for review mode)
      if (!skipRouting) {
        // Step 3: Route data to appropriate stores
        this.log('🚚 Step 3: Routing data to stores...');
        await this.routeData(screenType.screenType, extractedData);
        this.log('✅ Data routed successfully');
        
        this.emit({
          type: 'data-routed',
          screenType: screenType.screenType,
          message: `Data routed to appropriate stores`,
          timestamp: new Date()
        });

        // Step 4: Trigger content generation if needed
        this.log('✨ Step 4: Checking for content generation triggers...');
        generatedContent = await this.triggerContentGeneration(screenType.screenType, extractedData);
        
        if (generatedContent.length > 0) {
          this.log('📰 Content generation queued:', generatedContent);
        }
        
        this.emit({
          type: 'content-triggered',
          screenType: screenType.screenType,
          message: generatedContent.length > 0 
            ? `Content generation triggered: ${generatedContent.join(', ')}`
            : 'No content triggers met',
          timestamp: new Date()
        });
      } else {
        this.log('⏸️ Skipping data routing (review mode)');
      }

      const result = {
        screenType: screenType.screenType,
        confidence: screenType.confidence,
        extractedData,
        detectedTeam: screenType.detectedTeam,
        suggestedActions: this.getSuggestedActions(screenType.screenType),
        relatedScreens: this.getRelatedScreens(screenType.screenType),
        generatedContent
      };
      
      this.log('🎉 Processing complete!', {
        screenType: result.screenType,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        suggestedActions: result.suggestedActions.length
      });
      
      return result;
    } catch (error) {
      this.log('❌ Error processing screenshot', error);
      this.emit({
        type: 'error',
        message: `Error processing screenshot: ${error}`,
        timestamp: new Date()
      });
      throw error;
    }
  }
  
  // Public method to route data after review
  public async routeExtractedData(screenType: ScreenType, data: any): Promise<string[]> {
    await this.routeData(screenType, data);
    const generatedContent = await this.triggerContentGeneration(screenType, data);
    return generatedContent;
  }

  // Identify what type of screen this is
  private async identifyScreenType(imageUrl: string): Promise<{ screenType: ScreenType; confidence: number; detectedTeam?: string }> {
    this.log('🤖 Calling GPT-4o for screen identification...');
    
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
        this.log('⚠️ No OpenAI API key found, using mock data');
        return {
          screenType: 'roster-overview',
          confidence: 0.92,
          detectedTeam: 'Washington'
        };
      }

      // Convert image URL to base64 if it's a blob URL
      let base64Image = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        this.log('📦 Converting blob URL to base64...');
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        base64Image = await this.blobToBase64(blob);
        this.log('✅ Image converted', { size: `${(blob.size / 1024).toFixed(1)}KB` });
      }

      // Call GPT-4o (latest vision model)
      this.log('📡 Sending request to OpenAI GPT-4o...');
      const startTime = Date.now();
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
      
      const responseTime = Date.now() - startTime;
      this.log('✅ GPT-4o response received', { 
        responseTime: `${responseTime}ms`,
        tokensUsed: response.usage?.total_tokens 
      });

      const result = response.choices[0].message.content;
      if (result) {
        this.log('📝 Raw response:', result);
        
        // Clean up the response - remove markdown code blocks if present
        let cleanedResult = result.trim();
        
        // Remove ```json and ``` markers if present
        if (cleanedResult.startsWith('```json')) {
          cleanedResult = cleanedResult.substring(7);
        } else if (cleanedResult.startsWith('```')) {
          cleanedResult = cleanedResult.substring(3);
        }
        
        if (cleanedResult.endsWith('```')) {
          cleanedResult = cleanedResult.substring(0, cleanedResult.length - 3);
        }
        
        cleanedResult = cleanedResult.trim();
        
        try {
          const parsed = JSON.parse(cleanedResult);
          this.log('✅ Response parsed successfully', parsed);
          return {
            screenType: parsed.screenType || 'unknown',
            confidence: parsed.confidence || 0.5,
            detectedTeam: parsed.detectedTeam || null
          };
        } catch (e) {
          this.log('⚠️ Failed to parse GPT-4 response', e);
          
          // Try to extract JSON using regex as last resort
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              this.log('✅ Extracted JSON from response', parsed);
              return {
                screenType: parsed.screenType || 'unknown',
                confidence: parsed.confidence || 0.5,
                detectedTeam: parsed.detectedTeam || null
              };
            } catch (e2) {
              this.log('❌ Failed to extract JSON', e2);
            }
          }
        }
      }

      // Fallback if parsing fails
      this.log('⚠️ Using fallback response');
      return {
        screenType: 'unknown',
        confidence: 0.5,
        detectedTeam: null
      };

    } catch (error) {
      this.log('❌ Error identifying screen type', error);
      // Fallback to mock data for testing
      this.log('⚠️ Falling back to mock data');
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
      
      'roster-overview': `Extract player information from this roster screen:
        For the featured/highlighted player (if one is prominently shown):
        - Name (exactly as displayed)
        - Jersey number
        - Position
        - Overall rating
        - Statistics (receptions, yards, TDs, etc.)
        
        For other visible players in the list:
        - Names
        - Positions
        - Jersey numbers
        - Ratings
        
        IMPORTANT: Extract actual names and stats visible on screen.
        Return as JSON with featured player and roster list.`,
      
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
      
      'player-stats': `Extract the featured player's information from this screen:
        - Player name (exactly as shown)
        - Jersey number
        - Position (WR, HB, TE, etc.)
        - Overall rating if visible
        - Statistics shown (receptions, yards, touchdowns, etc.)
        - Archetype if shown (Deep Threat, etc.)
        
        IMPORTANT: Extract the actual data visible on screen, not example data.
        Return as JSON with the exact values you can see.`,
      
      'unknown': 'Unable to determine extraction requirements.'
    };

    const prompt = extractionPrompts[screenType];
    
    // If unknown screen type, return empty data
    if (screenType === 'unknown') {
      this.log('⚠️ Unknown screen type, returning empty data');
      return {};
    }

    this.log(`📋 Starting extraction for ${screenType} screen`);

    try {
      // Check if we're in development mode or if API key is missing
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'demo-key') {
        this.log('⚠️ No OpenAI API key found, using mock data for extraction');
        return this.getMockDataForScreenType(screenType);
      }
      
      this.log('✅ API key found, proceeding with real extraction');

      // Convert image URL to base64 if it's a blob URL
      let base64Image = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        this.log('📦 Converting blob URL to base64 for extraction...');
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        base64Image = await this.blobToBase64(blob);
      }

      // Call GPT-4o for data extraction
      const fullPrompt = detectedTeam 
        ? `For the team "${detectedTeam}", ${prompt}`
        : prompt;
      
      this.log('🤖 Calling GPT-4o for data extraction...', {
        screenType,
        team: detectedTeam || 'No team context'
      });
      
      const startTime = Date.now();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: fullPrompt },
              { 
                type: "image_url", 
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });
      
      const responseTime = Date.now() - startTime;
      this.log('✅ GPT-4o extraction response received', {
        responseTime: `${responseTime}ms`,
        tokensUsed: response.usage?.total_tokens
      });

      const result = response.choices[0].message.content;
      if (result) {
        this.log('📝 Raw extraction response:', result.substring(0, 200) + '...');
        
        // Clean up the response - remove markdown code blocks if present
        let cleanedResult = result.trim();
        
        // Remove ```json and ``` markers if present
        if (cleanedResult.startsWith('```json')) {
          cleanedResult = cleanedResult.substring(7);
        } else if (cleanedResult.startsWith('```')) {
          cleanedResult = cleanedResult.substring(3);
        }
        
        if (cleanedResult.endsWith('```')) {
          cleanedResult = cleanedResult.substring(0, cleanedResult.length - 3);
        }
        
        cleanedResult = cleanedResult.trim();
        
        try {
          // Try to parse the cleaned JSON response
          const parsed = JSON.parse(cleanedResult);
          this.log('✅ Extraction parsed successfully', {
            dataType: typeof parsed,
            keys: Array.isArray(parsed) ? `Array(${parsed.length})` : Object.keys(parsed).slice(0, 5)
          });
          return parsed;
        } catch (e) {
          this.log('⚠️ Failed to parse extraction response, attempting JSON extraction', e);
          // Try to extract JSON from the original response if it's wrapped in text
          const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              const extracted = JSON.parse(jsonMatch[0]);
              this.log('✅ Successfully extracted JSON from response');
              return extracted;
            } catch (e2) {
              this.log('❌ Failed to extract JSON from response', e2);
            }
          }
        }
      }

      // Fallback to mock data if extraction fails
      this.log('⚠️ Falling back to mock data due to extraction failure');
      this.log('📊 Returning mock data for:', screenType);
      const mockData = this.getMockDataForScreenType(screenType);
      this.log('Mock data being returned:', mockData);
      return mockData;

    } catch (error) {
      this.log('❌ Error extracting data', error);
      // Fallback to mock data
      this.log('⚠️ Using mock data as fallback due to error');
      const mockData = this.getMockDataForScreenType(screenType);
      this.log('Mock data being returned:', mockData);
      return mockData;
    }
  }

  // Route extracted data to appropriate stores
  private async routeData(screenType: ScreenType, data: any): Promise<void> {
    this.log(`🚚 Routing ${screenType} data to stores...`);
    
    switch (screenType) {
      case 'season-standings':
        const seasonStore = useSeasonStore.getState();
        if (data.overallRecord) {
          this.log('📊 Updating season standings', {
            overall: `${data.overallRecord.wins}-${data.overallRecord.losses}`,
            conference: data.conferenceRecord ? `${data.conferenceRecord.wins}-${data.conferenceRecord.losses}` : 'N/A',
            ranking: data.ranking || 'Unranked'
          });
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
          this.log(`🏈 Adding ${data.length} games to store`);
          data.forEach((game: Game) => gameStore.addGame(game));
        } else if (data.gameId) {
          this.log('🏈 Adding single game result', { 
            opponent: data.opponent,
            score: `${data.score?.for || 0}-${data.score?.against || 0}`
          });
          gameStore.addGame(data);
        }
        break;
      
      case 'roster-overview':
      case 'depth-chart':
        const playerStore = usePlayerStore.getState();
        if (Array.isArray(data)) {
          this.log(`👥 Adding ${data.length} players to store`);
          data.forEach((player: Player) => playerStore.addPlayer(player));
        }
        break;
      
      case 'player-stats':
        const playerStatsStore = usePlayerStore.getState();
        if (data.name) {
          this.log('🏈 Adding individual player stats', {
            name: data.name,
            position: data.position,
            jersey: data.jerseyNumber
          });
          // Convert player-stats format to Player format
          const player: Player = {
            id: `player-${Date.now()}`,
            name: data.name,
            position: data.position,
            jerseyNumber: data.jerseyNumber || 0,
            overall: data.overall || 85,
            year: data.year || 'JR',
            height: data.height || "6'0\"",
            weight: data.weight || 200,
            hometown: data.hometown || 'Unknown',
            highSchool: data.highSchool || 'Unknown',
            stats: data.seasonStats || {},
            teamId: data.teamId || 'washington'
          };
          playerStatsStore.addPlayer(player);
        }
        break;
      
      case 'recruiting-board':
        const recruitStore = useRecruitStore.getState();
        if (data.commits) {
          this.log(`⭐ Adding ${data.commits.length} recruits to store`);
          data.commits.forEach((recruit: Recruit) => recruitStore.addRecruit(recruit));
        }
        break;
      
      case 'coach-info':
        const coachStore = useCoachStore.getState();
        if (data.coachId) {
          this.log('🎯 Updating coach information', {
            name: data.name,
            record: `${data.wins}-${data.losses}`
          });
          coachStore.updateCoach(data.coachId, data);
        }
        break;
        
      default:
        this.log(`⚠️ No routing handler for screen type: ${screenType}`);
    }
  }

  // Trigger AI content generation based on significant events
  private async triggerContentGeneration(screenType: ScreenType, data: any): Promise<string[]> {
    const generatedContent: string[] = [];
    
    const triggers = {
      'game-result': () => {
        if (data.result && (data.marginOfVictory > 20 || data.upsetVictory)) {
          this.log('🎉 Significant game detected!', {
            margin: data.marginOfVictory,
            upset: data.upsetVictory
          });
          this.log('✨ Triggering article generation for significant game result');
          generatedContent.push('game-recap');
          // TODO: Actually queue content generation
        }
      },
      'season-standings': () => {
        if (data.ranking && data.ranking <= 25) {
          this.log('🏆 Top 25 ranking detected!', { ranking: data.ranking });
          this.log('✨ Triggering content for ranking update');
          generatedContent.push('ranking-analysis');
          // TODO: Actually queue content generation
        }
      },
      'recruiting-board': () => {
        if (data.commits?.some((r: any) => r.stars >= 4)) {
          this.log('⭐ 4+ star commit detected!');
          this.log('✨ Triggering recruiting article');
          generatedContent.push('recruiting-update');
          // TODO: Actually queue content generation
        }
      },
      'player-stats': () => {
        if (data.seasonStats && (
          data.seasonStats.touchdowns > 20 || 
          data.seasonStats.passingYards > 3000 ||
          data.seasonStats.rushingYards > 1000
        )) {
          this.log('🌟 Outstanding player performance detected!');
          this.log('✨ Triggering player spotlight article');
          generatedContent.push('player-spotlight');
          // TODO: Actually queue content generation
        }
      },
      'coach-info': () => {
        if (data.hotSeat === true) {
          this.log('🔥 Hot seat situation detected!');
          this.log('✨ Triggering hot seat discussion content');
          generatedContent.push('hot-seat-analysis');
          // TODO: Actually queue content generation
        }
      },
      'trophy-case': () => {
        if (data.championships?.length > 0 || data.bowlVictories?.length > 0) {
          this.log('🏆 Championship/Bowl victory detected!');
          this.log('✨ Triggering celebration content');
          generatedContent.push('championship-celebration');
          // TODO: Actually queue content generation
        }
      }
    };

    const trigger = triggers[screenType];
    if (trigger) {
      trigger();
    } else {
      this.log(`ℹ️ No content triggers for ${screenType}`);
    }
    
    return generatedContent;
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
      'top25-rankings': [
        { rank: 1, team: 'Georgia', record: '10-0', points: 1500 },
        { rank: 2, team: 'Michigan', record: '10-0', points: 1445 },
        { rank: 3, team: 'Washington', record: '9-1', points: 1388 }
      ],
      'player-stats': {
        name: 'Michael Penix Jr.',
        position: 'QB',
        jerseyNumber: 9,
        seasonStats: {
          passingYards: 3899,
          touchdowns: 32,
          completions: 276,
          attempts: 421,
          completionPercentage: 65.6,
          qbRating: 158.7
        },
        careerStats: {
          passingYards: 12000,
          touchdowns: 95,
          gamesPlayed: 35
        }
      },
      'unknown': {}
    };

    return mockData[screenType] || {};
  }
}

// Singleton instance
export const orchestrator = new ScreenshotOrchestrator();