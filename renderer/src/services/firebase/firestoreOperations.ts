// Firestore Operations Service - Complete CRUD operations for all collections

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  writeBatch, 
  runTransaction,
  onSnapshot,
  Unsubscribe,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryConstraint,
  Transaction
} from 'firebase/firestore';
import { getFirestoreInstance } from './config';
import { 
  CollectionName, 
  DocumentType,
  ACTIVE_COLLECTIONS,
  Office,
  Project,
  Regulation
} from '../../types/firestore';
import {
  QueryOptions, 
  QueryFilter,
  CreateResult,
  ReadResult,
  UpdateResult,
  DeleteResult,
  QueryResult
} from '../../types/operations';

// Define the missing types
export type CreateDocument<T extends DocumentType> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDocument<T extends DocumentType> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export interface DocumentOperationResult<T = DocumentType> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DocumentsOperationResult<T = DocumentType> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: string;
  message?: string;
}

// Define the missing interface
export interface FirestoreService {
  isFirebaseAvailable(): boolean;
  createDocument<T extends DocumentType>(collection: string, data: CreateDocument<T>): Promise<CreateResult<T>>;
  readDocument<T extends DocumentType>(collection: string, id: string): Promise<ReadResult<T>>;
  updateDocument<T extends DocumentType>(collection: string, id: string, data: UpdateDocument<T>): Promise<UpdateResult<T>>;
  deleteDocument(collection: string, id: string): Promise<DeleteResult>;
  queryDocuments<T extends DocumentType>(collection: string, options?: QueryOptions): Promise<QueryResult<T>>;
}
import { validateOffice, validateProject, validateRegulation } from '../../types/validation';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// OPERATION TYPES
// ============================================================================

export interface FirestoreOperationOptions {
  validate?: boolean;
  includeTimestamps?: boolean;
  batchSize?: number;
  timeout?: number;
  retries?: number;
}

export interface BatchOperationResult {
  success: boolean;
  operations: number;
  successful: number;
  failed: number;
  errors: string[];
  duration: number;
}

export interface TransactionOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  operations: number;
  duration: number;
}

export interface RealTimeSubscriptionOptions {
  includeMetadataChanges?: boolean;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

// ============================================================================
// FIRESTORE OPERATIONS SERVICE
// ============================================================================

export class FirestoreOperationsService implements FirestoreService {
  private static instance: FirestoreOperationsService;
  private db: any;
  private activeSubscriptions: Map<string, Unsubscribe> = new Map();

  private constructor() {
    try {
      this.db = getFirestoreInstance();
    } catch (error) {
      console.warn('Firebase not initialized, FirestoreOperationsService will use mock data');
      this.db = null;
    }
  }

  public static getInstance(): FirestoreOperationsService {
    if (!FirestoreOperationsService.instance) {
      FirestoreOperationsService.instance = new FirestoreOperationsService();
    }
    return FirestoreOperationsService.instance;
  }

  public isFirebaseAvailable(): boolean {
    // If db is null, try to reinitialize
    if (this.db === null) {
      try {
        console.log('FirestoreOperationsService: Attempting to reinitialize Firebase...');
        this.db = getFirestoreInstance();
        console.log('FirestoreOperationsService: Firebase reinitialized successfully');
      } catch (error) {
        console.log('FirestoreOperationsService: Firebase reinitialization failed:', error);
        this.db = null;
      }
    }
    return this.db !== null;
  }

  // ============================================================================
  // FIRESTORE SERVICE INTERFACE IMPLEMENTATION
  // ============================================================================

  public async createDocument<T extends DocumentType>(collection: string, data: CreateDocument<T>): Promise<CreateResult<T>> {
    const result = await this.create(collection as CollectionName, data);
    return {
      success: result.success,
      data: result.data as T,
      id: result.data?.id || '',
      error: result.error,
      metadata: {
        operation: 'create',
        collection: collection as CollectionName,
        timestamp: new Date()
      }
    };
  }

