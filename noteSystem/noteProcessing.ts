// Note Processing - AI Entity Creation System

import { Office, Project, Regulation, Workforce, Client, Technology, Financial, SupplyChain, LandData, CityData, ProjectData, CompanyStructure, DivisionPercentages, NewsArticle, PoliticalContext } from '../renderer/src/types/firestore';

export interface ProcessingResult {
  success: boolean;
  entitiesCreated: {
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
    workforce: Workforce[];
    mergedOffices?: Office[];
  };
  workforceUpdates?: {
    officeId: string;
    officeName: string;
    employeesAdded: number;
    employeesUpdated: number;
    totalEmployees: number;
  }[];
  summary: string;
  totalCreated: number;
  webSearchResults?: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  };
}

export class NoteProcessing {
  private static instance: NoteProcessing;

  private constructor() {}

  public static getInstance(): NoteProcessing {
    if (!NoteProcessing.instance) {
      NoteProcessing.instance = new NoteProcessing();
    }
    return NoteProcessing.instance;
  }

  /**
   * Main function: Process text and create entities in Firebase
   */
  public async processAndCreateEntities(inputText: string): Promise<ProcessingResult> {
    try {
      console.log('Note Processing: Starting text processing');
      console.log('Input text length:', inputText.length);
      console.log('Input text preview:', inputText.substring(0, 100) + '...');

      // Step 0: Translation to English
      console.log('Step 0: Translating to English if needed...');
      const { TranslationService } = await import('./translationService');
      const translationService = TranslationService.getInstance();
      const translationResult = await translationService.translateToEnglish(inputText);
      
      let processedText = inputText;
      if (translationResult.success && translationResult.translatedText !== inputText) {
        console.log('Text translated to English');
        console.log('Original text:', inputText.substring(0, 100) + '...');
        console.log('Translated text:', translationResult.translatedText.substring(0, 100) + '...');
        processedText = translationResult.translatedText;
      } else {
        console.log('Text is already in English or translation not needed');
      }

      // Step 1: AI Analysis
      console.log('Step 1: Starting AI analysis...');
      const aiResult = await this.analyzeWithAI(processedText);
      
      console.log('AI Analysis Result:', {
        success: aiResult.success,
        officesFound: aiResult.entities.offices.length,
        projectsFound: aiResult.entities.projects.length,
        regulationsFound: aiResult.entities.regulations.length,
        employeesFound: aiResult.employees?.length || 0,
        clientsFound: aiResult.clients?.length || 0,
        technologyFound: aiResult.technology?.length || 0,
        financialsFound: aiResult.financials?.length || 0,
        supplyChainFound: aiResult.supplyChain?.length || 0,
        landDataFound: aiResult.landData?.length || 0,
        cityDataFound: aiResult.cityData?.length || 0,
        projectDataFound: aiResult.projectData?.length || 0,
        companyStructureFound: aiResult.companyStructure?.length || 0,
        divisionPercentagesFound: aiResult.divisionPercentages?.length || 0,
        newsArticlesFound: aiResult.newsArticles?.length || 0,
        politicalContextFound: aiResult.politicalContext?.length || 0
      });

      if (!aiResult.success) {
        console.log('AI analysis failed');
        return {
          success: false,
          entitiesCreated: { offices: [], projects: [], regulations: [], workforce: [], mergedOffices: [] },
          summary: 'Failed to analyze text with AI',
          totalCreated: 0
        };
      }

      // Step 1.5: Web search for missing location data
      console.log('Step 1.5: Web search for missing location data...');
      const webSearchResults = await this.enrichWithWebSearch(aiResult.entities, processedText);

    // Step 2: Save user input to Firebase first
    console.log('Step 2: Saving user input to Firebase...');
    await this.saveUserInput(inputText, translationResult);

    // Step 3: Create entities in Firebase (only with valid location data)
    console.log('Step 3: Creating entities in Firebase...');
      const createdEntities = await this.createEntitiesInFirebase(
        aiResult.entities,
        aiResult.employees,
        aiResult.employeeDistribution,
        aiResult.clients,
        aiResult.technology,
        aiResult.financials,
        aiResult.supplyChain,
        aiResult.landData,
        aiResult.cityData,
        aiResult.projectData,
        aiResult.companyStructure,
        aiResult.divisionPercentages,
        aiResult.newsArticles,
        aiResult.politicalContext,
        inputText
      );

      console.log('Firebase Creation Result:', {
        officesCreated: createdEntities.offices.length,
        projectsCreated: createdEntities.projects.length,
        regulationsCreated: createdEntities.regulations.length,
        workforceCreated: createdEntities.workforce.length
      });

      // Update user input with processing results
      await this.updateUserInputProcessing(inputText, createdEntities, this.generateSummary(createdEntities, createdEntities.workforceUpdates));

      return {
        success: true,
        entitiesCreated: createdEntities,
        workforceUpdates: createdEntities.workforceUpdates.length > 0 ? createdEntities.workforceUpdates : undefined,
        summary: this.generateSummary(createdEntities, createdEntities.workforceUpdates),
        totalCreated: createdEntities.offices.length + createdEntities.projects.length + createdEntities.regulations.length + createdEntities.workforce.length + (createdEntities.mergedOffices?.length || 0),
        webSearchResults: webSearchResults
      };

    } catch (error) {
      console.error('V2 processing error:', error);
      return {
        success: false,
        entitiesCreated: { offices: [], projects: [], regulations: [], mergedOffices: [] },
        summary: 'Error processing text: ' + (error as Error).message,
        totalCreated: 0
      };
    }
  }

