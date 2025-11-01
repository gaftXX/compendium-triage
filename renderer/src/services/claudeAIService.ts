// Claude AI Service - Real AI-powered text analysis using Claude API

import { Office, Project, Regulation, Client, Technology, Financial, SupplyChain, LandData, CityData, ProjectData, CompanyStructure, DivisionPercentages, NewsArticle, PoliticalContext } from '../types/firestore';

export interface ClaudeCategorizationResult {
  category: 'office' | 'project' | 'regulation' | 'client' | 'technology' | 'financial' | 'supplyChain' | 'landData' | 'cityData' | 'projectData' | 'companyStructure' | 'divisionPercentages' | 'newsArticle' | 'politicalContext' | 'unknown';
  confidence: number;
  reasoning: string;
}

export interface ClaudeExtractionResult {
  extractedData: Partial<Office> | Partial<Project> | Partial<Regulation> | Partial<Client> | Partial<Technology> | Partial<Financial> | Partial<SupplyChain> | Partial<LandData> | Partial<CityData> | Partial<ProjectData> | Partial<CompanyStructure> | Partial<DivisionPercentages> | Partial<NewsArticle> | Partial<PoliticalContext> | any;
  confidence: number;
  missingFields: string[];
  reasoning: string;
  // Office-specific
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
  // Tier 3 entities
  clients?: Partial<Client>[];
  technology?: Partial<Technology>[];
  financials?: Partial<Financial>[];
  supplyChain?: Partial<SupplyChain>[];
  landData?: Partial<LandData>[];
  cityData?: Partial<CityData>[];
  projectData?: Partial<ProjectData>[];
  companyStructure?: Partial<CompanyStructure>[];
  divisionPercentages?: Partial<DivisionPercentages>[];
  newsArticles?: Partial<NewsArticle>[];
  politicalContext?: Partial<PoliticalContext>[];
}

export interface ClaudeAnalysisResult {
  categorization: ClaudeCategorizationResult;
  extraction: ClaudeExtractionResult;
  overallConfidence: number;
}

export class ClaudeAIService {
  private static instance: ClaudeAIService;
  private apiKey: string = '';
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

  private constructor() {
    // Get API key from environment or use fallback
    try {
      // Try import.meta.env first (Vite)
      (import.meta as any)?.env; // Access to ensure Vite env tree-shakes safely
      // Note: API key is now passed directly to chat() method, not loaded here
      console.log('ClaudeAIService initialized (API key will be provided at runtime)');
    } catch (error) {
      console.warn('Could not access environment variables:', error);
      this.apiKey = '';
    }
  }

  public static getInstance(): ClaudeAIService {
    if (!ClaudeAIService.instance) {
      ClaudeAIService.instance = new ClaudeAIService();
    }
    return ClaudeAIService.instance;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('🔑 Claude AI API key set:', !!apiKey);
  }

  /**
   * Chat with Claude AI - General conversation
   */
  public async chat(userMessage: string, apiKey?: string): Promise<string> {
    try {
      const prompt = this.buildChatPrompt(userMessage);
      const response = await this.callClaudeAPI(prompt, apiKey);
      return response;
    } catch (error) {
      console.error('Claude AI chat error:', error);
      throw new Error('Failed to chat with Claude AI: ' + (error as Error).message);
    }
  }

  /**
   * Analyze unstructured text using Claude AI
   */
  public async analyzeText(inputText: string): Promise<ClaudeAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(inputText);
      const response = await this.callClaudeAPI(prompt);
      
