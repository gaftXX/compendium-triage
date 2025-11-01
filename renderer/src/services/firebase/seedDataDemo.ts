// Seed Data Demo and Testing Service

import { 
  seedDataService,
  getSeedDataStatistics,
  validateSeedData
} from './seedDataService';
import { 
  dataService,
  queryOffices,
  queryProjects,
  queryRegulations,
  queryRelationships
} from './dataService';
import { 
  getOfficesByCountry,
  getOfficesByCity,
  getLargeOffices,
  getActiveProjects,
  getCompletedProjects,
  getRegulationsByCountry,
  getMandatoryRegulations,
  getRelationshipsByEntity,
  getStrongRelationships
} from './queryBuilders';

// ============================================================================
// DEMO TYPES
// ============================================================================

export interface DemoResult {
  success: boolean;
  operation: string;
  duration: number;
  data?: any;
  error?: string;
  metadata?: any;
}

export interface DemoSummary {
  success: boolean;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  duration: number;
  results: DemoResult[];
  errors: string[];
  warnings: string[];
}

// ============================================================================
// SEED DATA DEMO SERVICE
// ============================================================================

export class SeedDataDemoService {
  private static instance: SeedDataDemoService;

  private constructor() {}

  public static getInstance(): SeedDataDemoService {
    if (!SeedDataDemoService.instance) {
      SeedDataDemoService.instance = new SeedDataDemoService();
    }
    return SeedDataDemoService.instance;
  }

  // ============================================================================
  // MAIN DEMO METHODS
  // ============================================================================

