// Note Processing Engine - Phase 4: Independent Data Ingestion System

import { Office, Project, Regulation } from '../renderer/src/types/firestore';
import { ClaudeAIService } from './claudeAIService';

export interface NoteProcessingResult {
  success: boolean;
  category: 'office' | 'project' | 'regulation' | 'unknown';
  extractedData?: Partial<Office> | Partial<Project> | Partial<Regulation>;
  preview?: string;
  error?: string;
  confidence?: number;
}

export interface NoteProcessingOptions {
  autoSave?: boolean;
  showPreview?: boolean;
  validateRequired?: boolean;
}

export class NoteProcessingEngine {
  private static instance: NoteProcessingEngine;
  private claudeAI: ClaudeAIService;

  private constructor() {
    this.claudeAI = ClaudeAIService.getInstance();
  }

  public static getInstance(): NoteProcessingEngine {
    if (!NoteProcessingEngine.instance) {
      NoteProcessingEngine.instance = new NoteProcessingEngine();
    }
    return NoteProcessingEngine.instance;
  }

  /**
   * Main processing function - uses Claude AI to analyze unstructured text and extract structured data
   */
  public async processNote(
    inputText: string, 
    options: NoteProcessingOptions = {}
  ): Promise<NoteProcessingResult> {
    try {
      console.log('Processing note with Claude AI:', inputText);

      // Step 1: Clean and normalize input
      const cleanedText = this.cleanInputText(inputText);
      
      // Step 2: Use Claude AI to analyze the text (categorization + extraction)
      const claudeResult = await this.claudeAI.analyzeText(cleanedText);
      
      // Step 3: Validate Claude-extracted data
      const validationResult = this.validateExtractedData(claudeResult.extraction.extractedData, claudeResult.categorization.category);
      
      // Step 4: Generate preview
      const preview = this.generatePreview(claudeResult.extraction.extractedData, claudeResult.categorization.category);
      
      // Trust Claude's analysis - lower confidence threshold to respect Claude's reasoning
      const shouldAccept = validationResult.isValid && claudeResult.categorization.confidence > 0.3;
      
      return {
        success: shouldAccept,
        category: claudeResult.categorization.category,
        extractedData: shouldAccept ? claudeResult.extraction.extractedData : undefined,
        preview,
        error: shouldAccept ? undefined : validationResult.error || `Low confidence: ${claudeResult.categorization.confidence}`,
        confidence: claudeResult.overallConfidence
      };
    } catch (error) {
      console.error('Error processing note with Claude AI:', error);
      return {
        success: false,
        category: 'unknown',
        error: 'Failed to process note with Claude AI: ' + (error as Error).message
      };
    }
  }

  /**
   * Clean and normalize input text
   */
  private cleanInputText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,;:!?()-]/g, '') // Remove special characters except basic punctuation
      .toLowerCase();
  }

  // Note: AI-powered categorization and extraction is now handled by AIService


  /**
   * Validate extracted data with minimal checks - trust Claude's analysis
   */
  private validateExtractedData(
    data: any, 
    category: string
  ): { isValid: boolean; error?: string } {
    // Only validate that we have some data - trust Claude's categorization
    if (!data || Object.keys(data).length === 0) {
      return { isValid: false, error: 'No data extracted from the input text' };
    }

    // Basic validation only - let Claude's analysis be authoritative
    switch (category) {
      case 'office':
        // Only check for basic name presence, allow Claude to determine what constitutes a valid office
        if (!data.name || data.name.trim().length === 0) {
          return { isValid: false, error: 'Office name is required' };
        }
        // Allow Claude to determine if location is available or not
        break;

      case 'project':
        // Only check for basic project name, trust Claude's project identification
        if (!data.projectName || data.projectName.trim().length === 0) {
          return { isValid: false, error: 'Project name is required' };
        }
        // Allow Claude to determine project details
        break;

      case 'regulation':
        // Only check for basic regulation name, trust Claude's regulation identification
        if (!data.name || data.name.trim().length === 0) {
          return { isValid: false, error: 'Regulation name is required' };
        }
        // Allow Claude to determine regulation details
        break;
    }

    return { isValid: true };
  }

  /**
   * Generate preview text
   */
  private generatePreview(data: any, category: string): string {
    switch (category) {
      case 'office':
        return `Office: ${data.name || 'Unknown'}${data.location?.headquarters?.city ? ` in ${data.location.headquarters.city}` : ''}${data.founded ? ` (Founded ${data.founded})` : ''}`;
      case 'project':
        return `Project: ${data.projectName || 'Unknown'}${data.location?.city ? ` in ${data.location.city}` : ''}${data.details?.projectType ? ` (${data.details.projectType})` : ''}`;
      case 'regulation':
        return `Regulation: ${data.name || 'Unknown'}${data.jurisdiction?.cityName ? ` in ${data.jurisdiction.cityName}` : ''}${data.regulationType ? ` (${data.regulationType})` : ''}`;
      default:
        return 'Unknown content type';
    }
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: any, category: string): number {
    let score = 0;
    const maxScore = 5;

    if (data && Object.keys(data).length > 0) score += 1;
    
    switch (category) {
      case 'office':
        if (data.name) score += 1;
        if (data.location?.headquarters?.city) score += 1;
        if (data.founded) score += 1;
        if (data.size?.employeeCount) score += 1;
        break;
      case 'project':
        if (data.projectName) score += 1;
        if (data.location?.city) score += 1;
        if (data.details?.projectType) score += 1;
        if (data.status) score += 1;
        break;
      case 'regulation':
        if (data.name) score += 1;
        if (data.jurisdiction?.cityName) score += 1;
        if (data.regulationType) score += 1;
        if (data.description) score += 1;
        break;
    }

    return score / maxScore;
  }

  // Note: Utility methods (generateOfficeId, getSizeCategory) are now in AIService
}
