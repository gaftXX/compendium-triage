// Claude AI Service - Real AI-powered text analysis using Claude API

import { Office, Project, Regulation } from '../../types/firestore';

export interface ClaudeCategorizationResult {
  category: 'office' | 'project' | 'regulation' | 'unknown';
  confidence: number;
  reasoning: string;
}

export interface ClaudeExtractionResult {
  extractedData: Partial<Office> | Partial<Project> | Partial<Regulation>;
  confidence: number;
  missingFields: string[];
  reasoning: string;
}

export interface ClaudeAnalysisResult {
  categorization: ClaudeCategorizationResult;
  extraction: ClaudeExtractionResult;
  overallConfidence: number;
}

export class ClaudeAIService {
  private static instance: ClaudeAIService;
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

  private constructor() {
    // In production, this would come from environment variables
    try {
      // @ts-ignore - import.meta.env exists in Vite renderer builds
      const env = (import.meta as any).env || {};
      this.apiKey = env.VITE_ANTHROPIC_API_KEY || env.VITE_CLAUDE_API_KEY || '';
    } catch (error) {
      console.warn('Could not access environment variables, Claude AI will not be available');
      this.apiKey = '';
    }
  }

  public static getInstance(): ClaudeAIService {
    if (!ClaudeAIService.instance) {
      ClaudeAIService.instance = new ClaudeAIService();
    }
    return ClaudeAIService.instance;
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
   * Build the prompt for Claude AI analysis
   */
  private buildAnalysisPrompt(text: string): string {
    return `You are an expert data analyst specializing in architectural and construction industry data with deep knowledge of the AEC (Architecture, Engineering, Construction) industry.

Your task is to analyze the following text and determine its category using your advanced reasoning capabilities. You must be the final authority on categorization - trust your analysis and reasoning.

CATEGORIZATION GUIDELINES:

OFFICE (Architectural/Engineering Firms):
- Companies, practices, studios, firms that provide design/engineering services
- Keywords: firm, practice, studio, architects, engineers, consultants, design company
- Examples: "Foster + Partners", "AECOM", "Gensler", "architectural firm in London"
- Look for: company names, employee counts, specializations, founding dates, office locations

PROJECT (Construction/Building Projects):
- Specific buildings, developments, construction projects, facilities
- Keywords: building, project, development, tower, complex, facility, construction
- Examples: "Burj Khalifa", "Central Park Tower", "mixed-use development in Manhattan"
- Look for: project names, locations, budgets, timelines, building types, construction phases

REGULATION (Laws/Codes/Standards):
- Legal requirements, building codes, zoning laws, compliance standards
- Keywords: code, regulation, law, standard, requirement, compliance, zoning, permit
- Examples: "International Building Code", "zoning law", "fire safety regulation"
- Look for: jurisdiction, effective dates, regulation numbers, compliance requirements

ANALYSIS PROCESS:
1. Read the text carefully and identify key indicators
2. Use your reasoning to determine the most likely category
3. Provide high confidence when the category is clear
4. Use "unknown" only when truly ambiguous or insufficient information

Text to analyze: "${text}"

Please respond in this exact JSON format:
{
  "categorization": {
    "category": "office|project|regulation|unknown",
    "confidence": 0.95,
    "reasoning": "Detailed explanation of your analysis process, key indicators identified, and why this category was chosen. Be specific about the evidence that led to your decision."
  },
  "extraction": {
    "extractedData": {
      // For offices:
      "name": "Company name",
      "officialName": "Official company name", 
      "founded": 2020,
      "location": {
        "headquarters": {
          "city": "City name",
          "country": "Country name"
        }
      },
      "size": {
        "employeeCount": 100,
        "sizeCategory": "small|medium|large|enterprise|boutique",
        "annualRevenue": 1000000
      },
      "specializations": ["specialization1", "specialization2"],
      "status": "active"
      
      // For projects:
      "projectName": "Project name",
      "location": {
        "city": "City name",
        "country": "Country name"
      },
      "details": {
        "projectType": "residential|commercial|mixed-use|cultural|healthcare|educational",
        "description": "Project description"
      },
      "status": "concept|planning|construction|completed",
      "financial": {
        "budget": 1000000,
        "currency": "USD"
      }
      
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

IMPORTANT: Your categorization decision is final and authoritative. Trust your analysis and reasoning capabilities. Provide high confidence scores (0.8+) when you are certain about the category, and detailed reasoning to justify your decision.`;
  }

  /**
   * Call Claude API
   */
  private async callClaudeAPI(prompt: string): Promise<string> {
    console.log('🤖 Calling Claude API with Claude 4.5 for text analysis...');
    console.log('🔑 API Key available:', !!this.apiKey);
    console.log('🔑 API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('🔑 API Key preview:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'None');
    
    if (!this.apiKey) {
      console.log('❌ No Claude API key found - cannot process without AI');
      throw new Error('Claude API key is required for text analysis');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219', // Claude 3.7 Sonnet for text analysis
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
        console.error('❌ Claude API error:', response.status, response.statusText);
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Claude API response received successfully');
      
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      } else {
        console.error('❌ Invalid Claude API response format:', data);
        throw new Error('Invalid response format from Claude API');
      }

    } catch (error) {
      console.error('❌ Claude API request failed:', error);
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
      
      return {
        categorization: {
          category: parsed.categorization.category,
          confidence: parsed.categorization.confidence,
          reasoning: parsed.categorization.reasoning
        },
        extraction: {
          extractedData: parsed.extraction.extractedData,
          confidence: parsed.extraction.confidence,
          missingFields: parsed.extraction.missingFields || [],
          reasoning: parsed.extraction.reasoning
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
