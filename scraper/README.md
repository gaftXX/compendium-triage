# Office Scraper Module

This module provides functionality to scrape architecture offices from Google Places API based on location and radius parameters.

## Features

- **AI-Powered Detection**: Automatically detects office scraping requests from natural language input
- **Google Places Integration**: Uses Google Places API to find architecture offices
- **Location & Radius Support**: Supports custom locations and search radius
- **Detailed Office Information**: Retrieves comprehensive office details including ratings, contact info, and business status
- **Session Management**: Tracks scraping sessions with unique IDs
- **Error Handling**: Robust error handling and user feedback

## Components

### GooglePlacesService

Handles all Google Places API interactions:

- **Geocoding**: Converts location names to coordinates
- **Nearby Search**: Searches for places within specified radius
- **Place Details**: Retrieves detailed information for each place
- **Multiple Keywords**: Searches using various architecture-related keywords

### OfficeScraperService

Main orchestrator for office scraping:

- **Prompt Detection**: Recognizes office scraping requests from user input
- **Session Management**: Creates and tracks scraping sessions
- **Result Formatting**: Formats results for display
- **API Key Management**: Handles Google Places API key configuration

## Usage

### Basic Usage

1. **Detect Scrape Request**: The system automatically detects prompts like:
   - "office scrape in Barcelona"
   - "make a office scrape in New York"
   - "scrape offices in London"

2. **Start Scraping**: Type "start scraper" to begin the search

3. **View Results**: Results are automatically displayed with office details

### Advanced Usage

**Specify Radius**:
- "office scrape in Barcelona within 5km"
- "make a office scrape in New York within 10 miles"

**Custom Keywords**: The system searches for multiple architecture-related terms:
- architecture office
- architectural firm
- architect office
- design studio
- architectural design
- building design

## API Integration

### Environment Variables

```bash
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### Required Google APIs

- Places API
- Geocoding API

## Data Structure

### PlaceResult

```typescript
interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  website?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}
```

### ScrapeSession

```typescript
interface ScrapeSession {
  id: string;
  location: string;
  radius: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results?: OfficeScrapeResult;
  createdAt: Date;
  completedAt?: Date;
}
```

## Error Handling

The service handles various error scenarios:

- **API Key Missing**: Clear error message when Google Places API key is not configured
- **Location Not Found**: Handles geocoding failures gracefully
- **API Quota Exceeded**: Provides appropriate error messages
- **Network Issues**: Retries and fallback mechanisms

## Performance Considerations

- **Rate Limiting**: Respects Google Places API rate limits
- **Caching**: Results are cached to avoid duplicate API calls
- **Session Cleanup**: Old sessions are automatically cleaned up
- **Efficient Searching**: Uses multiple targeted searches instead of broad queries

## Testing

Run tests with:

```bash
npm test scraper/__tests__/officeScraperService.test.ts
```

## Security

- API keys are stored in environment variables
- No sensitive data is logged
- API keys are not exposed in client-side code
- Proper error handling prevents information leakage

## Future Enhancements

- **Batch Processing**: Support for multiple locations
- **Export Functionality**: Export results to various formats
- **Advanced Filtering**: Filter by rating, business status, etc.
- **Map Integration**: Visual display of found offices
- **Data Persistence**: Save results to database
