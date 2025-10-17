// Data Service - High-level service combining operations, templates, and queries

import { 
  CollectionName, 
  DocumentType,
  Office,
  Project,
  Regulation,
  Relationship,
  ACTIVE_COLLECTIONS
} from '../../types/firestore';
import { 
  CreateDocument, 
  UpdateDocument, 
  QueryOptions, 
  DocumentOperationResult, 
  DocumentsOperationResult
} from '../../types/operations';
import { firestoreOperations } from './firestoreOperations';
import { documentTemplateService } from './documentTemplates';
import { queryBuilder } from './queryBuilders';
import { 
  OfficeQueryOptions,
  ProjectQueryOptions,
  RegulationQueryOptions,
  RelationshipQueryOptions
} from './queryBuilders';
import { 
  FirestoreOperationOptions,
  BatchOperationResult,
  TransactionOperationResult
} from './firestoreOperations';

// ============================================================================
// DATA SERVICE TYPES
// ============================================================================

export interface DataServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    operation: string;
    collection: CollectionName;
    timestamp: Date;
    duration?: number;
  };
}

export interface DataServiceOptions extends FirestoreOperationOptions {
  useTemplate?: boolean;
  validateInput?: boolean;
  includeMetadata?: boolean;
}

export interface OfficeServiceOptions extends DataServiceOptions {
  generateId?: boolean;
  country?: string;
  city?: string;
}

export interface ProjectServiceOptions extends DataServiceOptions {
  linkToOffice?: boolean;
  officeId?: string;
}

export interface RegulationServiceOptions extends DataServiceOptions {
  jurisdiction?: any;
}

export interface RelationshipServiceOptions extends DataServiceOptions {
  sourceEntity?: { type: string; id: string };
  targetEntity?: { type: string; id: string };
  relationshipType?: string;
}

// ============================================================================
// DATA SERVICE CLASS
// ============================================================================

export class DataService {
  private static instance: DataService;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // ============================================================================
  // GENERIC DATA OPERATIONS
  // ============================================================================

