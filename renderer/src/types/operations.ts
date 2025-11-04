// Firestore operations and query types

import { DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { 
  DocumentType, 
  CollectionName, 
  Office, 
  Project, 
  Regulation, 
  Relationship,
  ACTIVE_COLLECTIONS 
} from './firestore';
import { ValidationResult } from './validation';

// ============================================================================
// CRUD OPERATION TYPES
// ============================================================================

export interface CreateOperation<T extends DocumentType> {
  type: 'create';
  collection: CollectionName;
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  validation?: boolean;
}

export interface ReadOperation<T extends DocumentType> {
  type: 'read';
  collection: CollectionName;
  id: string;
}

export interface UpdateOperation<T extends DocumentType> {
  type: 'update';
  collection: CollectionName;
  id: string;
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
  validation?: boolean;
}

export interface DeleteOperation {
  type: 'delete';
  collection: CollectionName;
  id: string;
}

export interface QueryOperation<T extends DocumentType> {
  type: 'query';
  collection: CollectionName;
  filters?: QueryFilter[];
  orderBy?: QueryOrderBy[];
  limit?: number;
  offset?: number;
}

export type FirestoreOperation<T extends DocumentType = DocumentType> = 
  | CreateOperation<T>
  | ReadOperation<T>
  | UpdateOperation<T>
  | DeleteOperation
  | QueryOperation<T>;

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
  value: any;
}

export interface QueryOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: QueryOrderBy[];
  limit?: number;
  offset?: number;
  startAfter?: DocumentSnapshot<DocumentData>;
}

// ============================================================================
// OPERATION RESULTS
// ============================================================================

export interface OperationResult<T extends DocumentType = DocumentType> {
  success: boolean;
  data?: T | T[];
  error?: string;
  validation?: ValidationResult;
  metadata?: {
    operation: string;
    collection: CollectionName;
    timestamp: Date;
    duration?: number;
  };
}

export interface CreateResult<T extends DocumentType = DocumentType> extends OperationResult<T> {
  data: T;
  id: string;
}

export interface ReadResult<T extends DocumentType = DocumentType> extends OperationResult<T> {
  data: T;
  exists: boolean;
}

export interface UpdateResult<T extends DocumentType = DocumentType> extends OperationResult<T> {
  data: T;
  modified: boolean;
}

export interface DeleteResult extends OperationResult {
  deleted: boolean;
}

export interface QueryResult<T extends DocumentType = DocumentType> extends OperationResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export interface BatchOperation {
  id: string;
  operation: FirestoreOperation;
  dependencies?: string[]; // IDs of operations that must complete first
}

export interface BatchResult {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
  errors: string[];
  duration: number;
}

// ============================================================================
// RELATIONSHIP OPERATIONS
// ============================================================================

export interface CreateRelationshipOperation {
  type: 'create-relationship';
  sourceEntity: {
    type: string;
    id: string;
  };
  targetEntity: {
    type: string;
    id: string;
  };
  relationshipType: string;
}

export interface LinkEntitiesOperation {
  type: 'link-entities';
  sourceId: string;
  targetId: string;
  relationshipType: string;
  bidirectional?: boolean;
  strength?: number;
}

// ============================================================================
// OFFICE ID OPERATIONS
// ============================================================================

export interface GenerateOfficeIdOperation {
  type: 'generate-office-id';
  country: string;
  city: string;
  retries?: number;
}

export interface ValidateOfficeIdOperation {
  type: 'validate-office-id';
  officeId: string;
}

export interface CheckOfficeIdCollisionOperation {
  type: 'check-office-id-collision';
  officeId: string;
}

// ============================================================================
// SEARCH OPERATIONS
// ============================================================================

export interface SearchOperation {
  type: 'search';
  collection: CollectionName;
  query: string;
  fields?: string[];
  filters?: QueryFilter[];
  limit?: number;
}

export interface FullTextSearchOperation {
  type: 'full-text-search';
  collection: CollectionName;
  query: string;
  language?: string;
  limit?: number;
}

// ============================================================================
// AGGREGATION OPERATIONS
// ============================================================================

export interface CountOperation {
  type: 'count';
  collection: CollectionName;
  filters?: QueryFilter[];
}

export interface AggregateOperation {
  type: 'aggregate';
  collection: CollectionName;
  field: string;
  operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  filters?: QueryFilter[];
  groupBy?: string[];
}

// ============================================================================
// SPECIALIZED OPERATIONS FOR ACTIVE COLLECTIONS
// ============================================================================

// Office Operations
export interface CreateOfficeOperation extends CreateOperation<Office> {
  collection: 'offices';
  generateId?: boolean;
  country?: string;
  city?: string;
}

export interface SearchOfficesOperation extends QueryOperation<Office> {
  collection: 'offices';
  filters?: Array<QueryFilter | {
    field: 'name' | 'specializations' | 'status' | 'sizeCategory';
    operator: '==' | 'in' | 'array-contains';
    value: any;
  }>;
}

export interface GetOfficeByIdOperation extends ReadOperation<Office> {
  collection: 'offices';
}

export interface UpdateOfficeOperation extends UpdateOperation<Office> {
  collection: 'offices';
}

export interface DeleteOfficeOperation extends DeleteOperation {
  collection: 'offices';
}

// Project Operations
export interface CreateProjectOperation extends CreateOperation<Project> {
  collection: 'projects';
  officeId: string;
}

