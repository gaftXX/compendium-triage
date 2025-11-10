// AI Orchestra - Main Entry Point
// This is the central hub for all AI Orchestra functionality

// Gen 1 Orchestra (Legacy - Pattern-based)
export { Orchestra } from './gen1/orchestra';

// Gen 2 Orchestra (Modern - AI-powered agent)
export { OrchestraGen2 } from './gen2/orchestrator';
export type { ActionPlan, OrchestraResponse } from './gen2/orchestrator';
export { ToolRegistry } from './gen2/toolRegistry';
export type { ToolDefinition } from './gen2/toolRegistry';
export { ToolExecutor } from './gen2/toolExecutor';
export type { ToolExecutionResult } from './gen2/toolExecutor';
export { ContextProvider } from './gen2/contextProvider';
export type { AppContext } from './gen2/contextProvider';
export { IntentRouter } from './gen2/intentRouter';
export type { Intent, IntentClassification } from './gen2/intentRouter';
export { DomainHandlers } from './gen2/domainHandlers';

// Shared Services
export { ClaudeAIService } from './services/claudeAIService';
export type {
  ClaudeTool,
  ClaudeToolUse,
  ClaudeToolResult,
  ClaudeChatWithToolsResponse,
  ClaudeAnalysisResult,
  ClaudeCategorizationResult,
  ClaudeExtractionResult
} from './services/claudeAIService';

