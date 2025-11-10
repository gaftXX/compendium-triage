import { ToolDefinition } from './toolRegistry';
import { ContextProvider } from './contextProvider';
import { navigationService } from '../../renderer/src/services/navigation/navigationService';
import { firestoreOperations } from '../../renderer/src/services/firebase/firestoreOperations';
import { NoteProcessing } from '../../noteSystem/noteProcessing';
import { getOfficeFullProfile } from '../../renderer/src/services/data/officeProfileService';
import { Office, Project, Regulation } from '../../renderer/src/types/firestore';
import { GeoPoint, Timestamp } from 'firebase/firestore';

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  message: string;
}

export class ToolExecutor {
  private static instance: ToolExecutor;
  private contextProvider: ContextProvider;
  private noteProcessing: NoteProcessing;

  private constructor() {
    this.contextProvider = ContextProvider.getInstance();
    this.noteProcessing = NoteProcessing.getInstance();
  }

  public static getInstance(): ToolExecutor {
    if (!ToolExecutor.instance) {
      ToolExecutor.instance = new ToolExecutor();
    }
    return ToolExecutor.instance;
  }

  public async executeTool(
    tool: ToolDefinition,
    input: Record<string, any>
  ): Promise<ToolExecutionResult> {
    console.log(`Executing tool: ${tool.name}`, input);

    try {
      switch (tool.category) {
        case 'navigation':
          return await this.executeNavigationTool(tool.name, input);
        case 'database':
          return await this.executeDatabaseTool(tool.name, input);
        case 'web':
          return await this.executeWebTool(tool.name, input);
        case 'note_system':
          return await this.executeNoteSystemTool(tool.name, input);
        case 'meditation':
          return await this.executeMeditationTool(tool.name, input);
        case 'system':
          return await this.executeSystemTool(tool.name, input);
        default:
          return {
            success: false,
            error: 'Unknown tool category',
            message: `Tool category ${tool.category} is not supported`
          };
      }
    } catch (error) {
      console.error(`Error executing tool ${tool.name}:`, error);
      return {
        success: false,
        error: (error as Error).message,
        message: `Failed to execute ${tool.name}: ${(error as Error).message}`
      };
    }
  }

