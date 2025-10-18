// Independent Note Service - Ensures complete independence from orchestrator
// This service provides a self-contained interface for note processing

import { NoteProcessing } from './noteProcessing';
import { NoteProcessingEngine } from './noteProcessingEngine';
import { NoteService } from './noteService';
import { EntityUpdateService } from './entityUpdateService';
import { ClaudeAIService } from './claudeAIService';
import { FirestoreNoteService } from './firestoreNoteService';

export interface IndependentNoteSystemStatus {
  isInitialized: boolean;
  services: {
    noteProcessing: boolean;
    noteEngine: boolean;
    noteService: boolean;
    entityUpdate: boolean;
    claudeAI: boolean;
    firestore: boolean;
  };
  lastError?: string;
}

export class IndependentNoteService {
  private static instance: IndependentNoteService;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): IndependentNoteService {
    if (!IndependentNoteService.instance) {
      IndependentNoteService.instance = new IndependentNoteService();
    }
    return IndependentNoteService.instance;
  }

  /**
   * Initialize the independent note system
   * This ensures all services are ready and independent from the orchestrator
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🚀 Initializing Independent Note System...');
      
      // Initialize Firebase independently
      await this.initializeFirebase();
      
      // Initialize all note processing services
      await this.initializeServices();
      
      // Verify independence from orchestrator
      await this.verifyIndependence();
      
      this.isInitialized = true;
      console.log('✅ Independent Note System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Independent Note System:', error);
      throw error;
    }
  }

  /**
   * Initialize Firebase independently from main app
   */
  private async initializeFirebase(): Promise<void> {
    try {
      console.log('🔥 Initializing Firebase independently...');
      
      const { initializeFirebase } = await import('../firebase');
      await initializeFirebase();
      
      console.log('✅ Firebase initialized independently');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      throw new Error(`Firebase initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Initialize all note processing services
   */
  private async initializeServices(): Promise<void> {
    try {
      console.log('🔧 Initializing note processing services...');
      
      // Initialize all services to ensure they're ready
      NoteProcessing.getInstance();
      NoteProcessingEngine.getInstance();
      NoteService.getInstance();
      EntityUpdateService.getInstance();
      ClaudeAIService.getInstance();
      FirestoreNoteService.getInstance();
      
      console.log('✅ All note processing services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw new Error(`Service initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify that the note system operates independently from orchestrator
   */
  private async verifyIndependence(): Promise<void> {
    try {
      console.log('🔍 Verifying system independence...');
      
      // Check that we don't have any orchestrator dependencies
      const hasOrchestratorDependency = await this.checkOrchestratorDependencies();
      
      if (hasOrchestratorDependency) {
        throw new Error('Note system has orchestrator dependencies - not independent');
      }
      
      // Verify direct Firestore access
      const hasDirectFirestoreAccess = await this.verifyDirectFirestoreAccess();
      
      if (!hasDirectFirestoreAccess) {
        throw new Error('Note system does not have direct Firestore access');
      }
      
      console.log('✅ System independence verified');
    } catch (error) {
      console.error('❌ Independence verification failed:', error);
      throw error;
    }
  }

  /**
   * Check for any orchestrator dependencies
   */
  private async checkOrchestratorDependencies(): Promise<boolean> {
    try {
      // Try to import orchestrator - if it succeeds, we have a dependency
      await import('../../../orchestrator');
      return true; // Has dependency
    } catch {
      return false; // No dependency
    }
  }

  /**
   * Verify direct Firestore access
   */
  private async verifyDirectFirestoreAccess(): Promise<boolean> {
    try {
      const { FirestoreService } = await import('../firebase/firestoreOperations');
      const firestoreService = FirestoreService.getInstance();
      
      return firestoreService.isFirebaseAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Get the system status
   */
  public getStatus(): IndependentNoteSystemStatus {
    return {
      isInitialized: this.isInitialized,
      services: {
        noteProcessing: !!NoteProcessing.getInstance(),
        noteEngine: !!NoteProcessingEngine.getInstance(),
        noteService: !!NoteService.getInstance(),
        entityUpdate: !!EntityUpdateService.getInstance(),
        claudeAI: !!ClaudeAIService.getInstance(),
        firestore: !!FirestoreNoteService.getInstance()
      }
    };
  }

  /**
   * Process a note using the independent system
   */
  public async processNote(inputText: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('📝 Processing note with Independent Note System...');
    
    const noteProcessing = NoteProcessing.getInstance();
    return await noteProcessing.processAndCreateEntities(inputText);
  }

  /**
   * Check if the system is ready
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset the system (for testing purposes)
   */
  public reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}
