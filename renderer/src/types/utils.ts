// Type utilities and helpers for Firestore operations

import { 
  DocumentType, 
  CollectionName, 
  Office, 
  Project, 
  Regulation, 
  Relationship,
  ACTIVE_COLLECTIONS,
  DORMANT_COLLECTIONS,
  COLLECTION_CONFIGS
} from './firestore';
import { ValidationResult, validateOfficeId } from './validation';
import { FirestoreOperation, OperationResult } from './operations';

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isOffice(doc: DocumentType): doc is Office {
  return 'name' in doc && 'founded' in doc && 'status' in doc;
}

export function isProject(doc: DocumentType): doc is Project {
  return 'projectName' in doc && 'officeId' in doc && 'status' in doc;
}

export function isRegulation(doc: DocumentType): doc is Regulation {
  return 'regulationType' in doc && 'jurisdiction' in doc && 'effectiveDate' in doc;
}

export function isRelationship(doc: DocumentType): doc is Relationship {
  return 'sourceEntity' in doc && 'targetEntity' in doc && 'relationshipType' in doc;
}

export function isActiveCollection(collection: CollectionName): boolean {
  return ACTIVE_COLLECTIONS.includes(collection);
}

export function isDormantCollection(collection: CollectionName): boolean {
  return DORMANT_COLLECTIONS.includes(collection);
}

// ============================================================================
// DOCUMENT TYPE HELPERS
// ============================================================================

export function getDocumentType(collection: CollectionName): string {
  const config = COLLECTION_CONFIGS[collection];
  if (!config) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  
  return config.name;
}

export function getCollectionTier(collection: CollectionName): number {
  const config = COLLECTION_CONFIGS[collection];
  if (!config) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  
  return config.tier;
}

export function getCollectionCategory(collection: CollectionName): string | undefined {
  const config = COLLECTION_CONFIGS[collection];
  if (!config) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  
  return config.category;
}

export function getCollectionsByTier(tier: 1 | 2 | 3 | 4): CollectionName[] {
  return Object.entries(COLLECTION_CONFIGS)
    .filter(([_, config]) => config.tier === tier)
    .map(([name, _]) => name as CollectionName);
}

