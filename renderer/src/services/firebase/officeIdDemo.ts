// Office ID System Demo and Test Functions

import {
  officeIdService,
  validateOfficeIdService,
  generateOfficeIdService,
  checkOfficeIdAvailabilityService,
  getOfficeIdSuggestionsService,
  getOfficeIdStatisticsService,
  type OfficeIdGenerationOptions
} from './officeIdService';
import { COUNTRY_CODES } from './officeIdSystem';

// ============================================================================
// DEMO FUNCTIONS
// ============================================================================

/**
 * Demo the complete Office ID system workflow
 */
export async function demoOfficeIdSystem(): Promise<void> {
  console.log('Office ID System Demo');
  console.log('========================\n');

  try {
    // 1. Validate existing office IDs
    console.log('1. Validating Office IDs:');
    const testIds = ['GBLO482', 'USNE567', 'AEDU891', 'INVALID', 'GBLO99'];
    
    for (const id of testIds) {
      const validation = await validateOfficeIdService(id);
      console.log(`   ${id}: ${validation.success ? 'SUCCESS' : 'FAILED'} ${validation.data.isValid ? 'Valid' : 'Invalid'}`);
      if (!validation.data.isValid) {
        console.log(`      Errors: ${validation.data.errors.join(', ')}`);
      }
    }
    console.log('');

    // 2. Generate new office IDs
    console.log('2. Generating New Office IDs:');
    const generationRequests: OfficeIdGenerationOptions[] = [
      { country: 'GB', city: 'London', checkCollision: false },
      { country: 'US', city: 'New York', checkCollision: false },
      { country: 'AE', city: 'Dubai', checkCollision: false },
      { country: 'FR', city: 'Paris', checkCollision: false },
      { country: 'JP', city: 'Tokyo', checkCollision: false }
    ];

    for (const request of generationRequests) {
      const result = await generateOfficeIdService(request);
      if (result.success) {
        console.log(`   ${request.country} ${request.city}: ${result.data} (${result.generationInfo.attempts} attempts)`);
      } else {
        console.log(`   ${request.country} ${request.city}: ${result.error}`);
      }
    }
    console.log('');

    // 3. Get office ID suggestions
    console.log('3. Getting Office ID Suggestions:');
    const suggestionRequests = [
      { country: 'GB', city: 'London' },
      { country: 'US', city: 'New York' },
      { country: 'DE', city: 'Berlin' }
    ];

    for (const request of suggestionRequests) {
      const suggestions = await getOfficeIdSuggestionsService(request.country, request.city, 3);
      if (suggestions.success) {
        console.log(`   ${request.country} ${request.city}: ${suggestions.data.join(', ')}`);
        console.log(`      Country: ${suggestions.countryInfo.name} (${suggestions.countryInfo.continent})`);
        console.log(`      City Codes: ${suggestions.cityCodeInfo.map(c => c.code).join(', ')}`);
      } else {
        console.log(`   ${request.country} ${request.city}: ${suggestions.error}`);
      }
    }
    console.log('');

    // 4. Check availability
    console.log('4. Checking Office ID Availability:');
    const testAvailabilityIds = ['GBLO999', 'USNE001', 'AEDU500'];
    
    for (const id of testAvailabilityIds) {
      const availability = await checkOfficeIdAvailabilityService(id);
      if (availability.success) {
        console.log(`   ${id}: ${availability.data ? 'Available' : 'Taken'}`);
      } else {
        console.log(`   ${id}: Error - ${availability.error}`);
      }
    }
    console.log('');

    // 5. Get statistics
    console.log('5. Office ID Statistics:');
    const stats = await getOfficeIdStatisticsService();
    if (stats.success) {
      console.log(`   Total Possible: ${stats.data.totalPossible.toLocaleString()}`);
      console.log(`   Total Used: ${stats.data.totalUsed.toLocaleString()}`);
      console.log(`   Total Available: ${stats.data.totalAvailable.toLocaleString()}`);
      console.log(`   Collision Rate: ${(stats.data.collisionRate * 100).toFixed(2)}%`);
      console.log(`   Usage by Country: ${Object.keys(stats.data.usageByCountry).length} countries`);
    } else {
      console.log(`   Error getting statistics: ${stats.error}`);
    }

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

/**
 * Demo country code system
 */
export function demoCountryCodes(): void {
  console.log('Country Codes Demo');
  console.log('=====================\n');

  const majorCountries = ['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'AU', 'CA', 'AE', 'BR'];
  
  console.log('Major Countries:');
  majorCountries.forEach(country => {
    const info = COUNTRY_CODES[country];
    if (info) {
      console.log(`   ${country}: ${info.name} (${info.continent})`);
      console.log(`      Major Cities: ${info.majorCities.slice(0, 3).join(', ')}${info.majorCities.length > 3 ? '...' : ''}`);
    }
  });
  
  console.log(`\nTotal Countries Supported: ${Object.keys(COUNTRY_CODES).length}`);
  console.log(`Continents: ${[...new Set(Object.values(COUNTRY_CODES).map(c => c.continent))].join(', ')}`);
}

/**
 * Demo city code generation
 */
export function demoCityCodeGeneration(): void {
  console.log('City Code Generation Demo');
  console.log('=============================\n');

  const testCities = [
    'London',
    'New York',
    'Los Angeles',
    'San Francisco',
    'São Paulo',
    'México City',
    'Köln',
    'New Delhi',
    'Hong Kong',
    'Buenos Aires'
  ];

  console.log('City Code Generation:');
  testCities.forEach(city => {
    try {
      const { generateCityCode, getCityCodeWithAlternatives } = require('./officeIdSystem');
      const primaryCode = generateCityCode(city);
      const alternatives = getCityCodeWithAlternatives(city, 'XX');
      
      console.log(`   ${city}: ${primaryCode}`);
      if (alternatives.length > 1) {
        console.log(`      Alternatives: ${alternatives.slice(1).map(a => a.code).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ${city}: Error - ${error}`);
    }
  });
}

/**
 * Demo office ID parsing
 */
export function demoOfficeIdParsing(): void {
  console.log('Office ID Parsing Demo');
  console.log('==========================\n');

  const testOfficeIds = [
    'GBLO482',
    'USNE567',
    'AEDU891',
    'FRPA123',
    'JPTO456',
    'CNBE789',
    'AUSY012',
    'CATO345'
  ];

  console.log('Office ID Parsing:');
  testOfficeIds.forEach(officeId => {
    try {
      const { parseOfficeId } = require('./officeIdSystem');
      const parsed = parseOfficeId(officeId);
      
      console.log(`   ${officeId}:`);
      console.log(`      Country: ${parsed.country} (${parsed.countryInfo?.name || 'Unknown'})`);
      console.log(`      City: ${parsed.city}`);
      console.log(`      Number: ${parsed.number}`);
      console.log(`      Valid: ${parsed.validation.isValid ? 'YES' : 'NO'}`);
    } catch (error) {
      console.log(`   ${officeId}: Error - ${error}`);
    }
  });
}

/**
 * Demo collision detection
 */
export async function demoCollisionDetection(): Promise<void> {
  console.log('Collision Detection Demo');
  console.log('============================\n');

  const testIds = ['GBLO999', 'USNE001', 'AEDU500', 'FRPA123'];
  
  console.log('Collision Detection:');
  for (const id of testIds) {
    try {
      const availability = await checkOfficeIdAvailabilityService(id);
      if (availability.success) {
        console.log(`   ${id}: ${availability.data ? 'Available' : 'Taken'}`);
      } else {
        console.log(`   ${id}: Error - ${availability.error}`);
      }
    } catch (error) {
      console.log(`   ${id}: Error - ${error}`);
    }
  }
}

/**
 * Demo batch operations
 */
export async function demoBatchOperations(): Promise<void> {
  console.log('Batch Operations Demo');
  console.log('========================\n');

  const batchRequests: OfficeIdGenerationOptions[] = [
    { country: 'GB', city: 'London', checkCollision: false },
    { country: 'US', city: 'New York', checkCollision: false },
    { country: 'FR', city: 'Paris', checkCollision: false },
    { country: 'DE', city: 'Berlin', checkCollision: false },
    { country: 'JP', city: 'Tokyo', checkCollision: false }
  ];

  console.log('Batch Generation:');
  try {
    const batchResult = await officeIdService.generateMultipleOfficeIds(batchRequests, 3);
    
    if (batchResult.success) {
      console.log(`   Generated ${batchResult.data.length} office IDs:`);
      batchResult.data.forEach((result, index) => {
        const request = batchRequests[index];
        if (result.success) {
          console.log(`      ${request.country} ${request.city}: ${result.data}`);
        } else {
          console.log(`      ${request.country} ${request.city}: ${result.error}`);
        }
      });
    } else {
      console.log(`   Batch generation failed: ${batchResult.error}`);
    }
  } catch (error) {
    console.log(`   Batch generation error: ${error}`);
  }
}

/**
 * Run complete demo
 */
export async function runCompleteDemo(): Promise<void> {
  console.log('Complete Office ID System Demo');
  console.log('==================================\n');

  try {
    // Run all demos
    demoCountryCodes();
    console.log('\n');
    
    demoCityCodeGeneration();
    console.log('\n');
    
    demoOfficeIdParsing();
    console.log('\n');
    
    await demoCollisionDetection();
    console.log('\n');
    
    await demoBatchOperations();
    console.log('\n');
    
    await demoOfficeIdSystem();
    
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

/**
 * Performance test for office ID generation
 */
export async function performanceTest(): Promise<void> {
  console.log('Performance Test');
  console.log('==================\n');

  const testCount = 100;
  const requests: OfficeIdGenerationOptions[] = Array(testCount).fill(null).map((_, i) => ({
    country: 'GB',
    city: 'London',
    checkCollision: false
  }));

  console.log(`Generating ${testCount} office IDs...`);
  
  const startTime = Date.now();
  const results = await officeIdService.generateMultipleOfficeIds(requests, 10);
  const endTime = Date.now();
  
  const duration = endTime - startTime;
  const successCount = results.data?.filter(r => r.success).length || 0;
  const avgTime = duration / testCount;
  
  console.log(`Results:`);
  console.log(`   Total Time: ${duration}ms`);
  console.log(`   Average Time: ${avgTime.toFixed(2)}ms per ID`);
  console.log(`   Success Rate: ${(successCount / testCount * 100).toFixed(1)}%`);
  console.log(`   Throughput: ${(testCount / (duration / 1000)).toFixed(1)} IDs/second`);
}

// ============================================================================
// ERROR HANDLING DEMO
// ============================================================================

/**
 * Demo error handling
 */
export async function demoErrorHandling(): Promise<void> {
  console.log('Error Handling Demo');
  console.log('======================\n');

  const errorTests = [
    { name: 'Invalid Country Code', test: () => generateOfficeIdService({ country: 'XX', city: 'London', checkCollision: false }) },
    { name: 'Empty City Name', test: () => generateOfficeIdService({ country: 'GB', city: '', checkCollision: false }) },
    { name: 'Invalid Office ID Format', test: () => validateOfficeIdService('INVALID') },
    { name: 'Network Error Simulation', test: () => checkOfficeIdAvailabilityService('GBLO999') }
  ];

  for (const errorTest of errorTests) {
    console.log(`${errorTest.name}:`);
    try {
      const result = await errorTest.test();
      if (result.success) {
        console.log(`   Unexpected success: ${JSON.stringify(result.data)}`);
      } else {
        console.log(`   Expected error: ${result.error}`);
      }
    } catch (error) {
      console.log(`   Exception: ${error}`);
    }
  }
}

// ============================================================================
// EXPORT ALL DEMO FUNCTIONS
// ============================================================================

export {
  demoCountryCodes,
  demoCityCodeGeneration,
  demoOfficeIdParsing,
  demoCollisionDetection,
  demoBatchOperations,
  performanceTest,
  demoErrorHandling
};