  /**
   * Process text and create entities in Firebase WITHOUT web search (for location prompt flow)
   */
  public async processAndCreateEntitiesWithoutWebSearch(inputText: string): Promise<ProcessingResult> {
    try {
      console.log('Note Processing: Starting text processing (without web search)');
      console.log('Input text length:', inputText.length);
      console.log('Input text preview:', inputText.substring(0, 100) + '...');

      // Step 0: Translation to English
      console.log('Step 0: Translating to English if needed...');
      const { TranslationService } = await import('./translationService');
      const translationService = TranslationService.getInstance();
      const translationResult = await translationService.translateToEnglish(inputText);
      
      let processedText = inputText;
      if (translationResult.success && translationResult.translatedText !== inputText) {
        console.log('Text translated to English');
        console.log('Original text:', inputText.substring(0, 100) + '...');
        console.log('Translated text:', translationResult.translatedText.substring(0, 100) + '...');
        processedText = translationResult.translatedText;
      } else {
        console.log('Text is already in English or translation not needed');
      }

      // Step 1: AI Analysis
      console.log('Step 1: Starting AI analysis...');
      const aiResult = await this.analyzeWithAI(processedText);
      
      console.log('AI Analysis Result:', {
        success: aiResult.success,
        officesFound: aiResult.entities.offices.length,
        projectsFound: aiResult.entities.projects.length,
        regulationsFound: aiResult.entities.regulations.length
      });

      if (!aiResult.success) {
        console.log('AI analysis failed');
        return {
          success: false,
          entitiesCreated: { offices: [], projects: [], regulations: [], workforce: [], mergedOffices: [] },
          summary: 'Failed to analyze text with AI',
          totalCreated: 0
        };
      }

      // SKIP Step 1.5: Web search (this is the key difference)
      console.log('Skipping web search for location prompt flow...');

      // Step 2: Save user input to Firebase first
      console.log('Step 2: Saving user input to Firebase...');
      await this.saveUserInput(inputText, translationResult);

      // Step 3: Create entities in Firebase (only with valid location data)
      console.log('Step 3: Creating entities in Firebase...');
      const createdEntities = await this.createEntitiesInFirebase(
        aiResult.entities,
        aiResult.employees,
        aiResult.employeeDistribution,
        aiResult.clients,
        aiResult.technology,
        aiResult.financials,
        aiResult.supplyChain,
        aiResult.landData,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        inputText
      );

      console.log('Firebase Creation Result:', {
        officesCreated: createdEntities.offices.length,
        projectsCreated: createdEntities.projects.length,
        regulationsCreated: createdEntities.regulations.length,
        workforceCreated: createdEntities.workforce.length
      });

      // Update user input with processing results
      await this.updateUserInputProcessing(inputText, createdEntities, this.generateSummary(createdEntities, createdEntities.workforceUpdates));

      return {
        success: true,
        entitiesCreated: createdEntities,
        workforceUpdates: createdEntities.workforceUpdates.length > 0 ? createdEntities.workforceUpdates : undefined,
        summary: this.generateSummary(createdEntities, createdEntities.workforceUpdates),
        totalCreated: createdEntities.offices.length + createdEntities.projects.length + createdEntities.regulations.length + createdEntities.workforce.length + (createdEntities.mergedOffices?.length || 0)
      };

    } catch (error) {
      console.error('Processing error (without web search):', error);
      return {
        success: false,
        entitiesCreated: { offices: [], projects: [], regulations: [], mergedOffices: [] },
        summary: 'Error processing text: ' + (error as Error).message,
        totalCreated: 0
      };
    }
  }

