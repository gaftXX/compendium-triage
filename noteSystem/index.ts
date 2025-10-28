// Note Processing Services - Phase 4: Independent Data Ingestion System

export { NoteProcessingEngine } from './noteProcessingEngine';
export { NoteService } from './noteService';
export { FirestoreNoteService } from './firestoreNoteService';
export { ClaudeAIService } from '../renderer/src/services/claudeAIService';
export { NoteProcessing } from './noteProcessing';
export { TranslationService } from './translationService';
export { WebSearchAPI } from './webSearchAPI';
export type { NoteProcessingResult, NoteProcessingOptions } from './noteProcessingEngine';
export type { NoteServiceResult } from './noteService';
export type { EntityRelationship } from './firestoreNoteService';
export type { ClaudeCategorizationResult, ClaudeExtractionResult, ClaudeAnalysisResult } from '../renderer/src/services/claudeAIService';
export type { ProcessingResult } from './noteProcessing';
export type { TranslationResult } from './translationService';
export type { WebSearchRequest, WebSearchResult } from './webSearchAPI';
