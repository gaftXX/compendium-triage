// Office ID System Test Suite

import {
  generateOfficeId,
  checkOfficeIdCollision,
  parseOfficeId,
  generateCityCode,
  getCityCodeWithAlternatives,
  getAllPossibleOfficeIds,
  getAvailableOfficeIds,
  suggestOfficeIdAlternatives,
  getOfficeIdStats,
  COUNTRY_CODES,
  type OfficeIdGenerationOptions,
  type OfficeIdGenerationResult,
  type CollisionCheckResult
} from './officeIdSystem';

// ============================================================================
// MOCK FIREBASE FUNCTIONS (for testing without actual Firebase)
// ============================================================================

// Mock Firestore functions
const mockFirestore = {
  doc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
};

// Mock Firebase config
jest.mock('./config', () => ({
  getFirestoreInstance: () => mockFirestore
}));

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Office ID System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Country Code Validation', () => {
    test('should have valid country codes', () => {
      expect(COUNTRY_CODES['GB']).toBeDefined();
      expect(COUNTRY_CODES['GB'].name).toBe('United Kingdom');
      expect(COUNTRY_CODES['GB'].continent).toBe('Europe');
      expect(COUNTRY_CODES['GB'].majorCities).toContain('London');
    });

    test('should have major countries covered', () => {
      const majorCountries = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'AU', 'CA'];
      majorCountries.forEach(country => {
        expect(COUNTRY_CODES[country]).toBeDefined();
      });
    });

    test('should have at least 50 countries', () => {
      expect(Object.keys(COUNTRY_CODES).length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('City Code Generation', () => {
    test('should generate city code from single word', () => {
      expect(generateCityCode('London')).toBe('LO');
      expect(generateCityCode('Paris')).toBe('PA');
      expect(generateCityCode('Tokyo')).toBe('TO');
    });

    test('should generate city code from multiple words', () => {
      expect(generateCityCode('New York')).toBe('NY');
      expect(generateCityCode('Los Angeles')).toBe('LA');
      expect(generateCityCode('San Francisco')).toBe('SF');
    });

    test('should handle special characters', () => {
      expect(generateCityCode('São Paulo')).toBe('SA');
      expect(generateCityCode('Köln')).toBe('KO');
      expect(generateCityCode('México City')).toBe('ME');
    });

    test('should throw error for invalid input', () => {
      expect(() => generateCityCode('')).toThrow();
      expect(() => generateCityCode('A')).toThrow();
      expect(() => generateCityCode('123')).toThrow();
    });
  });

  describe('City Code Alternatives', () => {
    test('should generate alternatives for multi-word cities', () => {
      const alternatives = getCityCodeWithAlternatives('New York', 'US');
      expect(alternatives).toHaveLength(4);
      expect(alternatives[0].code).toBe('NY');
      expect(alternatives[1].code).toBe('NY'); // First + third word (if exists)
      expect(alternatives[2].code).toBe('YO'); // Second word
      expect(alternatives[3].code).toBe('NE'); // First word
    });

    test('should handle single word cities', () => {
      const alternatives = getCityCodeWithAlternatives('London', 'GB');
      expect(alternatives).toHaveLength(1);
      expect(alternatives[0].code).toBe('LO');
    });
  });

  describe('Office ID Generation', () => {
    test('should generate valid office ID format', async () => {
      mockFirestore.getDoc.mockResolvedValue({ exists: () => false });
      
      const result = await generateOfficeId({
        country: 'GB',
        city: 'London',
        checkCollision: false
      });

      expect(result.success).toBe(true);
      expect(result.officeId).toMatch(/^GBLO\d{3}$/);
      expect(result.officeId).toHaveLength(7);
    });

    test('should handle collision detection', async () => {
      // Mock collision found
      mockFirestore.getDoc.mockResolvedValueOnce({ 
        exists: () => true,
        data: () => ({ name: 'Existing Office' })
      });
      
      // Mock no collision
      mockFirestore.getDoc.mockResolvedValueOnce({ exists: () => false });

      const result = await generateOfficeId({
        country: 'GB',
        city: 'London',
        maxRetries: 2
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBeGreaterThan(1);
    });

    test('should fail for invalid country code', async () => {
      const result = await generateOfficeId({
        country: 'XX',
        city: 'London',
        checkCollision: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid country code');
    });

    test('should retry on collision', async () => {
      // Mock multiple collisions then success
      mockFirestore.getDoc
        .mockResolvedValueOnce({ exists: () => true })
        .mockResolvedValueOnce({ exists: () => true })
        .mockResolvedValueOnce({ exists: () => false });

      const result = await generateOfficeId({
        country: 'GB',
        city: 'London',
        maxRetries: 3
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });
  });

  describe('Office ID Parsing', () => {
    test('should parse valid office ID', () => {
      const parsed = parseOfficeId('GBLO482');
      
      expect(parsed.country).toBe('GB');
      expect(parsed.city).toBe('LO');
      expect(parsed.number).toBe('482');
      expect(parsed.countryInfo?.name).toBe('United Kingdom');
      expect(parsed.validation.isValid).toBe(true);
    });

    test('should throw error for invalid format', () => {
      expect(() => parseOfficeId('INVALID')).toThrow();
      expect(() => parseOfficeId('GBLO99')).toThrow(); // Number too small
      expect(() => parseOfficeId('GBLO1000')).toThrow(); // Too long
    });
  });

  describe('Collision Detection', () => {
    test('should detect existing office ID', async () => {
      mockFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Existing Office' })
      });

      const result = await checkOfficeIdCollision('GBLO482');
      
      expect(result.found).toBe(true);
      expect(result.existingOfficeId).toBe('GBLO482');
      expect(result.existingOfficeName).toBe('Existing Office');
      expect(result.collisionType).toBe('exact');
    });

    test('should return no collision for non-existent ID', async () => {
      mockFirestore.getDoc.mockResolvedValue({ exists: () => false });

      const result = await checkOfficeIdCollision('GBLO999');
      
      expect(result.found).toBe(false);
    });

    test('should handle invalid office ID format', async () => {
      const result = await checkOfficeIdCollision('INVALID');
      
      expect(result.found).toBe(false);
    });
  });

  describe('Office ID Utilities', () => {
    test('should get all possible office IDs for country/city', () => {
      const possibleIds = getAllPossibleOfficeIds('GB', 'LO');
      
      expect(possibleIds).toHaveLength(900);
      expect(possibleIds[0]).toBe('GBLO100');
      expect(possibleIds[899]).toBe('GBLO999');
      expect(possibleIds).toContain('GBLO482');
    });

    test('should get available office IDs', async () => {
      // Mock some collisions
      mockFirestore.getDoc
        .mockResolvedValueOnce({ exists: () => true }) // GBLO100 taken
        .mockResolvedValueOnce({ exists: () => false }) // GBLO101 available
        .mockResolvedValueOnce({ exists: () => false }); // GBLO102 available

      const available = await getAvailableOfficeIds('GB', 'LO');
      
      expect(available).toContain('GBLO101');
      expect(available).toContain('GBLO102');
      expect(available).not.toContain('GBLO100');
    });

    test('should suggest office ID alternatives', async () => {
      // Mock some available IDs
      mockFirestore.getDoc
        .mockResolvedValueOnce({ exists: () => false }) // GBLO100
        .mockResolvedValueOnce({ exists: () => false }) // GBLO101
        .mockResolvedValueOnce({ exists: () => false }); // GBLO102

      const suggestions = await suggestOfficeIdAlternatives('GB', 'London', 3);
      
      expect(suggestions.suggestions).toHaveLength(3);
      expect(suggestions.countryInfo.name).toBe('United Kingdom');
      expect(suggestions.cityCodeInfo[0].code).toBe('LO');
    });
  });

  describe('Statistics', () => {
    test('should get office ID statistics', async () => {
      // Mock some offices
      mockFirestore.getDocs.mockResolvedValue({
        size: 5,
        forEach: (callback: any) => {
          const mockDocs = [
            { id: 'GBLO100', data: () => ({ name: 'Office 1' }) },
            { id: 'GBLO101', data: () => ({ name: 'Office 2' }) },
            { id: 'USNE200', data: () => ({ name: 'Office 3' }) },
            { id: 'USNE201', data: () => ({ name: 'Office 4' }) },
            { id: 'FRPA300', data: () => ({ name: 'Office 5' }) }
          ];
          mockDocs.forEach(callback);
        }
      });

      const stats = await getOfficeIdStats();
      
      expect(stats.totalUsed).toBe(5);
      expect(stats.usageByCountry['GB']).toBe(2);
      expect(stats.usageByCountry['US']).toBe(2);
      expect(stats.usageByCountry['FR']).toBe(1);
      expect(stats.collisionRate).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle Firebase errors gracefully', async () => {
      mockFirestore.getDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await checkOfficeIdCollision('GBLO482');
      
      expect(result.found).toBe(false);
    });

    test('should handle network errors in generation', async () => {
      mockFirestore.getDoc.mockRejectedValue(new Error('Network error'));

      const result = await generateOfficeId({
        country: 'GB',
        city: 'London',
        maxRetries: 1
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long city names', () => {
      const longCity = 'San Francisco de Asís de la Paz y Buenaventura';
      const code = generateCityCode(longCity);
      expect(code).toHaveLength(2);
      expect(code).toBe('SA');
    });

    test('should handle cities with numbers', () => {
      const cityWithNumbers = 'New York 123';
      const code = generateCityCode(cityWithNumbers);
      expect(code).toBe('NY');
    });

    test('should handle special characters in city names', () => {
      const specialCity = 'São Paulo';
      const code = generateCityCode(specialCity);
      expect(code).toBe('SA');
    });

    test('should handle maximum retries', async () => {
      // Mock all collisions
      mockFirestore.getDoc.mockResolvedValue({ exists: () => true });

      const result = await generateOfficeId({
        country: 'GB',
        city: 'London',
        maxRetries: 2
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
      expect(result.error).toContain('Failed to generate unique office ID');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Office ID System Integration', () => {
  test('should generate and validate complete workflow', async () => {
    // Mock no collision
    mockFirestore.getDoc.mockResolvedValue({ exists: () => false });

    // Generate office ID
    const generationResult = await generateOfficeId({
      country: 'GB',
      city: 'London'
    });

    expect(generationResult.success).toBe(true);
    expect(generationResult.officeId).toBeDefined();

    // Parse the generated ID
    const parsed = parseOfficeId(generationResult.officeId!);
    expect(parsed.country).toBe('GB');
    expect(parsed.city).toBe('LO');
    expect(parsed.number).toMatch(/^\d{3}$/);

    // Check collision (should not exist)
    const collisionCheck = await checkOfficeIdCollision(generationResult.officeId!);
    expect(collisionCheck.found).toBe(false);
  });

  test('should handle multiple city code alternatives', async () => {
    // Mock no collision
    mockFirestore.getDoc.mockResolvedValue({ exists: () => false });

    const result = await generateOfficeId({
      country: 'US',
      city: 'New York'
    });

    expect(result.success).toBe(true);
    expect(result.officeId).toMatch(/^US(NY|NE|YO)\d{3}$/);
  });
});
