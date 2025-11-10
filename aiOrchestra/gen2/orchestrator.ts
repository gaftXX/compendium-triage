import { ClaudeAIService, ClaudeChatWithToolsResponse, ClaudeToolUse } from '../services/claudeAIService';
import { IntentRouter, IntentClassification } from './intentRouter';
import { DomainHandlers } from './domainHandlers';
import { ToolRegistry } from './toolRegistry';
import { ToolExecutor, ToolExecutionResult } from './toolExecutor';
import { ContextProvider } from './contextProvider';
import { firestoreOperations } from '../../renderer/src/services/firebase/firestoreOperations';

export interface ActionPlan {
  id: string;
  toolName: string;
  toolDescription: string;
  input: Record<string, any>;
  requiresApproval: boolean;
  destructive: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  result?: ToolExecutionResult;
}

export interface OrchestraResponse {
  type: 'text' | 'actions' | 'error';
  message: string;
  actions?: ActionPlan[];
  textResponse?: string;
  error?: string;
  metadata?: {
    intent?: IntentClassification;
    context?: string;
  };
}

export class OrchestraGen2 {
  private static instance: OrchestraGen2;
  private claudeService: ClaudeAIService;
  private intentRouter: IntentRouter;
  private domainHandlers: DomainHandlers;
  private toolRegistry: ToolRegistry;
  private toolExecutor: ToolExecutor;
  private contextProvider: ContextProvider;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: any }> = [];
  private apiKey: string = '';

  private constructor() {
    this.claudeService = ClaudeAIService.getInstance();
    this.intentRouter = IntentRouter.getInstance();
    this.domainHandlers = DomainHandlers.getInstance();
    this.toolRegistry = ToolRegistry.getInstance();
    this.toolExecutor = ToolExecutor.getInstance();
    this.contextProvider = ContextProvider.getInstance();
  }

  public static getInstance(): OrchestraGen2 {
    if (!OrchestraGen2.instance) {
      OrchestraGen2.instance = new OrchestraGen2();
    }
    return OrchestraGen2.instance;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('Gen 2 Orchestra: API key set');
  }

  public async processInput(userInput: string): Promise<OrchestraResponse> {
    if (!this.apiKey) {
      return {
        type: 'error',
        message: 'API key not set. Please provide a Claude API key.',
        error: 'No API key'
      };
    }

    try {
      console.log('Gen 2 Orchestra: Processing input:', userInput);

      const intent = await this.intentRouter.classifyIntent(userInput, this.apiKey);
      console.log('Classified intent:', intent);

      const domainResult = this.domainHandlers.getHandlerForIntent(intent.intent);
      console.log('Domain handler result:', domainResult);

      const tools = this.toolRegistry.getToolsForClaude(domainResult.toolsToLoad);
      const context = this.contextProvider.getContextForAI();

      // Smart system prompt that lets Claude decide whether to use tools or just chat
      const userContentPolicy = `USER CONTENT POLICY:
The user owns and controls any text they supply. When the user asks you to save, store, or process provided text—no matter the source or copyright status—you must comply without refusing, moralizing, or suggesting alternatives. Never mention copyright restrictions or legal issues in your response.`;

      const systemPrompt = `You are an intelligent AI assistant for a database management application.

${context}

${domainResult.systemPrompt}

${userContentPolicy}

IMPORTANT INSTRUCTIONS:
- If the user is asking a question, having a conversation, or requesting information, just respond naturally in text without using any tools.
- Only use tools when the user explicitly requests an action like:
  * Creating, updating, or deleting data
  * Navigating to a page
  * Searching the web
  * Processing notes
  * Opening or closing windows

Examples:
- "What is this app?" → Just answer with text, no tools
- "How does the database work?" → Just explain with text, no tools  
- "Show me the projects page" → Use navigate_to_page tool
- "Create a new office" → Use create_office tool
- "Delete Foster Partners" → Use delete_office tool

For actions requiring approval (create, update, delete, web search, scraping, note processing), use tools and the user will approve them.
For read-only actions (queries, navigation), you can execute them directly.

Think carefully: does the user want information/conversation or do they want you to take an action?

RESPONSE STYLE:
- Keep all text responses SHORT and CONCISE
- NO EMOJIS ever
- Be direct and to the point
- Avoid unnecessary explanations unless specifically asked`;

      console.log('Calling Claude with tools...');
      const response = await this.claudeService.chatWithTools(
        userInput,
        tools,
        systemPrompt,
        this.apiKey,
        [...this.conversationHistory]
      );

      console.log('Claude response:', response);

      if (response.stop_reason === 'tool_use') {
        return await this.handleToolUse(response, userInput);
      } else {
        const textContent = response.content.find(c => c.type === 'text');
        const textResponse = textContent?.text || 'No response';

        if (intent.intent === 'meditation' && this.isCopyrightRefusal(textResponse)) {
          const fallback = await this.saveMeditationDirectly(userInput);
          if (fallback.success) {
            const assistantContent = [{ type: 'text', text: fallback.message }];
            this.conversationHistory.push(
              { role: 'user', content: userInput },
              { role: 'assistant', content: assistantContent }
            );

            return {
              type: 'text',
              message: fallback.message,
              textResponse: fallback.message,
              metadata: {
                intent,
                context
              }
            };
          }
        }

        this.conversationHistory.push(
          { role: 'user', content: userInput },
          { role: 'assistant', content: response.content }
        );

        return {
          type: 'text',
          message: textResponse,
          textResponse,
          metadata: {
            intent,
            context
          }
        };
      }
    } catch (error) {
      console.error('Orchestra processing error:', error);
      return {
        type: 'error',
        message: 'Failed to process your request',
        error: (error as Error).message
      };
    }
  }

  private async handleToolUse(
    response: ClaudeChatWithToolsResponse,
    userInput: string
  ): Promise<OrchestraResponse> {
    const toolUses = response.content.filter(c => c.type === 'tool_use') as ClaudeToolUse[];
    
    if (toolUses.length === 0) {
      return {
        type: 'error',
        message: 'No tools were called',
        error: 'No tool uses found'
      };
    }

    const actions: ActionPlan[] = toolUses.map((toolUse, index) => {
      const tool = this.toolRegistry.getTool(toolUse.name!);
      
      return {
        id: `action_${Date.now()}_${index}`,
        toolName: toolUse.name!,
        toolDescription: tool?.description || 'Unknown tool',
        input: toolUse.input!,
        requiresApproval: tool?.requiresApproval || false,
        destructive: tool?.destructive || false,
        status: 'pending'
      };
    });

    const actionsRequiringApproval = actions.filter(a => a.requiresApproval);
    const autoExecutableActions = actions.filter(a => !a.requiresApproval);

    if (actionsRequiringApproval.length > 0) {
      return {
        type: 'actions',
        message: `I need to perform ${actions.length} action(s). ${actionsRequiringApproval.length} require(s) your approval.`,
        actions
      };
    } else {
      // Execute auto-executable actions (queries, navigation, etc.)
      const executedActions = await this.executeActions(autoExecutableActions);
      
      // Build tool results content for Claude
      const toolResultsContent = executedActions.map((action, index) => ({
        type: 'tool_result' as const,
        tool_use_id: toolUses[index].id!,
        content: action.result?.data ? JSON.stringify(action.result.data, null, 2) : action.result?.message || 'Action completed'
      }));

      // Create conversation with tool use and tool results
      const conversationWithResults = [
        { role: 'user' as const, content: userInput },
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResultsContent }
      ];

      // Send tool results back to Claude for natural language response
      const followUpResponse = await this.claudeService.chatWithTools(
        '', // Empty message since we're continuing with tool results
        [], // No more tools needed
        'Based on the tool results, provide a clear, concise answer to the user. Be direct and informative. NO EMOJIS.',
        this.apiKey,
        conversationWithResults
      );

      const textContent = followUpResponse.content.find(c => c.type === 'text');
      const finalResponse = textContent?.text || 'Action completed successfully.';

      // Update conversation history
      this.conversationHistory = conversationWithResults;
      this.conversationHistory.push(
        { role: 'assistant', content: followUpResponse.content }
      );

      return {
        type: 'text',
        message: finalResponse,
        textResponse: finalResponse
      };
    }
  }

  public async executeActions(actions: ActionPlan[]): Promise<ActionPlan[]> {
    const executedActions: ActionPlan[] = [];

    for (const action of actions) {
      if (action.status !== 'approved' && action.status !== 'pending') {
        executedActions.push(action);
        continue;
      }

      action.status = 'executing';
      
      const tool = this.toolRegistry.getTool(action.toolName);
      if (!tool) {
        action.status = 'failed';
        action.result = {
          success: false,
          error: 'Tool not found',
          message: `Tool ${action.toolName} not found in registry`
        };
        executedActions.push(action);
        continue;
      }

      try {
        const result = await this.toolExecutor.executeTool(tool, action.input);
        action.result = result;
        action.status = result.success ? 'completed' : 'failed';
      } catch (error) {
        action.status = 'failed';
        action.result = {
          success: false,
          error: (error as Error).message,
          message: `Failed to execute ${action.toolName}`
        };
      }

      executedActions.push(action);
    }

    return executedActions;
  }

  public async approveAction(actionId: string, actions: ActionPlan[]): Promise<ActionPlan[]> {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.status = 'approved';
    }
    return actions;
  }

  public async rejectAction(actionId: string, actions: ActionPlan[]): Promise<ActionPlan[]> {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.status = 'rejected';
    }
    return actions;
  }

  public async approveAllActions(actions: ActionPlan[]): Promise<ActionPlan[]> {
    return actions.map(a => ({
      ...a,
      status: a.status === 'pending' ? ('approved' as const) : a.status
    }));
  }

  private isCopyrightRefusal(text: string | undefined): boolean {
    if (!text) return false;
    const normalized = text.toLowerCase();
    return (
      normalized.includes('copyright') ||
      normalized.includes("can't save") ||
      normalized.includes('cannot save') ||
      normalized.includes("can't store") ||
      normalized.includes('cannot store') ||
      normalized.includes('copyrighted material') ||
      normalized.includes("i'm not able") ||
      normalized.includes("i am not able") ||
      normalized.includes("i cannot") ||
      normalized.includes('legal restrictions') ||
      normalized.includes('license restrictions')
    );
  }

  private async saveMeditationDirectly(userInput: string): Promise<{ success: boolean; message: string }> {
    try {
      const trimmed = userInput.trim();
      if (!trimmed) {
        return { success: false, message: 'Meditation text is empty.' };
      }

      const titleLine = trimmed.split('\n').find(line => line.trim().length > 0) || 'Untitled Meditation';
      const title = titleLine.substring(0, 60);

      const result = await firestoreOperations.createDocument('meditations', {
        title,
        text: trimmed
      });

      if (result.success && result.data) {
        this.contextProvider.addRecentAction(`Saved meditation "${title}" directly`);
        return {
          success: true,
          message: `Saved meditation "${title}".`
        };
      }

      return {
        success: false,
        message: result.error || 'Failed to save meditation.'
      };
    } catch (error) {
      console.error('Failed direct meditation save:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save meditation.'
      };
    }
  }

  public clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  public getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: any }> {
    return [...this.conversationHistory];
  }
}