  public async readDocument<T extends DocumentType>(collection: string, id: string): Promise<ReadResult<T>> {
    const result = await this.get(collection as CollectionName, id);
    return {
      success: result.success,
      data: result.data as T,
      exists: result.success,
      error: result.error,
      metadata: {
        operation: 'read',
        collection: collection as CollectionName,
        timestamp: new Date()
      }
    };
  }

  public async updateDocument<T extends DocumentType>(collection: string, id: string, data: UpdateDocument<T>): Promise<UpdateResult<T>> {
    const result = await this.update(collection as CollectionName, id, data);
    return {
      success: result.success,
      data: result.data as T,
      modified: result.success,
      error: result.error,
      metadata: {
        operation: 'update',
        collection: collection as CollectionName,
        timestamp: new Date()
      }
    };
  }

  public async deleteDocument(collection: string, id: string): Promise<DeleteResult> {
    const result = await this.delete(collection as CollectionName, id);
    return {
      success: result.success,
      deleted: result.success,
      error: result.error,
      metadata: {
        operation: 'delete',
        collection: collection as CollectionName,
        timestamp: new Date()
      }
    };
  }

  public async queryDocuments<T extends DocumentType>(collection: string, options?: QueryOptions): Promise<QueryResult<T>> {
    const result = await this.query(collection as CollectionName, options);
    return {
      success: result.success,
      data: result.data as T[],
      count: result.count || 0,
      hasMore: false, // This would need pagination logic
      error: result.error,
      metadata: {
        operation: 'query',
        collection: collection as CollectionName,
        timestamp: new Date()
      }
    };
  }

  // ============================================================================
  // GENERIC CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new document in any collection
   */
  public async create<K extends CollectionName>(
    collectionName: K,
    data: CreateDocument<DocumentType>,
    options: FirestoreOperationOptions = {}
  ): Promise<DocumentOperationResult<DocumentType>> {
    const { validate = false, includeTimestamps = true } = options;

    try {
      // Validate collection access
      if (!this.canAccessCollection(collectionName)) {
        return {
          success: false,
          error: `Collection '${collectionName}' is dormant and not available for operations`
        };
      }

      // Validate data if requested
      console.log('Validation check:', { validate, collectionName });
      if (validate) {
        console.log('Running validation...');
        const validation = this.validateDocument(collectionName, data);
        if (!validation.isValid) {
          console.log('Validation failed:', validation.errors);
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }
        console.log('Validation passed');
      } else {
        console.log('Validation skipped');
      }

      // Add timestamps if requested
      const documentData = includeTimestamps ? this.addTimestamps(data) : data;

      // Generate ID if not provided
      if (!documentData.id) {
        // Special handling for meditations - use {number}-{DDMMYYYY} format
        if (collectionName === 'meditations') {
          documentData.id = await this.generateMeditationId();
        } else {
          documentData.id = this.generateDocumentId(collectionName, documentData);
        }
      }

      // Filter out undefined values before saving (Firestore doesn't allow undefined)
      const cleanDocumentData = this.removeUndefinedValues(documentData);

      // Create document
      const docRef = doc(this.db, collectionName, cleanDocumentData.id);
      await setDoc(docRef, cleanDocumentData);

      return {
        success: true,
        data: cleanDocumentData as DocumentType,
        message: `Document created successfully in ${collectionName}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during document creation'
      };
    }
  }

  /**
   * Get a single document by ID
   */
  public async get<K extends CollectionName>(
    collectionName: K,
    id: string
  ): Promise<DocumentOperationResult<DocumentType>> {
    try {
      // Validate collection access
      if (!this.canAccessCollection(collectionName)) {
        return {
          success: false,
          error: `Collection '${collectionName}' is dormant and not available for operations`
        };
      }

      const docRef = doc(this.db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: `Document with ID '${id}' not found in collection '${collectionName}'`
        };
      }

      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() } as DocumentType,
        message: `Document retrieved successfully from ${collectionName}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during document retrieval'
      };
    }
  }

