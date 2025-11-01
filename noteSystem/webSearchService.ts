/**
 * Web Search Service for Office Location Research
 * Uses web search to find country/location information for offices
 */

export interface WebSearchResult {
  success: boolean;
  data?: {
    country?: string;
    city?: string;
    headquarters?: string;
    website?: string;
    description?: string;
  };
  error?: string;
}

export class WebSearchService {
  private static instance: WebSearchService;
  private searchCache: Map<string, WebSearchResult> = new Map();

  public static getInstance(): WebSearchService {
    if (!WebSearchService.instance) {
      WebSearchService.instance = new WebSearchService();
    }
    return WebSearchService.instance;
  }

  /**
   * Search for office location information using web search
   */
  async searchOfficeLocation(officeName: string): Promise<WebSearchResult> {
    try {
      // Check cache first
      const cacheKey = officeName.toLowerCase().trim();
      if (this.searchCache.has(cacheKey)) {
        console.log('Using cached search result for:', officeName);
        return this.searchCache.get(cacheKey)!;
      }

      console.log('Searching web for office location:', officeName);
      
      // Create search query
      const searchQuery = `${officeName} architecture firm headquarters location country city`;
      
      // Use a web search API (you can replace this with your preferred search API)
      const searchResult = await this.performWebSearch(searchQuery);
      
      if (searchResult.success && searchResult.data) {
        // Cache the result
        this.searchCache.set(cacheKey, searchResult);
        console.log('Web search successful for:', officeName);
        return searchResult;
      } else {
        console.log('Web search failed for:', officeName);
        return {
          success: false,
          error: searchResult.error || 'Web search failed'
        };
      }
      
    } catch (error) {
      console.error('Web search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown web search error'
      };
    }
  }

  /**
   * Perform actual web search (placeholder - implement with your preferred search API)
   */
  private async performWebSearch(query: string): Promise<WebSearchResult> {
    try {
      // For now, we'll use a mock search that simulates finding location data
      // In production, you would integrate with a real search API like:
      // - Google Custom Search API
      // - Bing Search API
      // - SerpAPI
      // - DuckDuckGo API
      
      console.log('Mock web search for query:', query);
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock location extraction based on common architecture firms
      const mockResults = this.getMockLocationData(query);
      
      if (mockResults) {
        return {
          success: true,
          data: mockResults
        };
      } else {
        return {
          success: false,
          error: 'No location information found'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search API error'
      };
    }
  }

  /**
   * Mock location data for common architecture firms
   * In production, this would be replaced with actual web search results
   */
  private getMockLocationData(query: string): any {
    const queryLower = query.toLowerCase();
    
    // Common architecture firms and their locations
    const firmLocations: { [key: string]: any } = {
      'gensler': {
        country: 'United States',
        city: 'San Francisco',
        headquarters: 'San Francisco, California, United States',
        website: 'https://www.gensler.com',
        description: 'Global architecture and design firm headquartered in San Francisco'
      },
      'foster': {
        country: 'United Kingdom',
        city: 'London',
        headquarters: 'London, United Kingdom',
        website: 'https://www.fosterandpartners.com',
        description: 'British international architecture firm based in London'
      },
      'zaha hadid': {
        country: 'United Kingdom',
        city: 'London',
        headquarters: 'London, United Kingdom',
        website: 'https://www.zaha-hadid.com',
        description: 'International architecture and design firm founded by Zaha Hadid'
      },
      'norman foster': {
        country: 'United Kingdom',
        city: 'London',
        headquarters: 'London, United Kingdom',
        website: 'https://www.fosterandpartners.com',
        description: 'British architecture firm founded by Norman Foster'
      },
      'renzo piano': {
        country: 'Italy',
        city: 'Genoa',
        headquarters: 'Genoa, Italy',
        website: 'https://www.rpbw.com',
        description: 'Italian architecture firm founded by Renzo Piano'
      },
      'santiago calatrava': {
        country: 'Spain',
        city: 'Valencia',
        headquarters: 'Valencia, Spain',
        website: 'https://www.calatrava.com',
        description: 'Spanish architect and structural engineer'
      },
      'rem koolhaas': {
        country: 'Netherlands',
        city: 'Rotterdam',
        headquarters: 'Rotterdam, Netherlands',
        website: 'https://www.oma.eu',
        description: 'Dutch architect and founder of OMA'
      },
      'oma': {
        country: 'Netherlands',
        city: 'Rotterdam',
        headquarters: 'Rotterdam, Netherlands',
        website: 'https://www.oma.eu',
        description: 'Office for Metropolitan Architecture based in Rotterdam'
      }
    };

    // Find matching firm
    for (const [firmName, locationData] of Object.entries(firmLocations)) {
      if (queryLower.includes(firmName)) {
        return locationData;
      }
    }

    return null;
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    console.log('Web search cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.searchCache.size,
      keys: Array.from(this.searchCache.keys())
    };
  }
}
