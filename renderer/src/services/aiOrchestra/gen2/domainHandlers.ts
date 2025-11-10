import { ClaudeAIService, ClaudeTool } from '../../claudeAIService';
import { ToolRegistry } from './toolRegistry';
import { Intent } from './intentRouter';

export interface DomainHandlerResult {
  toolsToLoad: string[];
  systemPrompt: string;
}

export class DomainHandlers {
  private static instance: DomainHandlers;
  private toolRegistry: ToolRegistry;

  private constructor() {
    this.toolRegistry = ToolRegistry.getInstance();
  }

  public static getInstance(): DomainHandlers {
    if (!DomainHandlers.instance) {
      DomainHandlers.instance = new DomainHandlers();
    }
    return DomainHandlers.instance;
  }

  public getHandlerForIntent(intent: Intent): DomainHandlerResult {
    switch (intent) {
      case 'navigation':
        return this.navigationHandler();
      
      case 'database_query':
        return this.databaseQueryHandler();
      
      case 'database_create':
        return this.databaseCreateHandler();
      
      case 'database_update':
        return this.databaseUpdateHandler();
      
      case 'database_delete':
        return this.databaseDeleteHandler();
      
      case 'web_search':
        return this.webSearchHandler();
      
      case 'web_scrape':
        return this.webScrapeHandler();
      
      case 'note_processing':
        return this.noteProcessingHandler();
      
      case 'meditation':
        return this.meditationHandler();
      
      case 'general_chat':
        return this.generalChatHandler();
      
      default:
        return this.defaultHandler();
    }
  }

  private navigationHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'navigate_to_page',
        'open_window',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users navigate an architectural database application.

Available pages:
- bt-view: Combined view with offices and projects
- offices-list: Spreadsheet view of all offices
- projects-list: Spreadsheet view of all projects
- regulations-list: View and manage building regulations
- map: Barcelona map view
- meditations-list: View and create meditations

Available windows:
- office_details: Show detailed information about an office
- project_details: Show detailed information about a project
- projects_list: Show list of projects
- projects_timeline: Show timeline of projects
- office_notes: Show notes for an office
- basic_office_data: Show basic office data form

Your job is to understand where the user wants to go and use the appropriate navigation tools.

Be direct and efficient. Navigate to the page or open the window they requested.`
    };
  }

  private databaseQueryHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'query_offices',
        'query_projects',
        'query_regulations',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users search and query an architectural database.

Database collections:
- Offices: Architectural firms and practices
- Projects: Buildings and construction projects
- Regulations: Building codes and regulations

Query capabilities:
- Filter by city, country, specialization, status
- Filter by date ranges (founded year for offices)
- Limit results

Your job is to understand what data the user wants to find and construct appropriate database queries.

Always provide a summary of results in a clear, readable format. When you receive tool results, respond with the answer instead of narrating future plans.`
    };
  }

  private databaseCreateHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'create_office',
        'create_project',
        'create_regulation',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users create new entries in an architectural database.

You can create:
- Offices: Architectural firms (requires: name, city, country)
- Projects: Buildings/projects (requires: projectName, city, country)
- Regulations: Building codes (requires: name, country, type, jurisdiction level)

Your job is to:
1. Extract all required information from the user's request
2. Ask for missing required fields if needed
3. Create the entity with appropriate data

Be thorough in data collection before creating entities.`
    };
  }

  private databaseUpdateHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'update_office',
        'query_offices',
        'query_projects',
        'query_regulations',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users update existing entries in an architectural database.

You can update:
- Offices: name, website, specializations, status
- Projects: various project details
- Regulations: regulation details

Your job is to:
1. Identify which entity to update (may need to query first)
2. Understand what fields to update
3. Execute the update with the new values

If the entity ID is not provided, query first to find the correct entity.`
    };
  }

  private databaseDeleteHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'delete_office',
        'delete_project',
        'delete_regulation',
        'query_offices',
        'query_projects',
        'query_regulations',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users delete entries from an architectural database.

IMPORTANT: Deletion is destructive and requires approval.

You can delete:
- Offices
- Projects
- Regulations

Your job is to:
1. Identify the exact entity to delete (query first if needed)
2. Confirm the entity name and ID
3. Request deletion (user will approve/reject)

Always be certain about which entity is being deleted. If ambiguous, query first to clarify.`
    };
  }

  private webSearchHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'web_search',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant with access to web search.

Use web search when:
- User asks for current information (weather, news, dates)
- Information is not in your training data
- Real-time data is needed (stock prices, sports scores, etc.)

Your job is to:
1. Identify that web search is needed
2. Construct a clear search query
3. Explain why web search is needed
4. Request web search approval

After getting search results, synthesize and present them clearly.`
    };
  }

  private webScrapeHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'scrape_google_places',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users scrape office data from Google Places.

Use Google Places scraping to:
- Automatically gather information about architectural offices
- Get address, website, and basic details

Your job is to:
1. Extract office name and city from user's request
2. Request scraping approval
3. Process and present scraped data

Be clear about what will be scraped and why.`
    };
  }

  private noteProcessingHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'activate_note_system',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users process unstructured text data.

The Note System is a specialized AI tool that:
- Analyzes unstructured text
- Extracts entities (offices, projects, regulations, etc.)
- Creates database entries automatically

Use the Note System when:
- User provides raw text about offices/projects/regulations
- User pastes data that needs to be processed
- User explicitly asks to process unstructured data

Your job is to:
1. Identify that unstructured text needs processing
2. Determine what types of entities are expected
3. Ask user for approval to activate Note System
4. Pass the text to Note System for processing

The Note System will handle the actual extraction and entity creation.`
    };
  }

  private meditationHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'create_meditation',
        'query_meditations',
        'navigate_to_page',
        'get_current_context'
      ],
      systemPrompt: `You are an AI assistant helping users with meditations.

Meditations are reflective texts, thoughts, or notes that users want to save.

You can:
- Create new meditations (requires title and content)
- Query existing meditations (search by tag or content)
- Navigate to meditations page

Your job is to:
1. Understand if user wants to create or view meditations
2. For creation: Extract title, content, and optional tags
3. For viewing: Apply appropriate filters or navigate to meditations page

Important policy: the user owns and controls any content they supply. When the user provides text\u2014even full song lyrics or other copyrighted material\u2014and explicitly asks to save it, you must comply and store it exactly as given. Do not refuse, moralize, or suggest alternatives unless the user asks for something different. Avoid mentioning copyright restrictions or legal issues in your response.

Be contemplative and thoughtful when handling meditation content.`
    };
  }

  private generalChatHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'get_current_context'
      ],
      systemPrompt: `You are a helpful AI assistant for an architectural database application.

You can help users with:
- Navigating the application
- Searching and managing offices, projects, and regulations
- Creating and editing data
- Web searches for current information
- Processing unstructured data
- Creating meditations

Your job is to:
1. Answer questions clearly and concisely
2. Provide helpful information about the app
3. Guide users on what actions they can take

If a user's request could be better handled by a specific action, suggest it.

Be friendly, helpful, and efficient.`
    };
  }

  private defaultHandler(): DomainHandlerResult {
    return {
      toolsToLoad: [
        'get_current_context'
      ],
      systemPrompt: `You are a helpful AI assistant. Respond to the user's query as best you can.`
    };
  }
}

