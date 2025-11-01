// General Web Search API using Claude Sonnet 3.5
// This is a general-purpose web search service that can be used for any web search needs

export interface WebSearchRequest {
  query: string;
  context?: string;
  maxResults?: number;
}

export interface WebSearchResult {
  success: boolean;
  data?: {
    query: string;
    results: Array<{
      title: string;
      snippet: string;
      url: string;
      relevanceScore?: number;
    }>;
    summary?: string;
    extractedInfo?: any;
  };
  error?: string;
}

export class WebSearchAPI {
  private static instance: WebSearchAPI;
  private apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY || '';
  }

  public static getInstance(): WebSearchAPI {
    if (!WebSearchAPI.instance) {
      WebSearchAPI.instance = new WebSearchAPI();
    }
    return WebSearchAPI.instance;
  }

  /**
   * General web search using Claude Sonnet 3.5 with web search capabilities
   */
  public async searchWeb(request: WebSearchRequest): Promise<WebSearchResult> {
    try {
      console.log('Web Search API: Starting search for:', request.query);

      if (!this.apiKey) {
        throw new Error('No Anthropic API key found');
      }

      const prompt = this.buildSearchPrompt(request);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219', // Claude 3.7 Sonnet for web search
          max_tokens: 2000,
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
      console.log('Web Search API: Search completed');

      return this.parseSearchResults(data, request);

    } catch (error) {
      console.error('Web Search API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Search for office location information
   */
  public async searchOfficeLocation(officeName: string): Promise<WebSearchResult> {
    const query = `${officeName} architecture office`;
    
    return this.searchWeb({
      query,
      context: 'Find the headquarters location, country, and city for this architecture office',
      maxResults: 5
    });
  }

  /**
   * Build search prompt for Claude
   */
  private buildSearchPrompt(request: WebSearchRequest): string {
    let prompt = `Please search the web for current information about the architecture office: "${request.query}"`;
    
    if (request.context) {
      prompt += `\n\nContext: ${request.context}`;
    }
    
    prompt += `\n\nPlease search the web and provide:
    1. The headquarters location (city and country) of this architecture office
    2. Official website if available
    3. Brief company description focusing on their architecture work
    4. Any other relevant information about this architecture firm
    
    Respond with a JSON object in this format:
    {
      "country": "string or null",
      "city": "string or null", 
      "website": "string or null",
      "description": "string or null"
    }
    
    Use your web search capabilities to find the most current and accurate information about this architecture office.`;
    
    return prompt;
  }

  /**
   * Parse Claude's response into structured results
   */
  private parseSearchResults(apiResponse: any, request: WebSearchRequest): WebSearchResult {
    try {
      // Extract content from Claude's response
      const content = apiResponse.content?.[0]?.text || '';
      
      // Try to parse JSON response first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: {
              query: request.query,
              extractedInfo: jsonData,
              rawResponse: content
            }
          };
        } catch (jsonError) {
          console.log('JSON parse failed, falling back to text parsing');
        }
      }
      
      // Fallback to text parsing
      const results = this.extractSearchResults(content);
      const summary = this.extractSummary(content);
      
      return {
        success: true,
        data: {
          query: request.query,
          results,
          summary,
          extractedInfo: this.extractStructuredInfo(content)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse search results'
      };
    }
  }

  /**
   * Extract search results from Claude's response
   */
  private extractSearchResults(content: string): Array<{title: string, snippet: string, url: string}> {
    // This is a simplified parser - in reality, Claude's web search tool
    // would return structured data, but we need to parse the text response
    const results: Array<{title: string, snippet: string, url: string}> = [];
    
    // Look for patterns in the response that indicate search results
    const lines = content.split('\n');
    let currentResult: any = {};
    
    for (const line of lines) {
      if (line.includes('http') && line.includes('://')) {
        currentResult.url = line.trim();
      } else if (line.length > 20 && !line.includes('http')) {
        if (!currentResult.title) {
          currentResult.title = line.trim();
        } else if (!currentResult.snippet) {
          currentResult.snippet = line.trim();
        }
      }
      
      if (currentResult.url && currentResult.title && currentResult.snippet) {
        results.push(currentResult);
        currentResult = {};
      }
    }
    
    return results;
  }

  /**
   * Extract summary from Claude's response
   */
  private extractSummary(content: string): string {
    // Look for summary patterns in the response
    const summaryMatch = content.match(/summary[:\s]*(.+?)(?:\n\n|\n$)/i);
    return summaryMatch ? summaryMatch[1].trim() : 'Summary not available';
  }

  /**
   * Extract structured information (like location data)
   */
  private extractStructuredInfo(content: string): any {
    const info: any = {};
    
    // Look for location information
    const locationMatch = content.match(/location[:\s]*(.+?)(?:\n|$)/i);
    if (locationMatch) {
      info.location = locationMatch[1].trim();
    }
    
    // Look for country information
    const countryMatch = content.match(/country[:\s]*(.+?)(?:\n|$)/i);
    if (countryMatch) {
      info.country = countryMatch[1].trim();
    }
    
    // Look for city information
    const cityMatch = content.match(/city[:\s]*(.+?)(?:\n|$)/i);
    if (cityMatch) {
      info.city = cityMatch[1].trim();
    }
    
    return info;
  }
}
