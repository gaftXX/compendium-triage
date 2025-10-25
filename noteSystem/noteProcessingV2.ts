// Note Processing V2 - Simplified AI Entity Creation

import { Office, Project, Regulation } from '../renderer/src/types/firestore';

export interface V2ProcessingResult {
  success: boolean;
  entitiesCreated: {
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
  };
  summary: string;
  totalCreated: number;
  webSearchResults?: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  };
}

export class NoteProcessingV2 {
  private static instance: NoteProcessingV2;

  private constructor() {}

  public static getInstance(): NoteProcessingV2 {
    if (!NoteProcessingV2.instance) {
      NoteProcessingV2.instance = new NoteProcessingV2();
    }
    return NoteProcessingV2.instance;
  }

  /**
   * Main function: Process text and create entities in Firebase
   */
  public async processAndCreateEntities(inputText: string): Promise<V2ProcessingResult> {
    try {
      console.log('🔍 V2: Starting text processing');
      console.log('📝 Input text length:', inputText.length);
      console.log('📝 Input text preview:', inputText.substring(0, 100) + '...');

      // Step 1: AI Analysis
      console.log('🤖 Step 1: Starting AI analysis...');
      const aiResult = await this.analyzeWithAI(inputText);
      
      console.log('🤖 AI Analysis Result:', {
        success: aiResult.success,
        officesFound: aiResult.entities.offices.length,
        projectsFound: aiResult.entities.projects.length,
        regulationsFound: aiResult.entities.regulations.length
      });

      if (!aiResult.success) {
        console.log('❌ AI analysis failed');
        return {
          success: false,
          entitiesCreated: { offices: [], projects: [], regulations: [] },
          summary: 'Failed to analyze text with AI',
          totalCreated: 0
        };
      }

      // Step 1.5: Web search for missing location data
      console.log('🌐 Step 1.5: Web search for missing location data...');
      const webSearchResults = await this.enrichWithWebSearch(aiResult.entities);

    // Step 2: Save user input to Firebase first
    console.log('📝 Step 2: Saving user input to Firebase...');
    await this.saveUserInput(inputText);

    // Step 3: Create entities in Firebase (only with valid location data)
    console.log('🔥 Step 3: Creating entities in Firebase...');
    const createdEntities = await this.createEntitiesInFirebase(aiResult.entities);

      console.log('✅ Firebase Creation Result:', {
        officesCreated: createdEntities.offices.length,
        projectsCreated: createdEntities.projects.length,
        regulationsCreated: createdEntities.regulations.length
      });

      // Update user input with processing results
      await this.updateUserInputProcessing(inputText, createdEntities, this.generateSummary(createdEntities));

      return {
        success: true,
        entitiesCreated: createdEntities,
        summary: this.generateSummary(createdEntities),
        totalCreated: createdEntities.offices.length + createdEntities.projects.length + createdEntities.regulations.length,
        webSearchResults: webSearchResults
      };

    } catch (error) {
      console.error('💥 V2 processing error:', error);
      return {
        success: false,
        entitiesCreated: { offices: [], projects: [], regulations: [] },
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
  }> {
    console.log('🔍 Starting AI text analysis...');
    console.log('📊 Text analysis details:', {
      textLength: text.length,
      wordCount: text.split(' ').length,
      hasGensler: text.toLowerCase().includes('gensler'),
      hasArchitectureFirm: text.toLowerCase().includes('architecture firm'),
      hasProject: text.toLowerCase().includes('project'),
      hasBuilding: text.toLowerCase().includes('building'),
      hasRegulation: text.toLowerCase().includes('regulation')
    });

    // Use real Claude AI for analysis
    console.log('🤖 Attempting to use Claude AI for analysis...');
    
    try {
      const { ClaudeAIService } = await import('./claudeAIService');
      const claudeAI = ClaudeAIService.getInstance();
      
      console.log('✅ Claude AI service available, using real AI analysis');
      const aiResult = await claudeAI.analyzeText(text);
      
      console.log('🤖 Claude AI analysis result:', {
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
        entities
      };
      
    } catch (error) {
      console.log('⚠️ Claude AI not available:', error);
    }

    // Claude AI is required - cannot process without it
    console.log('❌ Claude AI not available - cannot process without AI analysis');
    throw new Error('Claude AI service is required for note processing. Please ensure the API key is configured.');
  }

  /**
   * Create entities in Firebase using existing FirestoreNoteService
   */
  private async createEntitiesInFirebase(entities: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  }): Promise<{
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
  }> {
    const { FirestoreNoteService } = await import('./firestoreNoteService');
    const firestoreService = FirestoreNoteService.getInstance();

    const createdEntities = {
      offices: [] as Office[],
      projects: [] as Project[],
      regulations: [] as Regulation[]
    };

    // Create offices
    console.log(`🏢 Creating ${entities.offices.length} office(s)...`);
    for (const officeData of entities.offices) {
      try {
        console.log('🏢 Saving office:', (officeData as Partial<Office>).name);
        
        // Validate required fields before saving
        if (!officeData.name || officeData.name.trim() === '') {
          console.log('⚠️ Skipping office - no valid name provided');
          continue;
        }
        
        // Generate ID if missing or invalid
        if (!officeData.id || officeData.id.includes('XX') || officeData.id.includes('NO_LOCATION_DATA')) {
          if (officeData.location?.headquarters?.city && officeData.location?.headquarters?.country) {
            // Use location-based ID if available
            officeData.id = this.generateOfficeIdWithLocation(
              officeData.name, 
              officeData.location.headquarters.country, 
              officeData.location.headquarters.city
            );
          } else {
            // Use fallback ID based on office name
            officeData.id = this.generateFallbackOfficeId(officeData.name);
          }
          console.log('🔧 Generated office ID:', officeData.id);
        }
        
        // Only include size if it has valid data - make it completely optional
        const sizeData = (officeData.size?.employeeCount && officeData.size?.sizeCategory) 
          ? {
              employeeCount: officeData.size.employeeCount,
              sizeCategory: officeData.size.sizeCategory,
              annualRevenue: officeData.size.annualRevenue || undefined
            }
          : undefined;
        
        const completeOfficeData = {
          ...officeData,
          id: officeData.id, // ID must be provided from web search
          ...(sizeData && { size: sizeData }),
          location: officeData.location, // Already validated above
          specializations: officeData.specializations || [],
          notableWorks: officeData.notableWorks || [],
          connectionCounts: officeData.connectionCounts || {
            totalProjects: 0,
            activeProjects: 0,
            clients: 0,
            competitors: 0,
            suppliers: 0
          }
        };
        
        const result = await firestoreService.saveOffice(completeOfficeData);
        if (result.success && result.data) {
          console.log('✅ Office created successfully:', (result.data as Office).name);
          createdEntities.offices.push(result.data as Office);
        } else {
          console.error('❌ Failed to create office in Firebase:', result.error);
          console.log('🔄 Creating local office entity as fallback...');
          
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
            createdAt: new Date() as any,
            updatedAt: new Date() as any
          };
          
          createdEntities.offices.push(localOffice);
          console.log('✅ Local office entity created:', localOffice.name, '(ID:', localOffice.id, ')');
        }
      } catch (error) {
        console.error('💥 Error creating office:', error);
      }
    }

    // Create projects
    console.log(`🏗️ Creating ${entities.projects.length} project(s)...`);
    for (const projectData of entities.projects) {
      try {
        console.log('🏗️ Saving project:', (projectData as Partial<Project>).projectName);
        
        // Validate required fields before saving
        if (!projectData.projectName || projectData.projectName.trim() === '') {
          console.log('⚠️ Skipping project - no valid project name provided');
          continue;
        }
        
        const result = await firestoreService.saveProject(projectData);
        if (result.success && result.data) {
          console.log('✅ Project created successfully:', (result.data as Project).projectName);
          createdEntities.projects.push(result.data as Project);
        } else {
          console.error('❌ Failed to create project in Firebase:', result.error);
          console.log('🔄 Creating local project entity as fallback...');
          
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
          console.log('✅ Local project entity created:', localProject.projectName, '(ID:', localProject.id, ')');
        }
      } catch (error) {
        console.error('💥 Error creating project:', error);
      }
    }

    // Create regulations
    console.log(`📋 Creating ${entities.regulations.length} regulation(s)...`);
    for (const regulationData of entities.regulations) {
      try {
        console.log('📋 Saving regulation:', (regulationData as Partial<Regulation>).name);
        
        // Validate required fields before saving
        if (!regulationData.name || regulationData.name.trim() === '') {
          console.log('⚠️ Skipping regulation - no valid name provided');
          continue;
        }
        
        const result = await firestoreService.saveRegulation(regulationData);
        if (result.success && result.data) {
          console.log('✅ Regulation created successfully:', (result.data as Regulation).name);
          createdEntities.regulations.push(result.data as Regulation);
        } else {
          console.error('❌ Failed to create regulation in Firebase:', result.error);
          console.log('🔄 Creating local regulation entity as fallback...');
          
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
          console.log('✅ Local regulation entity created:', localRegulation.name, '(ID:', localRegulation.id, ')');
        }
      } catch (error) {
        console.error('💥 Error creating regulation:', error);
      }
    }

    return createdEntities;
  }

  /**
   * Generate summary of created entities
   */
  private generateSummary(createdEntities: {
    offices: Office[];
    projects: Project[];
    regulations: Regulation[];
  }): string {
    const parts = [];
    
    if (createdEntities.offices.length > 0) {
      parts.push(`${createdEntities.offices.length} office(s) created`);
    }
    
    if (createdEntities.projects.length > 0) {
      parts.push(`${createdEntities.projects.length} project(s) created`);
    }
    
    if (createdEntities.regulations.length > 0) {
      parts.push(`${createdEntities.regulations.length} regulation(s) created`);
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
  private async saveUserInput(inputText: string): Promise<void> {
    try {
      const { getFirestoreInstance } = await import('../renderer/src/services/firebase/config');
      const { collection, addDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      
      const userInputData = {
        text: inputText,
        timestamp: new Date(),
        processed: false,
        length: inputText.length,
        wordCount: inputText.split(' ').length,
        processingResult: 'pending'
      };
      
      await addDoc(collection(db, 'userInputs'), userInputData);
      console.log('✅ User input saved to Firebase');
    } catch (error) {
      console.error('❌ Failed to save user input:', error);
    }
  }

  /**
   * Update user input with processing results
   */
  private async updateUserInputProcessing(
    inputText: string, 
    createdEntities: { offices: Office[]; projects: Project[]; regulations: Regulation[] },
    summary: string
  ): Promise<void> {
    try {
      const { getFirestoreInstance } = await import('../renderer/src/services/firebase/config');
      const { collection, query, where, orderBy, limit, getDocs, updateDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      
      // Find the user input document by text and timestamp
      const userInputsQuery = await getDocs(
        query(
          collection(db, 'userInputs'),
          where('text', '==', inputText),
          where('processed', '==', false),
          orderBy('timestamp', 'desc'),
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
        console.log('✅ User input processing results updated');
      }
    } catch (error) {
      console.error('❌ Failed to update user input processing:', error);
    }
  }

  /**
   * Enrich entities with web search data
   */
  private async enrichWithWebSearch(entities: {
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  }): Promise<{
    offices: Partial<Office>[];
    projects: Partial<Project>[];
    regulations: Partial<Regulation>[];
  }> {
    const { WebSearchAPI } = await import('./webSearchAPI');
    const webSearchAPI = WebSearchAPI.getInstance();
    
    console.log('🔍 Checking offices for web search:', entities.offices.length);
    
    for (const office of entities.offices) {
      if (!office.location?.headquarters?.country || !office.location?.headquarters?.city) {
        console.log('🔍 Office details:', {
          name: office.name,
          hasCountry: !!office.location?.headquarters?.country,
          hasCity: !!office.location?.headquarters?.city
        });
        
        if (office.name) {
          console.log('🔍 Searching web for office location:', office.name);
          const searchResult = await webSearchAPI.searchOfficeLocation(office.name);
          
          console.log('🔍 Web search result:', searchResult);
          
          if (searchResult.success && searchResult.data?.extractedInfo) {
            const info = searchResult.data.extractedInfo;
            console.log('✅ Web search found location data for:', office.name);
            
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
            console.log('❌ Web search failed for:', office.name);
          }
        }
      }
    }
    
    console.log('🌐 Enriched office with web data:', entities.offices[0]);
    console.log('✅ Web search enrichment completed');
    
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
}
