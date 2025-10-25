// Note Service - Handles the complete note processing workflow

import { NoteProcessingEngine, NoteProcessingResult, NoteProcessingOptions } from './noteProcessingEngine';
import { Office, Project, Regulation } from '../renderer/src/types/firestore';
import { FirestoreNoteService } from './firestoreNoteService';

export interface NoteServiceResult {
  success: boolean;
  message: string;
  data?: Office | Project | Regulation;
  error?: string;
}

export class NoteService {
  private static instance: NoteService;
  private processingEngine: NoteProcessingEngine;
  private firestoreService: FirestoreNoteService;

  private constructor() {
    this.processingEngine = NoteProcessingEngine.getInstance();
    this.firestoreService = FirestoreNoteService.getInstance();
  }

  public static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService();
    }
    return NoteService.instance;
  }

  /**
   * Process and save a note
   */
  public async processAndSaveNote(
    inputText: string,
    options: NoteProcessingOptions = {}
  ): Promise<NoteServiceResult> {
    try {
      // Step 1: Process the note
      const processingResult = await this.processingEngine.processNote(inputText, options);

      if (!processingResult.success || !processingResult.extractedData) {
        return {
          success: false,
          message: 'Failed to process note with Claude AI',
          error: processingResult.error || 'Claude AI could not process the input text',
          category: processingResult.category || 'unknown',
          confidence: processingResult.confidence || 0
        };
      }

      // Step 2: Save to appropriate collection
      const saveResult = await this.saveToCollection(
        processingResult.category,
        processingResult.extractedData
      );

      return saveResult;
    } catch (error) {
      console.error('Error in processAndSaveNote:', error);
      return {
        success: false,
        message: 'Failed to process and save note',
        error: (error as Error).message
      };
    }
  }

  /**
   * Process note and return preview (without saving)
   */
  public async processNotePreview(
    inputText: string
  ): Promise<NoteProcessingResult> {
    return await this.processingEngine.processNote(inputText, {
      autoSave: false,
      showPreview: true
    });
  }

  /**
   * Save extracted data to the appropriate Firestore collection
   */
  private async saveToCollection(
    category: 'office' | 'project' | 'regulation',
    data: Partial<Office> | Partial<Project> | Partial<Regulation>
  ): Promise<NoteServiceResult> {
    try {
      switch (category) {
        case 'office':
          return await this.firestoreService.saveOffice(data as Partial<Office>);

        case 'project':
          return await this.firestoreService.saveProject(data as Partial<Project>);

        case 'regulation':
          return await this.firestoreService.saveRegulation(data as Partial<Regulation>);

        default:
          return {
            success: false,
            message: 'Unknown category',
            error: 'Cannot determine collection for saving'
          };
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
      return {
        success: false,
        message: 'Failed to save to database',
        error: (error as Error).message
      };
    }
  }

  /**
   * Search for existing entities by name
   */
  public async searchExistingEntities(
    name: string,
    category: 'office' | 'project' | 'regulation'
  ): Promise<Office[] | Project[] | Regulation[]> {
    try {
      // This would search existing entities in the database
      // For now, return empty array (no existing entities found)
      console.log(`Searching for existing ${category} with name:`, name);
      return [];
    } catch (error) {
      console.error('Error searching existing entities:', error);
      return [];
    }
  }

  /**
   * Generate office ID in CCccNNN format
   */
  public generateOfficeId(data: Partial<Office>): string {
    if (!data.location?.headquarters?.city || !data.location?.headquarters?.country) {
      return 'UNKNOWN01'; // Fallback ID
    }

    const country = data.location.headquarters.country.toUpperCase();
    const city = data.location.headquarters.city.toUpperCase();
    
    // Generate country code (first 2 letters)
    const countryCode = country.substring(0, 2);
    
    // Generate city code (first 2 letters)
    const cityCode = city.substring(0, 2);
    
    // Generate number (for now, use random 3 digits)
    const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${countryCode}${cityCode}${number}`;
  }
}
