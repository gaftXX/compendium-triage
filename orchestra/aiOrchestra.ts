// Orchestra - Claude AI Integration with Web Search and Action Recognition
// Sends user input to Claude AI and returns response, also recognizes navigation actions

import { ClaudeAIService } from '../noteSystem/claudeAIService';
import { WebSearchService } from './webSearchService';
import { SearchResultAnalyzer } from './searchResultAnalyzer';
import { FirestoreQueryService } from './firestoreQueryService';

export interface AIResponse {
  success: boolean;
  message: string;
  error?: string;
  needsWebSearch?: boolean;
  searchQuery?: string;
  action?: {
    type: 'navigate';
    target: string;
    data?: any;
  };
}

export interface WebSearchRequest {
  query: string;
  approved: boolean;
}

export class Orchestra {
  private static instance: Orchestra | null = null;
  private claudeService: ClaudeAIService;
  private webSearchService: WebSearchService;
  private searchResultAnalyzer: SearchResultAnalyzer;
  private firestoreQueryService: FirestoreQueryService;
  private apiKey: string = '';
  private lastSearchQuery: string = '';

  private constructor() {
    this.claudeService = ClaudeAIService.getInstance();
    this.webSearchService = WebSearchService.getInstance();
    this.searchResultAnalyzer = SearchResultAnalyzer.getInstance();
    this.firestoreQueryService = FirestoreQueryService.getInstance();
  }

  static getInstance(): Orchestra {
    if (!this.instance) {
      this.instance = new Orchestra();
    }
    return this.instance;
  }

