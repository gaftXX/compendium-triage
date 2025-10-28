export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
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

export interface PlacesSearchResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

export interface OfficeScrapeRequest {
  location: string;
  radius: number; // in meters
  keyword?: string;
  type?: string;
}

export interface OfficeScrapeResult {
  success: boolean;
  offices: PlaceResult[];
  totalFound: number;
  error?: string;
}

export class GooglePlacesService {
  private static instance: GooglePlacesService;
  private apiKey: string | null = null;

  private constructor() {}

  public static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('Google Places API key set:', !!apiKey);
  }

  /**
   * Search for architecture offices in a specific location
   */
  public async searchArchitectureOffices(request: OfficeScrapeRequest): Promise<OfficeScrapeResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          offices: [],
          totalFound: 0,
          error: 'Google Places API key not configured'
        };
      }

      console.log('Searching for architecture offices:', request);

      // First, get the coordinates for the location
      console.log(`Geocoding location: ${request.location}`);
      const geocodeResult = await this.geocodeLocation(request.location);
      if (!geocodeResult.success) {
        console.error(`Geocoding failed: ${geocodeResult.error}`);
        return {
          success: false,
          offices: [],
          totalFound: 0,
          error: `Failed to geocode location: ${geocodeResult.error}`
        };
      }

      const { lat, lng } = geocodeResult.coordinates!;
      console.log(`Geocoded coordinates: ${lat}, ${lng}`);

      // Search for architecture-related places - specific to architecture offices only
      const searchQueries = [
        'architecture office',
        'architectural firm',
        'architect office',
        'architectural design studio',
        'arquitecto', // Spanish
        'arquitectura', // Spanish
        'estudio de arquitectura', // Spanish
        'arquitecto barcelona', // Spanish + location
        'architecture barcelona', // English + location
        'architectural consultancy',
        'architectural services',
        'architectural practice'
      ];

      let allOffices: PlaceResult[] = [];
      const seenPlaceIds = new Set<string>();

      for (const query of searchQueries) {
        console.log(`Searching for: "${query}" in ${request.location}`);
        const searchResult = await this.performNearbySearch({
          location: { lat, lng },
          radius: request.radius,
          keyword: query,
          type: 'establishment'
        });

        console.log(`Query "${query}" results:`, {
          success: searchResult.success,
          count: searchResult.results?.length || 0,
          error: searchResult.error
        });

        if (searchResult.success) {
          // Filter out duplicates and add to results
          searchResult.results.forEach(office => {
            if (!seenPlaceIds.has(office.place_id)) {
              seenPlaceIds.add(office.place_id);
              allOffices.push(office);
              console.log(`Found office: ${office.name} (${office.place_id})`);
            }
          });
        }
      }

      // Get detailed information for each office
      const detailedOffices = await this.getDetailedOfficeInfo(allOffices);

      // Filter out non-architecture businesses
      const architectureOffices = detailedOffices.filter(office => {
        const name = office.name?.toLowerCase() || '';
        const types = office.types || [];
        const businessStatus = office.business_status || '';
        
        // Exclude construction companies, home builders, and contractors
        const excludeKeywords = [
          'construction', 'contractor', 'builder', 'home builder',
          'general contractor', 'construction company', 'building contractor',
          'renovation', 'remodeling', 'home improvement', 'construction services',
          'excavation', 'concrete', 'roofing', 'plumbing', 'electrical',
          'landscaping', 'paving', 'masonry', 'carpentry', 'painting',
          'construccion', 'constructor', 'constructora', 'obra', 'reforma'
        ];
        
        // Check if name contains exclusion keywords
        const hasExcludeKeyword = excludeKeywords.some(keyword => 
          name.includes(keyword)
        );
        
        // Check if types indicate construction/contractor business
        const hasConstructionTypes = types.some(type => 
          type.includes('contractor') || 
          type.includes('construction') || 
          type.includes('home_goods_store') ||
          type.includes('hardware_store')
        );
        
        // Include only if it doesn't have exclusion keywords and doesn't have construction types
        return !hasExcludeKeyword && !hasConstructionTypes;
      });

      console.log(`Filtered results: ${detailedOffices.length} total -> ${architectureOffices.length} architecture offices`);

      return {
        success: true,
        offices: architectureOffices,
        totalFound: architectureOffices.length
      };

    } catch (error) {
      console.error('Error searching architecture offices:', error);
      return {
        success: false,
        offices: [],
        totalFound: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Geocode a location to get coordinates
   */
  private async geocodeLocation(location: string): Promise<{ success: boolean; coordinates?: { lat: number; lng: number }; error?: string }> {
    try {
      const encodedLocation = encodeURIComponent(location);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log('🧭 Geocode response status:', data.status);
      if (Array.isArray(data.results)) {
        console.log('🧭 Geocode results count:', data.results.length);
        if (data.results[0]?.formatted_address) {
          console.log('🧭 Geocode top match:', data.results[0].formatted_address);
        }
      }

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          success: true,
          coordinates: {
            lat: location.lat,
            lng: location.lng
          }
        };
      } else {
        if ((data as any).error_message) {
          console.warn('Geocoding API error_message:', (data as any).error_message);
        }
        return {
          success: false,
          error: `Geocoding failed: ${data.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding error'
      };
    }
  }

  /**
   * Perform nearby search using Google Places API
   */
  private async performNearbySearch(params: {
    location: { lat: number; lng: number };
    radius: number;
    keyword: string;
    type: string;
  }): Promise<{ success: boolean; results: PlaceResult[]; error?: string }> {
    try {
      const { location: { lat, lng }, radius, keyword, type } = params;
      const encodedKeyword = encodeURIComponent(keyword);
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodedKeyword}&type=${type}&key=${this.apiKey}`;
      const redacted = url.replace(/key=[^&]+/, 'key=REDACTED');
      console.log('Places nearby request:', { url: redacted, lat, lng, radius, keyword, type });

      const response = await fetch(url);
      const data: PlacesSearchResponse = await response.json();
      console.log('Places nearby status:', data.status);

      if (data.status === 'OK') {
        console.log('Places nearby results count:', data.results.length);
        if (data.results.length > 0) {
          console.log('First 3 results:', data.results.slice(0, 3).map(r => r.name));
        }
        return {
          success: true,
          results: data.results
        };
      } else {
        console.warn('Places API non-OK status:', data.status);
        if ((data as any).error_message) {
          console.warn('Places API error_message:', (data as any).error_message);
        }
        return {
          success: false,
          results: [],
          error: `Places API error: ${data.status}`
        };
      }
    } catch (error) {
      console.error('Places nearby error:', error);
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Places API error'
      };
    }
  }

  /**
   * Get detailed information for each office
   */
  private async getDetailedOfficeInfo(offices: PlaceResult[]): Promise<PlaceResult[]> {
    const detailedOffices: PlaceResult[] = [];

    for (const office of offices) {
      try {
        const details = await this.getPlaceDetails(office.place_id);
        if (details.success) {
          detailedOffices.push(details.place!);
          console.log('Detailed place fetched:', details.place?.name || office.name);
        } else {
          // If details fail, use the basic office info
          detailedOffices.push(office);
        }
      } catch (error) {
        console.warn(`Failed to get details for ${office.name}:`, error);
        detailedOffices.push(office);
      }
    }

    return detailedOffices;
  }

  /**
   * Get detailed place information
   */
  private async getPlaceDetails(placeId: string): Promise<{ success: boolean; place?: PlaceResult; error?: string }> {
    try {
      const fields = 'place_id,name,formatted_address,geometry,types,rating,user_ratings_total,business_status,website,international_phone_number,opening_hours,photos';
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return {
          success: true,
          place: data.result
        };
      } else {
        return {
          success: false,
          error: `Place details error: ${data.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Place details error'
      };
    }
  }
}
