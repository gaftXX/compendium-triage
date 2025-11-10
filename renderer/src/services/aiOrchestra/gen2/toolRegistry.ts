import { ClaudeTool } from '../../claudeAIService';

export interface ToolDefinition extends ClaudeTool {
  category: 'navigation' | 'database' | 'web' | 'note_system' | 'meditation' | 'system';
  requiresApproval: boolean;
  destructive: boolean;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  private constructor() {
    this.registerAllTools();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerAllTools(): void {
    this.registerNavigationTools();
    this.registerDatabaseTools();
    this.registerWebTools();
    this.registerNoteSystemTools();
    this.registerMeditationTools();
    this.registerSystemTools();
  }

  private registerNavigationTools(): void {
    this.tools.set('navigate_to_page', {
      name: 'navigate_to_page',
      description: 'Navigate to a specific page in the application. Use this when user wants to go to, open, or view a different page.',
      category: 'navigation',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            enum: [
              'bt-view',
              'offices-list',
              'projects-list',
              'regulations-list',
              'map',
              'meditations-list'
            ],
            description: 'The page to navigate to. bt-view is the combined offices/projects view, offices-list shows all offices, projects-list shows all projects, regulations-list shows regulations, map opens the Barcelona map, meditations-list shows meditations.'
          }
        },
        required: ['page']
      }
    });

    this.tools.set('open_window', {
      name: 'open_window',
      description: 'Open a specific window/modal within the current page. Use this to show detailed information or specialized views.',
      category: 'navigation',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          windowType: {
            type: 'string',
            enum: ['office_details', 'project_details', 'projects_list', 'projects_timeline', 'office_notes', 'basic_office_data'],
            description: 'The type of window to open'
          },
          entityId: {
            type: 'string',
            description: 'The ID of the entity to show details for (required for detail windows)'
          }
        },
        required: ['windowType']
      }
    });
  }

  private registerDatabaseTools(): void {
    this.tools.set('query_offices', {
      name: 'query_offices',
      description: 'Query offices from the database. Use this to search for, filter, or retrieve office information.',
      category: 'database',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'Filters to apply to the query',
            properties: {
              city: { type: 'string', description: 'Filter by city name' },
              country: { type: 'string', description: 'Filter by country name' },
              specialization: { type: 'string', description: 'Filter by specialization' },
              status: { 
                type: 'string', 
                enum: ['active', 'acquired', 'dissolved'],
                description: 'Filter by office status'
              },
              foundedAfter: { type: 'number', description: 'Filter by founded year (offices founded after this year)' },
              foundedBefore: { type: 'number', description: 'Filter by founded year (offices founded before this year)' }
            }
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 20
          }
        }
      }
    });

    this.tools.set('get_office_full_profile', {
      name: 'get_office_full_profile',
      description: 'Load the full dataset for a specific office, including workforce, projects, relationships, meditations, and saved workspaces.',
      category: 'database',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          officeId: {
            type: 'string',
            description: 'The ID of the office to retrieve.'
          }
        },
        required: ['officeId']
      }
    });

    this.tools.set('query_projects', {
      name: 'query_projects',
      description: 'Query projects from the database. Use this to search for, filter, or retrieve project information.',
      category: 'database',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'Filters to apply to the query',
            properties: {
              city: { type: 'string', description: 'Filter by city name' },
              country: { type: 'string', description: 'Filter by country name' },
              projectType: { type: 'string', description: 'Filter by project type (residential, commercial, etc.)' },
              status: { type: 'string', description: 'Filter by project status' },
              officeId: { type: 'string', description: 'Filter by office ID (projects by specific office)' }
            }
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 20
          }
        }
      }
    });

    this.tools.set('query_regulations', {
      name: 'query_regulations',
      description: 'Query regulations from the database. Use this to search for, filter, or retrieve regulation information.',
      category: 'database',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'Filters to apply to the query',
            properties: {
              city: { type: 'string', description: 'Filter by city name' },
              country: { type: 'string', description: 'Filter by country name' },
              regulationType: { type: 'string', description: 'Filter by regulation type' },
              jurisdictionLevel: { 
                type: 'string',
                enum: ['city', 'state', 'country'],
                description: 'Filter by jurisdiction level'
              }
            }
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 20
          }
        }
      }
    });

    this.tools.set('create_office', {
      name: 'create_office',
      description: 'Create a new office in the database. Use this when user wants to add a new architectural office.',
      category: 'database',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Office name' },
          officialName: { type: 'string', description: 'Official company name' },
          founded: { type: 'number', description: 'Year founded' },
          city: { type: 'string', description: 'Headquarters city' },
          country: { type: 'string', description: 'Headquarters country' },
          specializations: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of specializations'
          },
          website: { type: 'string', description: 'Office website URL' }
        },
        required: ['name', 'city', 'country']
      }
    });

    this.tools.set('create_project', {
      name: 'create_project',
      description: 'Create a new project in the database. Use this when user wants to add a new architectural project.',
      category: 'database',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Project name' },
          city: { type: 'string', description: 'Project city' },
          country: { type: 'string', description: 'Project country' },
          projectType: { type: 'string', description: 'Project type (residential, commercial, etc.)' },
          status: { type: 'string', description: 'Project status' },
          description: { type: 'string', description: 'Project description' }
        },
        required: ['projectName', 'city', 'country']
      }
    });

    this.tools.set('create_regulation', {
      name: 'create_regulation',
      description: 'Create a new regulation in the database. Use this when user wants to add a new building regulation or code.',
      category: 'database',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Regulation name' },
          city: { type: 'string', description: 'City (if city-level)' },
          country: { type: 'string', description: 'Country' },
          regulationType: { type: 'string', description: 'Type of regulation' },
          jurisdictionLevel: { 
            type: 'string',
            enum: ['city', 'state', 'country'],
            description: 'Jurisdiction level'
          },
          description: { type: 'string', description: 'Regulation description' }
        },
        required: ['name', 'country', 'regulationType', 'jurisdictionLevel']
      }
    });

    this.tools.set('update_office', {
      name: 'update_office',
      description: 'Update an existing office in the database. Use this to modify office information.',
      category: 'database',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          officeId: { type: 'string', description: 'ID of the office to update' },
          updates: {
            type: 'object',
            description: 'Fields to update',
            properties: {
              name: { type: 'string' },
              website: { type: 'string' },
              specializations: { type: 'array', items: { type: 'string' } },
              status: { type: 'string', enum: ['active', 'acquired', 'dissolved'] }
            }
          }
        },
        required: ['officeId', 'updates']
      }
    });

    this.tools.set('delete_office', {
      name: 'delete_office',
      description: 'Delete an office from the database. This is a destructive action and requires approval.',
      category: 'database',
      requiresApproval: true,
      destructive: true,
      input_schema: {
        type: 'object',
        properties: {
          officeId: { type: 'string', description: 'ID of the office to delete' },
          officeName: { type: 'string', description: 'Name of the office (for confirmation)' }
        },
        required: ['officeId', 'officeName']
      }
    });

    this.tools.set('delete_project', {
      name: 'delete_project',
      description: 'Delete a project from the database. This is a destructive action and requires approval.',
      category: 'database',
      requiresApproval: true,
      destructive: true,
      input_schema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of the project to delete' },
          projectName: { type: 'string', description: 'Name of the project (for confirmation)' }
        },
        required: ['projectId', 'projectName']
      }
    });

    this.tools.set('delete_regulation', {
      name: 'delete_regulation',
      description: 'Delete a regulation from the database. This is a destructive action and requires approval.',
      category: 'database',
      requiresApproval: true,
      destructive: true,
      input_schema: {
        type: 'object',
        properties: {
          regulationId: { type: 'string', description: 'ID of the regulation to delete' },
          regulationName: { type: 'string', description: 'Name of the regulation (for confirmation)' }
        },
        required: ['regulationId', 'regulationName']
      }
    });
  }

  private registerWebTools(): void {
    this.tools.set('web_search', {
      name: 'web_search',
      description: 'Search the web for information. Use this when you need current information, facts, or data not available in your knowledge.',
      category: 'web',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to execute'
          },
          reason: {
            type: 'string',
            description: 'Why you need to search the web (explain to user)'
          }
        },
        required: ['query', 'reason']
      }
    });

    this.tools.set('scrape_google_places', {
      name: 'scrape_google_places',
      description: 'Scrape office data from Google Places. Use this to automatically gather information about an architectural office.',
      category: 'web',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          officeName: {
            type: 'string',
            description: 'Name of the office to scrape'
          },
          city: {
            type: 'string',
            description: 'City where the office is located'
          }
        },
        required: ['officeName', 'city']
      }
    });
  }

  private registerNoteSystemTools(): void {
    this.tools.set('activate_note_system', {
      name: 'activate_note_system',
      description: 'Activate the specialized Note System AI to process unstructured text and create database entities. Use this when user provides raw text data about offices, projects, or regulations.',
      category: 'note_system',
      requiresApproval: true,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          unstructuredText: {
            type: 'string',
            description: 'The raw text to process'
          },
          expectedEntities: {
            type: 'array',
            items: { type: 'string' },
            description: 'What type of entities are expected in the text (office, project, regulation, etc.)'
          }
        },
        required: ['unstructuredText']
      }
    });
  }

  private registerMeditationTools(): void {
    this.tools.set('create_meditation', {
      name: 'create_meditation',
      description: 'Create a new meditation in the database. Use this when user wants to create a meditative text or reflection.',
      category: 'meditation',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Meditation title'
          },
          content: {
            type: 'string',
            description: 'Meditation content/text'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for categorization'
          }
        },
        required: ['title', 'content']
      }
    });

    this.tools.set('query_meditations', {
      name: 'query_meditations',
      description: 'Query meditations from the database. Use this to search for or retrieve existing meditations.',
      category: 'meditation',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {
          filters: {
            type: 'object',
            description: 'Filters to apply',
            properties: {
              tag: { type: 'string', description: 'Filter by tag' },
              searchTerm: { type: 'string', description: 'Search in title/content' }
            }
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
            default: 20
          }
        }
      }
    });
  }

  private registerSystemTools(): void {
    this.tools.set('get_current_context', {
      name: 'get_current_context',
      description: 'Get information about the current app state, page, and user context. Use this to understand where the user is and what they are viewing.',
      category: 'system',
      requiresApproval: false,
      destructive: false,
      input_schema: {
        type: 'object',
        properties: {}
      }
    });
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  public getToolsForClaude(toolNames?: string[]): ClaudeTool[] {
    let toolsToSend: ToolDefinition[];
    
    if (toolNames && toolNames.length > 0) {
      toolsToSend = toolNames
        .map(name => this.tools.get(name))
        .filter(tool => tool !== undefined) as ToolDefinition[];
    } else {
      toolsToSend = this.getAllTools();
    }

    return toolsToSend.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema
    }));
  }
}

