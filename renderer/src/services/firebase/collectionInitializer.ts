// Collection Initializer Service - Initialize all Firestore collections

import { getFirestoreInstance } from './config';
import { 
  CollectionName, 
  ACTIVE_COLLECTIONS, 
  DORMANT_COLLECTIONS,
  COLLECTION_CONFIGS
} from '../../types/firestore';
import { 
  getSchema,
  getActiveSchemas,
  getDormantSchemas,
  getCollectionsByTier,
  getCollectionsByCategory,
  COLLECTION_SCHEMAS
} from './schemas';
import { documentTemplateService } from './documentTemplates';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// INITIALIZATION TYPES
// ============================================================================

export interface CollectionInitializationResult {
  success: boolean;
  collection: CollectionName;
  tier: number;
  type: 'active' | 'dormant';
  category?: string;
  error?: string;
  metadata?: {
    operation: string;
    timestamp: Date;
    duration?: number;
  };
}

export interface InitializationSummary {
  success: boolean;
  totalCollections: number;
  activeCollections: number;
  dormantCollections: number;
  successful: number;
  failed: number;
  results: CollectionInitializationResult[];
  duration: number;
  errors: string[];
}

export interface CollectionSetupOptions {
  initializeActive?: boolean;
  initializeDormant?: boolean;
  createSampleDocuments?: boolean;
  validateSchemas?: boolean;
  maxConcurrent?: number;
}

// ============================================================================
// COLLECTION INITIALIZER SERVICE
// ============================================================================

export class CollectionInitializerService {
  private static instance: CollectionInitializerService;
  private initializedCollections: Set<CollectionName> = new Set();

  private constructor() {}

  public static getInstance(): CollectionInitializerService {
    if (!CollectionInitializerService.instance) {
      CollectionInitializerService.instance = new CollectionInitializerService();
    }
    return CollectionInitializerService.instance;
  }

  // ============================================================================
  // MAIN INITIALIZATION METHODS
  // ============================================================================

