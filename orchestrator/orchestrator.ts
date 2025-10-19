/**
 * AI Orchestrator Service
 * 
 * Central control system for the entire application.
 * Manages app-wide operations, executes commands on demand,
 * and coordinates between different systems.
 */

import { sendMessage } from './claudeClient';
import { getActiveActions, getActionById, validateActionParameters } from './actions/registry';
import { officeActions } from './actions/officeActions';
import { projectActions } from './actions/projectActions';
import { regulatoryActions } from './actions/regulatoryActions';
import { searchActions } from './actions/searchActions';
import { relationshipActions } from './actions/relationshipActions';
import { uiActions } from './actions/uiActions';

export interface OrchestratorRequest {
  command: string;
  context?: any;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface OrchestratorResponse {
  success: boolean;
  result?: any;
  error?: string;
  message?: string;
  actionExecuted?: string;
  data?: any;
}

export interface ActionHandler {
  [key: string]: (...args: any[]) => Promise<any>;
}

/**
 * Central AI Orchestrator Service
 */
export class OrchestratorService {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private actionHandlers: ActionHandler = {
    ...officeActions,
    ...projectActions,
    ...regulatoryActions,
    ...searchActions,
    ...relationshipActions,
    ...uiActions
  };

  /**
   * Process a user command through the AI orchestrator
   */
  async processCommand(request: OrchestratorRequest): Promise<OrchestratorResponse> {
    try {
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
      const claudeResponse = await claudeClient.generateResponse(prompt, this.conversationHistory);
      
      // Parse Claude's response
      const parsedResponse = this.parseClaudeResponse(claudeResponse);
      
      if (!parsedResponse.success) {
        return {
          success: false,
          error: parsedResponse.error || 'Failed to parse Claude response'
        };
      }

      // Execute the action
      const executionResult = await this.executeAction(parsedResponse.action, parsedResponse.parameters);
      
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
      console.error('Error in orchestrator processCommand:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Build context for Claude API
   */
  private buildContext(request: OrchestratorRequest): any {
    const activeActions = getActiveActions();
    const availableActions = Object.values(activeActions).map(action => ({
      id: action.id,
      name: action.name,
      description: action.description,
      requiredParams: action.requiredParams,
      optionalParams: action.optionalParams,
      category: action.category,
      domain: action.domain
    }));

    return {
      availableActions,
      appContext: request.context || {},
      conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages
    };
  }

  /**
   * Build prompt for Claude API
   */
  private buildPrompt(command: string, context: any): string {
    const availableActions = context.availableActions;
    
    return `You are an AI assistant for an architecture management application. You can help users manage offices, projects, and regulatory records.

Available Actions:
${availableActions.map(action => 
  `- ${action.id}: ${action.description}
    Required: ${action.requiredParams.join(', ')}
    Optional: ${action.optionalParams.join(', ')}
    Category: ${action.category} | Domain: ${action.domain}`
).join('\n')}

User Command: "${command}"

Based on the user's command, determine which action to execute and what parameters to use. Respond with a JSON object in this exact format:
{
  "action": "ACTION_ID",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "reasoning": "Brief explanation of why this action was chosen"
}

If the command is unclear or doesn't match any available actions, respond with:
{
  "action": null,
  "error": "Explanation of why the command couldn't be processed"
}`;
  }

  /**
   * Parse Claude's response to extract action and parameters
   */
  private parseClaudeResponse(response: string): {
    success: boolean;
    action?: string;
    parameters?: any;
    error?: string;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'No JSON found in Claude response'
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.error) {
        return {
          success: false,
          error: parsed.error
        };
      }

      if (!parsed.action) {
        return {
          success: false,
          error: 'No action specified in Claude response'
        };
      }

      return {
        success: true,
        action: parsed.action,
        parameters: parsed.parameters || {}
      };

    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {
        success: false,
        error: 'Failed to parse Claude response as JSON'
      };
    }
  }

  /**
   * Execute an action with the given parameters
   */
  private async executeAction(actionId: string, parameters: any): Promise<any> {
    try {
      // Validate the action exists
      const action = getActionById(actionId);
      if (!action) {
        throw new Error(`Unknown action: ${actionId}`);
      }

      // Validate parameters
      const validation = validateActionParameters(actionId, parameters);
      if (!validation.valid) {
        throw new Error(`Invalid parameters: missing ${validation.missing.join(', ')}, extra ${validation.extra.join(', ')}`);
      }

      // Get the handler function
      const handler = this.actionHandlers[action.handler];
      if (!handler) {
        throw new Error(`Handler not found for action: ${actionId}`);
      }

      // Execute the handler
      const result = await handler(parameters);
      
      return result;

    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get available actions for the current context
   */
  getAvailableActions(): any[] {
    const activeActions = getActiveActions();
    return Object.values(activeActions).map(action => ({
      id: action.id,
      name: action.name,
      description: action.description,
      category: action.category,
      domain: action.domain
    }));
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Add context to the conversation
   */
  addContext(context: any): void {
    this.conversationHistory.push({
      role: 'system',
      content: `Context: ${JSON.stringify(context)}`
    });
  }
}

// Export singleton instance
export const orchestrator = new OrchestratorService();
