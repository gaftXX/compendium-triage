// Office ID System - CCccNNN Format Implementation
// CC = ISO 3166-1 alpha-2 country code (2 letters)
// cc = First 2 letters of city (2 letters)
// NNN = Random 3-digit number (100-999)

import { getFirestoreInstance } from './config';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { validateOfficeId, type OfficeIdValidation } from '../../types/validation';

// ============================================================================
// ISO 3166-1 ALPHA-2 COUNTRY CODES (50+ countries)
// ============================================================================

export interface CountryInfo {
  code: string;
  name: string;
  continent: string;
  majorCities: string[];
}

export const COUNTRY_CODES: Record<string, CountryInfo> = {
  // Europe
  'GB': { code: 'GB', name: 'United Kingdom', continent: 'Europe', majorCities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow'] },
  'FR': { code: 'FR', name: 'France', continent: 'Europe', majorCities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  'DE': { code: 'DE', name: 'Germany', continent: 'Europe', majorCities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'] },
  'IT': { code: 'IT', name: 'Italy', continent: 'Europe', majorCities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'] },
  'ES': { code: 'ES', name: 'Spain', continent: 'Europe', majorCities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'] },
  'NL': { code: 'NL', name: 'Netherlands', continent: 'Europe', majorCities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'] },
  'CH': { code: 'CH', name: 'Switzerland', continent: 'Europe', majorCities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'] },
  'AT': { code: 'AT', name: 'Austria', continent: 'Europe', majorCities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'] },
  'BE': { code: 'BE', name: 'Belgium', continent: 'Europe', majorCities: ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège'] },
  'SE': { code: 'SE', name: 'Sweden', continent: 'Europe', majorCities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'] },
  'NO': { code: 'NO', name: 'Norway', continent: 'Europe', majorCities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand'] },
  'DK': { code: 'DK', name: 'Denmark', continent: 'Europe', majorCities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'] },
  'FI': { code: 'FI', name: 'Finland', continent: 'Europe', majorCities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku'] },
  'PL': { code: 'PL', name: 'Poland', continent: 'Europe', majorCities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan'] },
  'CZ': { code: 'CZ', name: 'Czech Republic', continent: 'Europe', majorCities: ['Prague', 'Brno', 'Ostrava', 'Plzen', 'Liberec'] },
  'HU': { code: 'HU', name: 'Hungary', continent: 'Europe', majorCities: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'] },
  'RO': { code: 'RO', name: 'Romania', continent: 'Europe', majorCities: ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Iasi', 'Constanta'] },
  'GR': { code: 'GR', name: 'Greece', continent: 'Europe', majorCities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'] },
  'PT': { code: 'PT', name: 'Portugal', continent: 'Europe', majorCities: ['Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga'] },
  'IE': { code: 'IE', name: 'Ireland', continent: 'Europe', majorCities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'] },

  // North America
  'US': { code: 'US', name: 'United States', continent: 'North America', majorCities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'] },
  'CA': { code: 'CA', name: 'Canada', continent: 'North America', majorCities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'] },
  'MX': { code: 'MX', name: 'Mexico', continent: 'North America', majorCities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Nezahualcóyotl', 'Guadalupe'] },

  // Asia
  'CN': { code: 'CN', name: 'China', continent: 'Asia', majorCities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Wuhan', 'Chengdu', 'Nanjing', 'Xi\'an', 'Hangzhou'] },
  'JP': { code: 'JP', name: 'Japan', continent: 'Asia', majorCities: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Yokohama', 'Kawasaki', 'Saitama'] },
  'KR': { code: 'KR', name: 'South Korea', continent: 'Asia', majorCities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Sejong', 'Suwon', 'Yongin'] },
  'IN': { code: 'IN', name: 'India', continent: 'Asia', majorCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'] },
  'SG': { code: 'SG', name: 'Singapore', continent: 'Asia', majorCities: ['Singapore'] },
  'HK': { code: 'HK', name: 'Hong Kong', continent: 'Asia', majorCities: ['Hong Kong'] },
  'TW': { code: 'TW', name: 'Taiwan', continent: 'Asia', majorCities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Taoyuan'] },
  'TH': { code: 'TH', name: 'Thailand', continent: 'Asia', majorCities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Hat Yai'] },
  'MY': { code: 'MY', name: 'Malaysia', continent: 'Asia', majorCities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya'] },
  'ID': { code: 'ID', name: 'Indonesia', continent: 'Asia', majorCities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'] },
  'PH': { code: 'PH', name: 'Philippines', continent: 'Asia', majorCities: ['Manila', 'Quezon City', 'Caloocan', 'Davao City', 'Cebu City'] },
  'VN': { code: 'VN', name: 'Vietnam', continent: 'Asia', majorCities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho'] },

  // Middle East & Africa
  'AE': { code: 'AE', name: 'United Arab Emirates', continent: 'Asia', majorCities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
  'SA': { code: 'SA', name: 'Saudi Arabia', continent: 'Asia', majorCities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] },
  'IL': { code: 'IL', name: 'Israel', continent: 'Asia', majorCities: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Rishon LeZion', 'Petah Tikva'] },
  'TR': { code: 'TR', name: 'Turkey', continent: 'Asia', majorCities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'] },
  'ZA': { code: 'ZA', name: 'South Africa', continent: 'Africa', majorCities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
  'EG': { code: 'EG', name: 'Egypt', continent: 'Africa', majorCities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said'] },
  'NG': { code: 'NG', name: 'Nigeria', continent: 'Africa', majorCities: ['Lagos', 'Kano', 'Ibadan', 'Benin City', 'Port Harcourt'] },
  'KE': { code: 'KE', name: 'Kenya', continent: 'Africa', majorCities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },

  // Oceania
  'AU': { code: 'AU', name: 'Australia', continent: 'Oceania', majorCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'] },
  'NZ': { code: 'NZ', name: 'New Zealand', continent: 'Oceania', majorCities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga'] },

  // South America
  'BR': { code: 'BR', name: 'Brazil', continent: 'South America', majorCities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'] },
  'AR': { code: 'AR', name: 'Argentina', continent: 'South America', majorCities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'] },
  'CL': { code: 'CL', name: 'Chile', continent: 'South America', majorCities: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'] },
  'CO': { code: 'CO', name: 'Colombia', continent: 'South America', majorCities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
  'PE': { code: 'PE', name: 'Peru', continent: 'South America', majorCities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura'] }
};

// ============================================================================
// CITY CODE GENERATION
// ============================================================================

export interface CityCodeInfo {
  code: string;
  city: string;
  country: string;
  alternatives?: string[];
}

/**
 * Generate city code from city name
 * Takes first 2 letters, handles special cases
 */
export function generateCityCode(cityName: string): string {
  if (!cityName || cityName.length < 2) {
    throw new Error('City name must be at least 2 characters long');
  }

  // Clean city name
  const cleanCity = cityName
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '') // Remove non-letters except spaces
    .trim();

  // Handle multi-word cities
  const words = cleanCity.split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 letters
    return words[0].substring(0, 2);
  } else {
    // Multiple words: take first letter of first two words
    return (words[0][0] + words[1][0]).substring(0, 2);
  }
}

/**
 * Get city code with alternatives for collision handling
 */
export function getCityCodeWithAlternatives(cityName: string, countryCode: string): CityCodeInfo[] {
  const primaryCode = generateCityCode(cityName);
  const alternatives: CityCodeInfo[] = [
    {
      code: primaryCode,
      city: cityName,
      country: countryCode
    }
  ];

  // Generate alternatives if needed
  const cleanCity = cityName.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
  const words = cleanCity.split(/\s+/);

  if (words.length > 2) {
    // Try first letter of first and third word
    alternatives.push({
      code: (words[0][0] + words[2][0]).substring(0, 2),
      city: cityName,
      country: countryCode
    });
  }

  if (words.length > 1) {
    // Try first two letters of second word
    alternatives.push({
      code: words[1].substring(0, 2),
      city: cityName,
      country: countryCode
    });
  }

  // Try first letter + second letter of first word
  if (words[0].length > 2) {
    alternatives.push({
      code: words[0].substring(0, 2),
      city: cityName,
      country: countryCode
    });
  }

  return alternatives;
}

// ============================================================================
// OFFICE ID GENERATION
// ============================================================================

export interface OfficeIdGenerationOptions {
  country: string;
  city: string;
  maxRetries?: number;
  checkCollision?: boolean;
}

export interface OfficeIdGenerationResult {
  success: boolean;
  officeId?: string;
  attempts: number;
  error?: string;
  collisionInfo?: {
    found: boolean;
    existingOfficeId?: string;
  };
}

/**
 * Generate a unique office ID in CCccNNN format
 */
export async function generateOfficeId(options: OfficeIdGenerationOptions): Promise<OfficeIdGenerationResult> {
  const { country, city, maxRetries = 10, checkCollision = true } = options;
  
  // Validate country code
  const countryInfo = COUNTRY_CODES[country.toUpperCase()];
  if (!countryInfo) {
    return {
      success: false,
      attempts: 0,
      error: `Invalid country code: ${country}. Must be a valid ISO 3166-1 alpha-2 code.`
    };
  }

  const countryCode = countryInfo.code;
  const cityCodeOptions = getCityCodeWithAlternatives(city, countryCode);
  
  let attempts = 0;
  const maxAttempts = maxRetries * cityCodeOptions.length;

  for (const cityCodeInfo of cityCodeOptions) {
    for (let i = 0; i < maxRetries; i++) {
      attempts++;
      
      // Generate random number (100-999)
      const randomNumber = Math.floor(Math.random() * 900) + 100;
      const officeId = `${countryCode}${cityCodeInfo.code}${randomNumber}`;
      
      // Check collision if requested
      if (checkCollision) {
        const collisionCheck = await checkOfficeIdCollision(officeId);
        if (!collisionCheck.found) {
          return {
            success: true,
            officeId,
            attempts,
            collisionInfo: collisionCheck
          };
        }
      } else {
        return {
          success: true,
          officeId,
          attempts,
          collisionInfo: { found: false }
        };
      }
    }
  }

  return {
    success: false,
    attempts,
    error: `Failed to generate unique office ID after ${attempts} attempts. Try increasing maxRetries or using a different city name.`
  };
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

export interface CollisionCheckResult {
  found: boolean;
  existingOfficeId?: string;
  existingOfficeName?: string;
  collisionType?: 'exact' | 'similar';
}

/**
 * Check if an office ID already exists in the database
 */
export async function checkOfficeIdCollision(officeId: string): Promise<CollisionCheckResult> {
  try {
    // Validate office ID format first
    const validation = validateOfficeId(officeId);
    if (!validation.isValid) {
      throw new Error(`Invalid office ID format: ${validation.errors.join(', ')}`);
    }

    const db = getFirestoreInstance();
    const officeRef = doc(db, 'offices', officeId);
    const officeSnap = await getDoc(officeRef);

    if (officeSnap.exists()) {
      const officeData = officeSnap.data();
      return {
        found: true,
        existingOfficeId: officeId,
        existingOfficeName: officeData.name,
        collisionType: 'exact'
      };
    }

    return {
      found: false
    };
  } catch (error) {
    console.error('Error checking office ID collision:', error);
    return {
      found: false
    };
  }
}

/**
 * Check for similar office IDs (same country/city combination)
 */
export async function checkSimilarOfficeIds(countryCode: string, cityCode: string): Promise<CollisionCheckResult[]> {
  try {
    const db = getFirestoreInstance();
    const officesRef = collection(db, 'offices');
    
    // Query for offices with similar country/city pattern
    const q = query(
      officesRef,
      where('id', '>=', `${countryCode}${cityCode}100`),
      where('id', '<=', `${countryCode}${cityCode}999`)
    );
    
    const querySnapshot = await getDocs(q);
    const results: CollisionCheckResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        found: true,
        existingOfficeId: doc.id,
        existingOfficeName: data.name,
        collisionType: 'similar'
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error checking similar office IDs:', error);
    return [];
  }
}

// ============================================================================
// OFFICE ID UTILITIES
// ============================================================================

/**
 * Parse office ID into its components
 */
export function parseOfficeId(officeId: string): {
  country: string;
  city: string;
  number: string;
  countryInfo?: CountryInfo;
  validation: OfficeIdValidation;
} {
  const validation = validateOfficeId(officeId);
  
  if (!validation.isValid) {
    throw new Error(`Invalid office ID format: ${validation.errors.join(', ')}`);
  }
  
  const countryInfo = COUNTRY_CODES[validation.country];
  
  return {
    country: validation.country,
    city: validation.city,
    number: validation.number,
    countryInfo,
    validation
  };
}

/**
 * Get all possible office IDs for a country/city combination
 */
export function getAllPossibleOfficeIds(countryCode: string, cityCode: string): string[] {
  const countryInfo = COUNTRY_CODES[countryCode.toUpperCase()];
  if (!countryInfo) {
    throw new Error(`Invalid country code: ${countryCode}`);
  }
  
  const officeIds: string[] = [];
  for (let i = 100; i <= 999; i++) {
    officeIds.push(`${countryCode.toUpperCase()}${cityCode.toUpperCase()}${i}`);
  }
  
  return officeIds;
}

/**
 * Get available office IDs for a country/city combination
 */
export async function getAvailableOfficeIds(countryCode: string, cityCode: string): Promise<string[]> {
  const allPossible = getAllPossibleOfficeIds(countryCode, cityCode);
  const available: string[] = [];
  
  for (const officeId of allPossible) {
    const collisionCheck = await checkOfficeIdCollision(officeId);
    if (!collisionCheck.found) {
      available.push(officeId);
    }
  }
  
  return available;
}

/**
 * Validate and suggest office ID alternatives
 */
export async function suggestOfficeIdAlternatives(
  country: string, 
  city: string, 
  maxSuggestions: number = 5
): Promise<{
  suggestions: string[];
  countryInfo: CountryInfo;
  cityCodeInfo: CityCodeInfo[];
}> {
  const countryInfo = COUNTRY_CODES[country.toUpperCase()];
  if (!countryInfo) {
    throw new Error(`Invalid country code: ${country}`);
  }
  
  const cityCodeOptions = getCityCodeWithAlternatives(city, countryInfo.code);
  const suggestions: string[] = [];
  
  for (const cityCodeInfo of cityCodeOptions) {
    const available = await getAvailableOfficeIds(countryInfo.code, cityCodeInfo.code);
    suggestions.push(...available.slice(0, maxSuggestions));
    
    if (suggestions.length >= maxSuggestions) {
      break;
    }
  }
  
  return {
    suggestions: suggestions.slice(0, maxSuggestions),
    countryInfo,
    cityCodeInfo: cityCodeOptions
  };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Generate multiple office IDs at once
 */
export async function generateMultipleOfficeIds(
  requests: OfficeIdGenerationOptions[],
  maxConcurrent: number = 5
): Promise<OfficeIdGenerationResult[]> {
  const results: OfficeIdGenerationResult[] = [];
  
  // Process in batches to avoid overwhelming the database
  for (let i = 0; i < requests.length; i += maxConcurrent) {
    const batch = requests.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(request => generateOfficeId(request));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

// ============================================================================
// STATISTICS AND ANALYTICS
// ============================================================================

export interface OfficeIdStats {
  totalPossible: number;
  totalUsed: number;
  totalAvailable: number;
  usageByCountry: Record<string, number>;
  usageByCity: Record<string, number>;
  collisionRate: number;
}

/**
 * Get statistics about office ID usage
 */
export async function getOfficeIdStats(): Promise<OfficeIdStats> {
  try {
    const db = getFirestoreInstance();
    const officesRef = collection(db, 'offices');
    const querySnapshot = await getDocs(officesRef);
    
    const stats: OfficeIdStats = {
      totalPossible: 0,
      totalUsed: querySnapshot.size,
      totalAvailable: 0,
      usageByCountry: {},
      usageByCity: {},
      collisionRate: 0
    };
    
    // Count usage by country and city
    querySnapshot.forEach((doc) => {
      const officeId = doc.id;
      const parsed = parseOfficeId(officeId);
      
      stats.usageByCountry[parsed.country] = (stats.usageByCountry[parsed.country] || 0) + 1;
      stats.usageByCity[`${parsed.country}-${parsed.city}`] = (stats.usageByCity[`${parsed.country}-${parsed.city}`] || 0) + 1;
    });
    
    // Calculate totals
    const totalCountries = Object.keys(COUNTRY_CODES).length;
    const totalPossiblePerCountry = 900; // 100-999
    stats.totalPossible = totalCountries * totalPossiblePerCountry;
    stats.totalAvailable = stats.totalPossible - stats.totalUsed;
    stats.collisionRate = stats.totalUsed / stats.totalPossible;
    
    return stats;
  } catch (error) {
    console.error('Error getting office ID stats:', error);
    throw error;
  }
}