  /**
   * Set the API key for Claude AI
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.searchResultAnalyzer.setApiKey(apiKey);
    console.log('🔑 Orchestra API key set:', !!apiKey);
  }

  /**
   * Process user input and get Claude AI response
   */
  async processInput(userInput: string): Promise<AIResponse> {
    try {
      console.log('🤖 Orchestra processing with Claude:', userInput);
      
      if (!this.apiKey) {
        return {
          success: false,
          message: 'Claude API key not set. Please configure your API key.',
          error: 'No API key available'
        };
      }
      
      // First, check for navigation actions
      const navigationAction = this.recognizeNavigationAction(userInput);
      if (navigationAction) {
        console.log('🎯 Navigation action recognized:', navigationAction);
        return {
          success: true,
          message: `Opening ${navigationAction.target}...`,
          action: navigationAction
        };
      }
      
      // Check if this is a web search approval response
      if (userInput.toLowerCase().trim() === 'yes' || userInput.toLowerCase().trim() === 'no') {
        return await this.handleWebSearchApproval(userInput.toLowerCase().trim() === 'yes');
      }
      
      // Check if this is a database query first
      const databaseQuery = this.recognizeDatabaseQuery(userInput);
      if (databaseQuery) {
        console.log('📊 Database query recognized:', databaseQuery);
        return await this.handleDatabaseQuery(databaseQuery);
      }
      
      // Check if this is a web search query
      if (this.isWebSearchQuery(userInput)) {
        console.log('🔍 Detected web search query, asking for approval');
        const searchQuery = this.extractSearchQuery(userInput, '');
        this.lastSearchQuery = searchQuery;
        
        return {
          success: true,
          message: `I need to search the web for current information about: ${searchQuery}\n\nType "yes" to search the web, or "no" to skip.`,
          needsWebSearch: true,
          searchQuery: searchQuery
        };
      }
      
      // Call Claude AI service with the API key
      const response = await this.claudeService.chat(userInput, this.apiKey);
      
      console.log('🤖 Claude response received:', response);
      console.log('🤖 Response length:', response.length);
      
      // Check if Claude indicates it needs web search
      const needsWeb = this.needsWebSearch(response);
      console.log('🔍 Needs web search:', needsWeb);
      
      if (needsWeb) {
        const searchQuery = this.extractSearchQuery(userInput, response);
        this.lastSearchQuery = searchQuery; // Store the search query
        console.log('🔍 Search query extracted:', searchQuery);
        return {
          success: true,
          message: `I need to search the web for current information about: ${searchQuery}\n\nType "yes" to search the web, or "no" to skip.`,
          needsWebSearch: true,
          searchQuery: searchQuery
        };
      }
      
      console.log('✅ Returning normal AI response');
      return {
        success: true,
        message: response
      };
    } catch (error) {
      console.error('❌ AI Orchestra error:', error);
      return {
        success: false,
        message: 'Error processing request with Claude AI',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle web search approval
   */
  private async handleWebSearchApproval(approved: boolean): Promise<AIResponse> {
    if (!approved) {
      return {
        success: true,
        message: 'Web search cancelled. How else can I help you?'
      };
    }

    // Get the last search query from stored state
    const searchQuery = this.lastSearchQuery;
    console.log('🔍 Performing web search for:', searchQuery);
    
    const searchResults = await this.webSearchService.searchWeb({
      query: searchQuery,
      maxResults: 5,
      searchType: 'general'
    });
    
    if (searchResults.success && searchResults.results.length > 0) {
      // Analyze search results with AI to provide a direct answer
      console.log('🔍 Analyzing search results with AI...');
      const analysis = await this.searchResultAnalyzer.analyzeSearchResults(searchQuery, searchResults.results);
      
      if (analysis.success) {
        return {
          success: true,
          message: analysis.answer
        };
      } else {
        // Fallback to formatted search results if analysis fails
        let responseMessage = '';
        
        searchResults.results.forEach((result, index) => {
          responseMessage += `${index + 1}. ${result.title}\n`;
          responseMessage += `${result.content || result.snippet}\n`;
          responseMessage += `Source: ${result.url}\n\n`;
        });
        
        return {
          success: true,
          message: responseMessage
        };
      }
    } else {
      return {
        success: true,
        message: 'Web search completed but no results found. Please try a different query.'
      };
    }
  }

  /**
   * Recognize navigation actions from user input
   */
  private recognizeNavigationAction(userInput: string): { type: 'navigate'; target: string; data?: any } | null {
    const input = userInput.toLowerCase().trim();
    
    // Navigation patterns for different pages
    const navigationPatterns = [
      // Offices patterns
      { pattern: /^(offices|office|offices list|office list)$/, target: 'offices-list' },
      { pattern: /^(open offices|open office list|show offices|go to offices|navigate to offices)$/, target: 'offices-list' },
      { pattern: /^(view offices|list offices|browse offices)$/, target: 'offices-list' },
      
      // Projects patterns
      { pattern: /^(projects|project|projects list|project list)$/, target: 'projects-list' },
      { pattern: /^(open projects|open projects list|open project list|show projects|go to projects|navigate to projects)$/, target: 'projects-list' },
      { pattern: /^(view projects|list projects|browse projects)$/, target: 'projects-list' },
      
      // Regulations patterns
      { pattern: /^(regulations|regulation|regulatory|regulations list|regulation list)$/, target: 'regulatory-list' },
      { pattern: /^(open regulations|show regulations|go to regulations|navigate to regulations)$/, target: 'regulatory-list' },
      { pattern: /^(view regulations|list regulations|browse regulations)$/, target: 'regulatory-list' },
      { pattern: /^(open regulatory|show regulatory|go to regulatory|navigate to regulatory)$/, target: 'regulatory-list' },
      
      // Note system patterns
      { pattern: /^(notes|note|note system|notes app)$/, target: 'note-system' },
      { pattern: /^(open notes|show notes|go to notes|navigate to notes)$/, target: 'note-system' },
      { pattern: /^(view notes|list notes|browse notes)$/, target: 'note-system' }
    ];
    
    // Check each pattern
    for (const { pattern, target } of navigationPatterns) {
      if (pattern.test(input)) {
        return {
          type: 'navigate',
          target: target
        };
      }
    }
    
    return null;
  }

  /**
   * Check if the user input is a web search query
   */
  private isWebSearchQuery(userInput: string): boolean {
    const input = userInput.toLowerCase();
    
    // Weather queries
    if (input.includes('weather') || input.includes('temperature') || input.includes('forecast')) {
      return true;
    }
    
    // News queries
    if (input.includes('news') || input.includes('latest') || input.includes('recent') || input.includes('today')) {
      return true;
    }
    
    // Stock/price queries
    if (input.includes('stock') || input.includes('price') || input.includes('market')) {
      return true;
    }
    
    // Current events
    if (input.includes('current') || input.includes('now') || input.includes('live')) {
      return true;
    }
    
    // Specific current information requests
    if (input.includes('what is the current') || input.includes('what\'s the current')) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if Claude's response indicates it needs web search
   */
  private needsWebSearch(response: string): boolean {
    // Trigger web search when Claude mentions needing current information or web search
    const explicitWebSearchIndicators = [
      'i need to search the web',
      'i should search the internet',
      'let me search the web',
      'i need to look this up online',
      'i should search online',
      'i need to find current information',
      'i need to search for current data',
      'i need to search the web for that information',
      'i don\'t have access to current',
      'search online',
      'check online',
      'look up online'
    ];
    
    const responseLower = response.toLowerCase();
    
    // Trigger if Claude explicitly mentions needing web search or current data
    return explicitWebSearchIndicators.some(indicator => 
      responseLower.includes(indicator)
    );
  }

  /**
   * Extract search query from user input and Claude response
   */
  private extractSearchQuery(userInput: string, claudeResponse: string): string {
    // Enhanced query extraction based on context
    const input = userInput.toLowerCase();
    
    // Weather queries
    if (input.includes('weather') || input.includes('temperature') || input.includes('forecast')) {
      return userInput; // Keep original for location context
    }
    
    // News queries
    if (input.includes('news') || input.includes('latest') || input.includes('recent')) {
      return userInput;
    }
    
    // Technical queries
    if (input.includes('how to') || input.includes('tutorial') || input.includes('guide')) {
      return userInput;
    }
    
    // Company/business queries
    if (input.includes('company') || input.includes('business') || input.includes('stock')) {
      return userInput;
    }
    
    // General knowledge queries
    if (input.includes('what is') || input.includes('who is') || input.includes('when') || input.includes('where')) {
      return userInput;
    }
    
    // Try to extract the main topic from Claude's response
    const responseLower = claudeResponse.toLowerCase();
    if (responseLower.includes('search for') || responseLower.includes('look up')) {
      // Extract the search topic from Claude's response
      const searchMatch = responseLower.match(/search for (.+?)(?:\.|$)/);
      if (searchMatch) {
        return searchMatch[1].trim();
      }
    }
    
    // Default to original user input
    return userInput;
  }

  /**
   * Recognize database queries
   */
  private recognizeDatabaseQuery(userInput: string): string | null {
    const input = userInput.toLowerCase();
    
    // Office-related queries
    if (input.includes('office') && (input.includes('count') || input.includes('many') || input.includes('how many'))) {
      return 'offices';
    }
    
    // Project-related queries
    if (input.includes('project') && (input.includes('count') || input.includes('many') || input.includes('how many'))) {
      return 'projects';
    }
    
    // Regulation-related queries
    if (input.includes('regulation') && (input.includes('count') || input.includes('many') || input.includes('how many'))) {
      return 'regulations';
    }
    
    // General database queries
    if (input.includes('database') && (input.includes('count') || input.includes('many') || input.includes('how many'))) {
      return 'stats';
    }
    
    return null;
  }

  /**
   * Handle database queries
   */
  private async handleDatabaseQuery(queryType: string): Promise<AIResponse> {
    try {
      let result;
      let message = '';
      
      switch (queryType) {
        case 'offices':
          result = await this.firestoreQueryService.countOffices();
          if (result.success) {
            message = `There are ${result.count} offices in the database.`;
            if (result.data && result.data.length > 0) {
              message += `\n\nOffice locations: ${result.data.map(office => office.location).join(', ')}`;
            }
          } else {
            message = `Error querying offices: ${result.error}`;
          }
          break;
          
        case 'projects':
          result = await this.firestoreQueryService.countProjects();
          if (result.success) {
            message = `There are ${result.count} projects in the database.`;
            if (result.data && result.data.length > 0) {
              message += `\n\nProject names: ${result.data.map(project => project.name).join(', ')}`;
            }
          } else {
            message = `Error querying projects: ${result.error}`;
          }
          break;
          
        case 'regulations':
          result = await this.firestoreQueryService.countRegulations();
          if (result.success) {
            message = `There are ${result.count} regulations in the database.`;
            if (result.data && result.data.length > 0) {
              message += `\n\nRegulation names: ${result.data.map(regulation => regulation.name).join(', ')}`;
            }
          } else {
            message = `Error querying regulations: ${result.error}`;
          }
          break;
          
        case 'stats':
          result = await this.firestoreQueryService.getDatabaseStats();
          if (result.success) {
            const stats = result.data;
            message = `Database Statistics:\n\n`;
            message += `Offices: ${stats.offices}\n`;
            message += `Projects: ${stats.projects}\n`;
            message += `Regulations: ${stats.regulations}\n`;
            message += `Total entities: ${stats.total}`;
          } else {
            message = `Error getting database statistics: ${result.error}`;
          }
          break;
          
        default:
          message = 'Unknown database query type.';
      }
      
      return {
        success: true,
        message: message
      };
    } catch (error) {
      console.error('Error handling database query:', error);
      return {
        success: false,
        message: `Error querying database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