  private async executeNavigationTool(toolName: string, input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'navigate_to_page': {
        const { page } = input;
        
        switch (page) {
          case 'bt-view':
            navigationService.navigateTo('bt-view');
            this.contextProvider.setCurrentPage('bt-view');
            this.contextProvider.addRecentAction('Navigated to BT View');
            break;
          case 'offices-list':
            navigationService.navigateToOffices();
            this.contextProvider.setCurrentPage('offices-list');
            this.contextProvider.addRecentAction('Navigated to Offices List');
            break;
          case 'projects-list':
            navigationService.navigateToProjects();
            this.contextProvider.setCurrentPage('projects-list');
            this.contextProvider.addRecentAction('Navigated to Projects List');
            break;
          case 'regulations-list':
            navigationService.navigateToRegulatory();
            this.contextProvider.setCurrentPage('regulations-list');
            this.contextProvider.addRecentAction('Navigated to Regulations List');
            break;
          case 'map':
            navigationService.navigateToMap();
            this.contextProvider.setCurrentPage('map');
            this.contextProvider.addRecentAction('Navigated to Map');
            break;
          case 'meditations-list':
            navigationService.navigateToMeditations();
            this.contextProvider.setCurrentPage('meditations-list');
            this.contextProvider.addRecentAction('Navigated to Meditations List');
            break;
          default:
            return {
              success: false,
              error: 'Unknown page',
              message: `Page ${page} is not recognized`
            };
        }

        return {
          success: true,
          message: `Navigated to ${page}`
        };
      }

      case 'open_window': {
        const { windowType, entityId } = input;
        this.contextProvider.addOpenWindow(windowType);
        this.contextProvider.addRecentAction(`Opened ${windowType} window`);
        
        return {
          success: true,
          message: `Opened ${windowType} window`,
          result: { windowType, entityId }
        };
      }

      default:
        return {
          success: false,
          error: 'Unknown navigation tool',
          message: `Navigation tool ${toolName} is not implemented`
        };
    }
  }

  private async executeDatabaseTool(toolName: string, input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'query_offices': {
        const { filters = {}, limit = 20 } = input;
        const result = await firestoreOperations.queryDocuments<Office>('offices', {
          filters: this.buildFirestoreFilters(filters),
          limit
        });

        if (result.success && result.data) {
          const offices = result.data;
          this.contextProvider.addRecentAction(`Queried ${offices.length} offices`);

          let message: string;
          if (offices.length === 0) {
            message = 'No offices found matching the requested filters.';
          } else {
            const officeLines = offices.slice(0, 5).map((office) => {
              const city = office.location?.headquarters?.city;
              const country = office.location?.headquarters?.country;
              const locationText = [city, country].filter(Boolean).join(', ') || 'Location unknown';
              return `• ${office.name || office.officialName || office.id} — ${locationText}`;
            });

            message = `Found ${offices.length} office${offices.length === 1 ? '' : 's'}.\n${officeLines.join('\n')}`;

            if (offices.length > 5) {
              message += `\n…and ${offices.length - 5} more.`;
            }
          }

          return {
            success: true,
            result: offices,
            message
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to query offices'
          };
        }
      }

      case 'get_office_full_profile': {
        const { officeId } = input;

        if (!officeId || typeof officeId !== 'string') {
          return {
            success: false,
            error: 'Invalid officeId',
            message: 'officeId must be provided to load a full profile.',
          };
        }

        const profileResult = await getOfficeFullProfile(officeId);
        if (!profileResult.success || !profileResult.data) {
          return {
            success: false,
            error: profileResult.error || 'Failed to retrieve office profile.',
            message: profileResult.error || `Unable to load profile for office ${officeId}`,
          };
        }

        const officeName = profileResult.data.office.name || profileResult.data.office.officialName || officeId;
        this.contextProvider.setSelectedEntity('office', profileResult.data.office.id, officeName);
        this.contextProvider.addRecentAction(`Loaded full profile for ${officeName}`);

        return {
          success: true,
          result: profileResult.data,
          message: `Loaded full profile for ${officeName}${
            profileResult.warnings && profileResult.warnings.length > 0
              ? ` (warnings: ${profileResult.warnings.join(' | ')})`
              : ''
          }`,
        };
      }

      case 'query_projects': {
        const { filters = {}, limit = 20 } = input;
        const result = await firestoreOperations.queryDocuments<Project>('projects', {
          filters: this.buildFirestoreFilters(filters),
          limit
        });

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Queried ${result.data.length} projects`);
          return {
            success: true,
            result: result.data,
            message: `Found ${result.data.length} projects`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to query projects'
          };
        }
      }

      case 'query_regulations': {
        const { filters = {}, limit = 20 } = input;
        const result = await firestoreOperations.queryDocuments<Regulation>('regulations', {
          filters: this.buildFirestoreFilters(filters),
          limit
        });

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Queried ${result.data.length} regulations`);
          return {
            success: true,
            result: result.data,
            message: `Found ${result.data.length} regulations`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to query regulations'
          };
        }
      }

      case 'create_office': {
        const officeData: Partial<Office> = {
          name: input.name,
          officialName: input.officialName || input.name,
          founded: input.founded,
          status: 'active',
          website: input.website,
          location: {
            headquarters: {
              city: input.city,
              country: input.country,
              address: input.address || '',
              coordinates: new GeoPoint(0, 0)
            },
            otherOffices: []
          },
          specializations: input.specializations || [],
          notableWorks: [],
          size: {},
          connectionCounts: {
            totalProjects: 0,
            activeProjects: 0,
            clients: 0,
            competitors: 0,
            suppliers: 0
          }
        };

        const result = await firestoreOperations.createDocument('offices', officeData);

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Created office: ${input.name}`);
          return {
            success: true,
            result: result.data,
            message: `Created office ${input.name}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to create office'
          };
        }
      }

      case 'create_project': {
        const projectData: Partial<Project> = {
          projectName: input.projectName,
          officeId: input.officeId || '',
          cityId: input.cityId || '',
          clientId: input.clientId || '',
          location: {
            city: input.city,
            country: input.country,
            address: input.address || '',
            coordinates: new GeoPoint(0, 0)
          },
          details: {
            projectType: input.projectType || 'mixed-use',
            size: input.size || 0,
            description: input.description || ''
          },
          status: input.status || 'concept',
          timeline: {
            startDate: Timestamp.now(),
            expectedCompletion: Timestamp.now()
          },
          financial: {
            budget: input.budget || 0,
            currency: input.currency || 'USD'
          }
        };

        const result = await firestoreOperations.createDocument('projects', projectData);

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Created project: ${input.projectName}`);
          return {
            success: true,
            result: result.data,
            message: `Created project ${input.projectName}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to create project'
          };
        }
      }

      case 'create_regulation': {
        const regulationData: Partial<Regulation> = {
          name: input.name,
          jurisdiction: {
            level: input.jurisdictionLevel || 'city',
            country: input.country || 'Unknown',
            countryName: input.country || 'Unknown',
            cityName: input.city,
            scope: {
              appliesToCountry: true,
              appliesToState: false,
              appliesToCities: input.city ? [input.city] : [],
              appliesToProjectTypes: []
            }
          },
          regulationType: input.regulationType,
          description: input.description || '',
          requirements: [],
          compliance: {
            mandatory: true,
            penalties: {
              fines: '',
              criminal: false,
              projectStoppage: false
            },
            requiredCertifications: [],
            inspectionRequired: false,
            complianceCost: {
              estimated: 0,
              currency: 'USD',
              perProjectType: {}
            },
            documentationRequired: []
          }
        };

        const result = await firestoreOperations.createDocument('regulations', regulationData);

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Created regulation: ${input.name}`);
          return {
            success: true,
            result: result.data,
            message: `Created regulation ${input.name}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to create regulation'
          };
        }
      }

      case 'update_office': {
        const { officeId, updates } = input;
        const result = await firestoreOperations.updateDocument('offices', officeId, updates);

        if (result.success) {
          this.contextProvider.addRecentAction(`Updated office: ${officeId}`);
          return {
            success: true,
            result: result.data,
            message: `Updated office ${officeId}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to update office'
          };
        }
      }

      case 'delete_office': {
        const { officeId, officeName } = input;
        const result = await firestoreOperations.deleteDocument('offices', officeId);

        if (result.success) {
          this.contextProvider.addRecentAction(`Deleted office: ${officeName}`);
          return {
            success: true,
            message: `Deleted office ${officeName}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to delete office'
          };
        }
      }

      case 'delete_project': {
        const { projectId, projectName } = input;
        const result = await firestoreOperations.deleteDocument('projects', projectId);

        if (result.success) {
          this.contextProvider.addRecentAction(`Deleted project: ${projectName}`);
          return {
            success: true,
            message: `Deleted project ${projectName}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to delete project'
          };
        }
      }

      case 'delete_regulation': {
        const { regulationId, regulationName } = input;
        const result = await firestoreOperations.deleteDocument('regulations', regulationId);

        if (result.success) {
          this.contextProvider.addRecentAction(`Deleted regulation: ${regulationName}`);
          return {
            success: true,
            message: `Deleted regulation ${regulationName}`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to delete regulation'
          };
        }
      }

      default:
        return {
          success: false,
          error: 'Unknown database tool',
          message: `Database tool ${toolName} is not implemented`
        };
    }
  }

  private async executeWebTool(toolName: string, input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'web_search':
        return {
          success: true,
          message: 'Web search initiated (requires external implementation)',
          result: { query: input.query, reason: input.reason }
        };

      case 'scrape_google_places':
        return {
          success: true,
          message: 'Google Places scraping initiated (requires external implementation)',
          result: { officeName: input.officeName, city: input.city }
        };

      default:
        return {
          success: false,
          error: 'Unknown web tool',
          message: `Web tool ${toolName} is not implemented`
        };
    }
  }

  private async executeNoteSystemTool(toolName: string, input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'activate_note_system': {
        const { unstructuredText } = input;
        
        try {
          await this.noteProcessing.processAndCreateEntities(unstructuredText);
          this.contextProvider.addRecentAction('Processed unstructured text with Note System');
          
          return {
            success: true,
            message: 'Note system successfully processed the text and created entities'
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
            message: 'Failed to process text with Note System'
          };
        }
      }

      default:
        return {
          success: false,
          error: 'Unknown note system tool',
          message: `Note system tool ${toolName} is not implemented`
        };
    }
  }

  private async executeMeditationTool(toolName: string, input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'create_meditation': {
        const meditationData = {
          title: input.title,
          text: input.content,
          tags: input.tags || []
        };

        const result = await firestoreOperations.createDocument('meditations', meditationData);

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Created meditation: ${input.title}`);
          return {
            success: true,
            result: result.data,
            message: `Created meditation "${input.title}"`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to create meditation'
          };
        }
      }

      case 'query_meditations': {
        const { filters = {}, limit = 20 } = input;
        const result = await firestoreOperations.queryDocuments('meditations', {
          filters: this.buildFirestoreFilters(filters),
          limit
        });

        if (result.success && result.data) {
          this.contextProvider.addRecentAction(`Queried ${result.data.length} meditations`);
          return {
            success: true,
            result: result.data,
            message: `Found ${result.data.length} meditations`
          };
        } else {
          return {
            success: false,
            error: result.error,
            message: 'Failed to query meditations'
          };
        }
      }

      default:
        return {
          success: false,
          error: 'Unknown meditation tool',
          message: `Meditation tool ${toolName} is not implemented`
        };
    }
  }

  private async executeSystemTool(toolName: string, _input: Record<string, any>): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'get_current_context': {
        const context = this.contextProvider.getContext();
        return {
          success: true,
          result: context,
          message: 'Retrieved current app context'
        };
      }

      default:
        return {
          success: false,
          error: 'Unknown system tool',
          message: `System tool ${toolName} is not implemented`
        };
    }
  }

  private buildFirestoreFilters(filters: Record<string, any>): any[] {
    const firestoreFilters: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        switch (key) {
          case 'city':
            firestoreFilters.push({
              field: 'location.headquarters.city',
              operator: '==',
              value: value
            });
            break;
          case 'country':
            firestoreFilters.push({
              field: 'location.headquarters.country',
              operator: '==',
              value: value
            });
            break;
          case 'specialization':
            firestoreFilters.push({
              field: 'specializations',
              operator: 'array-contains',
              value: value
            });
            break;
          case 'status':
            firestoreFilters.push({
              field: 'status',
              operator: '==',
              value: value
            });
            break;
          case 'foundedAfter':
            firestoreFilters.push({
              field: 'founded',
              operator: '>',
              value: value
            });
            break;
          case 'foundedBefore':
            firestoreFilters.push({
              field: 'founded',
              operator: '<',
              value: value
            });
            break;
          case 'projectType':
            firestoreFilters.push({
              field: 'details.projectType',
              operator: '==',
              value: value
            });
            break;
          case 'officeId':
            firestoreFilters.push({
              field: 'architects.lead',
              operator: 'array-contains',
              value: value
            });
            break;
          case 'regulationType':
            firestoreFilters.push({
              field: 'regulationType',
              operator: '==',
              value: value
            });
            break;
          case 'jurisdictionLevel':
            firestoreFilters.push({
              field: 'jurisdiction.level',
              operator: '==',
              value: value
            });
            break;
        }
      }
    }

    return firestoreFilters;
  }
}

