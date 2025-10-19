/**
 * Simple AI Orchestrator
 * 
 * Simplified orchestrator that focuses on UI navigation only
 */

import { sendMessage } from './claudeClient';
import { simpleUIActions } from './actions/simpleUIActions';
import { webSearchActions } from './actions/webSearchActions';

export interface SimpleOrchestratorRequest {
  command: string;
  context?: any;
}

export interface SimpleOrchestratorResponse {
  success: boolean;
  result?: any;
  error?: string;
  message?: string;
  actionExecuted?: string;
  data?: any;
}

/**
 * Simple AI Orchestrator Service
 */
export class SimpleOrchestratorService {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  /**
   * Process a user command through the AI orchestrator
   */
  async processCommand(request: SimpleOrchestratorRequest): Promise<SimpleOrchestratorResponse> {
    try {
      console.log('🤖 Simple Orchestrator: Processing command:', request.command);
      
      // Add user command to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: request.command
      });

      // Build context for Claude
      const context = this.buildContext(request);
      
      // Generate prompt with available actions
      const prompt = this.buildPrompt(request.command, context);
      
      // Send to Claude API
      const claudeResponse = await sendMessage({
        systemPrompt: prompt,
        userMessage: request.command,
        conversationHistory: this.conversationHistory
      }, {
        model: 'claude-3-7-sonnet-20250219'
      });
      
      // Parse Claude's response
      const parsedResponse = this.parseClaudeResponse(claudeResponse.content);
      
      if (!parsedResponse.success) {
        return {
          success: false,
          error: parsedResponse.error || 'Failed to parse Claude response'
        };
      }