export function getCollectionsByCategory(category: 'enrichment' | 'external-forces' | 'market-intelligence'): CollectionName[] {
  return Object.entries(COLLECTION_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .map(([name, _]) => name as CollectionName);
}

// ============================================================================
// OFFICE ID UTILITIES
// ============================================================================

export interface OfficeIdParts {
  country: string;
  city: string;
  number: string;
  full: string;
}

export function parseOfficeId(officeId: string): OfficeIdParts {
  const validation = validateOfficeId(officeId);
  if (!validation.isValid) {
    throw new Error(`Invalid office ID format: ${validation.errors.join(', ')}`);
  }
  
  return {
    country: validation.country,
    city: validation.city,
    number: validation.number,
    full: officeId.toUpperCase()
  };
}

export function generateOfficeId(country: string, city: string): string {
  const countryCode = country.toUpperCase().substring(0, 2);
  const cityCode = city.toUpperCase().substring(0, 2);
  const randomNumber = Math.floor(Math.random() * 900) + 100; // 100-999
  
  return `${countryCode}${cityCode}${randomNumber}`;
}

export function extractCountryFromOfficeId(officeId: string): string {
  return parseOfficeId(officeId).country;
}

export function extractCityFromOfficeId(officeId: string): string {
  return parseOfficeId(officeId).city;
}

// ============================================================================
// DOCUMENT TRANSFORMATION UTILITIES
// ============================================================================

export function createDocumentId(collection: CollectionName, data: any): string {
  switch (collection) {
    case 'offices':
      if (data.country && data.city) {
        return generateOfficeId(data.country, data.city);
      }
      throw new Error('Office creation requires country and city for ID generation');
      
    case 'projects':
      // Generate project ID from name (slugified)
      return data.projectName
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
        
    case 'regulations':
      // Generate regulation ID from name and jurisdiction
      const name = data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'regulation';
      const country = data.jurisdiction?.country?.toLowerCase() || 'unknown';
      const year = data.effectiveDate?.toDate?.()?.getFullYear() || new Date().getFullYear();
      return `${country}-${name}-${year}`;
        
    case 'relationships':
      // Generate relationship ID from source and target entities
      const source = `${data.sourceEntity?.type}-${data.sourceEntity?.id}`;
      const target = `${data.targetEntity?.type}-${data.targetEntity?.id}`;
      const type = data.relationshipType?.toLowerCase() || 'relationship';
      return `${source}-${type}-${target}`;
        
    default:
      // For other collections, use a generic ID
      return `${collection}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export function addTimestamps<T extends Partial<DocumentType>>(doc: T): T & { createdAt: Date; updatedAt: Date } {
  const now = new Date();
  return {
    ...doc,
    createdAt: now,
    updatedAt: now
  };
}

export function updateTimestamp<T extends Partial<DocumentType>>(doc: T): T & { updatedAt: Date } {
  return {
    ...doc,
    updatedAt: new Date()
  };
}

// ============================================================================
// QUERY UTILITIES
// ============================================================================

export function buildQueryString(filters: any[]): string {
  return filters
    .map(filter => `${filter.field} ${filter.operator} ${JSON.stringify(filter.value)}`)
    .join(' AND ');
}

export function createFieldFilter(field: string, operator: string, value: any) {
  return { field, operator, value };
}

export function createArrayContainsFilter(field: string, value: any) {
  return createFieldFilter(field, 'array-contains', value);
}

export function createEqualityFilter(field: string, value: any) {
  return createFieldFilter(field, '==', value);
}

export function createInFilter(field: string, values: any[]) {
  return createFieldFilter(field, 'in', values);
}

export function createRangeFilter(field: string, min?: any, max?: any) {
  const filters = [];
  if (min !== undefined) {
    filters.push(createFieldFilter(field, '>=', min));
  }
  if (max !== undefined) {
    filters.push(createFieldFilter(field, '<=', max));
  }
  return filters;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateDocumentBeforeSave<T extends DocumentType>(
  doc: Partial<T>,
  collection: CollectionName
): ValidationResult {
  // Check if collection is active
  if (!isActiveCollection(collection)) {
    return {
      isValid: false,
      errors: [`Collection '${collection}' is dormant and not available for operations`],
      warnings: []
    };
  }
  
  // Basic validation
  if (!doc) {
    return {
      isValid: false,
      errors: ['Document data is required'],
      warnings: []
    };
  }
  
  // Collection-specific validation
  switch (collection) {
    case 'offices':
      if (doc.id && !validateOfficeId(doc.id).isValid) {
        return {
          isValid: false,
          errors: ['Invalid office ID format'],
          warnings: []
        };
      }
      break;
      
    case 'projects':
      if (doc.officeId && !validateOfficeId(doc.officeId).isValid) {
        return {
          isValid: false,
          errors: ['Invalid office ID in project'],
          warnings: []
        };
      }
      break;
  }
  
  return {
    isValid: true,
    errors: [],
    warnings: []
  };
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export interface FirestoreError extends Error {
  code: string;
  details?: any;
}

export function createFirestoreError(message: string, code: string, details?: any): FirestoreError {
  const error = new Error(message) as FirestoreError;
  error.code = code;
  error.details = details;
  return error;
}

export function isFirestoreError(error: any): error is FirestoreError {
  return error instanceof Error && 'code' in error;
}

export function handleFirestoreError(error: any): OperationResult {
  if (isFirestoreError(error)) {
    return {
      success: false,
      error: error.message,
      metadata: {
        operation: 'unknown',
        collection: 'unknown' as CollectionName,
        timestamp: new Date()
      }
    };
  }
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
    metadata: {
      operation: 'unknown',
      collection: 'unknown' as CollectionName,
      timestamp: new Date()
    }
  };
}

// ============================================================================
// COLLECTION STATISTICS
// ============================================================================

export interface CollectionStats {
  name: CollectionName;
  tier: number;
  category?: string;
  type: 'active' | 'dormant';
  estimatedDocuments?: number;
  estimatedSize?: string;
}

export function getCollectionStats(): CollectionStats[] {
  return Object.entries(COLLECTION_CONFIGS).map(([name, config]) => ({
    name: name as CollectionName,
    tier: config.tier,
    category: config.category,
    type: config.type,
    estimatedDocuments: config.type === 'active' ? 1000 : 0,
    estimatedSize: config.type === 'active' ? '~10MB' : '~1MB'
  }));
}

export function getActiveCollectionStats(): CollectionStats[] {
  return getCollectionStats().filter(stats => stats.type === 'active');
}

export function getDormantCollectionStats(): CollectionStats[] {
  return getCollectionStats().filter(stats => stats.type === 'dormant');
}

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

export function logOperation(operation: FirestoreOperation, result: OperationResult): void {
  const timestamp = new Date().toISOString();
  const status = result.success ? '✅' : '❌';
  
  console.log(`[${timestamp}] ${status} ${operation.type.toUpperCase()} ${operation.collection}`, {
    operation,
    result: {
      success: result.success,
      error: result.error,
      dataCount: Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0
    }
  });
}

export function createMockDocument<T extends DocumentType>(collection: CollectionName): Partial<T> {
  const baseDoc = {
    id: createDocumentId(collection, {}),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  switch (collection) {
    case 'offices':
      return {
        ...baseDoc,
        name: 'Mock Architecture Office',
        officialName: 'Mock Architecture Office Ltd.',
        founded: 2020,
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
          employeeCount: 50,
          sizeCategory: 'medium',
          annualRevenue: 5000000
        },
        specializations: ['commercial', 'residential'],
        notableWorks: ['Mock Project 1', 'Mock Project 2'],
        connectionCounts: {
          totalProjects: 10,
          activeProjects: 5,
          clients: 8,
          competitors: 3,
          suppliers: 12
        }
      } as Partial<T>;
      
    case 'projects':
      return {
        ...baseDoc,
        projectName: 'Mock Project',
        officeId: 'GBLO123',
        cityId: 'london-uk',
        clientId: 'client-123',
        status: 'planning',
        timeline: {
          startDate: new Date(),
          expectedCompletion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        location: {
          city: 'London',
          country: 'GB',
          address: '123 Mock Street'
        },
        financial: {
          budget: 1000000,
          currency: 'GBP'
        },
        details: {
          projectType: 'commercial',
          size: 5000,
          description: 'A mock commercial project'
        }
      } as Partial<T>;
      
    default:
      return baseDoc as Partial<T>;
  }
}
