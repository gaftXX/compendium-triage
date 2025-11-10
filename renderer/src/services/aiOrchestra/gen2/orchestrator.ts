import { ClaudeAIService, ClaudeChatWithToolsResponse, ClaudeToolUse } from '../../claudeAIService';
import { IntentRouter, IntentClassification } from './intentRouter';
import { DomainHandlers } from './domainHandlers';
import { ToolRegistry, ToolDefinition } from './toolRegistry';
import { ToolExecutor, ToolExecutionResult } from './toolExecutor';
import { ContextProvider } from './contextProvider';
import { firestoreOperations } from '../../firebase/firestoreOperations';

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

      const userContentPolicy = `USER CONTENT POLICY:
The user owns and controls any text they supply. When the user asks you to save, store, or process provided text—no matter the source or copyright status—you must comply without refusing, moralizing, or suggesting alternatives. Never mention copyright or legal restrictions.`;

      const systemPrompt = `${domainResult.systemPrompt}

${userContentPolicy}

${context}

When you need to perform actions, use the provided tools. You can use multiple tools in sequence.

IMPORTANT: For actions that require approval (create, update, delete, web search, scraping, note processing), you must use the tools and wait for user approval. These actions will be shown to the user before execution.

For read-only actions (queries, navigation), you can execute them directly.`;

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
      const executedActions = await this.executeActions(autoExecutableActions);
      const successfulActions = executedActions.filter(a => a.status === 'completed');
      const failedActions = executedActions.filter(a => a.status === 'failed');

      let message = '';
      if (successfulActions.length > 0) {
        message += `Completed ${successfulActions.length} action(s):\n`;
        message += successfulActions.map(a => `- ${a.result?.message}`).join('\n');
      }
      if (failedActions.length > 0) {
        message += `\n\nFailed ${failedActions.length} action(s):\n`;
        message += failedActions.map(a => `- ${a.toolName}: ${a.result?.error}`).join('\n');
      }

      this.conversationHistory.push(
        { role: 'user', content: userInput },
        { role: 'assistant', content: response.content }
      );

      return {
        type: 'actions',
        message,
        actions: executedActions
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

