// Office ID Service - High-level service for Office ID operations

import {
  generateOfficeId,
  checkOfficeIdCollision,
  parseOfficeId,
  suggestOfficeIdAlternatives,
  getOfficeIdStats,
  type OfficeIdGenerationOptions,
  type OfficeIdGenerationResult,
  type CollisionCheckResult
} from './officeIdSystem';
import { validateOfficeId, type OfficeIdValidation } from '../../types/validation';
import { type Office } from '../../types/firestore';

// ============================================================================
// OFFICE ID SERVICE
// ============================================================================

export interface OfficeIdServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    operation: string;
    timestamp: Date;
    duration?: number;
  };
}

export interface OfficeIdValidationResult extends OfficeIdServiceResult<OfficeIdValidation> {
  data: OfficeIdValidation;
}

export interface OfficeIdGenerationServiceResult extends OfficeIdServiceResult<string> {
  data: string;
  generationInfo: {
    attempts: number;
    country: string;
    city: string;
    collisionChecked: boolean;
  };
}

export interface OfficeIdSuggestionResult extends OfficeIdServiceResult<string[]> {
  data: string[];
  countryInfo: {
    code: string;
    name: string;
    continent: string;
  };
  cityCodeInfo: Array<{
    code: string;
    city: string;
    country: string;
  }>;
}

