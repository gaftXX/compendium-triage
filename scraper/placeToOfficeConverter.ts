// Place to Office Converter - Converts Google Places PlaceResult to Office interface

import { PlaceResult } from './googlePlacesService';
import { Office } from '../renderer/src/types/firestore';
import { GeoPoint } from 'firebase/firestore';

export interface ConversionResult {
  success: boolean;
  office?: Office;
  error?: string;
}

export class PlaceToOfficeConverter {
  private static instance: PlaceToOfficeConverter;

  private constructor() {}

  public static getInstance(): PlaceToOfficeConverter {
    if (!PlaceToOfficeConverter.instance) {
      PlaceToOfficeConverter.instance = new PlaceToOfficeConverter();
    }
    return PlaceToOfficeConverter.instance;
  }

  /**
   * Convert a single PlaceResult to Office interface
   * Uses the same processing logic as the note system
   */
  public convertPlaceToOffice(place: PlaceResult): ConversionResult {
    try {
      console.log('🔄 Converting place to office:', place.name);

      // Extract location data
      const location = this.extractLocation(place);
      if (!location) {
        return {
          success: false,
          error: 'Could not extract valid location data from place'
        };
      }

      // Extract city and country from formatted address
      const { city, country } = this.parseAddress(place.formatted_address);

      // Generate office ID using the same logic as note system
      const officeId = this.generateOfficeIdWithLocation(place.name, country, city);

      // Create base office data (matching note system structure)
      const officeData: Partial<Office> = {
        id: officeId,
        name: place.name,
        officialName: place.name,
        founded: this.extractFoundedYear(place),
        status: this.determineStatus(place.business_status),
        location: {
          headquarters: {
            city: city,
            country: country,
            coordinates: new GeoPoint(place.geometry.location.lat, place.geometry.location.lng)
          },
          otherOffices: []
        },
        specializations: this.extractSpecializations(place),
        notableWorks: []
      };

      // Only include size if it has valid data - same logic as note system
      const sizeData = this.estimateSize(place);
      if (sizeData.employeeCount && sizeData.sizeCategory) {
        const size: any = {
          employeeCount: sizeData.employeeCount,
          sizeCategory: sizeData.sizeCategory
        };
        if (typeof sizeData.annualRevenue !== 'undefined' && sizeData.annualRevenue !== null) {
          size.annualRevenue = sizeData.annualRevenue;
        }
        officeData.size = size;
      }

      // Build complete office data with proper defaults - matching note system
      const completeOfficeData: Partial<Office> = {
        ...officeData,
        id: officeId,
        location: officeData.location,
        specializations: officeData.specializations || [],
        notableWorks: officeData.notableWorks || [],
        connectionCounts: {
          totalProjects: 0,
          activeProjects: 0,
          clients: 0,
          competitors: 0,
          suppliers: 0
        }
      };

      console.log('✅ Successfully converted place to office:', completeOfficeData.name);
      return {
        success: true,
        office: completeOfficeData as Office
      };

    } catch (error) {
      console.error('❌ Error converting place to office:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown conversion error'
      };
    }
  }

  /**
   * Convert multiple places to offices
   */
  public convertPlacesToOffices(places: PlaceResult[]): {
    success: boolean;
    offices: Office[];
    errors: string[];
  } {
    const offices: Office[] = [];
    const errors: string[] = [];

    places.forEach((place, index) => {
      const result = this.convertPlaceToOffice(place);
      if (result.success && result.office) {
        offices.push(result.office);
      } else {
        errors.push(`Place ${index + 1} (${place.name}): ${result.error || 'Unknown error'}`);
      }
    });

    return {
      success: offices.length > 0,
      offices: offices,
      errors: errors
    };
  }

  /**
   * Extract location data from place
   */
  private extractLocation(place: PlaceResult): { city: string; country: string } | null {
    try {
      const { city, country } = this.parseAddress(place.formatted_address);
      
      if (!city || !country) {
        console.warn('Could not extract city/country from address:', place.formatted_address);
        return null;
      }

      return { city, country };
    } catch (error) {
      console.error('Error extracting location:', error);
      return null;
    }
  }

