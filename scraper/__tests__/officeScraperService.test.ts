import { OfficeScraperService } from '../officeScraperService';

describe('OfficeScraperService', () => {
  let service: OfficeScraperService;

  beforeEach(() => {
    service = OfficeScraperService.getInstance();
  });

  describe('detectScrapePrompt', () => {
    it('should detect office scrape prompts with location', () => {
      const prompts = [
        'office scrape in Barcelona',
        'make a office scrape in New York',
        'scrape offices in London',
        'find architecture offices in Tokyo',
        'start office scraper in Paris'
      ];

      prompts.forEach(prompt => {
        const result = service.detectScrapePrompt(prompt);
        expect(result).not.toBeNull();
        expect(result?.confirmed).toBe(false);
        expect(result?.location).toBeDefined();
      });
    });

    it('should detect office scrape prompts with radius', () => {
      const prompt = 'office scrape in Barcelona within 5km';
      const result = service.detectScrapePrompt(prompt);
      
      expect(result).not.toBeNull();
      expect(result?.location).toBe('Barcelona');
      expect(result?.radius).toBe(5000); // 5km in meters
    });

    it('should detect office scrape prompts with miles', () => {
      const prompt = 'make a office scrape in New York within 10 miles';
      const result = service.detectScrapePrompt(prompt);
      
      expect(result).not.toBeNull();
      expect(result?.location).toBe('New York');
      expect(result?.radius).toBeCloseTo(16093.4, 1); // 10 miles in meters
    });

    it('should return null for non-scrape prompts', () => {
      const prompts = [
        'hello world',
        'show me offices',
        'what is the weather',
        'add a note'
      ];

      prompts.forEach(prompt => {
        const result = service.detectScrapePrompt(prompt);
        expect(result).toBeNull();
      });
    });

    it('should return null for prompts without location', () => {
      const prompt = 'office scrape';
      const result = service.detectScrapePrompt(prompt);
      
      expect(result).not.toBeNull();
      expect(result?.location).toBeUndefined();
    });

    it('should detect start office scraper command', () => {
      const prompt = 'start office scraper';
      const result = service.detectScrapePrompt(prompt);
      
      expect(result).not.toBeNull();
      expect(result?.confirmed).toBe(false);
      expect(result?.location).toBeUndefined();
    });
  });

  describe('formatResults', () => {
    it('should format successful results', () => {
      const results = {
        success: true,
        offices: [
          {
            place_id: '1',
            name: 'Test Architecture Office',
            formatted_address: '123 Test St, Test City',
            geometry: { location: { lat: 40.7128, lng: -74.0060 } },
            types: ['establishment'],
            rating: 4.5,
            user_ratings_total: 100,
            website: 'https://test.com',
            international_phone_number: '+1234567890',
            business_status: 'OPERATIONAL'
          }
        ],
        totalFound: 1
      };

      const formatted = service.formatResults(results);
      
      expect(formatted).toContain('Found 1 architecture offices');
      expect(formatted).toContain('Test Architecture Office');
      expect(formatted).toContain('123 Test St, Test City');
      expect(formatted).toContain('Rating: 4.5/5');
      expect(formatted).toContain('https://test.com');
    });

    it('should format failed results', () => {
      const results = {
        success: false,
        offices: [],
        totalFound: 0,
        error: 'API key not configured'
      };

      const formatted = service.formatResults(results);
      
      expect(formatted).toContain('Scraping failed: API key not configured');
    });

    it('should format empty results', () => {
      const results = {
        success: true,
        offices: [],
        totalFound: 0
      };

      const formatted = service.formatResults(results);
      
      expect(formatted).toContain('No architecture offices found');
    });
  });
});