  /**
   * Update an existing document
   */
  public async update<K extends CollectionName>(
    collectionName: K,
    id: string,
    data: UpdateDocument<DocumentType>,
    options: FirestoreOperationOptions = {}
  ): Promise<DocumentOperationResult<DocumentType>> {
    const { validate = false, includeTimestamps = true } = options;

    try {
      // Validate collection access
      if (!this.canAccessCollection(collectionName)) {
        return {
          success: false,
          error: `Collection '${collectionName}' is dormant and not available for operations`
        };
      }

      // Validate data if requested
      if (validate) {
        const validation = this.validateDocument(collectionName, data);
        if (!validation.isValid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }
      }

      // Add update timestamp if requested
      const updateData = includeTimestamps ? { ...data, updatedAt: Timestamp.now() } : data;

      // Update document
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, updateData);

      // Get updated document
      const updatedDoc = await this.get(collectionName, id);
      if (!updatedDoc.success) {
        return {
          success: false,
          error: `Document updated but failed to retrieve: ${updatedDoc.error}`
        };
      }

      return {
        success: true,
        data: updatedDoc.data,
        message: `Document updated successfully in ${collectionName}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during document update'
      };
    }
  }

  /**
   * Delete a document
   */
  public async delete<K extends CollectionName>(
    collectionName: K,
    id: string
  ): Promise<DocumentOperationResult<void>> {
    try {
      // Validate collection access
      if (!this.canAccessCollection(collectionName)) {
        return {
          success: false,
          error: `Collection '${collectionName}' is dormant and not available for operations`
        };
      }

      const docRef = doc(this.db, collectionName, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: `Document deleted successfully from ${collectionName}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during document deletion'
      };
    }
  }

  /**
   * Query documents with filters and options
   */
  public async query<K extends CollectionName>(
    collectionName: K,
    options: QueryOptions = {}
  ): Promise<DocumentsOperationResult<DocumentType>> {
    try {
      // Validate collection access
      if (!this.canAccessCollection(collectionName)) {
        return {
          success: false,
          error: `Collection '${collectionName}' is dormant and not available for operations`
        };
      }

      const { filters = [], orderBy: orderByOptions = [], limit: limitCount, startAfter: startAfterDoc } = options;

      // Build query constraints
      const constraints: QueryConstraint[] = [];

      // Add filters
      filters.forEach(filter => {
        constraints.push(this.convertFilterToConstraint(filter));
      });

      // Add ordering
      orderByOptions.forEach(order => {
        constraints.push(orderBy(order.field, order.direction));
      });

      // Add limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      // Add pagination
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }

      // Execute query
      const collectionRef = collection(this.db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const documents: DocumentType[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as DocumentType);
      });

