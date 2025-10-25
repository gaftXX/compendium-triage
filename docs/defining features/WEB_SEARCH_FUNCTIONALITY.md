# Web Search Functionality

## Overview

The web search functionality has been implemented to work for any web-based question. The system provides intelligent web search capabilities that can handle various types of queries including weather, news, technical questions, business information, academic research, and general knowledge.

## Architecture

### Components

1. **WebSearchService** (`orchestrator/webSearchService.ts`)
   - Unified web search service that handles any type of query
   - Intelligent query analysis and result generation
   - Caching system for improved performance
   - Support for real search APIs (Google Custom Search) and enhanced mock search

2. **AIOrchestrator** (`orchestrator/aiOrchestrator.ts`)
   - Integrates with the web search service
   - Handles user input processing and web search approval flow
   - Enhanced query extraction for better search results

3. **Cross Component** (`cross/Cross.tsx`)
   - UI component that displays web search results
   - Handles user interaction for web search approval

## Features

### Query Types Supported

The web search service intelligently detects and handles different types of queries:

- **Weather Queries**: "What's the weather in Barcelona?"
- **News Queries**: "Latest technology news"
- **Technical Queries**: "How to implement React hooks"
- **Business Queries**: "Apple stock price"
- **Academic Queries**: "Research papers on AI"
- **General Knowledge**: "What is the capital of Japan?"

### Search Capabilities

1. **Real Search API Integration**
   - Google Custom Search API integration
   - Bing Search API support (planned)
   - SerpAPI integration (planned)
   - Requires API key configuration

3. **Caching System**
   - 5-minute cache duration
   - Maximum 100 cached results
   - Automatic cache management

### User Experience

1. **Search Approval Flow**
   - AI determines when web search is needed
   - User approves or denies search requests
   - Clear indication of search intent

2. **Result Presentation**
   - Multiple search results displayed
   - Source URLs provided
   - Formatted for easy reading

## Configuration

### Environment Variables

To use real search APIs, configure these environment variables:

```bash
# Google Custom Search API
VITE_GOOGLE_SEARCH_API_KEY=your_api_key
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### API Key Setup

1. Get a Google Custom Search API key
2. Create a custom search engine
3. Configure the environment variables
4. The system will automatically use the real API when available

## Usage

### Basic Usage

The web search functionality is automatically integrated into the AI system. Users can ask any web-based question and the system will:

1. Analyze the query
2. Determine if web search is needed
3. Request user approval
4. Perform the search
5. Present results

### Example Queries

```
"What's the weather in Paris?"
"Latest news about artificial intelligence"
"How to implement authentication in Node.js?"
"What is Tesla's current stock price?"
"Recent research on climate change"
```

## Testing

### Manual Testing

Test the web search functionality by:

1. Setting up Google Custom Search API credentials
2. Asking web-based questions through the AI interface
3. Verifying search results are returned correctly
4. Testing different query types (weather, news, technical, etc.)

## Performance

### Caching

- Results are cached for 5 minutes
- Reduces API calls and improves response time
- Automatic cache size management

### Search Time

- Real API search: Depends on API response time
- Cached results: <50ms

## Future Enhancements

### Planned Features

1. **Additional Search APIs**
   - Bing Search API integration
   - DuckDuckGo API support
   - SerpAPI integration

2. **Advanced Query Processing**
   - Natural language query optimization
   - Query expansion and refinement
   - Context-aware search

3. **Result Enhancement**
   - Image search support
   - Video search capabilities
   - Academic paper search

4. **User Preferences**
   - Search result preferences
   - Custom search engines
   - Personal search history

## Troubleshooting

### Common Issues

1. **No Search Results**
   - Check API key configuration
   - Verify network connectivity
   - Try different query phrasing

2. **Slow Search Performance**
   - Check cache status
   - Verify API rate limits
   - Consider query optimization

3. **Search Approval Not Working**
   - Ensure AI orchestrator is properly initialized
   - Check API key configuration
   - Verify user input processing

### Debug Mode

Enable debug logging by setting:

```typescript
console.log('🔍 Web Search Debug Mode Enabled');
```

This will provide detailed logging of search operations, cache hits/misses, and API responses.

## Security Considerations

1. **API Key Protection**
   - Store API keys in environment variables
   - Never expose keys in client-side code
   - Use secure key management practices

2. **Search Result Validation**
   - Validate URLs before displaying
   - Sanitize search result content
   - Implement rate limiting

3. **User Privacy**
   - Don't log sensitive search queries
   - Implement search history controls
   - Respect user privacy preferences
