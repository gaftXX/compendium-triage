// Unified Web Search Service - Works for any web-based question
// This service provides real web search capabilities for any type of query

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  relevanceScore?: number;
}

export interface WebSearchResponse {
  success: boolean;
  results: WebSearchResult[];
  error?: string;
  totalResults?: number;
  searchTime?: number;
}

export interface WebSearchRequest {
  query: string;
  maxResults?: number;
  searchType?: 'general' | 'news' | 'academic' | 'images';
}

export class WebSearchService {
  private static instance: WebSearchService | null = null;
  private searchCache: Map<string, WebSearchResponse> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private constructor() {}

  static getInstance(): WebSearchService {
    if (!this.instance) {
      this.instance = new WebSearchService();
    }
    return this.instance;
  }

  /**
   * Perform a web search for any type of query
   */
  async searchWeb(request: WebSearchRequest): Promise<WebSearchResponse> {
    try {
      console.log('🔍 Web Search Service searching for:', request.query);
      
      // Check cache first
      const cacheKey = this.getCacheKey(request);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        console.log('📋 Using cached search result');
        return cachedResult;
      }

      const startTime = Date.now();
      
      // Perform the actual web search
      const searchResults = await this.performWebSearch(request);
      
      const searchTime = Date.now() - startTime;
      searchResults.searchTime = searchTime;
      
      // Cache the result
      this.cacheResult(cacheKey, searchResults);
      
      console.log(`✅ Web search completed in ${searchTime}ms, found ${searchResults.results.length} results`);
      return searchResults;
      
    } catch (error) {
      console.error('❌ Web Search error:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown search error'
      };
    }
  }

  /**
   * Perform actual web search using real APIs
   */
  private async performWebSearch(request: WebSearchRequest): Promise<WebSearchResponse> {
    try {
      // Use real search API
      const realSearchResult = await this.tryRealSearchAPI(request);
      if (realSearchResult.success && realSearchResult.results.length > 0) {
        return realSearchResult;
      }

      // If no real API is configured, return error
      return {
        success: false,
        results: [],
        error: 'No search API configured. Please set up Google Custom Search API or another search service.'
      };
      
    } catch (error) {
      console.error('Error in web search:', error);
      return {
        success: false,
        results: [],
        error: 'Search service unavailable'
      };
    }
  }

  /**
   * Try to use a real search API (Google Custom Search, Bing, etc.)
   */
  private async tryRealSearchAPI(request: WebSearchRequest): Promise<WebSearchResponse> {
    // Check if we have API keys configured
    const googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
    const googleSearchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
    
    console.log('🔍 Web Search API Debug:');
    console.log('Google API Key available:', !!googleApiKey);
    console.log('Google Search Engine ID available:', !!googleSearchEngineId);
    console.log('API Key preview:', googleApiKey ? `${googleApiKey.substring(0, 10)}...` : 'Not found');
    console.log('Search Engine ID:', googleSearchEngineId);
    
    if (googleApiKey && googleSearchEngineId) {
      console.log('✅ Using Google Custom Search API');
      return await this.performGoogleSearch(request, googleApiKey, googleSearchEngineId);
    }

    // If no real API is configured, return error
    console.log('❌ No search API configured');
    return {
      success: false,
      results: [],
      error: 'No search API configured. Please set up Google Custom Search API.'
    };
  }

  /**
   * Perform Google Custom Search
   */
  private async performGoogleSearch(
    request: WebSearchRequest, 
    apiKey: string, 
    searchEngineId: string
  ): Promise<WebSearchResponse> {
    try {
      const maxResults = request.maxResults || 10;
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(request.query)}&num=${maxResults}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results: WebSearchResult[] = (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        content: item.snippet
      }));
      
      return {
        success: true,
        results,
        totalResults: parseInt(data.searchInformation?.totalResults || '0')
      };
      
    } catch (error) {
      console.error('Google Search API error:', error);
      return {
        success: false,
        results: [],
        error: 'Google Search API error'
      };
    }
  }


  /**
   * Cache management methods
   */
  private getCacheKey(request: WebSearchRequest): string {
    return `${request.query.toLowerCase()}_${request.maxResults || 5}_${request.searchType || 'general'}`;
  }

  private getCachedResult(cacheKey: string): WebSearchResponse | null {
    const cached = this.searchCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    return null;
  }

  private isCacheValid(cached: WebSearchResponse): boolean {
    // For now, we'll use a simple time-based cache
    // In a real implementation, you'd store timestamps
    return true; // Simplified for mock implementation
  }

  private cacheResult(cacheKey: string, result: WebSearchResponse): void {
    // Implement cache size limit
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    
    this.searchCache.set(cacheKey, result);
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    console.log('🗑️ Web search cache cleared');
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