      // Execute the action
      console.log('🎯 Executing action:', parsedResponse.action, 'with parameters:', parsedResponse.parameters);
      const executionResult = await this.executeAction(parsedResponse.action, parsedResponse.parameters);
      console.log('✅ Action executed successfully:', executionResult.message);
      
      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: executionResult.message || 'Action executed successfully'
      });

      return {
        success: true,
        result: executionResult,
        actionExecuted: parsedResponse.action,
        data: executionResult.data,
        message: executionResult.message
      };

    } catch (error) {
      console.error('Error in simple orchestrator processCommand:', error);
      return {
        success: false,
        error: `Orchestrator error: ${error}`
      };
    }
  }

  /**
   * Build context for Claude
   */
  private buildContext(request: SimpleOrchestratorRequest): any {
    return {
      availableActions: this.getAvailableActions(),
      currentState: 'cross', // Default state
      conversationHistory: this.conversationHistory,
      ...request.context
    };
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(command: string, context: any): string {
    return `You are an AI assistant that helps users navigate an architecture management application.

Available Actions:
- navigateToCross: Go to main input interface
- navigateToOffices: Open offices list
- navigateToProjects: Open projects list  
- navigateToRegulatory: Open regulatory records
- navigateBack: Go back to previous view
- getCurrentState: Get current app state
- addNote: Process and create entities from unstructured text
- searchWeb: Search the web for information
- searchArchitecture: Search for architecture-related information
- searchRegulatory: Search for regulatory information

User Command: "${command}"

If the command is a navigation request, respond with a JSON object containing:
{
  "action": "actionName",
  "parameters": {},
  "reasoning": "Why this action was chosen"
}

If the command is a general question or doesn't match any navigation actions, respond with:
{
  "action": "generalResponse",
  "parameters": {"response": "Your helpful answer to the question"},
  "reasoning": "This is a general question that doesn't require navigation"
}

Examples:
- "open offices" → {"action": "navigateToOffices", "parameters": {}, "reasoning": "User wants to see offices list"}
- "show projects" → {"action": "navigateToProjects", "parameters": {}, "reasoning": "User wants to see projects list"}
- "go back" → {"action": "navigateBack", "parameters": {}, "reasoning": "User wants to return to previous view"}
- "add note: New office in downtown" → {"action": "addNote", "parameters": {"text": "New office in downtown"}, "reasoning": "User wants to add a note for processing"}
- "search for sustainable architecture" → {"action": "searchWeb", "parameters": {"query": "sustainable architecture"}, "reasoning": "User wants to search the web for information"}
- "find architecture firms in London" → {"action": "searchArchitecture", "parameters": {"topic": "architecture firms", "location": "London"}, "reasoning": "User wants architecture-specific information"}
- "search building codes" → {"action": "searchRegulatory", "parameters": {"regulation": "building codes"}, "reasoning": "User wants regulatory information"}
- "what date is today" → {"action": "generalResponse", "parameters": {"response": "Today's date is " + new Date().toLocaleDateString()}, "reasoning": "User is asking for current date information"}`;
  }

  /**
   * Parse Claude's response
   */
  private parseClaudeResponse(response: string): { success: boolean; action?: string; parameters?: any; error?: string } {
    try {
      const parsed = JSON.parse(response);
      return {
        success: true,
        action: parsed.action,
        parameters: parsed.parameters || {}
      };
    } catch (error) {
      // Fallback: try to extract action from natural language
      const lowerResponse = response.toLowerCase();
      
      if (lowerResponse.includes('office') || lowerResponse.includes('offices')) {
        return { success: true, action: 'navigateToOffices', parameters: {} };
      } else if (lowerResponse.includes('project') || lowerResponse.includes('projects')) {
        return { success: true, action: 'navigateToProjects', parameters: {} };
      } else if (lowerResponse.includes('regulatory') || lowerResponse.includes('regulation')) {
        return { success: true, action: 'navigateToRegulatory', parameters: {} };
      } else if (lowerResponse.includes('back') || lowerResponse.includes('return')) {
        return { success: true, action: 'navigateBack', parameters: {} };
      } else if (lowerResponse.includes('cross') || lowerResponse.includes('main')) {
        return { success: true, action: 'navigateToCross', parameters: {} };
      } else {
        return { success: false, error: 'Could not parse response' };
      }
    }
  }

  /**
   * Execute the action
   */
  private async executeAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'navigateToCross':
        return await simpleUIActions.navigateToCross();
      case 'navigateToOffices':
        return await simpleUIActions.navigateToOffices();
      case 'navigateToProjects':
        return await simpleUIActions.navigateToProjects();
      case 'navigateToRegulatory':
        return await simpleUIActions.navigateToRegulatory();
      case 'navigateBack':
        return await simpleUIActions.navigateBack();
      case 'getCurrentState':
        return await simpleUIActions.getCurrentState();
      case 'generalResponse':
        return {
          success: true,
          message: parameters.response || 'I understand your question, but I can only help with navigation commands.',
          data: { response: parameters.response }
        };
      case 'addNote':
        return await this.processNote(parameters.text);
      case 'searchWeb':
        return await webSearchActions.searchWeb(parameters);
      case 'searchArchitecture':
        return await webSearchActions.searchArchitectureInfo(parameters);
      case 'searchRegulatory':
        return await webSearchActions.searchRegulatoryInfo(parameters);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Process note using note processing system
   */
  private async processNote(text: string): Promise<any> {
    try {
      const { NoteProcessing } = await import('../renderer/src/services/noteProcessing/noteProcessing');
      const service = NoteProcessing.getInstance();
      
      const processingResult = await service.processAndCreateEntities(text);
      
      return {
        success: true,
        message: `Note processed successfully. Created ${processingResult.category} entity.`,
        data: processingResult
      };
    } catch (error) {
      console.error('Error processing note:', error);
      return {
        success: false,
        error: `Failed to process note: ${error}`
      };
    }
  }

  /**
   * Get available actions
   */
  private getAvailableActions(): string[] {
    return [
      'navigateToCross',
      'navigateToOffices', 
      'navigateToProjects',
      'navigateToRegulatory',
      'navigateBack',
      'getCurrentState',
      'addNote',
      'searchWeb',
      'searchArchitecture',
      'searchRegulatory'
    ];
  }
}

// Export singleton instance
export const simpleOrchestrator = new SimpleOrchestratorService();