  /**
   * Create a document with optional template
   */
  public async createDocument<K extends CollectionName>(
    collectionName: K,
    data: CreateDocument<DocumentType>,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<DocumentType>> {
    const startTime = Date.now();
    const { useTemplate = false, validateInput = true, includeMetadata = true } = options;

    try {
      let documentData = data;

      // Use template if requested
      if (useTemplate) {
        const templateResult = await documentTemplateService.getTemplate(collectionName, {
          includeOptional: true,
          includeDefaults: true,
          validate: validateInput
        });

        if (!templateResult.success) {
          return {
            success: false,
            error: `Template generation failed: ${templateResult.error}`,
            metadata: includeMetadata ? {
              operation: 'create-document',
              collection: collectionName,
              timestamp: new Date(),
              duration: Date.now() - startTime
            } : undefined
          };
        }

        // Merge template with provided data
        documentData = { ...templateResult.template, ...data };
      }

      // Create document
      const result = await firestoreOperations.create(collectionName, documentData, options);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'create-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'create-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Get a document by ID
   */
  public async getDocument<K extends CollectionName>(
    collectionName: K,
    id: string,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<DocumentType>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.get(collectionName, id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'get-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'get-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Update a document
   */
  public async updateDocument<K extends CollectionName>(
    collectionName: K,
    id: string,
    data: UpdateDocument<DocumentType>,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<DocumentType>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.update(collectionName, id, data, options);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'update-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'update-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Delete a document
   */
  public async deleteDocument<K extends CollectionName>(
    collectionName: K,
    id: string,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<void>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.delete(collectionName, id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'delete-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'delete-document',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Query documents
   */
  public async queryDocuments<K extends CollectionName>(
    collectionName: K,
    options: QueryOptions = {},
    serviceOptions: DataServiceOptions = {}
  ): Promise<DataServiceResult<DocumentType[]>> {
    const startTime = Date.now();
    const { includeMetadata = true } = serviceOptions;

    try {
      const result = await firestoreOperations.query(collectionName, options);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'query-documents',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'query-documents',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  // ============================================================================
  // OFFICE SERVICE METHODS
  // ============================================================================

  /**
   * Create an office with generated ID
   */
  public async createOffice(
    data: CreateDocument<Office>,
    options: OfficeServiceOptions = {}
  ): Promise<DataServiceResult<Office>> {
    const startTime = Date.now();
    const { generateId = true, country, city, includeMetadata = true } = options;

    try {
      let officeData = data;

      // Generate office ID if requested
      if (generateId && (country || city)) {
        const templateResult = await documentTemplateService.getOfficeTemplate(
          country || 'GB',
          city || 'London',
          { includeOptional: true, validate: true }
        );

        if (!templateResult.success) {
          return {
            success: false,
            error: `Office template generation failed: ${templateResult.error}`,
            metadata: includeMetadata ? {
              operation: 'create-office',
              collection: 'offices',
              timestamp: new Date(),
              duration: Date.now() - startTime
            } : undefined
          };
        }

        // Merge template with provided data
        officeData = { ...templateResult.template, ...data };
      }

      const result = await firestoreOperations.createOffice(officeData);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'create-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'create-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Get office by ID
   */
  public async getOffice(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<Office>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.getOffice(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'get-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'get-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Update office
   */
  public async updateOffice(
    id: string,
    data: UpdateDocument<Office>,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<Office>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.updateOffice(id, data);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'update-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'update-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Delete office
   */
  public async deleteOffice(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<void>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.deleteOffice(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'delete-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'delete-office',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Query offices with specialized options
   */
  public async queryOffices(
    queryOptions: OfficeQueryOptions = {},
    serviceOptions: DataServiceOptions = {}
  ): Promise<DataServiceResult<Office[]>> {
    const startTime = Date.now();
    const { includeMetadata = true } = serviceOptions;

    try {
      const query = queryBuilder.buildOfficeQuery(queryOptions);
      const result = await firestoreOperations.queryOffices(query);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'query-offices',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'query-offices',
          collection: 'offices',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  // ============================================================================
  // PROJECT SERVICE METHODS
  // ============================================================================

  /**
   * Create a project with office relationship
   */
  public async createProject(
    data: CreateDocument<Project>,
    options: ProjectServiceOptions = {}
  ): Promise<DataServiceResult<Project>> {
    const startTime = Date.now();
    const { linkToOffice = true, officeId, includeMetadata = true } = options;

    try {
      let projectData = data;

      // Link to office if requested
      if (linkToOffice && officeId) {
        const templateResult = await documentTemplateService.getProjectTemplate(
          officeId,
          data.projectName || 'Untitled Project',
          { includeOptional: true, validate: true }
        );

        if (!templateResult.success) {
          return {
            success: false,
            error: `Project template generation failed: ${templateResult.error}`,
            metadata: includeMetadata ? {
              operation: 'create-project',
              collection: 'projects',
              timestamp: new Date(),
              duration: Date.now() - startTime
            } : undefined
          };
        }

        // Merge template with provided data
        projectData = { ...templateResult.template, ...data };
      }

      const result = await firestoreOperations.createProject(projectData);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'create-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'create-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Get project by ID
   */
  public async getProject(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<Project>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.getProject(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'get-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'get-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Update project
   */
  public async updateProject(
    id: string,
    data: UpdateDocument<Project>,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<Project>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.updateProject(id, data);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'update-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'update-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Delete project
   */
  public async deleteProject(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<void>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.deleteProject(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'delete-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'delete-project',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Query projects with specialized options
   */
  public async queryProjects(
    queryOptions: ProjectQueryOptions = {},
    serviceOptions: DataServiceOptions = {}
  ): Promise<DataServiceResult<Project[]>> {
    const startTime = Date.now();
    const { includeMetadata = true } = serviceOptions;

    try {
      const query = queryBuilder.buildProjectQuery(queryOptions);
      const result = await firestoreOperations.queryProjects(query);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'query-projects',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'query-projects',
          collection: 'projects',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  // ============================================================================
  // REGULATION SERVICE METHODS
  // ============================================================================

  /**
   * Create a regulation with jurisdiction
   */
  public async createRegulation(
    data: CreateDocument<Regulation>,
    options: RegulationServiceOptions = {}
  ): Promise<DataServiceResult<Regulation>> {
    const startTime = Date.now();
    const { jurisdiction, includeMetadata = true } = options;

    try {
      let regulationData = data;

      // Add jurisdiction if provided
      if (jurisdiction) {
        const templateResult = await documentTemplateService.getRegulationTemplate(
          data.name || 'Untitled Regulation',
          data.regulationType || 'building-code',
          jurisdiction,
          { includeOptional: true, validate: true }
        );

        if (!templateResult.success) {
          return {
            success: false,
            error: `Regulation template generation failed: ${templateResult.error}`,
            metadata: includeMetadata ? {
              operation: 'create-regulation',
              collection: 'regulations',
              timestamp: new Date(),
              duration: Date.now() - startTime
            } : undefined
          };
        }

        // Merge template with provided data
        regulationData = { ...templateResult.template, ...data };
      }

      const result = await firestoreOperations.createRegulation(regulationData);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'create-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'create-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Get regulation by ID
   */
  public async getRegulation(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<Regulation>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.getRegulation(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'get-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'get-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Update regulation
   */
  public async updateRegulation(
    id: string,
    data: UpdateDocument<Regulation>,
    options: DataServiceOptions = {}
  ): Promise<DataServiceResult<Regulation>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.updateRegulation(id, data);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'update-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'update-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Delete regulation
   */
  public async deleteRegulation(id: string, options: DataServiceOptions = {}): Promise<DataServiceResult<void>> {
    const startTime = Date.now();
    const { includeMetadata = true } = options;

    try {
      const result = await firestoreOperations.deleteRegulation(id);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'delete-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'delete-regulation',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Query regulations with specialized options
   */
  public async queryRegulations(
    queryOptions: RegulationQueryOptions = {},
    serviceOptions: DataServiceOptions = {}
  ): Promise<DataServiceResult<Regulation[]>> {
    const startTime = Date.now();
    const { includeMetadata = true } = serviceOptions;

    try {
      const query = queryBuilder.buildRegulationQuery(queryOptions);
      const result = await firestoreOperations.queryRegulations(query);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'query-regulations',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'query-regulations',
          collection: 'regulations',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  // ============================================================================
  // RELATIONSHIP SERVICE METHODS
  // ============================================================================

  /**
   * Create a relationship between entities
   */
  public async createRelationship(
    data: CreateDocument<Relationship>,
    options: RelationshipServiceOptions = {}
  ): Promise<DataServiceResult<Relationship>> {
    const startTime = Date.now();
    const { sourceEntity, targetEntity, relationshipType, includeMetadata = true } = options;

    try {
      let relationshipData = data;

      // Add entity relationships if provided
      if (sourceEntity && targetEntity && relationshipType) {
        const templateResult = await documentTemplateService.getRelationshipTemplate(
          sourceEntity,
          targetEntity,
          relationshipType,
          { includeOptional: true, validate: true }
        );

        if (!templateResult.success) {
          return {
            success: false,
            error: `Relationship template generation failed: ${templateResult.error}`,
            metadata: includeMetadata ? {
              operation: 'create-relationship',
              collection: 'relationships',
              timestamp: new Date(),
              duration: Date.now() - startTime
            } : undefined
          };
        }

        // Merge template with provided data
        relationshipData = { ...templateResult.template, ...data };
      }

      const result = await firestoreOperations.create('relationships', relationshipData);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'create-relationship',
          collection: 'relationships',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'create-relationship',
          collection: 'relationships',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  /**
   * Query relationships with specialized options
   */
  public async queryRelationships(
    queryOptions: RelationshipQueryOptions = {},
    serviceOptions: DataServiceOptions = {}
  ): Promise<DataServiceResult<Relationship[]>> {
    const startTime = Date.now();
    const { includeMetadata = true } = serviceOptions;

    try {
      const query = queryBuilder.buildRelationshipQuery(queryOptions);
      const result = await firestoreOperations.query('relationships', query);

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        message: result.message,
        metadata: includeMetadata ? {
          operation: 'query-relationships',
          collection: 'relationships',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: includeMetadata ? {
          operation: 'query-relationships',
          collection: 'relationships',
          timestamp: new Date(),
          duration: Date.now() - startTime
        } : undefined
      };
    }
  }

  // ============================================================================
  // BATCH AND TRANSACTION OPERATIONS
  // ============================================================================

  /**
   * Execute batch operations
   */
  public async executeBatch(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: CollectionName;
      id?: string;
      data?: any;
    }>
  ): Promise<BatchOperationResult> {
    return firestoreOperations.executeBatch(operations);
  }

  /**
   * Execute transaction operations
   */
  public async executeTransaction<T>(
    transactionFunction: (transaction: any) => Promise<T>
  ): Promise<TransactionOperationResult<T>> {
    return firestoreOperations.executeTransaction(transactionFunction);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get collection statistics
   */
  public async getCollectionStats(collectionName: CollectionName): Promise<DataServiceResult<{
    totalDocuments: number;
    activeDocuments: number;
    lastUpdated: Date;
  }>> {
    const startTime = Date.now();

    try {
      // Get total count
      const totalResult = await firestoreOperations.query(collectionName, { limit: 1 });
      if (!totalResult.success) {
        return {
          success: false,
          error: `Failed to get collection stats: ${totalResult.error}`
        };
      }

      // Get active count (if applicable)
      let activeCount = 0;
      if (collectionName === 'offices') {
        const activeResult = await firestoreOperations.query(collectionName, {
          filters: [where('status', '==', 'active')],
          limit: 1
        });
        if (activeResult.success) {
          activeCount = activeResult.count || 0;
        }
      }

      return {
        success: true,
        data: {
          totalDocuments: totalResult.count || 0,
          activeDocuments: activeCount,
          lastUpdated: new Date()
        },
        message: `Collection stats retrieved for ${collectionName}`,
        metadata: {
          operation: 'get-collection-stats',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operation: 'get-collection-stats',
          collection: collectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get all collection statistics
   */
  public async getAllCollectionStats(): Promise<DataServiceResult<Record<CollectionName, {
    totalDocuments: number;
    activeDocuments: number;
    lastUpdated: Date;
  }>>> {
    const startTime = Date.now();

    try {
      const stats: Record<CollectionName, any> = {} as any;

      // Get stats for all active collections
      for (const collectionName of ACTIVE_COLLECTIONS) {
        const result = await this.getCollectionStats(collectionName);
        if (result.success && result.data) {
          stats[collectionName] = result.data;
        }
      }

      return {
        success: true,
        data: stats,
        message: 'All collection stats retrieved',
        metadata: {
          operation: 'get-all-collection-stats',
          collection: 'all' as CollectionName,
          timestamp: new Date(),
          duration: Date.now() - startTime
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operation: 'get-all-collection-stats',
          collection: 'all' as CollectionName,
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

export const dataService = DataService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function createDocument<K extends CollectionName>(
  collectionName: K,
  data: CreateDocument<DocumentType>,
  options?: DataServiceOptions
): Promise<DataServiceResult<DocumentType>> {
  return dataService.createDocument(collectionName, data, options);
}

export async function getDocument<K extends CollectionName>(
  collectionName: K,
  id: string,
  options?: DataServiceOptions
): Promise<DataServiceResult<DocumentType>> {
  return dataService.getDocument(collectionName, id, options);
}

export async function updateDocument<K extends CollectionName>(
  collectionName: K,
  id: string,
  data: UpdateDocument<DocumentType>,
  options?: DataServiceOptions
): Promise<DataServiceResult<DocumentType>> {
  return dataService.updateDocument(collectionName, id, data, options);
}

export async function deleteDocument<K extends CollectionName>(
  collectionName: K,
  id: string,
  options?: DataServiceOptions
): Promise<DataServiceResult<void>> {
  return dataService.deleteDocument(collectionName, id, options);
}

export async function queryDocuments<K extends CollectionName>(
  collectionName: K,
  options?: QueryOptions,
  serviceOptions?: DataServiceOptions
): Promise<DataServiceResult<DocumentType[]>> {
  return dataService.queryDocuments(collectionName, options, serviceOptions);
}

// Office convenience functions
export async function createOffice(
  data: CreateDocument<Office>,
  options?: OfficeServiceOptions
): Promise<DataServiceResult<Office>> {
  return dataService.createOffice(data, options);
}

export async function getOffice(id: string, options?: DataServiceOptions): Promise<DataServiceResult<Office>> {
  return dataService.getOffice(id, options);
}

export async function updateOffice(
  id: string,
  data: UpdateDocument<Office>,
  options?: DataServiceOptions
): Promise<DataServiceResult<Office>> {
  return dataService.updateOffice(id, data, options);
}

export async function deleteOffice(id: string, options?: DataServiceOptions): Promise<DataServiceResult<void>> {
  return dataService.deleteOffice(id, options);
}

export async function queryOffices(
  queryOptions?: OfficeQueryOptions,
  serviceOptions?: DataServiceOptions
): Promise<DataServiceResult<Office[]>> {
  return dataService.queryOffices(queryOptions, serviceOptions);
}

// Project convenience functions
export async function createProject(
  data: CreateDocument<Project>,
  options?: ProjectServiceOptions
): Promise<DataServiceResult<Project>> {
  return dataService.createProject(data, options);
}

export async function getProject(id: string, options?: DataServiceOptions): Promise<DataServiceResult<Project>> {
  return dataService.getProject(id, options);
}

export async function updateProject(
  id: string,
  data: UpdateDocument<Project>,
  options?: DataServiceOptions
): Promise<DataServiceResult<Project>> {
  return dataService.updateProject(id, data, options);
}

export async function deleteProject(id: string, options?: DataServiceOptions): Promise<DataServiceResult<void>> {
  return dataService.deleteProject(id, options);
}

export async function queryProjects(
  queryOptions?: ProjectQueryOptions,
  serviceOptions?: DataServiceOptions
): Promise<DataServiceResult<Project[]>> {
  return dataService.queryProjects(queryOptions, serviceOptions);
}

// Regulation convenience functions
export async function createRegulation(
  data: CreateDocument<Regulation>,
  options?: RegulationServiceOptions
): Promise<DataServiceResult<Regulation>> {
  return dataService.createRegulation(data, options);
}

export async function getRegulation(id: string, options?: DataServiceOptions): Promise<DataServiceResult<Regulation>> {
  return dataService.getRegulation(id, options);
}

export async function updateRegulation(
  id: string,
  data: UpdateDocument<Regulation>,
  options?: DataServiceOptions
): Promise<DataServiceResult<Regulation>> {
  return dataService.updateRegulation(id, data, options);
}

export async function deleteRegulation(id: string, options?: DataServiceOptions): Promise<DataServiceResult<void>> {
  return dataService.deleteRegulation(id, options);
}

export async function queryRegulations(
  queryOptions?: RegulationQueryOptions,
  serviceOptions?: DataServiceOptions
): Promise<DataServiceResult<Regulation[]>> {
  return dataService.queryRegulations(queryOptions, serviceOptions);
}

// Relationship convenience functions
export async function createRelationship(
  data: CreateDocument<Relationship>,
  options?: RelationshipServiceOptions
): Promise<DataServiceResult<Relationship>> {
  return dataService.createRelationship(data, options);
}

export async function queryRelationships(
  queryOptions?: RelationshipQueryOptions,
  serviceOptions?: DataServiceOptions
): Promise<DataServiceResult<Relationship[]>> {
  return dataService.queryRelationships(queryOptions, serviceOptions);
}

// Utility functions
export async function getCollectionStats(collectionName: CollectionName): Promise<DataServiceResult<{
  totalDocuments: number;
  activeDocuments: number;
  lastUpdated: Date;
}>> {
  return dataService.getCollectionStats(collectionName);
}

export async function getAllCollectionStats(): Promise<DataServiceResult<Record<CollectionName, {
  totalDocuments: number;
  activeDocuments: number;
  lastUpdated: Date;
}>>> {
  return dataService.getAllCollectionStats();
}