  /**
   * Initialize all collections
   */
  public async initializeAllCollections(
    options: CollectionSetupOptions = {}
  ): Promise<InitializationSummary> {
    const startTime = Date.now();
    const {
      initializeActive = true,
      initializeDormant = true,
      createSampleDocuments = false,
      validateSchemas = true,
      maxConcurrent = 5
    } = options;

    const results: CollectionInitializationResult[] = [];
    const errors: string[] = [];

    try {
      // Get collections to initialize
      const collectionsToInitialize: CollectionName[] = [];
      
      if (initializeActive) {
        collectionsToInitialize.push(...ACTIVE_COLLECTIONS);
      }
      
      if (initializeDormant) {
        collectionsToInitialize.push(...DORMANT_COLLECTIONS);
      }

      // Initialize collections in batches
      for (let i = 0; i < collectionsToInitialize.length; i += maxConcurrent) {
        const batch = collectionsToInitialize.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(collection => 
          this.initializeCollection(collection, { createSampleDocuments, validateSchemas })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Calculate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      results.forEach(result => {
        if (!result.success && result.error) {
          errors.push(`${result.collection}: ${result.error}`);
        }
      });

      const duration = Date.now() - startTime;

      return {
        success: failed === 0,
        totalCollections: collectionsToInitialize.length,
        activeCollections: ACTIVE_COLLECTIONS.length,
        dormantCollections: DORMANT_COLLECTIONS.length,
        successful,
        failed,
        results,
        duration,
        errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        totalCollections: 0,
        activeCollections: 0,
        dormantCollections: 0,
        successful: 0,
        failed: 0,
        results,
        duration,
        errors
      };
    }
  }

  /**
   * Initialize only active collections
   */
  public async initializeActiveCollections(
    options: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'> = {}
  ): Promise<InitializationSummary> {
    return this.initializeAllCollections({
      ...options,
      initializeActive: true,
      initializeDormant: false
    });
  }

  /**
   * Initialize only dormant collections
   */
  public async initializeDormantCollections(
    options: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'> = {}
  ): Promise<InitializationSummary> {
    return this.initializeAllCollections({
      ...options,
      initializeActive: false,
      initializeDormant: true
    });
  }

  /**
   * Initialize collections by tier
   */
  public async initializeCollectionsByTier(
    tier: 1 | 2 | 3 | 4,
    options: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'> = {}
  ): Promise<InitializationSummary> {
    const startTime = Date.now();
    const {
      createSampleDocuments = false,
      validateSchemas = true,
      maxConcurrent = 5
    } = options;

    const collectionsToInitialize = getCollectionsByTier(tier);
    const results: CollectionInitializationResult[] = [];
    const errors: string[] = [];

    try {
      // Initialize collections in batches
      for (let i = 0; i < collectionsToInitialize.length; i += maxConcurrent) {
        const batch = collectionsToInitialize.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(collection => 
          this.initializeCollection(collection, { createSampleDocuments, validateSchemas })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Calculate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      results.forEach(result => {
        if (!result.success && result.error) {
          errors.push(`${result.collection}: ${result.error}`);
        }
      });

      const duration = Date.now() - startTime;

      return {
        success: failed === 0,
        totalCollections: collectionsToInitialize.length,
        activeCollections: collectionsToInitialize.filter(c => ACTIVE_COLLECTIONS.includes(c)).length,
        dormantCollections: collectionsToInitialize.filter(c => DORMANT_COLLECTIONS.includes(c)).length,
        successful,
        failed,
        results,
        duration,
        errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Tier ${tier} initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        totalCollections: 0,
        activeCollections: 0,
        dormantCollections: 0,
        successful: 0,
        failed: 0,
        results,
        duration,
        errors
      };
    }
  }

  /**
   * Initialize collections by category
   */
  public async initializeCollectionsByCategory(
    category: 'enrichment' | 'external-forces' | 'market-intelligence',
    options: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'> = {}
  ): Promise<InitializationSummary> {
    const startTime = Date.now();
    const {
      createSampleDocuments = false,
      validateSchemas = true,
      maxConcurrent = 5
    } = options;

    const collectionsToInitialize = getCollectionsByCategory(category);
    const results: CollectionInitializationResult[] = [];
    const errors: string[] = [];

    try {
      // Initialize collections in batches
      for (let i = 0; i < collectionsToInitialize.length; i += maxConcurrent) {
        const batch = collectionsToInitialize.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(collection => 
          this.initializeCollection(collection, { createSampleDocuments, validateSchemas })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Calculate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      results.forEach(result => {
        if (!result.success && result.error) {
          errors.push(`${result.collection}: ${result.error}`);
        }
      });

      const duration = Date.now() - startTime;

      return {
        success: false,
        totalCollections: collectionsToInitialize.length,
        activeCollections: collectionsToInitialize.filter(c => ACTIVE_COLLECTIONS.includes(c)).length,
        dormantCollections: collectionsToInitialize.filter(c => DORMANT_COLLECTIONS.includes(c)).length,
        successful,
        failed,
        results,
        duration,
        errors
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`${category} initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        totalCollections: 0,
        activeCollections: 0,
        dormantCollections: 0,
        successful: 0,
        failed: 0,
        results,
        duration,
        errors
      };
    }
  }

  // ============================================================================
  // INDIVIDUAL COLLECTION INITIALIZATION
  // ============================================================================

  /**
   * Initialize a single collection
   */
  public async initializeCollection(
    collectionName: CollectionName,
    options: {
      createSampleDocuments?: boolean;
      validateSchemas?: boolean;
    } = {}
  ): Promise<CollectionInitializationResult> {
    const startTime = Date.now();
    const { createSampleDocuments = false, validateSchemas = true } = options;

    try {
      // Check if already initialized
      if (this.initializedCollections.has(collectionName)) {
        return {
          success: true,
          collection: collectionName,
          tier: COLLECTION_CONFIGS[collectionName].tier,
          type: COLLECTION_CONFIGS[collectionName].type,
          category: COLLECTION_CONFIGS[collectionName].category,
          metadata: {
            operation: 'initialize-collection',
            timestamp: new Date(),
            duration: Date.now() - startTime
          }
        };
      }

      // Get schema
      const schema = getSchema(collectionName);

      // Validate schema if requested
      if (validateSchemas) {
        const validationResult = this.validateCollectionSchema(collectionName, schema);
        if (!validationResult.isValid) {
          return {
            success: false,
            collection: collectionName,
            tier: schema.tier,
            type: schema.type,
            category: schema.category,
            error: `Schema validation failed: ${validationResult.errors.join(', ')}`,
            metadata: {
              operation: 'initialize-collection',
              timestamp: new Date(),
              duration: Date.now() - startTime
            }
          };
        }
      }

      // Create sample documents if requested
      if (createSampleDocuments) {
        await this.createSampleDocuments(collectionName);
      }

      // Mark as initialized
      this.initializedCollections.add(collectionName);

      return {
        success: true,
        collection: collectionName,
        tier: schema.tier,
        type: schema.type,
        category: schema.category,
        metadata: {
          operation: 'initialize-collection',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        collection: collectionName,
        tier: COLLECTION_CONFIGS[collectionName].tier,
        type: COLLECTION_CONFIGS[collectionName].type,
        category: COLLECTION_CONFIGS[collectionName].category,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operation: 'initialize-collection',
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate collection schema
   */
  private validateCollectionSchema(collectionName: CollectionName, schema: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check required schema properties
      if (!schema.name) {
        errors.push('Schema missing name property');
      }
      
      if (!schema.type) {
        errors.push('Schema missing type property');
      }
      
      if (!schema.tier) {
        errors.push('Schema missing tier property');
      }
      
      if (!schema.template) {
        errors.push('Schema missing template function');
      }
      
      if (!schema.requiredFields) {
        errors.push('Schema missing requiredFields array');
      }
      
      if (!schema.optionalFields) {
        errors.push('Schema missing optionalFields array');
      }

      // Validate tier
      if (schema.tier && ![1, 2, 3, 4].includes(schema.tier)) {
        errors.push(`Invalid tier: ${schema.tier}. Must be 1, 2, 3, or 4`);
      }

      // Validate type
      if (schema.type && !['active', 'dormant'].includes(schema.type)) {
        errors.push(`Invalid type: ${schema.type}. Must be 'active' or 'dormant'`);
      }

      // Validate category for tier 3
      if (schema.tier === 3 && !schema.category) {
        warnings.push('Tier 3 collection missing category');
      }

      // Test template function
      try {
        const template = schema.template();
        if (!template || typeof template !== 'object') {
          errors.push('Template function does not return valid object');
        }
      } catch (templateError) {
        errors.push(`Template function error: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`);
      }

      // Validate required fields
      if (schema.requiredFields && !Array.isArray(schema.requiredFields)) {
        errors.push('Required fields must be an array');
      }

      // Validate optional fields
      if (schema.optionalFields && !Array.isArray(schema.optionalFields)) {
        errors.push('Optional fields must be an array');
      }

    } catch (error) {
      errors.push(`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // SAMPLE DOCUMENT CREATION
  // ============================================================================

  /**
   * Create sample documents for a collection
   */
  private async createSampleDocuments(collectionName: CollectionName): Promise<void> {
    try {
      // Only create sample documents for active collections
      if (!ACTIVE_COLLECTIONS.includes(collectionName)) {
        return;
      }

      const db = getFirestoreInstance();
      
      // Create sample documents based on collection type
      switch (collectionName) {
        case 'offices':
          await this.createSampleOffices(db);
          break;
        case 'projects':
          await this.createSampleProjects(db);
          break;
        case 'regulations':
          await this.createSampleRegulations(db);
          break;
        case 'relationships':
          await this.createSampleRelationships(db);
          break;
        default:
          // No sample documents for other collections
          break;
      }
    } catch (error) {
      console.warn(`Failed to create sample documents for ${collectionName}:`, error);
    }
  }

  /**
   * Create sample offices
   */
  private async createSampleOffices(db: any): Promise<void> {
    const sampleOffices = [
      {
        id: 'GBLO001',
        name: 'Zaha Hadid Architects',
        officialName: 'Zaha Hadid Architects Ltd.',
        founded: 1980,
        status: 'active',
        location: {
          headquarters: {
            city: 'London',
            country: 'GB',
            coordinates: { latitude: 51.5074, longitude: -0.1278 }
          },
          otherOffices: []
        },
        size: {
          employeeCount: 400,
          sizeCategory: 'large',
          annualRevenue: 50000000
        },
        specializations: ['commercial', 'cultural', 'residential'],
        notableWorks: ['Heydar Aliyev Center', 'London Aquatics Centre'],
        connectionCounts: {
          totalProjects: 150,
          activeProjects: 25,
          clients: 45,
          competitors: 12,
          suppliers: 30
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'USNE002',
        name: 'Foster + Partners',
        officialName: 'Foster + Partners Ltd.',
        founded: 1967,
        status: 'active',
        location: {
          headquarters: {
            city: 'New York',
            country: 'US',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          otherOffices: []
        },
        size: {
          employeeCount: 200,
          sizeCategory: 'large',
          annualRevenue: 30000000
        },
        specializations: ['commercial', 'transportation', 'sustainability'],
        notableWorks: ['30 St Mary Axe', 'Apple Park'],
        connectionCounts: {
          totalProjects: 200,
          activeProjects: 30,
          clients: 60,
          competitors: 15,
          suppliers: 40
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    // Note: In a real implementation, you would use Firestore batch writes here
    // For now, we'll just log the sample data
    console.log(`Sample offices for ${collectionName}:`, sampleOffices);
  }

  /**
   * Create sample projects
   */
  private async createSampleProjects(db: any): Promise<void> {
    const sampleProjects = [
      {
        id: 'heydar-aliyev-center',
        projectName: 'Heydar Aliyev Center',
        officeId: 'GBLO001',
        cityId: 'baku-azerbaijan',
        clientId: 'azerbaijan-government',
        status: 'completed',
        timeline: {
          startDate: Timestamp.fromDate(new Date('2007-01-01')),
          expectedCompletion: Timestamp.fromDate(new Date('2012-01-01')),
          actualCompletion: Timestamp.fromDate(new Date('2012-05-01'))
        },
        location: {
          city: 'Baku',
          country: 'AZ',
          address: 'Heydar Aliyev Avenue, Baku, Azerbaijan',
          coordinates: { latitude: 40.4093, longitude: 49.8671 }
        },
        financial: {
          budget: 250000000,
          currency: 'USD',
          actualCost: 275000000
        },
        details: {
          projectType: 'cultural',
          size: 57519,
          description: 'Cultural center and museum complex'
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    console.log(`Sample projects for ${collectionName}:`, sampleProjects);
  }

  /**
   * Create sample regulations
   */
  private async createSampleRegulations(db: any): Promise<void> {
    const sampleRegulations = [
      {
        id: 'gb-building-regs-2023',
        regulationType: 'building-code',
        name: 'UK Building Regulations 2023',
        jurisdiction: {
          level: 'national',
          country: 'GB',
          countryName: 'United Kingdom',
          scope: {
            appliesToCountry: true,
            appliesToState: false,
            appliesToCities: [],
            appliesToProjectTypes: ['residential', 'commercial', 'institutional']
          }
        },
        effectiveDate: Timestamp.fromDate(new Date('2023-01-01')),
        version: '2023',
        description: 'National building regulations for England and Wales',
        compliance: {
          mandatory: true,
          penalties: {
            fines: 'Up to £5,000 per violation',
            criminal: false,
            projectStoppage: true
          },
          requiredCertifications: ['Building Control Approval'],
          inspectionRequired: true,
          complianceCost: {
            estimated: 5000,
            currency: 'GBP',
            perProjectType: {}
          },
          documentationRequired: ['Building Control Application', 'Structural Calculations']
        },
        enforcement: {
          enforcingAuthority: 'Local Building Control',
          inspectionFrequency: 'At key construction stages',
          complianceRate: 95,
          violationCount: 150
        },
        impact: {
          level: 'high',
          affectedProjects: [],
          economicImpact: 'Moderate cost increase for compliance',
          timelineImpact: 'Additional 2-4 weeks for approvals',
          designImpact: 'Must meet minimum standards for safety and energy efficiency'
        },
        newsArticles: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    console.log(`Sample regulations for ${collectionName}:`, sampleRegulations);
  }

  /**
   * Create sample relationships
   */
  private async createSampleRelationships(db: any): Promise<void> {
    const sampleRelationships = [
      {
        id: 'office-GBLO001-collaborator-office-USNE002',
        sourceEntity: {
          type: 'office',
          id: 'GBLO001'
        },
        targetEntity: {
          type: 'office',
          id: 'USNE002'
        },
        relationshipType: 'collaborator',
        strength: 7,
        sentiment: 'positive',
        startDate: Timestamp.fromDate(new Date('2020-01-01')),
        endDate: undefined,
        details: {
          context: 'Joint venture on sustainable architecture projects',
          outcomes: ['Shared research on green building technologies', 'Collaborative design competitions'],
          notes: 'Strong working relationship with regular project collaboration'
        },
        evidence: ['project-001', 'project-002'],
        tags: ['sustainability', 'collaboration', 'research'],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    console.log(`Sample relationships for ${collectionName}:`, sampleRelationships);
  }

  // ============================================================================
  // STATUS AND UTILITY METHODS
  // ============================================================================

  /**
   * Get initialization status
   */
  public getInitializationStatus(): {
    totalCollections: number;
    initializedCollections: number;
    activeCollections: number;
    dormantCollections: number;
    initializedActive: number;
    initializedDormant: number;
    status: Record<CollectionName, boolean>;
  } {
    const totalCollections = Object.keys(COLLECTION_CONFIGS).length;
    const initializedCollections = this.initializedCollections.size;
    const activeCollections = ACTIVE_COLLECTIONS.length;
    const dormantCollections = DORMANT_COLLECTIONS.length;
    
    const initializedActive = ACTIVE_COLLECTIONS.filter(c => this.initializedCollections.has(c)).length;
    const initializedDormant = DORMANT_COLLECTIONS.filter(c => this.initializedCollections.has(c)).length;
    
    const status: Record<CollectionName, boolean> = {} as any;
    Object.keys(COLLECTION_CONFIGS).forEach(collection => {
      status[collection as CollectionName] = this.initializedCollections.has(collection as CollectionName);
    });

    return {
      totalCollections,
      initializedCollections,
      activeCollections,
      dormantCollections,
      initializedActive,
      initializedDormant,
      status
    };
  }

  /**
   * Reset initialization status
   */
  public resetInitializationStatus(): void {
    this.initializedCollections.clear();
  }

  /**
   * Check if collection is initialized
   */
  public isCollectionInitialized(collectionName: CollectionName): boolean {
    return this.initializedCollections.has(collectionName);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const collectionInitializer = CollectionInitializerService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function initializeAllCollections(
  options?: CollectionSetupOptions
): Promise<InitializationSummary> {
  return collectionInitializer.initializeAllCollections(options);
}

export async function initializeActiveCollections(
  options?: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'>
): Promise<InitializationSummary> {
  return collectionInitializer.initializeActiveCollections(options);
}

export async function initializeDormantCollections(
  options?: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'>
): Promise<InitializationSummary> {
  return collectionInitializer.initializeDormantCollections(options);
}

export async function initializeCollectionsByTier(
  tier: 1 | 2 | 3 | 4,
  options?: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'>
): Promise<InitializationSummary> {
  return collectionInitializer.initializeCollectionsByTier(tier, options);
}

export async function initializeCollectionsByCategory(
  category: 'enrichment' | 'external-forces' | 'market-intelligence',
  options?: Omit<CollectionSetupOptions, 'initializeActive' | 'initializeDormant'>
): Promise<InitializationSummary> {
  return collectionInitializer.initializeCollectionsByCategory(category, options);
}

export function getInitializationStatus() {
  return collectionInitializer.getInitializationStatus();
}

export function isCollectionInitialized(collectionName: CollectionName): boolean {
  return collectionInitializer.isCollectionInitialized(collectionName);
}
