// Search Result Analyzer - AI service that analyzes web search results and provides direct answers

export interface SearchResultAnalysis {
  success: boolean;
  answer: string;
  confidence: number;
  sources: string[];
  error?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export class SearchResultAnalyzer {
  private static instance: SearchResultAnalyzer | null = null;
  private apiKey: string = '';

  private constructor() {}

  static getInstance(): SearchResultAnalyzer {
    if (!this.instance) {
      this.instance = new SearchResultAnalyzer();
    }
    return this.instance;
  }

  /**
   * Set the API key for Claude AI
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Analyze search results and provide a direct answer to the user's question
   */
  async analyzeSearchResults(
    userQuestion: string, 
    searchResults: SearchResult[]
  ): Promise<SearchResultAnalysis> {
    try {
      console.log('Analyzing search results for question:', userQuestion);
      console.log('Search results to analyze:', searchResults.length);
      console.log('API key available:', !!this.apiKey);
      
      if (!this.apiKey) {
        console.log('No API key available for analysis');
        return {
          success: false,
          answer: 'AI analysis unavailable - no API key configured',
          confidence: 0,
          sources: [],
          error: 'No API key available'
        };
      }

      const prompt = this.buildAnalysisPrompt(userQuestion, searchResults);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const analysis = this.parseAnalysisResponse(data, searchResults);
      
      // If analysis failed or gave a generic response, try direct extraction
      if (!analysis.success || analysis.answer.toLowerCase().includes('cannot provide') || analysis.answer.toLowerCase().includes('visit')) {
        console.log('AI analysis failed, trying direct extraction');
        const directAnswer = this.extractDirectAnswer(userQuestion, searchResults);
        if (directAnswer) {
          return {
            success: true,
            answer: directAnswer,
            confidence: 0.9,
            sources: searchResults.map(r => r.url).slice(0, 3)
          };
        }
      }
      
      console.log('Search results analyzed successfully');
      return analysis;

    } catch (error) {
      console.error('Search result analysis error:', error);
      return {
        success: false,
        answer: 'Failed to analyze search results',
        confidence: 0,
        sources: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build the analysis prompt for Claude
   */
  private buildAnalysisPrompt(userQuestion: string, searchResults: SearchResult[]): string {
    let prompt = `You are an AI assistant that analyzes web search results to provide direct, concise answers to user questions.

User Question: "${userQuestion}"

Search Results:
`;

    searchResults.forEach((result, index) => {
      prompt += `\n${index + 1}. Title: ${result.title}\n`;
      prompt += `   Content: ${result.content || result.snippet}\n`;
      prompt += `   Source: ${result.url}\n`;
    });

    prompt += `\nInstructions:
1. Look at the search results above and extract the EXACT information that answers the user's question
2. If the search results contain current time, weather, or specific data, provide it directly
3. Do NOT say you cannot provide the information - extract what's available from the results
4. Be extremely direct and concise - just give the answer
5. If you see time information like "7:36 PM" or "19:36", provide it
6. If you see weather information like "22°C" or "sunny", provide it
7. Do NOT suggest websites or tell users to visit other sites
8. Do NOT give generic advice - extract the actual data from the search results

Answer format: Give the direct answer from the search results. Be specific and factual.`;

    return prompt;
  }

  /**
   * Parse Claude's analysis response
   */
  private parseAnalysisResponse(apiResponse: any, searchResults: SearchResult[]): SearchResultAnalysis {
    try {
      const content = apiResponse.content?.[0]?.text || '';
      
      // Extract sources from the search results
      const sources = searchResults.map(result => result.url);
      
      // Determine confidence based on response quality and source consistency
      let confidence = 0.8; // Default confidence
      
      // Increase confidence if multiple sources provide similar information
      if (searchResults.length > 1) {
        confidence = Math.min(0.95, confidence + (searchResults.length * 0.05));
      }
      
      // Check if the response seems definitive
      const definitiveIndicators = ['current time', 'is now', 'exactly', 'precisely'];
      const hasDefinitiveInfo = definitiveIndicators.some(indicator => 
        content.toLowerCase().includes(indicator)
      );
      
      if (hasDefinitiveInfo) {
        confidence = Math.min(0.98, confidence + 0.1);
      }
      
      return {
        success: true,
        answer: content.trim(),
        confidence: Math.round(confidence * 100) / 100,
        sources: sources.slice(0, 3) // Limit to top 3 sources
      };
      
    } catch (error) {
      return {
        success: false,
        answer: 'Failed to parse analysis response',
        confidence: 0,
        sources: [],
        error: 'Response parsing error'
      };
    }
  }

  /**
   * Quick analysis for time-related questions
   */
  async analyzeTimeQuestion(searchResults: SearchResult[]): Promise<string> {
    // Look for current time information in the search results
    for (const result of searchResults) {
      const content = result.content || result.snippet;
      
      // Look for time patterns like "7:36 PM", "19:36", "current local time"
      const timeMatch = content.match(/(\d{1,2}:\d{2}\s*(am|pm|AM|PM)?)/);
      if (timeMatch) {
        const time = timeMatch[1];
        const timezoneMatch = content.match(/(cest|gmt|utc|pht|time zone)/i);
        if (timezoneMatch) {
          return `The current time is ${time} (${timezoneMatch[1].toUpperCase()}).`;
        }
        return `The current time is ${time}.`;
      }
      
      // Look for "current local time" mentions
      if (content.toLowerCase().includes('current local time')) {
        const timeMatch = content.match(/current local time[^.]*?(\d{1,2}:\d{2}\s*(am|pm|AM|PM)?)/i);
        if (timeMatch) {
          return `The current time is ${timeMatch[1]}.`;
        }
      }
    }
    
    return 'Time information not found in search results.';
  }

  /**
   * Quick analysis for weather questions
   */
  async analyzeWeatherQuestion(searchResults: SearchResult[]): Promise<string> {
    for (const result of searchResults) {
      const content = (result.content || result.snippet).toLowerCase();
      
      // Look for temperature and weather conditions
      const tempMatch = content.match(/(\d+)\s*°[cf]/);
      const conditionMatch = content.match(/(sunny|cloudy|rainy|clear|partly cloudy|overcast)/);
      
      if (tempMatch && conditionMatch) {
        return `Current weather in Barcelona: ${tempMatch[1]}°C, ${conditionMatch[1]}.`;
      }
    }
    
    return 'Current weather information not found in search results.';
  }

  /**
   * Extract direct answer from search results using pattern matching
   */
  private extractDirectAnswer(userQuestion: string, searchResults: SearchResult[]): string | null {
    const question = userQuestion.toLowerCase();
    
    // Time questions
    if (question.includes('time') && (question.includes('what') || question.includes('current'))) {
      return this.extractTimeFromResults(searchResults);
    }
    
    // Weather questions
    if (question.includes('weather') || question.includes('temperature')) {
      return this.extractWeatherFromResults(searchResults);
    }
    
    return null;
  }

  /**
   * Extract time information from search results
   */
  private extractTimeFromResults(searchResults: SearchResult[]): string | null {
    for (const result of searchResults) {
      const content = result.content || result.snippet;
      
      // Look for time patterns
      const timeMatch = content.match(/(\d{1,2}:\d{2}\s*(am|pm|AM|PM)?)/);
      if (timeMatch) {
        const time = timeMatch[1];
        const timezoneMatch = content.match(/(cest|gmt|utc|pht|est|pst|time zone)/i);
        if (timezoneMatch) {
          return `The current time is ${time} (${timezoneMatch[1].toUpperCase()}).`;
        }
        return `The current time is ${time}.`;
      }
    }
    
    return null;
  }

  /**
   * Extract weather information from search results
   */
  private extractWeatherFromResults(searchResults: SearchResult[]): string | null {
    for (const result of searchResults) {
      const content = result.content || result.snippet;
      
      // Look for temperature and weather conditions
      const tempMatch = content.match(/(\d+)\s*°[cf]/i);
      const conditionMatch = content.match(/(sunny|cloudy|rainy|clear|partly cloudy|overcast|storm)/i);
      
      if (tempMatch && conditionMatch) {
        return `Current weather: ${tempMatch[1]}°C, ${conditionMatch[1]}.`;
      } else if (tempMatch) {
        return `Current temperature: ${tempMatch[1]}°C.`;
      }
    }
    
    return null;
  }
}