  /**
   * Parse address to extract city and country
   */
  private parseAddress(formattedAddress: string): { city: string; country: string } {
    console.log('Parsing address:', formattedAddress);
    const parts = formattedAddress.split(',').map(part => part.trim());
    console.log('Address parts:', parts);
    
    // Last part is usually country - normalize country names
    let country = parts[parts.length - 1] || 'Unknown';
    
    // Normalize country names to proper country codes
    if (country === 'United States' || country === 'US') {
      country = 'US';
    } else if (country === 'Spain' || country === 'SP' || country === 'ES') {
      country = 'Spain';
    } else if (country === 'France' || country === 'FR') {
      country = 'France';
    } else if (country === 'Germany' || country === 'DE') {
      country = 'Germany';
    } else if (country === 'Italy' || country === 'IT') {
      country = 'Italy';
    } else if (country === 'United Kingdom' || country === 'UK' || country === 'GB') {
      country = 'United Kingdom';
    }
    
    // Special handling for major cities and their districts
    if (country === 'Spain' || country === 'SP' || country === 'ES') {
      // Barcelona districts
      const barcelonaIndicators = ['Barcelona', 'barcelona', 'BARCELONA', 'Eixample', 'EIXAMPLE', 'Gracia', 'GRACIA', 'Sants', 'SANTS', 'Poblenou', 'POBLENOU', 'Gothic', 'GOTHIC', 'Raval', 'RAVAL'];
      
      for (const part of parts) {
        if (barcelonaIndicators.some(indicator => part.includes(indicator))) {
          console.log('Barcelona address detected, using Barcelona as city');
          return { city: 'Barcelona', country: 'Spain' };
        }
      }
      
      // Madrid districts
      const madridIndicators = ['Madrid', 'madrid', 'MADRID', 'Centro', 'CENTRO', 'Salamanca', 'SALAMANCA', 'Chamberí', 'CHAMBERI', 'Retiro', 'RETIRO'];
      
      for (const part of parts) {
        if (madridIndicators.some(indicator => part.includes(indicator))) {
          console.log('Madrid address detected, using Madrid as city');
          return { city: 'Madrid', country: 'Spain' };
        }
      }
    }
    
    // Similar logic for other countries
    if (country === 'US') {
      // New York districts
      const nycIndicators = ['New York', 'NEW YORK', 'Manhattan', 'MANHATTAN', 'Brooklyn', 'BROOKLYN', 'Queens', 'QUEENS', 'Bronx', 'BRONX', 'Staten Island', 'STATEN ISLAND'];
      
      for (const part of parts) {
        if (nycIndicators.some(indicator => part.includes(indicator))) {
          console.log('New York address detected, using New York as city');
          return { city: 'New York', country: 'US' };
        }
      }
    }
    
    // Find the city part - look for the part that contains a city name (not just numbers)
    let city = 'Unknown';
    for (let i = parts.length - 2; i >= 0; i--) {
      const part = parts[i];
      // Skip if it's just numbers (postal code) or starts with numbers
      if (!/^\d+$/.test(part) && !/^\d+\s/.test(part)) {
        city = part;
        break;
      }
    }
    
    // Remove postal codes (numbers at the beginning) from city name
    city = city.replace(/^\d+\s*/, '');
    
    // Additional check: if city is still just numbers, try to find a better city name
    if (/^\d+$/.test(city)) {
      // Look for any part that contains letters (city name)
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (/[a-zA-Z]/.test(part) && !/^\d+$/.test(part)) {
          city = part.replace(/^\d+\s*/, '');
          break;
        }
      }
    }
    