  /**
   * Run complete seed data demo
   */
  public async runCompleteDemo(): Promise<DemoSummary> {
    const startTime = Date.now();
    const results: DemoResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log('🌱 Starting Seed Data Demo');
      console.log('==========================\n');

      // 1. Show seed data statistics
      const statsResult = await this.showSeedDataStatistics();
      results.push(statsResult);

      // 2. Validate seed data
      const validationResult = await this.validateSeedData();
      results.push(validationResult);

      // 3. Seed all collections
      const seedResult = await this.seedAllCollections();
      results.push(seedResult);

      // 4. Query and display results
      const queryResults = await this.queryAndDisplayResults();
      results.push(...queryResults);

      // 5. Demonstrate advanced queries
      const advancedQueryResults = await this.demonstrateAdvancedQueries();
      results.push(...advancedQueryResults);

      // 6. Show relationship analysis
      const relationshipResults = await this.analyzeRelationships();
      results.push(...relationshipResults);

      // Calculate summary
      const successfulOperations = results.filter(r => r.success).length;
      const failedOperations = results.filter(r => !r.success).length;

      results.forEach(result => {
        if (!result.success && result.error) {
          errors.push(`${result.operation}: ${result.error}`);
        }
      });

      console.log('\nSeed Data Demo Completed!');
      console.log(`Total Operations: ${results.length}`);
      console.log(`Successful: ${successfulOperations}`);
      console.log(`Failed: ${failedOperations}`);
      console.log(`Duration: ${Date.now() - startTime}ms`);

      return {
        success: failedOperations === 0,
        totalOperations: results.length,
        successfulOperations,
        failedOperations,
        duration: Date.now() - startTime,
        results,
        errors,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        duration: Date.now() - startTime,
        results,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings
      };
    }
  }

  // ============================================================================
  // DEMO OPERATIONS
  // ============================================================================

  /**
   * Show seed data statistics
   */
  private async showSeedDataStatistics(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const stats = getSeedDataStatistics();
      
      console.log('Seed Data Statistics:');
      console.log(`   Offices: ${stats.offices}`);
      console.log(`   Projects: ${stats.projects}`);
      console.log(`   Regulations: ${stats.regulations}`);
      console.log(`   Relationships: ${stats.relationships}`);
      console.log(`   Total: ${stats.total}\n`);

      return {
        success: true,
        operation: 'show-seed-data-statistics',
        duration: Date.now() - startTime,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        operation: 'show-seed-data-statistics',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate seed data
   */
  private async validateSeedData(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const validation = validateSeedData();
      
      console.log('Seed Data Validation:');
      if (validation.isValid) {
        console.log('   All seed data is valid');
      } else {
        console.log('   Validation errors:');
        validation.errors.forEach(error => console.log(`     - ${error}`));
      }
      if (validation.warnings.length > 0) {
        console.log('   Warnings:');
        validation.warnings.forEach(warning => console.log(`     - ${warning}`));
      }
      console.log('');

      return {
        success: validation.isValid,
        operation: 'validate-seed-data',
        duration: Date.now() - startTime,
        data: validation
      };
    } catch (error) {
      return {
        success: false,
        operation: 'validate-seed-data',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Seed all collections
   */
  private async seedAllCollections(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      console.log('🌱 Seeding Collections:');
      
      const seedResult = await seedDataService.seedAllCollections({
        clearExisting: false,
        batchSize: 5,
        validateData: true,
        generateIds: true,
        includeRelationships: true,
        maxConcurrent: 2
      });

      console.log(`   Collections: ${seedResult.totalCollections}`);
      console.log(`   Documents: ${seedResult.totalDocuments}`);
      console.log(`   Successful: ${seedResult.successfulCollections}`);
      console.log(`   Failed: ${seedResult.failedCollections}`);
      console.log(`   Duration: ${seedResult.duration}ms\n`);

      return {
        success: seedResult.success,
        operation: 'seed-all-collections',
        duration: Date.now() - startTime,
        data: seedResult
      };
    } catch (error) {
      return {
        success: false,
        operation: 'seed-all-collections',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query and display results
   */
  private async queryAndDisplayResults(): Promise<DemoResult[]> {
    const results: DemoResult[] = [];

    try {
      console.log('Querying Collections:');

      // Query offices
      const officesResult = await this.queryOffices();
      results.push(officesResult);

      // Query projects
      const projectsResult = await this.queryProjects();
      results.push(projectsResult);

      // Query regulations
      const regulationsResult = await this.queryRegulations();
      results.push(regulationsResult);

      // Query relationships
      const relationshipsResult = await this.queryRelationships();
      results.push(relationshipsResult);

      console.log('');

      return results;
    } catch (error) {
      results.push({
        success: false,
        operation: 'query-and-display-results',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return results;
    }
  }

  /**
   * Query offices
   */
  private async queryOffices(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const officesQuery = await queryOffices({
        status: 'active',
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 10
      });

      if (officesQuery.success && officesQuery.data) {
        console.log(`   Offices: ${officesQuery.data.length} found`);
        officesQuery.data.slice(0, 3).forEach(office => {
          console.log(`     - ${office.name} (${office.location.headquarters.city}, ${office.location.headquarters.country})`);
        });
        if (officesQuery.data.length > 3) {
          console.log(`     ... and ${officesQuery.data.length - 3} more`);
        }
      }

      return {
        success: officesQuery.success,
        operation: 'query-offices',
        duration: Date.now() - startTime,
        data: officesQuery.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'query-offices',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query projects
   */
  private async queryProjects(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const projectsQuery = await queryProjects({
        status: 'completed',
        orderBy: [{ field: 'projectName', direction: 'asc' }],
        limit: 10
      });

      if (projectsQuery.success && projectsQuery.data) {
        console.log(`   Projects: ${projectsQuery.data.length} found`);
        projectsQuery.data.slice(0, 3).forEach(project => {
          console.log(`     - ${project.projectName} (${project.location.city}, ${project.location.country})`);
        });
        if (projectsQuery.data.length > 3) {
          console.log(`     ... and ${projectsQuery.data.length - 3} more`);
        }
      }

      return {
        success: projectsQuery.success,
        operation: 'query-projects',
        duration: Date.now() - startTime,
        data: projectsQuery.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'query-projects',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query regulations
   */
  private async queryRegulations(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const regulationsQuery = await queryRegulations({
        mandatory: true,
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 10
      });

      if (regulationsQuery.success && regulationsQuery.data) {
        console.log(`   Regulations: ${regulationsQuery.data.length} found`);
        regulationsQuery.data.slice(0, 3).forEach(regulation => {
          console.log(`     - ${regulation.name} (${regulation.jurisdiction.country})`);
        });
        if (regulationsQuery.data.length > 3) {
          console.log(`     ... and ${regulationsQuery.data.length - 3} more`);
        }
      }

      return {
        success: regulationsQuery.success,
        operation: 'query-regulations',
        duration: Date.now() - startTime,
        data: regulationsQuery.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'query-regulations',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Query relationships
   */
  private async queryRelationships(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const relationshipsQuery = await queryRelationships({
        sentiment: 'positive',
        orderBy: [{ field: 'strength', direction: 'desc' }],
        limit: 10
      });

      if (relationshipsQuery.success && relationshipsQuery.data) {
        console.log(`   Relationships: ${relationshipsQuery.data.length} found`);
        relationshipsQuery.data.slice(0, 3).forEach(relationship => {
          console.log(`     - ${relationship.sourceEntity.type}:${relationship.sourceEntity.id} -> ${relationship.targetEntity.type}:${relationship.targetEntity.id} (${relationship.relationshipType})`);
        });
        if (relationshipsQuery.data.length > 3) {
          console.log(`     ... and ${relationshipsQuery.data.length - 3} more`);
        }
      }

      return {
        success: relationshipsQuery.success,
        operation: 'query-relationships',
        duration: Date.now() - startTime,
        data: relationshipsQuery.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'query-relationships',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // ADVANCED QUERY DEMONSTRATIONS
  // ============================================================================

  /**
   * Demonstrate advanced queries
   */
  private async demonstrateAdvancedQueries(): Promise<DemoResult[]> {
    const results: DemoResult[] = [];

    try {
      console.log('Advanced Query Demonstrations:');

      // Get offices by country
      const ukOfficesResult = await this.getOfficesByCountry('GB');
      results.push(ukOfficesResult);

      // Get large offices
      const largeOfficesResult = await this.getLargeOffices();
      results.push(largeOfficesResult);

      // Get active projects
      const activeProjectsResult = await this.getActiveProjects();
      results.push(activeProjectsResult);

      // Get regulations by country
      const ukRegulationsResult = await this.getRegulationsByCountry('GB');
      results.push(ukRegulationsResult);

      console.log('');

      return results;
    } catch (error) {
      results.push({
        success: false,
        operation: 'demonstrate-advanced-queries',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return results;
    }
  }

  /**
   * Get offices by country
   */
  private async getOfficesByCountry(country: string): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getOfficesByCountry(country, 5);
      const result = await queryOffices(query);

      if (result.success && result.data) {
        console.log(`   UK Offices: ${result.data.length} found`);
        result.data.forEach(office => {
          console.log(`     - ${office.name} (${office.location.headquarters.city})`);
        });
      }

      return {
        success: result.success,
        operation: 'get-offices-by-country',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-offices-by-country',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get large offices
   */
  private async getLargeOffices(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getLargeOffices(5);
      const result = await queryOffices(query);

      if (result.success && result.data) {
        console.log(`   Large Offices: ${result.data.length} found`);
        result.data.forEach(office => {
          console.log(`     - ${office.name} (${office.size.employeeCount} employees)`);
        });
      }

      return {
        success: result.success,
        operation: 'get-large-offices',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-large-offices',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get active projects
   */
  private async getActiveProjects(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getActiveProjects(5);
      const result = await queryProjects(query);

      if (result.success && result.data) {
        console.log(`   Active Projects: ${result.data.length} found`);
        result.data.forEach(project => {
          console.log(`     - ${project.projectName} (${project.status})`);
        });
      }

      return {
        success: result.success,
        operation: 'get-active-projects',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-active-projects',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get regulations by country
   */
  private async getRegulationsByCountry(country: string): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getRegulationsByCountry(country, 5);
      const result = await queryRegulations(query);

      if (result.success && result.data) {
        console.log(`   UK Regulations: ${result.data.length} found`);
        result.data.forEach(regulation => {
          console.log(`     - ${regulation.name} (${regulation.regulationType})`);
        });
      }

      return {
        success: result.success,
        operation: 'get-regulations-by-country',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-regulations-by-country',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // RELATIONSHIP ANALYSIS
  // ============================================================================

  /**
   * Analyze relationships
   */
  private async analyzeRelationships(): Promise<DemoResult[]> {
    const results: DemoResult[] = [];

    try {
      console.log('Relationship Analysis:');

      // Get relationships by entity
      const entityRelationshipsResult = await this.getRelationshipsByEntity('office', 'GBLO001');
      results.push(entityRelationshipsResult);

      // Get strong relationships
      const strongRelationshipsResult = await this.getStrongRelationships();
      results.push(strongRelationshipsResult);

      console.log('');

      return results;
    } catch (error) {
      results.push({
        success: false,
        operation: 'analyze-relationships',
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return results;
    }
  }

  /**
   * Get relationships by entity
   */
  private async getRelationshipsByEntity(entityType: string, entityId: string): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getRelationshipsByEntity(entityType, entityId, 5);
      const result = await queryRelationships(query);

      if (result.success && result.data) {
        console.log(`   Relationships for ${entityType}:${entityId}: ${result.data.length} found`);
        result.data.forEach(relationship => {
          console.log(`     - ${relationship.relationshipType} with ${relationship.targetEntity.type}:${relationship.targetEntity.id} (strength: ${relationship.strength})`);
        });
      }

      return {
        success: result.success,
        operation: 'get-relationships-by-entity',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-relationships-by-entity',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get strong relationships
   */
  private async getStrongRelationships(): Promise<DemoResult> {
    const startTime = Date.now();

    try {
      const query = getStrongRelationships(5);
      const result = await queryRelationships(query);

      if (result.success && result.data) {
        console.log(`   Strong Relationships: ${result.data.length} found`);
        result.data.forEach(relationship => {
          console.log(`     - ${relationship.sourceEntity.type}:${relationship.sourceEntity.id} -> ${relationship.targetEntity.type}:${relationship.targetEntity.id} (strength: ${relationship.strength})`);
        });
      }

      return {
        success: result.success,
        operation: 'get-strong-relationships',
        duration: Date.now() - startTime,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        operation: 'get-strong-relationships',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const seedDataDemo = SeedDataDemoService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function runSeedDataDemo(): Promise<DemoSummary> {
  return seedDataDemo.runCompleteDemo();
}

export async function showSeedDataStatistics(): Promise<DemoResult> {
  return seedDataDemo['showSeedDataStatistics']();
}

export async function validateSeedDataDemo(): Promise<DemoResult> {
  return seedDataDemo['validateSeedData']();
}

export async function seedAllCollectionsDemo(): Promise<DemoResult> {
  return seedDataDemo['seedAllCollections']();
}