  /**
   * AI Analysis - Extract entities from text
   */
  private async analyzeWithAI(text: string): Promise<{
    success: boolean;
    entities: {
      offices: Partial<Office>[];
      projects: Partial<Project>[];
      regulations: Partial<Regulation>[];
    };
    employees?: Array<{
      name: string;
      role?: string;
      description?: string;
      expertise?: string[];
      location?: {
        city?: string;
        country?: string;
      };
    }>;
    employeeDistribution?: {
      architects?: number;
      engineers?: number;
      designers?: number;
      administrative?: number;
    };
  }> {
    console.log('Starting AI text analysis...');
    console.log('Text analysis details:', {
      textLength: text.length,
      wordCount: text.split(' ').length,
      hasGensler: text.toLowerCase().includes('gensler'),
      hasArchitectureFirm: text.toLowerCase().includes('architecture firm'),
      hasProject: text.toLowerCase().includes('project'),
      hasBuilding: text.toLowerCase().includes('building'),
      hasRegulation: text.toLowerCase().includes('regulation')
    });

    // Use real Claude AI for analysis
    console.log('Attempting to use Claude AI for analysis...');
    
    try {
      const { ClaudeAIService } = await import('../renderer/src/services/claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      
      console.log('Claude AI service available, using real AI analysis');
      const aiResult = await claudeAI.analyzeText(text);
      
      console.log('Claude AI analysis result:', {
        category: aiResult.categorization.category,
        confidence: aiResult.categorization.confidence,
        reasoning: aiResult.categorization.reasoning
      });
      
      // Convert Claude result to our format
      const entities = {
        offices: [] as Partial<Office>[],
        projects: [] as Partial<Project>[],
        regulations: [] as Partial<Regulation>[]
      };
      
      if (aiResult.categorization.category === 'office' && aiResult.extraction.extractedData) {
        entities.offices.push(aiResult.extraction.extractedData as Partial<Office>);
      } else if (aiResult.categorization.category === 'project' && aiResult.extraction.extractedData) {
        entities.projects.push(aiResult.extraction.extractedData as Partial<Project>);
      } else if (aiResult.categorization.category === 'regulation' && aiResult.extraction.extractedData) {
        entities.regulations.push(aiResult.extraction.extractedData as Partial<Regulation>);
      }
      
      return {
        success: true,
        entities,
        employees: aiResult.extraction.employees,
        employeeDistribution: aiResult.extraction.employeeDistribution,
        // Tier 3 entities
        clients: aiResult.extraction.clients || [],
        technology: aiResult.extraction.technology || [],
        financials: aiResult.extraction.financials || [],
        supplyChain: aiResult.extraction.supplyChain || [],
        landData: aiResult.extraction.landData || [],
        cityData: aiResult.extraction.cityData || [],
        projectData: aiResult.extraction.projectData || [],
        companyStructure: aiResult.extraction.companyStructure || [],
        divisionPercentages: aiResult.extraction.divisionPercentages || [],
        newsArticles: aiResult.extraction.newsArticles || [],
        politicalContext: aiResult.extraction.politicalContext || []
      };
      
    } catch (error) {
      console.log('Claude AI not available:', error);
    }

    // Claude AI is required - cannot process without it
    console.log('Claude AI not available - cannot process without AI analysis');
    throw new Error('Claude AI service is required for note processing. Please ensure the API key is configured.');
  }

  /**
   * Create or update entities in Firebase using EntityUpdateService for smart merging
   */
  private async createEntitiesInFirebase(
    entities: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
    },
    employees?: Array<{
      name: string;
      role?: string;
      description?: string;
      expertise?: string[];
      location?: {
        city?: string;
        country?: string;
      };
    }>,
    employeeDistribution?: {
      architects?: number;
      engineers?: number;
      designers?: number;
      administrative?: number;
    },
    clients?: Partial<Client>[],
    technology?: Partial<Technology>[],
    financials?: Partial<Financial>[],
    supplyChain?: Partial<SupplyChain>[],
    landData?: Partial<LandData>[],
    cityData?: Partial<CityData>[],
    projectData?: Partial<ProjectData>[],
    companyStructure?: Partial<CompanyStructure>[],
    divisionPercentages?: Partial<DivisionPercentages>[],
    newsArticles?: Partial<NewsArticle>[],
    politicalContext?: Partial<PoliticalContext>[],
    userInputText?: string
  ): Promise<{
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
    workforce: Workforce[];
    mergedOffices: Office[];
    clients: Client[];
    technology: Technology[];
    financials: Financial[];
    supplyChain: SupplyChain[];
    landData: LandData[];
    cityData: CityData[];
    projectData: ProjectData[];
    companyStructure: CompanyStructure[];
    divisionPercentages: DivisionPercentages[];
    newsArticles: NewsArticle[];
    politicalContext: PoliticalContext[];
    workforceUpdates: {
      officeId: string;
      officeName: string;
      employeesAdded: number;
      employeesUpdated: number;
      totalEmployees: number;
    }[];
  }> {
    const { FirestoreNoteService } = await import('./firestoreNoteService');
    const firestoreService = FirestoreNoteService.getInstance();

    const createdEntities = {
      offices: [] as Office[],
      projects: [] as Project[],
      regulations: [] as Regulation[],
      workforce: [] as Workforce[],
      mergedOffices: [] as Office[],
      clients: [] as Client[],
      technology: [] as Technology[],
      financials: [] as Financial[],
      supplyChain: [] as SupplyChain[],
      landData: [] as LandData[],
      cityData: [] as CityData[],
      projectData: [] as ProjectData[],
      companyStructure: [] as CompanyStructure[],
      divisionPercentages: [] as DivisionPercentages[],
      newsArticles: [] as NewsArticle[],
      politicalContext: [] as PoliticalContext[]
    };

    // Create or update offices using EntityUpdateService
    console.log(`Processing ${entities.offices.length} office(s)...`);
    const { EntityUpdateService } = await import('./entityUpdateService');
    const entityUpdateService = EntityUpdateService.getInstance();
    
    for (const officeData of entities.offices) {
      try {
        console.log('Processing office:', (officeData as Partial<Office>).name);
        
        // Validate required fields before processing
        if (!officeData.name || officeData.name.trim() === '') {
          console.log('Skipping office - no valid name provided');
          continue;
        }

        // Search for existing office - try multiple name variations
        let searchResult = await entityUpdateService.searchExistingOffice(officeData.name);
        
        // If not found and we have an officialName, try that too
        if (!searchResult.found && officeData.officialName && officeData.officialName !== officeData.name) {
          console.log(`Trying to find office by officialName: ${officeData.officialName}`);
          searchResult = await entityUpdateService.searchExistingOffice(officeData.officialName);
        }
        
        // If still not found, try extracting the main name parts (remove "Architects", "Architecture", "Architect" etc.)
        if (!searchResult.found && officeData.name) {
          const nameVariations = this.generateOfficeNameVariations(officeData.name);
          for (const variation of nameVariations) {
            if (variation !== officeData.name) {
              console.log(`Trying office name variation: ${variation}`);
              searchResult = await entityUpdateService.searchExistingOffice(variation);
              if (searchResult.found) break;
            }
          }
        }
        
        if (searchResult.found && searchResult.entity) {
          // Merge with existing office
          console.log(`Merging with existing office: ${'name' in searchResult.entity ? searchResult.entity.name : 'Unknown'}`);
          const mergeResult = await entityUpdateService.mergeOfficeData(
            searchResult.entity as Office, 
            officeData
          );
          
          if (mergeResult.success) {
            console.log(`Office merged successfully: ${mergeResult.mergedFields.join(', ')}`);
            createdEntities.mergedOffices.push(mergeResult.entity as Office);
          } else {
            console.error(`Failed to merge office: ${mergeResult.error}`);
          }
        } else {
          // Create new office
          console.log(`Creating new office: ${officeData.name}`);
        
        // CRITICAL: Headquarters location is REQUIRED when creating a new office
        if (!officeData.location?.headquarters?.city || 
            !officeData.location?.headquarters?.country ||
            officeData.location.headquarters.city === 'Unknown' ||
            officeData.location.headquarters.country === 'Unknown') {
          console.log('Skipping office - headquarters location is required and must be valid');
          console.log('Office data:', {
            name: officeData.name,
            hasLocation: !!officeData.location,
            hasCity: !!officeData.location?.headquarters?.city,
            hasCountry: !!officeData.location?.headquarters?.country,
            city: officeData.location?.headquarters?.city,
            country: officeData.location?.headquarters?.country
          });
          continue;
        }
        
        // Generate ID if missing or invalid - requires headquarters location
        if (!officeData.id || officeData.id.includes('XX') || officeData.id.includes('NO_LOCATION_DATA')) {
          if (officeData.location?.headquarters?.city && officeData.location?.headquarters?.country) {
            // Use location-based ID if available
            officeData.id = this.generateOfficeIdWithLocation(
              officeData.name, 
              officeData.location.headquarters.country, 
              officeData.location.headquarters.city
            );
          } else {
            // Use fallback ID based on office name (shouldn't happen if validation above works)
            officeData.id = this.generateFallbackOfficeId(officeData.name);
          }
          console.log('Generated office ID:', officeData.id);
        }
        
        // Build office data - ensure location is properly structured with required headquarters
        const completeOfficeData: any = {
          ...officeData,
          id: officeData.id,
          location: {
            headquarters: {
              city: officeData.location.headquarters.city,
              country: officeData.location.headquarters.country,
              ...(officeData.location.headquarters.coordinates && { coordinates: officeData.location.headquarters.coordinates }),
              ...(officeData.location.headquarters.address && { address: officeData.location.headquarters.address }),
              ...(officeData.location.headquarters.neighborhood && { neighborhood: officeData.location.headquarters.neighborhood })
            },
            otherOffices: officeData.location.otherOffices || []
          },
          specializations: officeData.specializations || [],
          notableWorks: officeData.notableWorks || [],
          connectionCounts: officeData.connectionCounts || {
            totalProjects: 0,
            activeProjects: 0,
            clients: 0,
            competitors: 0,
            suppliers: 0
          },
          infoEntries: 1
        };
        
        // Don't set employeeCount from officeData - it will be calculated from workforce
        // Only include sizeCategory and annualRevenue if provided
        if (officeData.size?.sizeCategory && 
            ['boutique', 'medium', 'large', 'global'].includes(officeData.size.sizeCategory)) {
          completeOfficeData.size = {
            // Don't set employeeCount - it's calculated from workforce records
            sizeCategory: officeData.size.sizeCategory,
            annualRevenue: officeData.size.annualRevenue || undefined
          };
          console.log('Valid size data included (without employeeCount)');
        } else if (officeData.size?.annualRevenue) {
          // If only annualRevenue is provided, include it but don't set employeeCount
          completeOfficeData.size = {
            annualRevenue: officeData.size.annualRevenue
          };
          console.log('Annual revenue included (without employeeCount)');
        } else {
          console.log('Size data omitted (no valid sizeCategory or annualRevenue)');
        }
        
        const result = await firestoreService.saveOffice(completeOfficeData);
        if (result.success && result.data) {
          console.log('Office created successfully:', (result.data as Office).name);
          createdEntities.offices.push(result.data as Office);
        } else {
          console.error('Failed to create office in Firebase:', result.error);
          console.log('Creating local office entity as fallback...');
          
          // Use the location data as provided by AI analysis
          const location = (officeData as Partial<Office>).location;
          
          // Create a local entity with generated ID and timestamps
          const localOffice: Office = {
            id: (officeData as Partial<Office>).id || 'NO_LOCATION_DATA',
            name: (officeData as Partial<Office>).name || 'Unknown Office',
            officialName: (officeData as Partial<Office>).officialName || (officeData as Partial<Office>).name || 'Unknown Office',
            founded: (officeData as Partial<Office>).founded || new Date().getFullYear(),
            status: (officeData as Partial<Office>).status || 'active',
            location: location || {
              headquarters: { city: 'Unknown', country: 'Unknown' },
              otherOffices: []
            },
            size: (officeData as Partial<Office>).size || {
              employeeCount: 0,
              sizeCategory: 'medium',
              annualRevenue: 0
            },
            specializations: (officeData as Partial<Office>).specializations || [],
            notableWorks: (officeData as Partial<Office>).notableWorks || [],
            connectionCounts: (officeData as Partial<Office>).connectionCounts || {
              totalProjects: 0,
              activeProjects: 0,
              clients: 0,
              competitors: 0,
              suppliers: 0
            },
            infoEntries: 1,
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          };
          
            createdEntities.offices.push(localOffice);
            console.log('Local office entity created:', localOffice.name, '(ID:', localOffice.id, ')');
          }
        }
      } catch (error) {
        console.error('Error creating office:', error);
      }
    }

    // Create or update projects using EntityUpdateService
    console.log(`Processing ${entities.projects.length} project(s)...`);
    
    for (const projectData of entities.projects) {
      try {
        console.log('Processing project:', (projectData as Partial<Project>).projectName);
        
        // Validate required fields before processing
        if (!projectData.projectName || projectData.projectName.trim() === '') {
          console.log('Skipping project - no valid project name provided');
          continue;
        }

        // Search for existing project
        const searchResult = await entityUpdateService.searchExistingProject(projectData.projectName);
        
        if (searchResult.found && searchResult.entity) {
          // Merge with existing project
          console.log(`Merging with existing project: ${'projectName' in searchResult.entity ? searchResult.entity.projectName : 'name' in searchResult.entity ? searchResult.entity.name : 'Unknown'}`);
          const mergeResult = await entityUpdateService.mergeProjectData(
            searchResult.entity as Project, 
            projectData
          );
          
          if (mergeResult.success) {
            console.log(`Project merged successfully: ${mergeResult.mergedFields.join(', ')}`);
            createdEntities.projects.push(mergeResult.entity as Project);
          } else {
            console.error(`Failed to merge project: ${mergeResult.error}`);
          }
        } else {
          // Create new project
          console.log(`Creating new project: ${projectData.projectName}`);
          
          const result = await firestoreService.saveProject(projectData);
          if (result.success && result.data) {
            console.log('Project created successfully:', (result.data as Project).projectName);
            createdEntities.projects.push(result.data as Project);
          } else {
            console.error('Failed to create project in Firebase:', result.error);
            console.log('Creating local project entity as fallback...');
          
          // Create a local project entity
          const localProject: Project = {
            id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            projectName: (projectData as Partial<Project>).projectName || 'Unknown Project',
            officeId: (projectData as Partial<Project>).officeId || 'unknown',
            cityId: (projectData as Partial<Project>).cityId || 'unknown',
            clientId: (projectData as Partial<Project>).clientId || 'unknown',
            status: (projectData as Partial<Project>).status || 'planning',
            timeline: (projectData as Partial<Project>).timeline || {
              startDate: new Date() as any,
              expectedCompletion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any
            },
            location: (projectData as Partial<Project>).location || {
              city: 'Unknown',
              country: 'Unknown'
            },
            financial: (projectData as Partial<Project>).financial || {
              budget: 0,
              currency: 'USD'
            },
            details: (projectData as Partial<Project>).details || {
              projectType: 'unknown',
              size: 0,
              description: 'Unknown project'
            },
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          };
          
            createdEntities.projects.push(localProject);
            console.log('Local project entity created:', localProject.projectName, '(ID:', localProject.id, ')');
          }
        }
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }

    // Create or update regulations using EntityUpdateService
    console.log(`Processing ${entities.regulations.length} regulation(s)...`);
    
    for (const regulationData of entities.regulations) {
      try {
        console.log('Processing regulation:', (regulationData as Partial<Regulation>).name);
        
        // Validate required fields before processing
        if (!regulationData.name || regulationData.name.trim() === '') {
          console.log('Skipping regulation - no valid name provided');
          continue;
        }

        // Search for existing regulation
        const searchResult = await entityUpdateService.searchExistingRegulation(regulationData.name);
        
        if (searchResult.found && searchResult.entity) {
          // Merge with existing regulation
          console.log(`Merging with existing regulation: ${'name' in searchResult.entity ? searchResult.entity.name : 'Unknown'}`);
          const mergeResult = await entityUpdateService.mergeRegulationData(
            searchResult.entity as Regulation, 
            regulationData
          );
          
          if (mergeResult.success) {
            console.log(`Regulation merged successfully: ${mergeResult.mergedFields.join(', ')}`);
            createdEntities.regulations.push(mergeResult.entity as Regulation);
          } else {
            console.error(`Failed to merge regulation: ${mergeResult.error}`);
          }
        } else {
          // Create new regulation
          console.log(`Creating new regulation: ${regulationData.name}`);
          
          const result = await firestoreService.saveRegulation(regulationData);
          if (result.success && result.data) {
            console.log('Regulation created successfully:', (result.data as Regulation).name);
            createdEntities.regulations.push(result.data as Regulation);
          } else {
            console.error('Failed to create regulation in Firebase:', result.error);
            console.log('Creating local regulation entity as fallback...');
          
          // Create a local regulation entity
          const localRegulation: Regulation = {
            id: `regulation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            regulationType: (regulationData as Partial<Regulation>).regulationType || 'zoning',
            name: (regulationData as Partial<Regulation>).name || 'Unknown Regulation',
            jurisdiction: (regulationData as Partial<Regulation>).jurisdiction || {
              level: 'city',
              country: 'Unknown',
              countryName: 'Unknown',
              scope: {
                appliesToCountry: false,
                appliesToState: false,
                appliesToCities: [],
                appliesToProjectTypes: []
              }
            },
            hierarchy: (regulationData as Partial<Regulation>).hierarchy || {
              relatedRegulations: []
            },
            effectiveDate: (regulationData as Partial<Regulation>).effectiveDate || new Date() as any,
            version: (regulationData as Partial<Regulation>).version || '1.0',
            description: (regulationData as Partial<Regulation>).description || 'Unknown regulation',
            requirements: (regulationData as Partial<Regulation>).requirements || [],
            compliance: (regulationData as Partial<Regulation>).compliance || {
              mandatory: false,
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
            },
            enforcement: (regulationData as Partial<Regulation>).enforcement || {
              enforcingAuthority: '',
              inspectionFrequency: '',
              complianceRate: 0,
              violationCount: 0
            },
            impact: (regulationData as Partial<Regulation>).impact || {
              level: 'low',
              affectedProjects: [],
              economicImpact: '',
              timelineImpact: '',
              designImpact: ''
            },
            newsArticles: (regulationData as Partial<Regulation>).newsArticles || [],
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          };
          
            createdEntities.regulations.push(localRegulation);
            console.log('Local regulation entity created:', localRegulation.name, '(ID:', localRegulation.id, ')');
          }
        }
      } catch (error) {
        console.error('Error creating regulation:', error);
      }
    }

    // Track workforce updates for summary
    const workforceUpdates: {
      officeId: string;
      officeName: string;
      employeesAdded: number;
      employeesUpdated: number;
      totalEmployees: number;
    }[] = [];

    // If we have employees but no office extracted, try to find office from text or employee context
    if (employees && employees.length > 0 && entities.offices.length === 0 && userInputText) {
      // Try to extract office name from user text if explicitly mentioned
      // Pattern: "goes into [office name] office", "employees of [office name]", "part of [office name]", etc.
      const officeNamePatterns = [
        /(?:goes?\s+(?:into|in|to)|goes\s+in\s+to)\s+([^,\-\.]+?)\s+(?:office|firm|company)/i,
        /employees?\s+of\s+([^,\-\.]+?)\s+(?:office|firm|company)/i,
        /part\s+of\s+([^,\-\.]+?)\s+(?:office|firm|company)/i,
        /works?\s+for\s+([^,\-\.]+?)\s+(?:office|firm|company)/i,
        /([^,\-\.]+?)\s+office[\s,]/i  // "Boris Pena Architecture office"
      ];
      
      let extractedOfficeName: string | null = null;
      for (const pattern of officeNamePatterns) {
        const match = userInputText.match(pattern);
        if (match && match[1]) {
          extractedOfficeName = match[1].trim();
          console.log(`Extracting office name from user text using pattern: "${extractedOfficeName}"`);
          break; // Use first match
        }
      }
      
      if (extractedOfficeName) {
        // Try to find existing office with this name
        const searchResult = await entityUpdateService.searchExistingOffice(extractedOfficeName);
        
        if (searchResult.found && searchResult.entity) {
          console.log(`Found existing office: ${searchResult.entity.name}`);
          entities.offices.push({ name: searchResult.entity.name, id: searchResult.entity.id } as Partial<Office>);
        } else {
          // Try name variations
          const nameVariations = this.generateOfficeNameVariations(extractedOfficeName);
          for (const variation of nameVariations) {
            if (variation !== extractedOfficeName) {
              const varSearchResult = await entityUpdateService.searchExistingOffice(variation);
              if (varSearchResult.found && varSearchResult.entity) {
                console.log(`Found existing office by variation: ${varSearchResult.entity.name}`);
                entities.offices.push({ name: varSearchResult.entity.name, id: varSearchResult.entity.id } as Partial<Office>);
                break;
              }
            }
          }
        }
      }
    }

    // Create/Update Workforce records if employee information is provided
    if (employees && employees.length > 0 && entities.offices.length > 0) {
      console.log(`Processing ${employees.length} employee(s) for workforce records...`);
      
      for (const office of [...createdEntities.offices, ...createdEntities.mergedOffices]) {
        if (!office || !office.id) continue;
        
        try {
          console.log(`Adding employees to workforce for office: ${office.name}`);
          
          // Add employees to the workforce record (creates or updates)
          const workforceResult = await firestoreService.addEmployeesToWorkforce(office.id, employees);
          
          if (workforceResult.success && workforceResult.data) {
            const workforce = workforceResult.data as Workforce;
            createdEntities.workforce.push(workforce);
            
            // Extract counts from the result message
            const message = workforceResult.message || '';
            const addedMatch = message.match(/(\d+) added/);
            const updatedMatch = message.match(/(\d+) updated/);
            const employeesAdded = addedMatch ? parseInt(addedMatch[1]) : 0;
            const employeesUpdated = updatedMatch ? parseInt(updatedMatch[1]) : employees.length;
            
            console.log(`Workforce updated for ${office.name}: ${employeesAdded} added, ${employeesUpdated} updated`);
            
            // Update aggregate data if employee distribution is provided
            if (employeeDistribution && (
              employeeDistribution.architects || 
              employeeDistribution.engineers || 
              employeeDistribution.designers || 
              employeeDistribution.administrative
            )) {
              const aggregateResult = await firestoreService.updateWorkforceAggregate(office.id, {
                totalEmployees: await firestoreService.countUniqueEmployees(office.id),
                distribution: {
                  architects: employeeDistribution.architects || 0,
                  engineers: employeeDistribution.engineers || 0,
                  designers: employeeDistribution.designers || 0,
                  administrative: employeeDistribution.administrative || 0
                },
                retentionRate: 0,
                growthRate: 0
              });
              
              if (aggregateResult.success) {
                console.log(`Aggregate data updated for ${office.name}`);
              }
            }
            
            // Update office employee count based on actual workforce records
            console.log(`Updating employee count for office: ${office.name}`);
            const updateCountResult = await firestoreService.updateOfficeEmployeeCount(office.id);
            
            if (updateCountResult.success) {
              console.log(`Employee count updated for ${office.name}: ${updateCountResult.message}`);
              
              // Get the updated count
              const totalEmployees = await firestoreService.countUniqueEmployees(office.id);
              
              // Track workforce update for summary
              if (employeesAdded > 0 || employeesUpdated > 0) {
                workforceUpdates.push({
                  officeId: office.id,
                  officeName: office.name,
                  employeesAdded,
                  employeesUpdated,
                  totalEmployees
                });
              }
            } else {
              console.error(`Failed to update employee count for ${office.name}:`, updateCountResult.error);
            }
          } else {
            console.error(`Failed to add employees to workforce for ${office.name}:`, workforceResult.error);
          }
        } catch (error) {
          console.error(`Error processing workforce for ${office.name}:`, error);
        }
      }
    }

    // Create Tier 3 entities
    if (clients && clients.length > 0) {
      console.log(`Processing ${clients.length} client(s)...`);
      for (const clientData of clients) {
        if (clientData.clientName) {
          try {
            const result = await firestoreService.saveClient(clientData);
            if (result.success && result.data) {
              createdEntities.clients.push(result.data as Client);
              console.log(`Client created: ${clientData.clientName}`);
            }
          } catch (error) {
            console.error(`Error creating client ${clientData.clientName}:`, error);
          }
        }
      }
    }

    if (technology && technology.length > 0) {
      console.log(`Processing ${technology.length} technology record(s)...`);
      for (const techData of technology) {
        if (techData.technologyName && techData.officeId) {
          try {
            const result = await firestoreService.saveTechnology(techData);
            if (result.success && result.data) {
              createdEntities.technology.push(result.data as Technology);
              console.log(`Technology created: ${techData.technologyName}`);
            }
          } catch (error) {
            console.error(`Error creating technology ${techData.technologyName}:`, error);
          }
        }
      }
    }

    if (financials && financials.length > 0) {
      console.log(`Processing ${financials.length} financial record(s)...`);
      for (const financialData of financials) {
        if (financialData.amount && financialData.recordType && financialData.officeId) {
          try {
            const result = await firestoreService.saveFinancial(financialData);
            if (result.success && result.data) {
              createdEntities.financials.push(result.data as Financial);
              console.log(`Financial record created: ${financialData.recordType}`);
            }
          } catch (error) {
            console.error(`Error creating financial record:`, error);
          }
        }
      }
    }

    if (supplyChain && supplyChain.length > 0) {
      console.log(`Processing ${supplyChain.length} supply chain record(s)...`);
      for (const supplyData of supplyChain) {
        if (supplyData.supplierName) {
          try {
            const result = await firestoreService.saveSupplyChain(supplyData);
            if (result.success && result.data) {
              createdEntities.supplyChain.push(result.data as SupplyChain);
              console.log(`Supply chain record created: ${supplyData.supplierName}`);
            }
          } catch (error) {
            console.error(`Error creating supply chain record ${supplyData.supplierName}:`, error);
          }
        }
      }
    }

    if (landData && landData.length > 0) {
      console.log(`Processing ${landData.length} land data record(s)...`);
      for (const landDataItem of landData) {
        if (landDataItem.location) {
          try {
            const result = await firestoreService.saveLandData(landDataItem);
            if (result.success && result.data) {
              createdEntities.landData.push(result.data as LandData);
              console.log(`Land data record created`);
            }
          } catch (error) {
            console.error(`Error creating land data record:`, error);
          }
        }
      }
    }

    if (cityData && cityData.length > 0) {
      console.log(`Processing ${cityData.length} city data record(s)...`);
      for (const cityDataItem of cityData) {
        if (cityDataItem.cityId) {
          try {
            const result = await firestoreService.saveCityData(cityDataItem);
            if (result.success && result.data) {
              createdEntities.cityData.push(result.data as CityData);
              console.log(`City data record created`);
            }
          } catch (error) {
            console.error(`Error creating city data record:`, error);
          }
        }
      }
    }

    if (projectData && projectData.length > 0) {
      console.log(`Processing ${projectData.length} project data record(s)...`);
      for (const projectDataItem of projectData) {
        if (projectDataItem.projectId) {
          try {
            const result = await firestoreService.saveProjectData(projectDataItem);
            if (result.success && result.data) {
              createdEntities.projectData.push(result.data as ProjectData);
              console.log(`Project data record created`);
            }
          } catch (error) {
            console.error(`Error creating project data record:`, error);
          }
        }
      }
    }

    if (companyStructure && companyStructure.length > 0) {
      console.log(`Processing ${companyStructure.length} company structure record(s)...`);
      for (const structureData of companyStructure) {
        if (structureData.officeId) {
          try {
            const result = await firestoreService.saveCompanyStructure(structureData);
            if (result.success && result.data) {
              createdEntities.companyStructure.push(result.data as CompanyStructure);
              console.log(`Company structure record created`);
            }
          } catch (error) {
            console.error(`Error creating company structure record:`, error);
          }
        }
      }
    }

    if (divisionPercentages && divisionPercentages.length > 0) {
      console.log(`Processing ${divisionPercentages.length} division percentages record(s)...`);
      for (const divisionData of divisionPercentages) {
        if (divisionData.officeId && divisionData.divisionType) {
          try {
            const result = await firestoreService.saveDivisionPercentages(divisionData);
            if (result.success && result.data) {
              createdEntities.divisionPercentages.push(result.data as DivisionPercentages);
              console.log(`Division percentages record created`);
            }
          } catch (error) {
            console.error(`Error creating division percentages record:`, error);
          }
        }
      }
    }

    if (newsArticles && newsArticles.length > 0) {
      console.log(`Processing ${newsArticles.length} news article(s)...`);
      for (const articleData of newsArticles) {
        if (articleData.title || articleData.url) {
          try {
            const result = await firestoreService.saveNewsArticle(articleData);
            if (result.success && result.data) {
              createdEntities.newsArticles.push(result.data as NewsArticle);
              console.log(`News article created: ${articleData.title || 'Untitled'}`);
            }
          } catch (error) {
            console.error(`Error creating news article:`, error);
          }
        }
      }
    }

    if (politicalContext && politicalContext.length > 0) {
      console.log(`Processing ${politicalContext.length} political context record(s)...`);
      for (const politicalData of politicalContext) {
        if (politicalData.jurisdiction && politicalData.jurisdiction.country) {
          try {
            const result = await firestoreService.savePoliticalContext(politicalData);
            if (result.success && result.data) {
              createdEntities.politicalContext.push(result.data as PoliticalContext);
              console.log(`Political context record created`);
            }
          } catch (error) {
            console.error(`Error creating political context record:`, error);
          }
        }
      }
    }

    // Create relationships between entities
    console.log('Creating relationships between entities...');
    await this.createEntityRelationships(createdEntities);

    return {
      ...createdEntities,
      workforceUpdates
    };
  }

  /**
   * Create relationships between entities
   */
  private async createEntityRelationships(entities: {
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
  }): Promise<void> {
    try {
      const { EntityUpdateService } = await import('./entityUpdateService');
      const entityUpdateService = EntityUpdateService.getInstance();

      // Create office-project relationships
      for (const office of entities.offices) {
        for (const project of entities.projects) {
          // Check if office and project are in the same city or have logical connection
          if (this.shouldCreateRelationship(office, project)) {
            await entityUpdateService.createBidirectionalRelationship({
              sourceId: office.id,
              targetId: project.id,
              relationshipType: 'office-project',
              bidirectional: true
            });
          }
        }
      }

      // Create office-regulation relationships
      for (const office of entities.offices) {
        for (const regulation of entities.regulations) {
          // Check if office location matches regulation jurisdiction
          if (this.shouldCreateOfficeRegulationRelationship(office, regulation)) {
            await entityUpdateService.createBidirectionalRelationship({
              sourceId: office.id,
              targetId: regulation.id,
              relationshipType: 'office-regulation',
              bidirectional: true
            });
          }
        }
      }

      // Create project-regulation relationships
      for (const project of entities.projects) {
        for (const regulation of entities.regulations) {
          // Check if project location matches regulation jurisdiction
          if (this.shouldCreateProjectRegulationRelationship(project, regulation)) {
            await entityUpdateService.createBidirectionalRelationship({
              sourceId: project.id,
              targetId: regulation.id,
              relationshipType: 'project-regulation',
              bidirectional: true
            });
          }
        }
      }

      console.log('Entity relationships created successfully');
    } catch (error) {
      console.error('Error creating entity relationships:', error);
    }
  }

  /**
   * Determine if office and project should have a relationship
   */
  private shouldCreateRelationship(office: Office, project: Project): boolean {
    // Check if they're in the same city
    const officeCity = office.location?.headquarters?.city?.toLowerCase();
    const projectCity = project.location?.city?.toLowerCase();
    
    if (officeCity && projectCity && officeCity === projectCity) {
      return true;
    }

    // Check if they're in the same country
    const officeCountry = office.location?.headquarters?.country?.toLowerCase();
    const projectCountry = project.location?.country?.toLowerCase();
    
    if (officeCountry && projectCountry && officeCountry === projectCountry) {
      return true;
    }

    return false;
  }

  /**
   * Determine if office and regulation should have a relationship
   */
  private shouldCreateOfficeRegulationRelationship(office: Office, regulation: Regulation): boolean {
    // Check if office location matches regulation jurisdiction
    const officeCity = office.location?.headquarters?.city?.toLowerCase();
    const officeCountry = office.location?.headquarters?.country?.toLowerCase();
    const regulationCity = regulation.jurisdiction?.cityName?.toLowerCase();
    const regulationCountry = regulation.jurisdiction?.countryName?.toLowerCase();

    // City-level match
    if (officeCity && regulationCity && officeCity === regulationCity) {
      return true;
    }

    // Country-level match
    if (officeCountry && regulationCountry && officeCountry === regulationCountry) {
      return true;
    }

    return false;
  }

  /**
   * Determine if project and regulation should have a relationship
   */
  private shouldCreateProjectRegulationRelationship(project: Project, regulation: Regulation): boolean {
    // Check if project location matches regulation jurisdiction
    const projectCity = project.location?.city?.toLowerCase();
    const projectCountry = project.location?.country?.toLowerCase();
    const regulationCity = regulation.jurisdiction?.cityName?.toLowerCase();
    const regulationCountry = regulation.jurisdiction?.countryName?.toLowerCase();

    // City-level match
    if (projectCity && regulationCity && projectCity === regulationCity) {
      return true;
    }

    // Country-level match
    if (projectCountry && regulationCountry && projectCountry === regulationCountry) {
      return true;
    }

    return false;
  }

  /**
   * Generate office name variations for better matching
   */
  private generateOfficeNameVariations(name: string): string[] {
    const variations: string[] = [name];
    const cleanName = name.trim();
    
    // Remove common suffixes and try variations
    const suffixes = ['Architects', 'Architecture', 'Architect', 'Associates', 'LLC', 'Ltd', 'Inc', 'Studio', 'Design'];
    const words = cleanName.split(/\s+/);
    
    // Try removing each suffix
    for (const suffix of suffixes) {
      if (cleanName.endsWith(suffix)) {
        const withoutSuffix = cleanName.substring(0, cleanName.length - suffix.length).trim();
        if (withoutSuffix.length > 0) {
          variations.push(withoutSuffix);
        }
      }
    }
    
    // Try abbreviations (first letters of each word)
    if (words.length > 1) {
      const abbreviation = words.map(w => w.charAt(0).toUpperCase()).join('');
      variations.push(abbreviation);
      
      // Also try first word + abbreviation of rest
      if (words.length > 2) {
        const firstWord = words[0];
        const restAbbr = words.slice(1).map(w => w.charAt(0).toUpperCase()).join('');
        variations.push(`${firstWord} ${restAbbr}`);
      }
    }
    
    // Try common variations
    if (cleanName.includes('Architecture')) {
      variations.push(cleanName.replace(/Architecture/gi, 'Architects'));
    }
    if (cleanName.includes('Architects')) {
      variations.push(cleanName.replace(/Architects/gi, 'Architecture'));
    }
    
    return [...new Set(variations)]; // Remove duplicates
  }

  /**
   * Generate summary of created entities
   */
  private generateSummary(
    createdEntities: {
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
      workforce: Workforce[];
    mergedOffices?: Office[];
    },
    workforceUpdates?: {
      officeId: string;
      officeName: string;
      employeesAdded: number;
      employeesUpdated: number;
      totalEmployees: number;
    }[]
  ): string {
    const parts: string[] = [];
    
    if (createdEntities.offices.length > 0) {
      const officeDetails = createdEntities.offices.map(office => {
        if (office.name && office.id) {
          return `${office.name} (${office.id})`;
        }
        return office.name || office.id;
      });
      parts.push(`${createdEntities.offices.length} office(s) created: ${officeDetails.join(', ')}`);
    }
    
    if (createdEntities.mergedOffices && createdEntities.mergedOffices.length > 0) {
      const mergedDetails = createdEntities.mergedOffices.map(office => {
        if (office.name && office.id) {
          return `${office.name} (${office.id})`;
        }
        return office.name || office.id;
      });
      parts.push(`${createdEntities.mergedOffices.length} office(s) merged (already existing): ${mergedDetails.join(', ')}`);
    }
    
    if (createdEntities.projects.length > 0) {
      parts.push(`${createdEntities.projects.length} project(s) created`);
    }
    
    if (createdEntities.regulations.length > 0) {
      parts.push(`${createdEntities.regulations.length} regulation(s) created`);
    }
    
    // Add detailed workforce update information
    if (workforceUpdates && workforceUpdates.length > 0) {
      for (const update of workforceUpdates) {
        const updateMessages: string[] = [];
        
        if (update.employeesAdded > 0) {
          updateMessages.push(`${update.employeesAdded} new employee(s) added`);
        }
        
        if (update.employeesUpdated > 0) {
          updateMessages.push(`${update.employeesUpdated} employee(s) updated`);
        }
        
        if (updateMessages.length > 0) {
          parts.push(`Updated ${update.officeName}: ${updateMessages.join(', ')}. Total employees: ${update.totalEmployees}`);
        }
      }
    } else if (createdEntities.workforce.length > 0) {
      parts.push(`${createdEntities.workforce.length} workforce record(s) created`);
    }

    if (parts.length === 0) {
      return 'No entities created - no relevant data found in text';
    }

    // Check if Firebase is available by looking at the IDs
    const hasLocalEntities = createdEntities.offices.some(o => o.id.startsWith('GE')) || 
                            createdEntities.projects.some(p => p.id.startsWith('project-')) ||
                            createdEntities.regulations.some(r => r.id.startsWith('regulation-'));
    
    if (hasLocalEntities) {
      return `Successfully created: ${parts.join(', ')} (Local entities - Firebase not configured)`;
    }

    return `Successfully created: ${parts.join(', ')} (Saved to Firebase)`;
  }


  /**
   * Save user input to Firebase for tracking
   */
  private async saveUserInput(inputText: string, translationResult?: any): Promise<void> {
    try {
      const { getFirestoreInstance } = await import('../renderer/src/services/firebase/config');
      const { collection, addDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      
      // Truncate text to avoid Firestore query limits (max 1500 chars for queries)
      const truncatedText = inputText.length > 1000 ? inputText.substring(0, 1000) + '...' : inputText;
      
      const userInputData = {
        text: truncatedText,
        fullText: inputText, // Store full text separately
        textHash: this.generateTextHash(inputText), // Hash for unique identification
        timestamp: new Date(),
        processed: false,
        length: inputText.length,
        wordCount: inputText.split(' ').length,
        processingResult: 'pending',
        // Translation information
        translation: translationResult ? {
          wasTranslated: translationResult.success && translationResult.translatedText !== inputText,
          originalLanguage: translationResult.detectedLanguage,
          translatedText: translationResult.translatedText
        } : null
      };
      
      await addDoc(collection(db, 'userInputs'), userInputData);
      console.log('User input saved to Firebase');
    } catch (error) {
      console.error('Failed to save user input:', error);
    }
  }

  /**
   * Update user input with processing results
   */
  private async updateUserInputProcessing(
    inputText: string, 
    createdEntities: { offices: Office[]; projects: Project[]; regulations: Regulation[]; workforce: Workforce[] },
    summary: string
  ): Promise<void> {
    try {
      const { getFirestoreInstance } = await import('../renderer/src/services/firebase/config');
      const { collection, query, where, orderBy, limit, getDocs, updateDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      
      // Find the user input document by hash (avoids text size limits)
      const textHash = this.generateTextHash(inputText);
      const userInputsQuery = await getDocs(
        query(
          collection(db, 'userInputs'),
          where('textHash', '==', textHash),
          where('processed', '==', false),
          limit(1)
        )
      );
      
      if (!userInputsQuery.empty) {
        const userInputDoc = userInputsQuery.docs[0];
        await updateDoc(userInputDoc.ref, {
          processed: true,
          entitiesCreated: {
            offices: createdEntities.offices.length,
            projects: createdEntities.projects.length,
            regulations: createdEntities.regulations.length
          },
          processingResult: summary
        });
        console.log('User input processing results updated');
      }
    } catch (error) {
      console.error('Failed to update user input processing:', error);
    }
  }

  /**
   * Enrich entities with web search data
   */
  private async enrichWithWebSearch(entities: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  }, originalText: string): Promise<{
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  }> {
    const { WebSearchAPI } = await import('./webSearchAPI');
    const webSearchAPI = WebSearchAPI.getInstance();
    
    console.log('Checking offices for web search:', entities.offices.length);
    
    for (const office of entities.offices) {
      if (!office.location?.headquarters?.country || !office.location?.headquarters?.city) {
        console.log('Office details:', {
          name: office.name,
          hasCountry: !!office.location?.headquarters?.country,
          hasCity: !!office.location?.headquarters?.city
        });
        
        // Check if location info is already in the original text
        if (!office.name) {
          console.log('Office name is undefined, skipping location check');
          continue;
        }
        const hasLocationInText = this.checkLocationInText(office.name, originalText);
        
        if (hasLocationInText) {
          console.log('Location info found in original text, skipping web search for:', office.name);
          continue;
        }
        
        if (office.name) {
          console.log('Searching web for office location:', office.name);
          const searchResult = await webSearchAPI.searchOfficeLocation(office.name);
          
          console.log('Web search result:', searchResult);
          
          if (searchResult.success && searchResult.data?.extractedInfo) {
            const info = searchResult.data.extractedInfo;
            console.log('Web search found location data for:', office.name);
            
            // Update office with web search data
            if (info.country || info.city) {
              office.location = {
                headquarters: {
                  city: info.city || office.location?.headquarters?.city || null,
                  country: info.country || office.location?.headquarters?.country || null
                },
                otherOffices: office.location?.otherOffices || []
              };
              
              // Update office ID with location data
              if (info.country && info.city) {
                office.id = this.generateOfficeIdWithLocation(office.name, info.country, info.city);
              }
            }
          } else {
            console.log('Web search failed for:', office.name);
          }
        }
      }
    }
    
    console.log('Enriched office with web data:', entities.offices[0]);
    console.log('Web search enrichment completed');
    
    return entities;
  }

  /**
   * Generate office ID with location data (CCccNNN format)
   */
  private generateOfficeIdWithLocation(_officeName: string, country: string, city: string): string {
    const countryCode = this.getCountryCode(country);
    const cityCode = this.getCityCode(city);
    const numberCode = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `${countryCode}${cityCode}${numberCode}`;
  }

  /**
   * Get country code from country name
   */
  private getCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'United States': 'US',
      'USA': 'US',
      'US': 'US',
      'United Kingdom': 'UK',
      'UK': 'UK',
      'Canada': 'CA',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'China': 'CN',
      'Australia': 'AU',
      'Netherlands': 'NL',
      'Switzerland': 'CH',
      'Italy': 'IT',
      'Spain': 'SP'
    };
    
    return countryMap[country] || country.substring(0, 2).toUpperCase().padEnd(2, 'X');
  }

  /**
   * Get city code from city name
   */
  private getCityCode(city: string): string {
    const cityMap: { [key: string]: string } = {
      'San Francisco': 'SF',
      'New York': 'NY',
      'Los Angeles': 'LA',
      'Chicago': 'CH',
      'London': 'LD',
      'Paris': 'PR',
      'Berlin': 'BL',
      'Tokyo': 'TK',
      'Sydney': 'SY',
      'Toronto': 'TO',
      'Vancouver': 'VC',
      'Amsterdam': 'AM',
      'Zurich': 'ZH',
      'Milan': 'ML',
      'Madrid': 'MD'
    };
    
    return cityMap[city] || city.substring(0, 2).toUpperCase().padEnd(2, 'X');
  }

  /**
   * Generate fallback office ID when location data is not available
   */
  private generateFallbackOfficeId(officeName: string): string {
    // Use first 2 letters of office name + XX + random number
    const nameCode = officeName.substring(0, 2).toUpperCase().padEnd(2, 'X');
    const numberCode = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `${nameCode}XX${numberCode}`;
  }

  /**
   * Generate a simple hash for text identification
   */
  private generateTextHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if location information is already present in the original text
   */
  private checkLocationInText(officeName: string, originalText: string): boolean {
    const text = originalText.toLowerCase();
    const officeNameLower = officeName.toLowerCase();
    
    // Common location indicators
    const locationIndicators = [
      'based in', 'located in', 'headquarters in', 'office in', 'studio in',
      'from', 'in', 'at', 'barcelona', 'madrid', 'london', 'paris', 'berlin',
      'new york', 'san francisco', 'los angeles', 'chicago', 'toronto',
      'spain', 'france', 'germany', 'united kingdom', 'united states', 'canada'
    ];
    
    // Check if office name appears near location indicators
    const officeIndex = text.indexOf(officeNameLower);
    if (officeIndex === -1) return false;
    
    // Check 200 characters before and after the office name for location indicators
    const start = Math.max(0, officeIndex - 200);
    const end = Math.min(text.length, officeIndex + officeName.length + 200);
    const context = text.substring(start, end);
    
    // Look for location indicators near the office name
    for (const indicator of locationIndicators) {
      if (context.includes(indicator)) {
        console.log(`Found location indicator "${indicator}" near office "${officeName}"`);
        return true;
      }
    }
    
    return false;
  }
}