export interface OfficeIdStatsResult extends OfficeIdServiceResult<{
  totalPossible: number;
  totalUsed: number;
  totalAvailable: number;
  usageByCountry: Record<string, number>;
  usageByCity: Record<string, number>;
  collisionRate: number;
}> {
  data: {
    totalPossible: number;
    totalUsed: number;
    totalAvailable: number;
    usageByCountry: Record<string, number>;
    usageByCity: Record<string, number>;
    collisionRate: number;
  };
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class OfficeIdService {
  private static instance: OfficeIdService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): OfficeIdService {
    if (!OfficeIdService.instance) {
      OfficeIdService.instance = new OfficeIdService();
    }
    return OfficeIdService.instance;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate an office ID format and return detailed results
   */
  public async validateOfficeId(officeId: string): Promise<OfficeIdValidationResult> {
    const startTime = Date.now();
    
    try {
      const validation = validateOfficeId(officeId);
      
      return {
        success: true,
        data: validation,
        metadata: {
          operation: 'validate-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
        data: {
          isValid: false,
          format: 'CCccNNN',
          country: '',
          city: '',
          number: '',
          errors: ['Validation failed']
        },
        metadata: {
          operation: 'validate-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Parse office ID and return detailed information
   */
  public async parseOfficeId(officeId: string): Promise<OfficeIdServiceResult<{
    country: string;
    city: string;
    number: string;
    countryInfo: any;
    validation: OfficeIdValidation;
  }>> {
    const startTime = Date.now();
    
    try {
      const parsed = parseOfficeId(officeId);
      
      return {
        success: true,
        data: parsed,
        metadata: {
          operation: 'parse-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        metadata: {
          operation: 'parse-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // GENERATION METHODS
  // ============================================================================

  /**
   * Generate a new office ID with comprehensive options
   */
  public async generateOfficeId(options: OfficeIdGenerationOptions): Promise<OfficeIdGenerationServiceResult> {
    const startTime = Date.now();
    
    try {
      const result = await generateOfficeId(options);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          data: '',
          generationInfo: {
            attempts: result.attempts,
            country: options.country,
            city: options.city,
            collisionChecked: options.checkCollision || false
          },
          metadata: {
            operation: 'generate-office-id',
            timestamp: new Date(),
            duration: Date.now() - startTime
          }
        };
      }
      
      return {
        success: true,
        data: result.officeId!,
        generationInfo: {
          attempts: result.attempts,
          country: options.country,
          city: options.city,
          collisionChecked: options.checkCollision || false
        },
        metadata: {
          operation: 'generate-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error',
        data: '',
        generationInfo: {
          attempts: 0,
          country: options.country,
          city: options.city,
          collisionChecked: options.checkCollision || false
        },
        metadata: {
          operation: 'generate-office-id',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Generate office ID for office creation
   */
  public async generateOfficeIdForOffice(officeData: Partial<Office>): Promise<OfficeIdGenerationServiceResult> {
    if (!officeData.location?.headquarters?.country || !officeData.location?.headquarters?.city) {
      return {
        success: false,
        error: 'Office location (country and city) is required for ID generation',
        data: '',
        generationInfo: {
          attempts: 0,
          country: '',
          city: '',
          collisionChecked: false
        },
        metadata: {
          operation: 'generate-office-id-for-office',
          timestamp: new Date()
        }
      };
    }

    return this.generateOfficeId({
      country: officeData.location.headquarters.country,
      city: officeData.location.headquarters.city,
      checkCollision: true,
      maxRetries: 10
    });
  }

  // ============================================================================
  // COLLISION DETECTION METHODS
  // ============================================================================

  /**
   * Check if an office ID is available
   */
  public async checkOfficeIdAvailability(officeId: string): Promise<OfficeIdServiceResult<boolean>> {
    const startTime = Date.now();
    
    try {
      const collisionCheck = await checkOfficeIdCollision(officeId);
      
      return {
        success: true,
        data: !collisionCheck.found,
        metadata: {
          operation: 'check-office-id-availability',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown collision check error',
        metadata: {
          operation: 'check-office-id-availability',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get detailed collision information
   */
  public async getCollisionInfo(officeId: string): Promise<OfficeIdServiceResult<CollisionCheckResult>> {
    const startTime = Date.now();
    
    try {
      const collisionInfo = await checkOfficeIdCollision(officeId);
      
      return {
        success: true,
        data: collisionInfo,
        metadata: {
          operation: 'get-collision-info',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown collision info error',
        metadata: {
          operation: 'get-collision-info',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // SUGGESTION METHODS
  // ============================================================================

  /**
   * Get office ID suggestions for a country/city combination
   */
  public async getOfficeIdSuggestions(
    country: string, 
    city: string, 
    maxSuggestions: number = 5
  ): Promise<OfficeIdSuggestionResult> {
    const startTime = Date.now();
    
    try {
      const suggestions = await suggestOfficeIdAlternatives(country, city, maxSuggestions);
      
      return {
        success: true,
        data: suggestions.suggestions,
        countryInfo: {
          code: suggestions.countryInfo.code,
          name: suggestions.countryInfo.name,
          continent: suggestions.countryInfo.continent
        },
        cityCodeInfo: suggestions.cityCodeInfo,
        metadata: {
          operation: 'get-office-id-suggestions',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown suggestion error',
        data: [],
        countryInfo: {
          code: '',
          name: '',
          continent: ''
        },
        cityCodeInfo: [],
        metadata: {
          operation: 'get-office-id-suggestions',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // STATISTICS METHODS
  // ============================================================================

  /**
   * Get office ID usage statistics
   */
  public async getOfficeIdStatistics(): Promise<OfficeIdStatsResult> {
    const startTime = Date.now();
    const cacheKey = 'office-id-stats';
    
    try {
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            operation: 'get-office-id-statistics',
            timestamp: new Date(),
            duration: Date.now() - startTime
          }
        };
      }
      
      const stats = await getOfficeIdStats();
      
      // Cache the result
      this.setCache(cacheKey, stats);
      
      return {
        success: true,
        data: stats,
        metadata: {
          operation: 'get-office-id-statistics',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown statistics error',
        data: {
          totalPossible: 0,
          totalUsed: 0,
          totalAvailable: 0,
          usageByCountry: {},
          usageByCity: {},
          collisionRate: 0
        },
        metadata: {
          operation: 'get-office-id-statistics',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get all possible office IDs for a country/city combination
   */
  public async getAllPossibleOfficeIds(country: string, city: string): Promise<OfficeIdServiceResult<string[]>> {
    const startTime = Date.now();
    
    try {
      const { getAllPossibleOfficeIds } = await import('./officeIdSystem');
      const possibleIds = getAllPossibleOfficeIds(country, city);
      
      return {
        success: true,
        data: possibleIds,
        metadata: {
          operation: 'get-all-possible-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operation: 'get-all-possible-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get available office IDs for a country/city combination
   */
  public async getAvailableOfficeIds(country: string, city: string): Promise<OfficeIdServiceResult<string[]>> {
    const startTime = Date.now();
    
    try {
      const { getAvailableOfficeIds } = await import('./officeIdSystem');
      const availableIds = await getAvailableOfficeIds(country, city);
      
      return {
        success: true,
        data: availableIds,
        metadata: {
          operation: 'get-available-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operation: 'get-available-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // CACHE METHODS
  // ============================================================================

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Generate multiple office IDs at once
   */
  public async generateMultipleOfficeIds(
    requests: OfficeIdGenerationOptions[],
    maxConcurrent: number = 5
  ): Promise<OfficeIdServiceResult<OfficeIdGenerationServiceResult[]>> {
    const startTime = Date.now();
    
    try {
      const { generateMultipleOfficeIds } = await import('./officeIdSystem');
      const results = await generateMultipleOfficeIds(requests, maxConcurrent);
      
      const serviceResults: OfficeIdGenerationServiceResult[] = results.map(result => ({
        success: result.success,
        data: result.officeId || '',
        error: result.error,
        generationInfo: {
          attempts: result.attempts,
          country: '',
          city: '',
          collisionChecked: false
        },
        metadata: {
          operation: 'generate-office-id',
          timestamp: new Date()
        }
      }));
      
      return {
        success: true,
        data: serviceResults,
        metadata: {
          operation: 'generate-multiple-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown batch generation error',
        metadata: {
          operation: 'generate-multiple-office-ids',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const officeIdService = OfficeIdService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function validateOfficeIdService(officeId: string): Promise<OfficeIdValidationResult> {
  return officeIdService.validateOfficeId(officeId);
}

export async function generateOfficeIdService(options: OfficeIdGenerationOptions): Promise<OfficeIdGenerationServiceResult> {
  return officeIdService.generateOfficeId(options);
}

export async function checkOfficeIdAvailabilityService(officeId: string): Promise<OfficeIdServiceResult<boolean>> {
  return officeIdService.checkOfficeIdAvailability(officeId);
}

export async function getOfficeIdSuggestionsService(
  country: string, 
  city: string, 
  maxSuggestions: number = 5
): Promise<OfficeIdSuggestionResult> {
  return officeIdService.getOfficeIdSuggestions(country, city, maxSuggestions);
}

export async function getOfficeIdStatisticsService(): Promise<OfficeIdStatsResult> {
  return officeIdService.getOfficeIdStatistics();
}