      return {
        success: true,
        data: documents,
        count: documents.length,
        message: `Query executed successfully on ${collectionName}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during query execution'
      };
    }
  }

  // ============================================================================
  // ACTIVE COLLECTION SPECIFIC METHODS
  // ============================================================================


  /**
   * Create an office document with flat structure
   */
  public async createOffice(data: CreateDocument<Office>): Promise<DocumentOperationResult<Office>> {
    console.log('Creating office with flat structure');
    console.log('Office data being saved:', JSON.stringify(data, null, 2));
    
    try {
      // Generate ID if not provided
      const documentData: any = { ...data };
      if (!documentData.id) {
        documentData.id = this.generateDocumentId('offices', documentData);
      }

      // Add timestamps
      const timestampedData = this.addTimestamps(documentData);

      // Create flat structure: offices/{officeId}
      const officeDocRef = doc(collection(this.db, 'offices'), documentData.id as string);
      await setDoc(officeDocRef, timestampedData);

      console.log('Office created successfully at flat path:', `offices/${documentData.id}`);

      return {
        success: true,
        data: timestampedData as Office,
        message: `Office created successfully at offices/${documentData.id}`
      };
    } catch (error) {
      console.error('Error creating office:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during office creation'
      };
    }
  }

  /**
   * Get an office by ID (flat structure)
   */
  public async getOffice(id: string): Promise<DocumentOperationResult<Office>> {
    return this.readDocument<Office>('offices', id);
  }

  /**
   * Update an office (flat structure)
   */
  public async updateOffice(id: string, data: UpdateDocument<Office>): Promise<DocumentOperationResult<Office>> {
    return this.updateDocument<Office>('offices', id, data);
  }

  /**
   * Delete an office (flat structure)
   */
  public async deleteOffice(id: string): Promise<DocumentOperationResult<void>> {
    const result = await this.deleteDocument('offices', id);
    return {
      success: result.success,
      error: result.error,
      message: result.success ? `Office ${id} deleted successfully` : 'Failed to delete office'
    };
  }

  /**
   * Query offices (flat structure with indexed fields)
   */
  public async queryOffices(options?: QueryOptions): Promise<DocumentsOperationResult<Office>> {
    return this.queryDocuments<Office>('offices', options);
  }

  /**
   * Create a project document with flat structure
   */
  public async createProject(data: CreateDocument<Project>): Promise<DocumentOperationResult<Project>> {
    console.log('Creating project with flat structure');
    console.log('Project data being saved:', JSON.stringify(data, null, 2));
    
    try {
      // Generate ID if not provided
      const documentData: any = { ...data };
      if (!documentData.id) {
        documentData.id = this.generateDocumentId('projects', documentData);
      }

      // Add timestamps
      const timestampedData = this.addTimestamps(documentData);

      // Create flat structure: projects/{projectId}
      const projectDocRef = doc(collection(this.db, 'projects'), documentData.id as string);
      await setDoc(projectDocRef, timestampedData);

      console.log('Project created successfully at flat path:', `projects/${documentData.id}`);

      return {
        success: true,
        data: timestampedData as Project,
        message: `Project created successfully at projects/${documentData.id}`
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during project creation'
      };
    }
  }

  /**
   * Get a project by ID (flat structure)
   */
  public async getProject(id: string): Promise<DocumentOperationResult<Project>> {
    return this.readDocument<Project>('projects', id);
  }

  /**
   * Update a project
   */
  public async updateProject(id: string, data: UpdateDocument<Project>): Promise<DocumentOperationResult<Project>> {
    return this.updateDocument<Project>('projects', id, data);
  }

  /**
   * Delete a project
   */
  public async deleteProject(id: string): Promise<DocumentOperationResult<void>> {
    const result = await this.deleteDocument('projects', id);
    return {
      success: result.success,
      error: result.error,
      message: result.success ? `Project ${id} deleted successfully` : 'Failed to delete project'
    };
  }

  /**
   * Query projects (flat structure with indexed fields)
   */
  public async queryProjects(options?: QueryOptions): Promise<DocumentsOperationResult<Project>> {
    return this.queryDocuments<Project>('projects', options);
  }


  /**
   * Create a regulation document with flat structure
   */
  public async createRegulation(data: CreateDocument<Regulation>): Promise<DocumentOperationResult<Regulation>> {
    console.log('Creating regulation with flat structure');
    console.log('Regulation data being saved:', JSON.stringify(data, null, 2));
    
    try {
      // Generate ID if not provided
      const documentData: any = { ...data };
      if (!documentData.id) {
        documentData.id = this.generateDocumentId('regulations', documentData);
      }

      // Add timestamps
      const timestampedData = this.addTimestamps(documentData);

      // Create flat structure: regulations/{regulationId}
      const regulationDocRef = doc(collection(this.db, 'regulations'), documentData.id as string);
      await setDoc(regulationDocRef, timestampedData);

      console.log('Regulation created successfully at flat path:', `regulations/${documentData.id}`);

      return {
        success: true,
        data: timestampedData as Regulation,
        message: `Regulation created successfully at regulations/${documentData.id}`
      };
    } catch (error) {
      console.error('Error creating regulation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during regulation creation'
      };
    }
  }

  /**
   * Get a regulation by ID
   */
  public async getRegulation(id: string): Promise<DocumentOperationResult<Regulation>> {
    const result = await this.get('regulations', id);
    return {
      ...result,
      data: result.data as Regulation
    };
  }

  /**
   * Update a regulation
   */
  public async updateRegulation(id: string, data: UpdateDocument<Regulation>): Promise<DocumentOperationResult<Regulation>> {
    const result = await this.update('regulations', id, data);
    return {
      ...result,
      data: result.data as Regulation
    };
  }

  /**
   * Delete a regulation
   */
  public async deleteRegulation(id: string): Promise<DocumentOperationResult<void>> {
    return this.delete('regulations', id);
  }

  /**
   * Query regulations
   */
  public async queryRegulations(options?: QueryOptions): Promise<DocumentsOperationResult<Regulation>> {
    const result = await this.query('regulations', options);
    return {
      ...result,
      data: result.data as Regulation[]
    };
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Execute multiple operations in a batch
   */
  public async executeBatch(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: CollectionName;
      id?: string;
      data?: any;
    }>
  ): Promise<BatchOperationResult> {
    const startTime = Date.now();
    const batch = writeBatch(this.db);
    const results: Array<{ success: boolean; error?: string }> = [];

    try {
      // Validate all operations
      for (const operation of operations) {
        if (!this.canAccessCollection(operation.collection)) {
          results.push({
            success: false,
            error: `Collection '${operation.collection}' is dormant`
          });
          continue;
        }

        try {
          switch (operation.type) {
            case 'create':
              if (!operation.data || !operation.id) {
                results.push({
                  success: false,
                  error: 'Create operation requires data and id'
                });
                continue;
              }
              const docRef = doc(this.db, operation.collection, operation.id);
              batch.set(docRef, this.addTimestamps(operation.data));
              results.push({ success: true });
              break;

            case 'update':
              if (!operation.id || !operation.data) {
                results.push({
                  success: false,
                  error: 'Update operation requires id and data'
                });
                continue;
              }
              const updateRef = doc(this.db, operation.collection, operation.id);
              batch.update(updateRef, { ...operation.data, updatedAt: Timestamp.now() });
              results.push({ success: true });
              break;

            case 'delete':
              if (!operation.id) {
                results.push({
                  success: false,
                  error: 'Delete operation requires id'
                });
                continue;
              }
              const deleteRef = doc(this.db, operation.collection, operation.id);
              batch.delete(deleteRef);
              results.push({ success: true });
              break;

            default:
              results.push({
                success: false,
                error: `Unknown operation type: ${operation.type}`
              });
          }
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Execute batch
      await batch.commit();

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error');

      return {
        success: failed === 0,
        operations: operations.length,
        successful,
        failed,
        errors,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        operations: operations.length,
        successful: 0,
        failed: operations.length,
        errors: [error instanceof Error ? error.message : 'Unknown batch error'],
        duration: Date.now() - startTime
      };
    }
  }

  // ============================================================================
  // TRANSACTION OPERATIONS
  // ============================================================================

  /**
   * Execute operations in a transaction
   */
  public async executeTransaction<T>(
    transactionFunction: (transaction: Transaction) => Promise<T>
  ): Promise<TransactionOperationResult<T>> {
    const startTime = Date.now();

    try {
      const result = await runTransaction(this.db, async (transaction) => {
        return await transactionFunction(transaction);
      });

      return {
        success: true,
        data: result,
        operations: 1,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown transaction error',
        operations: 0,
        duration: Date.now() - startTime
      };
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to real-time updates for a document
   */
  public subscribeToDocument<K extends CollectionName>(
    collectionName: K,
    id: string,
    callback: (doc: DocumentSnapshot<DocumentData>) => void,
    options: RealTimeSubscriptionOptions = {}
  ): Unsubscribe {
    const { includeMetadataChanges = false, onError, onComplete } = options;

    const docRef = doc(this.db, collectionName, id);
    const unsubscribe = onSnapshot(
      docRef,
      { includeMetadataChanges },
      callback,
      onError,
      onComplete
    );

    // Store subscription for cleanup
    const subscriptionId = `${collectionName}-${id}`;
    this.activeSubscriptions.set(subscriptionId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Subscribe to real-time updates for a collection query
   */
  public subscribeToCollection<K extends CollectionName>(
    collectionName: K,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void,
    options: QueryOptions & RealTimeSubscriptionOptions = {}
  ): Unsubscribe {
    const { 
      filters = [], 
      orderBy: orderByOptions = [], 
      limit: limitCount,
      includeMetadataChanges = false,
      onError,
      onComplete
    } = options;

    // Build query constraints
    const constraints: QueryConstraint[] = [];
    filters.forEach(filter => {
      constraints.push(this.convertFilterToConstraint(filter));
    });
    orderByOptions.forEach(order => {
      constraints.push(orderBy(order.field, order.direction));
    });
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const collectionRef = collection(this.db, collectionName);
    const q = query(collectionRef, ...constraints);
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges },
      callback,
      onError,
      onComplete
    );

    // Store subscription for cleanup
    const subscriptionId = `${collectionName}-query-${Date.now()}`;
    this.activeSubscriptions.set(subscriptionId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  public unsubscribe(subscriptionId: string): boolean {
    const unsubscribe = this.activeSubscriptions.get(subscriptionId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSubscriptions.delete(subscriptionId);
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  public unsubscribeAll(): void {
    this.activeSubscriptions.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeSubscriptions.clear();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert QueryFilter to QueryConstraint
   */
  private convertFilterToConstraint(filter: QueryFilter): QueryConstraint {
    switch (filter.operator) {
      case '==':
        return where(filter.field, '==', filter.value);
      case '!=':
        return where(filter.field, '!=', filter.value);
      case '<':
        return where(filter.field, '<', filter.value);
      case '<=':
        return where(filter.field, '<=', filter.value);
      case '>':
        return where(filter.field, '>', filter.value);
      case '>=':
        return where(filter.field, '>=', filter.value);
      case 'in':
        return where(filter.field, 'in', filter.value);
      case 'not-in':
        return where(filter.field, 'not-in', filter.value);
      case 'array-contains':
        return where(filter.field, 'array-contains', filter.value);
      case 'array-contains-any':
        return where(filter.field, 'array-contains-any', filter.value);
      default:
        throw new Error(`Unsupported filter operator: ${filter.operator}`);
    }
  }

  /**
   * Check if collection can be accessed
   */
  private canAccessCollection(collectionName: CollectionName): boolean {
    return ACTIVE_COLLECTIONS.includes(collectionName);
  }

  /**
   * Validate document data
   */
  private validateDocument(collectionName: CollectionName, data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      switch (collectionName) {
        case 'offices':
          const officeValidation = validateOffice(data);
          if (!officeValidation.isValid) {
            errors.push(...Object.values(officeValidation.errors).flat());
          }
          break;

        case 'projects':
          const projectValidation = validateProject(data);
          if (!projectValidation.isValid) {
            errors.push(...Object.values(projectValidation.errors).flat());
          }
          break;

        case 'regulations':
          const regulationValidation = validateRegulation(data);
          if (!regulationValidation.isValid) {
            errors.push(...Object.values(regulationValidation.errors).flat());
          }
          break;

        default:
          // Basic validation for other collections
          if (!data || typeof data !== 'object') {
            errors.push('Document data must be an object');
          }
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Add timestamps to document data
   */
  private addTimestamps(data: any): any {
    const now = Timestamp.now();
    return {
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
  }

  /**
   * Remove undefined values from object
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
          cleaned[key] = this.removeUndefinedValues(obj[key]);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Generate document ID
   */
  private generateDocumentId(collectionName: CollectionName, data: any): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    switch (collectionName) {
      case 'offices':
        // Office IDs are generated by the Office ID system
        return `office-${timestamp}-${random}`;
      
      case 'projects':
        // Project IDs based on name
        if (data.projectName) {
          return data.projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `project-${timestamp}`;
        }
        return `project-${timestamp}-${random}`;
      
      case 'regulations':
        // Regulation IDs based on name and jurisdiction
        if (data.name && data.jurisdiction) {
          const nameSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const country = data.jurisdiction.country?.toLowerCase() || 'unknown';
          return `${country}-${nameSlug}-${new Date().getFullYear()}`;
        }
        return `regulation-${timestamp}-${random}`;
      
      case 'meditations':
        // Meditations use {number}-{DDMMYYYY} format
        // This will be handled separately in async function
        return `temp-${timestamp}`;
      
      default:
        return `${collectionName}-${timestamp}-${random}`;
    }
  }

  /**
   * Generate meditation ID based on {number}-{DDMMYYYY} template
   */
  public async generateMeditationId(): Promise<string> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}${month}${year}`; // DDMMYYYY format
    
    // Query all meditations to find the highest number for today
    const meditationsResult = await this.query('meditations');
    
    let maxNumber = 0;
    if (meditationsResult.success && meditationsResult.data) {
      // Pattern to match: {number}-{DDMMYYYY}
      const pattern = new RegExp(`^(\\d+)-${dateStr}$`);
      
      for (const meditation of meditationsResult.data) {
        const match = meditation.id.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    
    // Next number is maxNumber + 1
    const nextNumber = maxNumber + 1;
    return `${nextNumber}-${dateStr}`;
  }

  /**
   * Get active subscriptions count
   */
  public getActiveSubscriptionsCount(): number {
    return this.activeSubscriptions.size;
  }

  /**
   * Get active subscriptions info
   */
  public getActiveSubscriptionsInfo(): Array<{ id: string; collection: string }> {
    const info: Array<{ id: string; collection: string }> = [];
    this.activeSubscriptions.forEach((_, id) => {
      const [collection] = id.split('-');
      info.push({ id, collection });
    });
    return info;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const firestoreOperations = FirestoreOperationsService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function createDocument<K extends CollectionName>(
  collectionName: K,
  data: CreateDocument<DocumentType>,
  options?: FirestoreOperationOptions
): Promise<DocumentOperationResult<DocumentType>> {
  return firestoreOperations.create(collectionName, data, options);
}

export async function getDocument<K extends CollectionName>(
  collectionName: K,
  id: string
): Promise<DocumentOperationResult<DocumentType>> {
  return firestoreOperations.get(collectionName, id);
}

export async function updateDocument<K extends CollectionName>(
  collectionName: K,
  id: string,
  data: UpdateDocument<DocumentType>,
  options?: FirestoreOperationOptions
): Promise<DocumentOperationResult<DocumentType>> {
  return firestoreOperations.update(collectionName, id, data, options);
}

export async function deleteDocument<K extends CollectionName>(
  collectionName: K,
  id: string
): Promise<DocumentOperationResult<void>> {
  return firestoreOperations.delete(collectionName, id);
}

export async function queryDocuments<K extends CollectionName>(
  collectionName: K,
  options?: QueryOptions
): Promise<DocumentsOperationResult<DocumentType>> {
  return firestoreOperations.query(collectionName, options);
}

export async function executeBatchOperations(
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: CollectionName;
    id?: string;
    data?: any;
  }>
): Promise<BatchOperationResult> {
  return firestoreOperations.executeBatch(operations);
}

export async function executeTransactionOperation<T>(
  transactionFunction: (transaction: Transaction) => Promise<T>
): Promise<TransactionOperationResult<T>> {
  return firestoreOperations.executeTransaction(transactionFunction);
}

export function subscribeToDocumentUpdates<K extends CollectionName>(
  collectionName: K,
  id: string,
  callback: (doc: DocumentSnapshot<DocumentData>) => void,
  options?: RealTimeSubscriptionOptions
): Unsubscribe {
  return firestoreOperations.subscribeToDocument(collectionName, id, callback, options);
}

export function subscribeToCollectionUpdates<K extends CollectionName>(
  collectionName: K,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  options?: QueryOptions & RealTimeSubscriptionOptions
): Unsubscribe {
  return firestoreOperations.subscribeToCollection(collectionName, callback, options);
}

export function unsubscribeFromUpdates(subscriptionId: string): boolean {
  return firestoreOperations.unsubscribe(subscriptionId);
}

export function unsubscribeFromAllUpdates(): void {
  firestoreOperations.unsubscribeAll();
}
