import { GooglePlacesService, OfficeScrapeRequest, OfficeScrapeResult } from './googlePlacesService';
import { PlaceToOfficeConverter } from './placeToOfficeConverter';
import { FirestoreNoteService } from '../noteSystem/firestoreNoteService.ts';
import { Office } from '../renderer/src/types/firestore';

export interface ScrapePrompt {
  location?: string;
  radius?: number;
  confirmed: boolean;
}

export interface ScrapeSession {
  id: string;
  location: string;
  radius: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results?: OfficeScrapeResult;
  savedOffices?: Office[];
  stats?: {
    totalFound: number;
    successfullySaved: number;
    duplicatesMerged: number;
    failedToSave: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

export class OfficeScraperService {
  private static instance: OfficeScraperService;
  private googlePlacesService: GooglePlacesService;
  private placeConverter: PlaceToOfficeConverter;
  private firestoreService: FirestoreNoteService;
  private activeSessions: Map<string, ScrapeSession> = new Map();
  private persistentSessions: Map<string, ScrapeSession> = new Map(); // Persistent sessions that survive navigation

  private constructor() {
    this.googlePlacesService = GooglePlacesService.getInstance();
    this.placeConverter = PlaceToOfficeConverter.getInstance();
    this.firestoreService = FirestoreNoteService.getInstance();
  }

  public static getInstance(): OfficeScraperService {
    if (!OfficeScraperService.instance) {
      OfficeScraperService.instance = new OfficeScraperService();
    }
    return OfficeScraperService.instance;
  }

  public setGooglePlacesApiKey(apiKey: string): void {
    this.googlePlacesService.setApiKey(apiKey);
  }

  /**
   * Detect if user input is requesting office scraping
   */
  public detectScrapePrompt(userInput: string): ScrapePrompt | null {
    const input = userInput.toLowerCase().trim();
    
    // Patterns to detect office scraping requests
    const scrapePatterns = [
      /office\s+scrape/i,
      /make\s+a\s+office\s+scrape/i,
      /scrape\s+offices/i,
      /find\s+architecture\s+offices/i,
      /search\s+for\s+offices/i,
      /start\s+office\s+scraper/i
    ];

    // Check for simple location + radius format (e.g., "barcelona 5km")
    const simpleLocationRadiusMatch = input.match(/^([a-zA-Z\s]+?)\s+(\d+)\s*(?:km|kilometers?|miles?|mi)$/i);
    
    const hasScrapeIntent = scrapePatterns.some(pattern => pattern.test(input)) || simpleLocationRadiusMatch;
    
    if (!hasScrapeIntent) {
      return null;
    }

    let location: string | undefined;
    let radius: number | undefined;

    if (simpleLocationRadiusMatch) {
      // Handle simple format: "barcelona 5km"
      location = simpleLocationRadiusMatch[1].trim();
      radius = this.parseRadius(simpleLocationRadiusMatch[2], simpleLocationRadiusMatch[0]);
    } else {
      // Handle complex format: "office scrape in Barcelona within 5km"
      const locationMatch = input.match(/(?:in|at|for)\s+([^,]+?)(?:\s+within|\s+with|\s*$|,)/i);
      location = locationMatch ? locationMatch[1].trim() : undefined;

      const radiusMatch = input.match(/(\d+)\s*(?:km|kilometers?|miles?|mi)/i);
      radius = radiusMatch ? this.parseRadius(radiusMatch[1], radiusMatch[0]) : undefined;
    }

    return {
      location,
      radius,
      confirmed: false
    };
  }

  /**
   * Parse radius from text input
   */
  private parseRadius(value: string, unit: string): number {
    const num = parseInt(value);
    const unitLower = unit.toLowerCase();
    
    if (unitLower.includes('km') || unitLower.includes('kilometer')) {
      return num * 1000; // Convert km to meters
    } else if (unitLower.includes('mi') || unitLower.includes('mile')) {
      return num * 1609.34; // Convert miles to meters
    } else {
      return num * 1000; // Default to km if no unit specified
    }
  }

  /**
   * Start a new scraping session
   */
  public async startScrapingSession(location: string, radius: number = 10000, persistent: boolean = true): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      const sessionId = this.generateSessionId();
      
      const session: ScrapeSession = {
        id: sessionId,
        location,
        radius,
        status: 'pending',
        createdAt: new Date()
      };

      // Store in both active and persistent sessions
      this.activeSessions.set(sessionId, session);
      if (persistent) {
        this.persistentSessions.set(sessionId, session);
      }

      // Start the actual scraping process
      this.performScraping(sessionId);

      return {
        success: true,
        sessionId,
        message: `Started scraping architecture offices in ${location} within ${radius/1000}km radius. This may take a few minutes...`
      };

    } catch (error) {
      console.error('Error starting scraping session:', error);
      return {
        success: false,
        message: `Failed to start scraping: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Perform the actual scraping
   */
  private async performScraping(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.error('Session not found:', sessionId);
      return;
    }

    try {
      session.status = 'in_progress';
      this.activeSessions.set(sessionId, session);

      const scrapeRequest: OfficeScrapeRequest = {
        location: session.location,
        radius: session.radius,
        keyword: 'architecture office',
        type: 'establishment'
      };

      const results = await this.googlePlacesService.searchArchitectureOffices(scrapeRequest);
      
      session.results = results;
      
      // Convert and save offices to Firebase if scraping was successful
      if (results.success && results.offices.length > 0) {
        console.log(`Converting and saving ${results.offices.length} offices to Firebase...`);
        
        const conversionResult = this.placeConverter.convertPlacesToOffices(results.offices);
        
        if (conversionResult.success && conversionResult.offices.length > 0) {
          const savedOffices: Office[] = [];
          const stats = {
            totalFound: conversionResult.offices.length,
            successfullySaved: 0,
            duplicatesMerged: 0,
            failedToSave: 0
          };
          
          // Save each office to Firebase using the same logic as note system
          for (const officeData of conversionResult.offices) {
            try {
              // Validate required fields before saving - same as note system
              if (!officeData.name || officeData.name.trim() === '') {
                console.log('Skipping office - no valid name provided');
                continue;
              }
              
              // Duplicate check using the same system as note processing
              const { EntityUpdateService } = await import('../noteSystem/entityUpdateService');
              const entityUpdateService = EntityUpdateService.getInstance();

              const searchResult = await entityUpdateService.searchExistingOffice(officeData.name);

              if (searchResult.found && searchResult.entity) {
                // Merge with existing office
                console.log(`🔄 Merging scraped office with existing: ${searchResult.entity.name}`);
                const mergeResult = await entityUpdateService.mergeOfficeData(
                  searchResult.entity as Office,
                  officeData
                );

                if (mergeResult.success) {
                  savedOffices.push(mergeResult.entity as Office);
                  stats.duplicatesMerged++;
                  console.log(`Office merged successfully: ${mergeResult.mergedFields.join(', ')}`);
                } else {
                  stats.failedToSave++;
                  console.error(`Failed to merge office: ${mergeResult.error}`);
                }
              } else {
                // Create new office via the same service as note system
                console.log('Saving office:', officeData.name);
                const saveResult = await this.firestoreService.saveOffice(officeData);
                
                if (saveResult.success && saveResult.data && 'name' in saveResult.data) {
                  savedOffices.push(saveResult.data as Office);
                  stats.successfullySaved++;
                  console.log(`Office created successfully: ${saveResult.data.name} (ID: ${saveResult.data.id})`);
                } else {
                  stats.failedToSave++;
                  console.error(`Failed to create office in Firebase:`, saveResult.error);
                }
              }
            } catch (error) {
              stats.failedToSave++;
              console.error(`Error saving office ${officeData.name}:`, error);
            }
          }
          
          session.savedOffices = savedOffices;
          session.stats = stats;
          console.log(`📊 Scraping Results:`, {
            totalFound: stats.totalFound,
            successfullySaved: stats.successfullySaved,
            duplicatesMerged: stats.duplicatesMerged,
            failedToSave: stats.failedToSave
          });
          
          if (conversionResult.errors.length > 0) {
            console.warn(`Conversion errors:`, conversionResult.errors);
          }
        } else {
          console.error('Failed to convert places to offices:', conversionResult.errors);
        }
      }
      
      session.status = results.success ? 'completed' : 'failed';
      session.completedAt = new Date();
      
      this.activeSessions.set(sessionId, session);

      console.log(`Scraping completed for session ${sessionId}:`, {
        success: results.success,
        officesFound: results.totalFound,
        officesSaved: session.savedOffices?.length || 0
      });

    } catch (error) {
      console.error('Scraping failed for session:', sessionId, error);
      
      session.status = 'failed';
      session.completedAt = new Date();
      session.results = {
        success: false,
        offices: [],
        totalFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.activeSessions.set(sessionId, session);
    }
  }

  /**
   * Get session status and results
   */
  public getSessionStatus(sessionId: string): ScrapeSession | null {
    return this.activeSessions.get(sessionId) || this.persistentSessions.get(sessionId) || null;
  }

  /**
   * Get all persistent sessions (survive navigation)
   */
  public getPersistentSessions(): ScrapeSession[] {
    return Array.from(this.persistentSessions.values());
  }

  /**
   * Get active persistent sessions (currently running)
   */
  public getActivePersistentSessions(): ScrapeSession[] {
    return Array.from(this.persistentSessions.values()).filter(session => 
      session.status === 'pending' || session.status === 'in_progress'
    );
  }

  /**
   * Get formatted results for a session
   */
  public getSessionResults(sessionId: string): string {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return 'Session not found';
    }

    if (!session.results) {
      return 'Session still in progress...';
    }

    return this.formatResults(session.results, session.savedOffices, session.stats);
  }

  /**
   * Get all active sessions
   */
  public getAllSessions(): ScrapeSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Format scraping results for display
   */
  public formatResults(results: OfficeScrapeResult, savedOffices?: Office[], stats?: ScrapeSession['stats']): string {
    if (!results.success) {
      return `Scraping failed: ${results.error}`;
    }

    if (results.totalFound === 0) {
      return 'No architecture offices found in the specified area.';
    }

    let formatted = `Found ${results.totalFound} architecture offices`;
    
    if (stats) {
      formatted += `\nFirestore Results:`;
      formatted += `\n  Successfully saved: ${stats.successfullySaved}`;
      formatted += `\n  Duplicates merged: ${stats.duplicatesMerged}`;
      formatted += `\n  Failed to save: ${stats.failedToSave}`;
      formatted += `\n  Total processed: ${stats.successfullySaved + stats.duplicatesMerged + stats.failedToSave}`;
    } else if (savedOffices && savedOffices.length > 0) {
      formatted += ` (${savedOffices.length} saved to database)`;
    }
    
    formatted += `:\n\n`;
    
    results.offices.forEach((office, index) => {
      const isSaved = savedOffices?.some(saved => saved.name === office.name);
      const savedIndicator = isSaved ? ' [saved]' : '';
      
      formatted += `${index + 1}. **${office.name}**${savedIndicator}\n`;
      formatted += `   Address: ${office.formatted_address}\n`;
      
      if (office.rating) {
        formatted += `   Rating: ${office.rating}/5 (${office.user_ratings_total || 0} reviews)\n`;
      }
      
      if (office.website) {
        formatted += `   Website: ${office.website}\n`;
      }
      
      if (office.international_phone_number) {
        formatted += `   Phone: ${office.international_phone_number}\n`;
      }
      
      if (office.business_status) {
        formatted += `   Status: ${office.business_status}\n`;
      }
      
      formatted += '\n';
    });

    return formatted;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  public cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}