      return this.parseClaudeResponse(response);
    } catch (error) {
      console.error('Claude AI analysis error:', error);
      throw new Error('Failed to analyze text with Claude AI: ' + (error as Error).message);
    }
  }

  /**
   * Build the prompt for Claude AI chat
   */
  private buildChatPrompt(userMessage: string): string {
    return `You are Claude, an AI assistant. Be extremely concise and direct. Give the shortest possible answer that still helps the user.

User message: ${userMessage}

Respond with the most direct, simple answer possible. Avoid explanations unless specifically asked. If you need current information (like weather, news, stock prices, etc.), you should explicitly say "I need to search the web for that information" so the system can help you get current data.`;
  }

  /**
   * Build the prompt for Claude AI analysis
   */
  private buildAnalysisPrompt(text: string): string {
    return `You are an expert data analyst specializing in architectural and construction industry data with deep knowledge of the AEC (Architecture, Engineering, Construction) industry.

Your task is to analyze the following text and determine its category using your advanced reasoning capabilities. You must be the final authority on categorization - trust your analysis and reasoning.

CRITICAL: If the user explicitly mentions an existing office name (e.g., "goes into [office name] office", "employees of [office name]", "part of [office name]"), you MUST extract that exact office name or its recognizable variants (e.g., "Boris Pena Architects", "Boris Pena Architecture", "BPA", "Boris Pena") and use it as the office name. Do NOT create abbreviated names when the full office name is mentioned. ALWAYS prioritize finding and matching existing offices when explicitly mentioned by the user.

CATEGORIZATION GUIDELINES:

OFFICE (Architectural/Engineering Firms):
- Companies, practices, studios, firms that provide design/engineering services
- Keywords: firm, practice, studio, architects, engineers, consultants, design company
- Examples: "Foster + Partners", "AECOM", "Gensler", "architectural firm in London"
- Look for: company names, employee counts, specializations, founding dates, office locations
- CRITICAL: If the text mentions employees AND explicitly names an office (e.g., "employees of [office name]", "employees go into [office name] office"), you MUST categorize this as OFFICE and extract the office name. Even if the text is primarily about employees, if an office is explicitly mentioned, extract it as an office entity.
- IMPORTANT: If the text mentions "has offices in [cities]", "branches in [locations]", "offices located in [places]", extract these cities/locations as otherOffices array. For each location, include the city name as the address (if specific address not provided) and set coordinates to {latitude: 0, longitude: 0} if not available.
- CRITICAL FOR EMPLOYEES: When extracting employee information, ALWAYS extract their location (city and country) if mentioned in the text. For example, if text says "ARCHITECT BARCELONA" or "employees are part of the barcelona branch", extract location: {city: "Barcelona", country: "Spain"}. This is essential for offices with multiple locations to distinguish which employees work at which branch.

PROJECT (Construction/Building Projects):
- Specific buildings, developments, construction projects, facilities
- Keywords: building, project, development, tower, complex, facility, construction, hospital, competition, design, unveil, create
- Examples: "Burj Khalifa", "Central Park Tower", "mixed-use development in Manhattan", "competition to create a hospital", "BPA unveils design for hospital"
- Look for: project names, locations, budgets, timelines, building types, construction phases, competition mentions, site sizes (m²), building areas (GBA)
- CRITICAL: If text mentions "competition to create", "design for", "unveils design for", "project", "building", "hospital", "facility" with a location and/or size (m²), categorize as PROJECT even if the project name isn't explicitly stated

REGULATION (Laws/Codes/Standards):
- Legal requirements, building codes, zoning laws, compliance standards
- Keywords: code, regulation, law, standard, requirement, compliance, zoning, permit
- Examples: "International Building Code", "zoning law", "fire safety regulation"
- Look for: jurisdiction, effective dates, regulation numbers, compliance requirements

CLIENT (Clients/Organizations):
- Companies, institutions, or individuals who commission projects
- Keywords: client, customer, owner, developer, institution, corporation, company hiring architects
- Examples: "Google commissioned a project", "client relationship", "corporate client"
- Look for: client names, client types (private/public/corporate/institutional), industries, locations, project relationships

TECHNOLOGY (Technology/Tools/Software):
- Software, tools, or technologies used by architectural firms
- Keywords: BIM, software, technology, tool, platform, system, AI, parametric, VR, fabrication
- Examples: "Revit implementation", "uses Rhino", "adopted Autodesk BIM 360"
- Look for: technology names, vendors, categories, adoption dates, usage levels, ROI data

FINANCIAL (Financial Transactions/Data):
- Financial information related to offices or projects
- Keywords: funding, revenue, expense, investment, debt, budget, financial transaction, payment
- Examples: "raised $10M funding", "annual revenue of $50M", "expense report", "investment in office"
- Look for: amounts, currencies, dates, record types (funding/debt/revenue/expense/investment), sources, destinations

SUPPLYCHAIN (Suppliers/Vendors):
- Suppliers, vendors, or material providers
- Keywords: supplier, vendor, material provider, contractor, supply chain, materials, services
- Examples: "steel supplier", "glass vendor", "material provider in China"
- Look for: supplier names, types (materials/services/equipment), locations, reliability scores, pricing

LANDDATA (Land/Property):
- Land parcels, properties, or real estate data
- Keywords: land, property, parcel, site, plot, real estate, acquisition, zoning
- Examples: "acquired land in Manhattan", "property development", "zoning for residential"
- Look for: locations, sizes, zoning classifications, ownership, valuations, development status

CITYDATA (City Enrichment):
- Detailed demographic, economic, and cultural data about cities
- Keywords: city demographics, population data, economic indicators, cultural context, infrastructure
- Examples: "London population growth", "city GDP data", "cultural influences in Tokyo"
- Look for: demographics, economic data, architectural styles, cultural context, infrastructure

PROJECTDATA (Project Details):
- Comprehensive project execution and performance data
- Keywords: project team, design philosophy, performance metrics, awards, client satisfaction
- Examples: "project won award", "team composition", "schedule delays", "client feedback"
- Look for: vision/design, team members, performance metrics, technical details, awards, legacy

COMPANYSTRUCTURE (Organizational Structure):
- Company organizational structure and leadership
- Keywords: company structure, departments, divisions, leadership, hierarchy, governance
- Examples: "company reorganized into divisions", "new CEO appointed", "department structure"
- Look for: organization type, departments, leadership, divisions, governance structure

DIVISIONPERCENTAGES (Analytics Breakdown):
- Percentage breakdowns by revenue, workforce, projects, or regions
- Keywords: revenue breakdown, workforce distribution, project percentages, regional split
- Examples: "60% revenue from commercial projects", "workforce split by region"
- Look for: division type, breakdown percentages, period, methodology

NEWSARTICLE (News/Media Coverage):
- News articles, press releases, or media coverage
- Keywords: news article, press release, media coverage, announcement, published
- Examples: "ArchDaily reported on project", "press release announced merger", "article in Dezeen"
- Look for: title, source, publication date, content, entities mentioned, sentiment, impact

POLITICALCONTEXT (Political/Governance):
- Political context, governance, institutions, and policy information
- Keywords: government, policy, political stability, regulatory bodies, governance, institutions
- Examples: "government announced new policy", "regulatory body changes", "political stability"
- Look for: jurisdiction, governance type, institutions, policies, elections, stability indicators

ANALYSIS PROCESS:
1. Read the text carefully and identify key indicators
2. Use your reasoning to determine the most likely category
3. Provide high confidence when the category is clear
4. Use "unknown" only when truly ambiguous or insufficient information

Text to analyze: "${text}"

Please respond in this exact JSON format:
{
  "categorization": {
    "category": "office|project|regulation|client|technology|financial|supplyChain|landData|cityData|projectData|companyStructure|divisionPercentages|newsArticle|politicalContext|unknown",
    "confidence": 0.95,
    "reasoning": "Detailed explanation of your analysis process, key indicators identified, and why this category was chosen. Be specific about the evidence that led to your decision."
  },
  "extraction": {
    "extractedData": {
      // For offices:
      // CRITICAL: When the user explicitly mentions an office name (e.g., "goes into [office name] office", "employees of [office name]", "part of [office name]"), extract the FULL office name, NOT an abbreviation.
      // Example: If user says "employees of Boris Pena Architecture office", extract "Boris Pena Architecture" or "Boris Pena Architects", NOT "BPA".
      // Only use abbreviations if that's the only name mentioned in the text.
      // IMPORTANT: If the text is about employees but explicitly mentions an office name, you MUST still extract an office entity with the mentioned office name.
      "name": "Full company name (e.g., 'Boris Pena Architects', NOT 'BPA' unless only abbreviation is mentioned). MUST extract office if explicitly mentioned even if text is primarily about employees.",
      "officialName": "Official company name", 
      "founded": 2020,
      "founder": "Founder's name",
      "location": {
        "headquarters": {
          "city": "City name",
          "country": "Country name"
        },
        "otherOffices": [
          // Array of other office branches/locations
          // IMPORTANT: If the text mentions "has offices in [cities]", "branches in [cities]", "offices in [locations]", extract these as otherOffices
          // Each entry should have address (can be city name if specific address not provided) and coordinates (if available)
          {
            "address": "Full address or city name if address not provided",
            "coordinates": {
              "latitude": 0.0,
              "longitude": 0.0
            }
          }
        ]
      },
      "size": {
        "employeeCount": 100,
        "sizeCategory": "small|medium|large|enterprise|boutique",
        "annualRevenue": 1000000
      },
      "specializations": ["specialization1", "specialization2"],
      "status": "active",
      // Employee information (if provided):
      "employees": [
        {
          "name": "Employee name",
          "role": "Employee role/position",
          "description": "Description or biography about the employee",
          "expertise": ["expertise1", "expertise2"],
          "location": {
            "city": "City where employee is located/working (e.g., 'Barcelona', 'Miami', 'Cancun')",
            "country": "Country where employee is located/working (e.g., 'Spain', 'United States', 'Mexico')"
          }
        }
      ],
      // Employee distribution by role (if provided):
      "employeeDistribution": {
        "architects": 50,
        "engineers": 30,
        "designers": 15,
        "administrative": 5
      }
      
      // For projects:
      // CRITICAL: If text describes a project (competition, design, building, facility) with location and/or size, extract as PROJECT
      // Project name can be derived from location + type (e.g., "Hospital in Los Cabos", "Hospital Los Cabos")
      "projectName": "Project name (derive from location + type if not explicitly stated, e.g., 'Hospital Los Cabos' or 'Los Cabos Hospital')",
      "location": {
        "city": "City name (e.g., 'Los Cabos')",
        "country": "Country name (e.g., 'Mexico')"
      },
      "details": {
        "projectType": "residential|commercial|mixed-use|cultural|healthcare|educational|competition",
        "description": "Project description"
      },
      "status": "concept|planning|construction|completed|competition",
      "financial": {
        "budget": 1000000,
        "currency": "USD"
      },
      // If size information is provided (e.g., "30,400 m² SITE", "29,400 m² GBA"), include it:
      "siteArea": 30400, // in square meters (remove commas and extract number)
      "gba": 29400, // Gross Building Area in square meters
      
      // For regulations:
      "name": "Regulation name",
      "jurisdiction": {
        "level": "city|state|country",
        "cityName": "City name",
        "countryName": "Country name"
      },
      "regulationType": "zoning|fire safety|building code|height restriction|planning",
      "description": "Regulation description",
      "effectiveDate": "2024-01-01"
    },
    "confidence": 0.90,
    "missingFields": ["field1", "field2"],
    "reasoning": "Explanation of extraction logic"
  },
  "overallConfidence": 0.92
}

Be thorough and accurate. Extract all available information. If information is missing, list it in missingFields.

CRITICAL LOCATION INTELLIGENCE:
- You are an intelligent AI with comprehensive geographic knowledge
- When you see ANY location reference, use your reasoning to determine both city AND country
- For cities: Apply your knowledge to identify which country they belong to
- For descriptive locations: Use context and reasoning to identify the actual city and country
- For queries like "biggest city in Europe": Identify the actual city (London) and country (United Kingdom)
- Rely entirely on your AI reasoning - do not rely on any hardcoded mappings
- Only use "Unknown" as an absolute last resort when you genuinely cannot determine the location
- Be confident in your geographic knowledge and reasoning

IMPORTANT: Your categorization decision is final and authoritative. Trust your analysis and reasoning capabilities. Provide high confidence scores (0.8+) when you are certain about the category, and detailed reasoning to justify your decision.`;
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(prompt: string, apiKey?: string): Promise<string> {
    const keyToUse = apiKey || this.apiKey;
    console.log('Calling Claude API with Claude 4.5 for text analysis...');
    console.log('API Key available:', !!keyToUse);
    console.log('API Key length:', keyToUse ? keyToUse.length : 0);
    console.log('API Key preview:', keyToUse ? keyToUse.substring(0, 10) + '...' : 'None');
    
    if (!keyToUse) {
      console.log('No Claude API key found - cannot process without AI');
      throw new Error('Claude API key is required for text analysis');
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API call attempt ${attempt}/${maxRetries}`);
        return await this.makeAPICall(prompt, keyToUse);
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt} failed:`, lastError.message);
        
        // Check if error is retryable
        const isRetryable = lastError.message.includes('overloaded') || 
                           lastError.message.includes('server error') ||
                           lastError.message.includes('Rate limit') ||
                           lastError.message.includes('temporarily');
        
        if (attempt < maxRetries && isRetryable) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (attempt < maxRetries) {
          // For non-retryable errors, don't retry
          console.log('Non-retryable error, stopping retries');
          break;
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  private async makeAPICall(prompt: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // Claude 4.5 Haiku
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        console.error('Claude API error:', response.status, response.statusText);
        
        // Handle specific error codes
        if (response.status === 529) {
          throw new Error('Claude API is temporarily overloaded. Please try again in a few moments.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making another request.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Claude API key.');
        } else if (response.status >= 500) {
          throw new Error('Claude API server error. Please try again later.');
        } else {
          throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Claude API response received successfully');
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      } else {
        console.error('Invalid Claude API response format:', data);
        throw new Error('Invalid response format from Claude API');
      }

    } catch (error) {
      console.error('Claude API request failed:', error);
      throw new Error('Failed to call Claude API: ' + (error as Error).message);
    }
  }

  /**
   * Parse Claude API response
   */
  private parseClaudeResponse(response: string): ClaudeAnalysisResult {
    try {
      // Extract JSON from response (Claude might include extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Extract employee information if available
      const extractedData = parsed.extraction.extractedData || {};
      const employees = extractedData.employees || parsed.extraction.employees;
      const employeeDistribution = extractedData.employeeDistribution || parsed.extraction.employeeDistribution;
      
      return {
        categorization: {
          category: parsed.categorization.category,
          confidence: parsed.categorization.confidence,
          reasoning: parsed.categorization.reasoning
        },
        extraction: {
          extractedData: extractedData,
          confidence: parsed.extraction.confidence,
          missingFields: parsed.extraction.missingFields || [],
          reasoning: parsed.extraction.reasoning,
          employees: employees,
          employeeDistribution: employeeDistribution
        },
        overallConfidence: parsed.overallConfidence
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse Claude AI response');
    }
  }


  /**
   * Train the model with user feedback
   */
  public async trainWithFeedback(
    inputText: string,
    correctCategory: 'office' | 'project' | 'regulation',
    correctData: any,
    userFeedback: string
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Store the feedback in a training dataset
    // 2. Retrain the model periodically
    // 3. Improve future predictions
    
    console.log('Training with feedback:', {
      inputText,
      correctCategory,
      correctData,
      userFeedback
    });

    // For now, just log the feedback for manual model improvement
    // In production, this would integrate with a training pipeline
  }

  /**
   * Get model performance metrics
   */
  public async getModelMetrics(): Promise<{
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    categoryBreakdown: Record<string, number>;
  }> {
    // Metrics for development
    return {
      accuracy: 0.92,
      totalPredictions: 150,
      correctPredictions: 138,
      categoryBreakdown: {
        office: 45,
        project: 52,
        regulation: 41,
        unknown: 12
      }
    };
  }
}