    console.log('Parsed city:', city, 'country:', country);
    return { city, country };
  }

  /**
   * Generate office ID using the same logic as note system
   */
  private generateOfficeIdWithLocation(name: string, country: string, city: string): string {
    // Use proper country codes, first 2 letters of city, and random 3 digits
    let countryCode: string;
    
    // Map country names to proper 2-letter codes
    switch (country) {
      case 'US':
        countryCode = 'US';
        break;
      case 'Spain':
        countryCode = 'SP';
        break;
      case 'France':
        countryCode = 'FR';
        break;
      case 'Germany':
        countryCode = 'DE';
        break;
      case 'Italy':
        countryCode = 'IT';
        break;
      case 'United Kingdom':
        countryCode = 'UK';
        break;
      default:
        countryCode = country.substring(0, 2).toUpperCase();
    }
    
    const cityCode = city.substring(0, 2).toUpperCase();
    const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${countryCode}${cityCode}${number}`;
  }

  /**
   * Extract founded year from place data (estimate based on rating/reviews)
   */
  private extractFoundedYear(place: PlaceResult): number {
    // If we have rating data, estimate age based on review count
    if (place.user_ratings_total && place.user_ratings_total > 0) {
      // Rough estimate: more reviews = older business
      const currentYear = new Date().getFullYear();
      const estimatedAge = Math.min(Math.max(place.user_ratings_total / 10, 1), 50); // 1-50 years
      return Math.max(currentYear - Math.floor(estimatedAge), 1950);
    }
    
    // Default to a reasonable founding year
    return 2000;
  }

  /**
   * Determine office status based on business status
   */
  private determineStatus(businessStatus?: string): 'active' | 'acquired' | 'dissolved' {
    if (!businessStatus) return 'active';
    
    switch (businessStatus.toLowerCase()) {
      case 'operational':
      case 'open':
        return 'active';
      case 'closed_permanently':
        return 'dissolved';
      case 'acquired':
        return 'acquired';
      default:
        return 'active';
    }
  }

  /**
   * Estimate office size based on available data
   */
  private estimateSize(place: PlaceResult): Office['size'] {
    // Estimate based on rating count (more reviews = larger business)
    const reviewCount = place.user_ratings_total || 0;
    
    let sizeCategory: 'boutique' | 'medium' | 'large' | 'global';
    let employeeCount: number;
    
    if (reviewCount < 10) {
      sizeCategory = 'boutique';
      employeeCount = Math.floor(Math.random() * 10) + 1; // 1-10
    } else if (reviewCount < 50) {
      sizeCategory = 'medium';
      employeeCount = Math.floor(Math.random() * 40) + 11; // 11-50
    } else if (reviewCount < 200) {
      sizeCategory = 'large';
      employeeCount = Math.floor(Math.random() * 100) + 51; // 51-150
    } else {
      sizeCategory = 'global';
      employeeCount = Math.floor(Math.random() * 200) + 151; // 151-350
    }

    return {
      employeeCount,
      sizeCategory,
      annualRevenue: undefined // No revenue data from Google Places
    };
  }

  /**
   * Extract specializations from place types and name
   */
  private extractSpecializations(place: PlaceResult): string[] {
    const specializations: string[] = [];
    
    // Add based on place types
    place.types.forEach(type => {
      switch (type) {
        case 'architect':
        case 'architecture':
          specializations.push('Architecture');
          break;
        case 'design':
          specializations.push('Design');
          break;
        case 'construction':
          specializations.push('Construction');
          break;
        case 'engineering':
          specializations.push('Engineering');
          break;
      }
    });

    // Add based on name keywords
    const nameLower = place.name.toLowerCase();
    if (nameLower.includes('architect')) {
      specializations.push('Architecture');
    }
    if (nameLower.includes('design')) {
      specializations.push('Design');
    }
    if (nameLower.includes('studio')) {
      specializations.push('Design Studio');
    }
    if (nameLower.includes('group')) {
      specializations.push('Architecture Group');
    }
    if (nameLower.includes('associates')) {
      specializations.push('Architecture Associates');
    }

    // Remove duplicates and ensure we have at least one specialization
    const uniqueSpecializations = [...new Set(specializations)];
    return uniqueSpecializations.length > 0 ? uniqueSpecializations : ['Architecture'];
  }
}

