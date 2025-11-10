import { ClaudeAIService } from '../services/claudeAIService';
import { ContextProvider } from './contextProvider';

export type Intent = 
  | 'navigation'
  | 'database_query'
  | 'database_create'
  | 'database_update'
  | 'database_delete'
  | 'web_search'
  | 'web_scrape'
  | 'note_processing'
  | 'meditation'
  | 'general_chat'
  | 'unknown';

export interface IntentClassification {
  intent: Intent;
  confidence: number;
  reasoning: string;
  domain: 'navigation' | 'database' | 'web' | 'note_system' | 'meditation' | 'chat';
}

export class IntentRouter {
  private static instance: IntentRouter;
  private claudeService: ClaudeAIService;
  private contextProvider: ContextProvider;
  private classificationCache: Map<string, IntentClassification> = new Map();

  private constructor() {
    this.claudeService = ClaudeAIService.getInstance();
    this.contextProvider = ContextProvider.getInstance();
  }

  public static getInstance(): IntentRouter {
    if (!IntentRouter.instance) {
      IntentRouter.instance = new IntentRouter();
    }
    return IntentRouter.instance;
  }

  public async classifyIntent(userInput: string, apiKey: string): Promise<IntentClassification> {
    const cacheKey = userInput.toLowerCase().trim();
    if (this.classificationCache.has(cacheKey)) {
      return this.classificationCache.get(cacheKey)!;
    }

    const context = this.contextProvider.getContextForAI();
    const prompt = this.buildClassificationPrompt(userInput, context);

    try {
      const response = await this.claudeService.chat(prompt, apiKey);
      const classification = this.parseClassificationResponse(response);
      
      this.classificationCache.set(cacheKey, classification);
      
      return classification;
    } catch (error) {
      console.error('Intent classification error:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        reasoning: 'Failed to classify intent',
        domain: 'chat'
      };
    }
  }

  private buildClassificationPrompt(userInput: string, context: string): string {
    return `You are an intent classifier for an architectural database application. Your job is to quickly classify user intent into ONE category.

${context}

User Input: "${userInput}"

INTENT CATEGORIES:

**navigation** - User wants to go to a page, open a window, or navigate somewhere
Examples: "go to regulations", "open meditations", "show me the bt view", "open office details"

**database_query** - User wants to search, find, list, or view data (read-only)
Examples: "show offices in London", "find projects in Berlin", "list all regulations", "how many offices in Spain"

**database_create** - User wants to create, add, or insert new data
Examples: "create office Foster Partners", "add project", "create new regulation"

**database_update** - User wants to update, modify, or edit existing data
Examples: "update Foster Partners website", "change office status", "edit project details"

**database_delete** - User wants to delete or remove data
Examples: "delete Foster Partners office", "remove this project", "delete regulation"

**web_search** - User needs current information from the internet
Examples: "what's the weather in London", "latest news about Zaha Hadid", "current population of Tokyo"

**web_scrape** - User wants to scrape office data from Google Places
Examples: "scrape Foster Partners from Google", "get office data from Google Places"

**note_processing** - User provides unstructured text data to process
Examples: "here's info about an office: [text]", "process this data: [text]", pasted text with multiple data points

**meditation** - User wants to create or view meditations
Examples: "create meditation about architecture", "show my meditations", "meditate on design"

**general_chat** - General questions, greetings, or conversation
Examples: "hello", "how are you", "what can you do", "explain GDPR"

Respond in this exact JSON format:
{
  "intent": "navigation|database_query|database_create|database_update|database_delete|web_search|web_scrape|note_processing|meditation|general_chat|unknown",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this intent was chosen",
  "domain": "navigation|database|web|note_system|meditation|chat"
}

Be decisive. Choose the most likely intent based on keywords and context.`;
  }

  private parseClassificationResponse(response: string): IntentClassification {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        intent: parsed.intent || 'unknown',
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || '',
        domain: parsed.domain || 'chat'
      };
    } catch (error) {
      console.error('Failed to parse intent classification:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        reasoning: 'Failed to parse response',
        domain: 'chat'
      };
    }
  }

  public getDomainForIntent(intent: Intent): IntentClassification['domain'] {
    const intentDomainMap: Record<Intent, IntentClassification['domain']> = {
      navigation: 'navigation',
      database_query: 'database',
      database_create: 'database',
      database_update: 'database',
      database_delete: 'database',
      web_search: 'web',
      web_scrape: 'web',
      note_processing: 'note_system',
      meditation: 'meditation',
      general_chat: 'chat',
      unknown: 'chat'
    };

    return intentDomainMap[intent] || 'chat';
  }

  public clearCache(): void {
    this.classificationCache.clear();
  }
}