export interface SearchProjectsOperation extends QueryOperation<Project> {
  collection: 'projects';
  filters?: Array<QueryFilter | {
    field: 'officeId' | 'cityId' | 'status' | 'projectType';
    operator: '==' | 'in' | 'array-contains';
    value: any;
  }>;
}

export interface GetProjectsByOfficeOperation extends QueryOperation<Project> {
  collection: 'projects';
  officeId: string;
}

export interface GetProjectByIdOperation extends ReadOperation<Project> {
  collection: 'projects';
}

export interface UpdateProjectOperation extends UpdateOperation<Project> {
  collection: 'projects';
}

export interface DeleteProjectOperation extends DeleteOperation {
  collection: 'projects';
}

// Regulation Operations
export interface CreateRegulationOperation extends CreateOperation<Regulation> {
  collection: 'regulations';
}

export interface SearchRegulationsOperation extends QueryOperation<Regulation> {
  collection: 'regulations';
  filters?: Array<QueryFilter | {
    field: 'regulationType' | 'jurisdiction.level' | 'jurisdiction.country' | 'jurisdiction.cityId';
    operator: '==' | 'in' | 'array-contains';
    value: any;
  }>;
}

export interface GetRegulationsByJurisdictionOperation extends QueryOperation<Regulation> {
  collection: 'regulations';
  jurisdiction: {
    level: string;
    country?: string;
    cityId?: string;
  };
}

export interface GetRegulationByIdOperation extends ReadOperation<Regulation> {
  collection: 'regulations';
}

export interface UpdateRegulationOperation extends UpdateOperation<Regulation> {
  collection: 'regulations';
}

export interface DeleteRegulationOperation extends DeleteOperation {
  collection: 'regulations';
}

// Relationship Operations
export interface CreateRelationshipOperation extends CreateOperation<Relationship> {
  collection: 'relationships';
}

export interface SearchRelationshipsOperation extends QueryOperation<Relationship> {
  collection: 'relationships';
  filters?: Array<QueryFilter | {
    field: 'sourceEntity.type' | 'targetEntity.type' | 'relationshipType' | 'strength';
    operator: '==' | 'in' | '>=' | '<=';
    value: any;
  }>;
}

export interface GetRelationshipsByEntityOperation extends QueryOperation<Relationship> {
  collection: 'relationships';
  entityId: string;
  entityType?: string;
}

export interface GetRelationshipByIdOperation extends ReadOperation<Relationship> {
  collection: 'relationships';
}

export interface UpdateRelationshipOperation extends UpdateOperation<Relationship> {
  collection: 'relationships';
}

export interface DeleteRelationshipOperation extends DeleteOperation {
  collection: 'relationships';
}

// ============================================================================
// OPERATION FACTORY FUNCTIONS
// ============================================================================

export function createOfficeOperation(data: Omit<Office, 'id' | 'createdAt' | 'updatedAt'>): CreateOfficeOperation {
  return {
    type: 'create',
    collection: 'offices',
    data,
    generateId: true
  };
}

export function createProjectOperation(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, officeId: string): CreateProjectOperation {
  return {
    type: 'create',
    collection: 'projects',
    data,
    officeId
  };
}

export function createRegulationOperation(data: Omit<Regulation, 'id' | 'createdAt' | 'updatedAt'>): CreateRegulationOperation {
  return {
    type: 'create',
    collection: 'regulations',
    data
  };
}

export function createRelationshipOperation(data: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>): CreateRelationshipOperation {
  return {
    type: 'create',
    collection: 'relationships',
    data
  };
}

export function searchOfficesOperation(filters?: QueryFilter[]): SearchOfficesOperation {
  return {
    type: 'query',
    collection: 'offices',
    filters
  };
}

export function searchProjectsOperation(filters?: QueryFilter[]): SearchProjectsOperation {
  return {
    type: 'query',
    collection: 'projects',
    filters
  };
}

export function searchRegulationsOperation(filters?: QueryFilter[]): SearchRegulationsOperation {
  return {
    type: 'query',
    collection: 'regulations',
    filters
  };
}

export function searchRelationshipsOperation(filters?: QueryFilter[]): SearchRelationshipsOperation {
  return {
    type: 'query',
    collection: 'relationships',
    filters
  };
}

// ============================================================================
// OPERATION VALIDATION
// ============================================================================

export function validateOperation(operation: FirestoreOperation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if collection is active
  if (!ACTIVE_COLLECTIONS.includes(operation.collection)) {
    warnings.push(`Collection '${operation.collection}' is dormant and may not have full functionality`);
  }
  
  // Validate operation-specific requirements
  switch (operation.type) {
    case 'create':
      if (!operation.data) {
        errors.push('Create operation requires data');
      }
      break;
      
    case 'read':
    case 'delete':
      if (!operation.id) {
        errors.push(`${operation.type} operation requires id`);
      }
      break;
      
    case 'update':
      if (!operation.id) {
        errors.push('Update operation requires id');
      }
      if (!operation.data) {
        errors.push('Update operation requires data');
      }
      break;
      
    case 'query':
      // Query operations are always valid
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// OPERATION METADATA
// ============================================================================

export interface OperationMetadata {
  operation: string;
  collection: CollectionName;
  timestamp: Date;
  duration?: number;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export function createOperationMetadata(
  operation: FirestoreOperation,
  additionalData?: Partial<OperationMetadata>
): OperationMetadata {
  return {
    operation: operation.type,
    collection: operation.collection,
    timestamp: new Date(),
    ...additionalData
  };
}
