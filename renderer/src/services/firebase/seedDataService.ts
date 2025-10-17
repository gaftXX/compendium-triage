// Seed Data Service - Comprehensive seed data for all active collections

import { 
  CollectionName, 
  Office, 
  Project, 
  Regulation, 
  Relationship,
  ACTIVE_COLLECTIONS
} from '../../types/firestore';
import { 
  dataService,
  createOffice,
  createProject,
  createRegulation,
  createRelationship
} from './dataService';
import { 
  generateOfficeId,
  generateCityCode
} from './officeIdSystem';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// SEED DATA TYPES
// ============================================================================

export interface SeedDataResult {
  success: boolean;
  collection: CollectionName;
  documentsCreated: number;
  documentsSkipped: number;
  documentsFailed: number;
  duration: number;
  error?: string;
  details?: any;
}

export interface SeedDataSummary {
  success: boolean;
  totalCollections: number;
  totalDocuments: number;
  successfulCollections: number;
  failedCollections: number;
  duration: number;
  results: SeedDataResult[];
  errors: string[];
  warnings: string[];
}

export interface SeedDataOptions {
  clearExisting?: boolean;
  batchSize?: number;
  validateData?: boolean;
  generateIds?: boolean;
  includeRelationships?: boolean;
  maxConcurrent?: number;
}

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

// Major Architecture Offices Data
const architectureOffices: Partial<Office>[] = [
  {
    name: 'Zaha Hadid Architects',
    officialName: 'Zaha Hadid Architects Ltd.',
    founded: 1980,
    status: 'active',
    location: {
      headquarters: {
        city: 'London',
        country: 'GB',
        coordinates: { latitude: 51.5074, longitude: -0.1278 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'Beijing', country: 'CN', coordinates: { latitude: 39.9042, longitude: 116.4074 } }
      ]
    },
    size: {
      employeeCount: 400,
      sizeCategory: 'large',
      annualRevenue: 50000000
    },
    specializations: ['commercial', 'cultural', 'residential', 'transportation'],
    notableWorks: ['Heydar Aliyev Center', 'London Aquatics Centre', 'Guangzhou Opera House'],
    connectionCounts: {
      totalProjects: 150,
      activeProjects: 25,
      clients: 45,
      competitors: 12,
      suppliers: 30
    }
  },
  {
    name: 'Foster + Partners',
    officialName: 'Foster + Partners Ltd.',
    founded: 1967,
    status: 'active',
    location: {
      headquarters: {
        city: 'London',
        country: 'GB',
        coordinates: { latitude: 51.5074, longitude: -0.1278 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'Hong Kong', country: 'HK', coordinates: { latitude: 22.3193, longitude: 114.1694 } }
      ]
    },
    size: {
      employeeCount: 200,
      sizeCategory: 'large',
      annualRevenue: 30000000
    },
    specializations: ['commercial', 'transportation', 'sustainability', 'residential'],
    notableWorks: ['30 St Mary Axe', 'Apple Park', 'Hong Kong International Airport'],
    connectionCounts: {
      totalProjects: 200,
      activeProjects: 30,
      clients: 60,
      competitors: 15,
      suppliers: 40
    }
  },
  {
    name: 'BIG - Bjarke Ingels Group',
    officialName: 'BIG - Bjarke Ingels Group A/S',
    founded: 2005,
    status: 'active',
    location: {
      headquarters: {
        city: 'Copenhagen',
        country: 'DK',
        coordinates: { latitude: 55.6761, longitude: 12.5683 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'London', country: 'GB', coordinates: { latitude: 51.5074, longitude: -0.1278 } }
      ]
    },
    size: {
      employeeCount: 150,
      sizeCategory: 'large',
      annualRevenue: 25000000
    },
    specializations: ['residential', 'commercial', 'cultural', 'sustainability'],
    notableWorks: ['8 House', 'Vancouver House', 'The Twist Museum'],
    connectionCounts: {
      totalProjects: 80,
      activeProjects: 20,
      clients: 35,
      competitors: 10,
      suppliers: 25
    }
  },
  {
    name: 'OMA - Office for Metropolitan Architecture',
    officialName: 'OMA B.V.',
    founded: 1975,
    status: 'active',
    location: {
      headquarters: {
        city: 'Rotterdam',
        country: 'NL',
        coordinates: { latitude: 51.9244, longitude: 4.4777 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'Hong Kong', country: 'HK', coordinates: { latitude: 22.3193, longitude: 114.1694 } }
      ]
    },
    size: {
      employeeCount: 120,
      sizeCategory: 'large',
      annualRevenue: 20000000
    },
    specializations: ['cultural', 'commercial', 'residential', 'urban-planning'],
    notableWorks: ['Casa da Música', 'Seattle Central Library', 'De Rotterdam'],
    connectionCounts: {
      totalProjects: 100,
      activeProjects: 15,
      clients: 40,
      competitors: 8,
      suppliers: 20
    }
  },
  {
    name: 'SOM - Skidmore, Owings & Merrill',
    officialName: 'Skidmore, Owings & Merrill LLP',
    founded: 1936,
    status: 'active',
    location: {
      headquarters: {
        city: 'Chicago',
        country: 'US',
        coordinates: { latitude: 41.8781, longitude: -87.6298 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'San Francisco', country: 'US', coordinates: { latitude: 37.7749, longitude: -122.4194 } },
        { city: 'London', country: 'GB', coordinates: { latitude: 51.5074, longitude: -0.1278 } }
      ]
    },
    size: {
      employeeCount: 300,
      sizeCategory: 'large',
      annualRevenue: 40000000
    },
    specializations: ['commercial', 'residential', 'transportation', 'sustainability'],
    notableWorks: ['Burj Khalifa', 'One World Trade Center', 'Willis Tower'],
    connectionCounts: {
      totalProjects: 300,
      activeProjects: 40,
      clients: 80,
      competitors: 20,
      suppliers: 50
    }
  },
  {
    name: 'Gensler',
    officialName: 'Gensler, Inc.',
    founded: 1965,
    status: 'active',
    location: {
      headquarters: {
        city: 'San Francisco',
        country: 'US',
        coordinates: { latitude: 37.7749, longitude: -122.4194 }
      },
      otherOffices: [
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
        { city: 'London', country: 'GB', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
        { city: 'Shanghai', country: 'CN', coordinates: { latitude: 31.2304, longitude: 121.4737 } }
      ]
    },
    size: {
      employeeCount: 500,
      sizeCategory: 'global',
      annualRevenue: 60000000
    },
    specializations: ['commercial', 'residential', 'hospitality', 'retail'],
    notableWorks: ['Shanghai Tower', 'Facebook Headquarters', 'The Shard'],
    connectionCounts: {
      totalProjects: 500,
      activeProjects: 60,
      clients: 120,
      competitors: 25,
      suppliers: 80
    }
  },
  {
    name: 'Aedas',
    officialName: 'Aedas Limited',
    founded: 2002,
    status: 'active',
    location: {
      headquarters: {
        city: 'Hong Kong',
        country: 'HK',
        coordinates: { latitude: 22.3193, longitude: 114.1694 }
      },
      otherOffices: [
        { city: 'London', country: 'GB', coordinates: { latitude: 51.5074, longitude: -0.1278 } },
        { city: 'Singapore', country: 'SG', coordinates: { latitude: 1.3521, longitude: 103.8198 } }
      ]
    },
    size: {
      employeeCount: 180,
      sizeCategory: 'large',
      annualRevenue: 22000000
    },
    specializations: ['commercial', 'residential', 'hospitality', 'transportation'],
    notableWorks: ['International Commerce Centre', 'Marina Bay Sands', 'The Pinnacle'],
    connectionCounts: {
      totalProjects: 120,
      activeProjects: 18,
      clients: 45,
      competitors: 12,
      suppliers: 30
    }
  },
  {
    name: 'MVRDV',
    officialName: 'MVRDV B.V.',
    founded: 1993,
    status: 'active',
    location: {
      headquarters: {
        city: 'Rotterdam',
        country: 'NL',
        coordinates: { latitude: 51.9244, longitude: 4.4777 }
      },
      otherOffices: [
        { city: 'Shanghai', country: 'CN', coordinates: { latitude: 31.2304, longitude: 121.4737 } },
        { city: 'New York', country: 'US', coordinates: { latitude: 40.7128, longitude: -74.0060 } }
      ]
    },
    size: {
      employeeCount: 100,
      sizeCategory: 'medium',
      annualRevenue: 15000000
    },
    specializations: ['residential', 'commercial', 'cultural', 'urban-planning'],
    notableWorks: ['Markthal Rotterdam', 'Wozoco Apartments', 'Baltyk Tower'],
    connectionCounts: {
      totalProjects: 80,
      activeProjects: 12,
      clients: 30,
      competitors: 8,
      suppliers: 20
    }
  }
];

// Major Architecture Projects Data
const architectureProjects: Partial<Project>[] = [
  {
    projectName: 'Heydar Aliyev Center',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2007-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2012-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2012-05-01'))
    },
    location: {
      city: 'Baku',
      country: 'AZ',
      address: 'Heydar Aliyev Avenue, Baku, Azerbaijan',
      coordinates: { latitude: 40.4093, longitude: 49.8671 }
    },
    financial: {
      budget: 250000000,
      currency: 'USD',
      actualCost: 275000000
    },
    details: {
      projectType: 'cultural',
      size: 57519,
      description: 'Cultural center and museum complex designed by Zaha Hadid Architects'
    }
  },
  {
    projectName: '30 St Mary Axe',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2001-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2004-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2004-04-01'))
    },
    location: {
      city: 'London',
      country: 'GB',
      address: '30 St Mary Axe, London EC3A 8EP, UK',
      coordinates: { latitude: 51.5145, longitude: -0.0801 }
    },
    financial: {
      budget: 200000000,
      currency: 'GBP',
      actualCost: 220000000
    },
    details: {
      projectType: 'commercial',
      size: 46400,
      description: 'Iconic commercial skyscraper designed by Foster + Partners'
    }
  },
  {
    projectName: 'Apple Park',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2013-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2017-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2017-04-01'))
    },
    location: {
      city: 'Cupertino',
      country: 'US',
      address: '1 Apple Park Way, Cupertino, CA 95014, USA',
      coordinates: { latitude: 37.3346, longitude: -122.0090 }
    },
    financial: {
      budget: 5000000000,
      currency: 'USD',
      actualCost: 5500000000
    },
    details: {
      projectType: 'commercial',
      size: 260000,
      description: 'Apple\'s corporate headquarters designed by Foster + Partners'
    }
  },
  {
    projectName: '8 House',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2006-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2010-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2010-03-01'))
    },
    location: {
      city: 'Copenhagen',
      country: 'DK',
      address: 'Orestad Boulevard 107, 2300 Copenhagen, Denmark',
      coordinates: { latitude: 55.6761, longitude: 12.5683 }
    },
    financial: {
      budget: 80000000,
      currency: 'EUR',
      actualCost: 85000000
    },
    details: {
      projectType: 'residential',
      size: 61000,
      description: 'Mixed-use residential complex designed by BIG'
    }
  },
  {
    projectName: 'Casa da Música',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('1999-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2005-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2005-04-01'))
    },
    location: {
      city: 'Porto',
      country: 'PT',
      address: 'Avenida da Boavista 604-610, 4149-071 Porto, Portugal',
      coordinates: { latitude: 41.1579, longitude: -8.6291 }
    },
    financial: {
      budget: 100000000,
      currency: 'EUR',
      actualCost: 110000000
    },
    details: {
      projectType: 'cultural',
      size: 38000,
      description: 'Concert hall designed by OMA'
    }
  },
  {
    projectName: 'Burj Khalifa',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2004-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2009-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2010-01-01'))
    },
    location: {
      city: 'Dubai',
      country: 'AE',
      address: '1 Sheikh Mohammed bin Rashid Blvd, Dubai, UAE',
      coordinates: { latitude: 25.1972, longitude: 55.2744 }
    },
    financial: {
      budget: 1500000000,
      currency: 'USD',
      actualCost: 1600000000
    },
    details: {
      projectType: 'commercial',
      size: 309473,
      description: 'World\'s tallest building designed by SOM'
    }
  },
  {
    projectName: 'Shanghai Tower',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2008-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2014-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2015-01-01'))
    },
    location: {
      city: 'Shanghai',
      country: 'CN',
      address: '501 Yincheng Middle Rd, Pudong, Shanghai, China',
      coordinates: { latitude: 31.2304, longitude: 121.4737 }
    },
    financial: {
      budget: 2400000000,
      currency: 'USD',
      actualCost: 2500000000
    },
    details: {
      projectType: 'commercial',
      size: 420000,
      description: 'Second tallest building in the world designed by Gensler'
    }
  },
  {
    projectName: 'International Commerce Centre',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2005-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2010-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2010-04-01'))
    },
    location: {
      city: 'Hong Kong',
      country: 'HK',
      address: '1 Austin Rd W, Tsim Sha Tsui, Hong Kong',
      coordinates: { latitude: 22.3193, longitude: 114.1694 }
    },
    financial: {
      budget: 3000000000,
      currency: 'HKD',
      actualCost: 3200000000
    },
    details: {
      projectType: 'commercial',
      size: 250000,
      description: 'Hong Kong\'s tallest building designed by Aedas'
    }
  },
  {
    projectName: 'Markthal Rotterdam',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2009-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2014-01-01')),
      actualCompletion: Timestamp.fromDate(new Date('2014-10-01'))
    },
    location: {
      city: 'Rotterdam',
      country: 'NL',
      address: 'Dominee Jan Scharpstraat 298, 3011 GZ Rotterdam, Netherlands',
      coordinates: { latitude: 51.9244, longitude: 4.4777 }
    },
    financial: {
      budget: 175000000,
      currency: 'EUR',
      actualCost: 180000000
    },
    details: {
      projectType: 'commercial',
      size: 95000,
      description: 'Food market and residential complex designed by MVRDV'
    }
  }
];

// Building Regulations Data
const buildingRegulations: Partial<Regulation>[] = [
  {
    name: 'UK Building Regulations 2023',
    regulationType: 'building-code',
    jurisdiction: {
      level: 'national',
      country: 'GB',
      countryName: 'United Kingdom',
      scope: {
        appliesToCountry: true,
        appliesToState: false,
        appliesToCities: [],
        appliesToProjectTypes: ['residential', 'commercial', 'institutional']
      }
    },
    effectiveDate: Timestamp.fromDate(new Date('2023-01-01')),
    version: '2023',
    description: 'National building regulations for England and Wales',
    compliance: {
      mandatory: true,
      penalties: {
        fines: 'Up to £5,000 per violation',
        criminal: false,
        projectStoppage: true
      },
      requiredCertifications: ['Building Control Approval'],
      inspectionRequired: true,
      complianceCost: {
        estimated: 5000,
        currency: 'GBP',
        perProjectType: {}
      },
      documentationRequired: ['Building Control Application', 'Structural Calculations']
    },
    enforcement: {
      enforcingAuthority: 'Local Building Control',
      inspectionFrequency: 'At key construction stages',
      complianceRate: 95,
      violationCount: 150
    },
    impact: {
      level: 'high',
      affectedProjects: [],
      economicImpact: 'Moderate cost increase for compliance',
      timelineImpact: 'Additional 2-4 weeks for approvals',
      designImpact: 'Must meet minimum standards for safety and energy efficiency'
    }
  },
  {
    name: 'International Building Code 2021',
    regulationType: 'building-code',
    jurisdiction: {
      level: 'national',
      country: 'US',
      countryName: 'United States',
      scope: {
        appliesToCountry: true,
        appliesToState: false,
        appliesToCities: [],
        appliesToProjectTypes: ['residential', 'commercial', 'institutional']
      }
    },
    effectiveDate: Timestamp.fromDate(new Date('2021-01-01')),
    version: '2021',
    description: 'International Building Code adopted by most US states',
    compliance: {
      mandatory: true,
      penalties: {
        fines: 'Up to $10,000 per violation',
        criminal: false,
        projectStoppage: true
      },
      requiredCertifications: ['Building Permit', 'Certificate of Occupancy'],
      inspectionRequired: true,
      complianceCost: {
        estimated: 8000,
        currency: 'USD',
        perProjectType: {}
      },
      documentationRequired: ['Building Permit Application', 'Structural Plans', 'Fire Safety Plans']
    },
    enforcement: {
      enforcingAuthority: 'Local Building Department',
      inspectionFrequency: 'At key construction stages',
      complianceRate: 92,
      violationCount: 300
    },
    impact: {
      level: 'high',
      affectedProjects: [],
      economicImpact: 'Significant cost increase for compliance',
      timelineImpact: 'Additional 4-6 weeks for approvals',
      designImpact: 'Must meet minimum standards for safety, accessibility, and energy efficiency'
    }
  },
  {
    name: 'London Plan 2021',
    regulationType: 'zoning',
    jurisdiction: {
      level: 'city',
      country: 'GB',
      countryName: 'United Kingdom',
      cityId: 'london-uk',
      cityName: 'London',
      scope: {
        appliesToCountry: false,
        appliesToState: false,
        appliesToCities: ['london-uk'],
        appliesToProjectTypes: ['residential', 'commercial', 'mixed-use']
      }
    },
    effectiveDate: Timestamp.fromDate(new Date('2021-03-01')),
    version: '2021',
    description: 'Spatial development strategy for Greater London',
    compliance: {
      mandatory: true,
      penalties: {
        fines: 'Up to £20,000 per violation',
        criminal: false,
        projectStoppage: true
      },
      requiredCertifications: ['Planning Permission'],
      inspectionRequired: true,
      complianceCost: {
        estimated: 15000,
        currency: 'GBP',
        perProjectType: {}
      },
      documentationRequired: ['Planning Application', 'Design and Access Statement', 'Sustainability Statement']
    },
    enforcement: {
      enforcingAuthority: 'Local Planning Authority',
      inspectionFrequency: 'At planning and construction stages',
      complianceRate: 88,
      violationCount: 200
    },
    impact: {
      level: 'high',
      affectedProjects: [],
      economicImpact: 'High cost increase for compliance',
      timelineImpact: 'Additional 8-12 weeks for approvals',
      designImpact: 'Must meet London-specific design standards and sustainability requirements'
    }
  }
];

// Relationships Data
const relationships: Partial<Relationship>[] = [
  {
    sourceEntity: {
      type: 'office',
      id: 'GBLO001' // Zaha Hadid Architects
    },
    targetEntity: {
      type: 'office',
      id: 'GBLO002' // Foster + Partners
    },
    relationshipType: 'collaborator',
    strength: 7,
    sentiment: 'positive',
    startDate: Timestamp.fromDate(new Date('2020-01-01')),
    endDate: undefined,
    details: {
      context: 'Joint venture on sustainable architecture projects',
      outcomes: ['Shared research on green building technologies', 'Collaborative design competitions'],
      notes: 'Strong working relationship with regular project collaboration'
    },
    evidence: ['project-001', 'project-002'],
    tags: ['sustainability', 'collaboration', 'research']
  },
  {
    sourceEntity: {
      type: 'office',
      id: 'GBLO001' // Zaha Hadid Architects
    },
    targetEntity: {
      type: 'office',
      id: 'USNE003' // SOM
    },
    relationshipType: 'competitor',
    strength: 6,
    sentiment: 'neutral',
    startDate: Timestamp.fromDate(new Date('2015-01-01')),
    endDate: undefined,
    details: {
      context: 'Competition for major international projects',
      outcomes: ['Competitive bidding on large-scale developments'],
      notes: 'Professional competition with mutual respect'
    },
    evidence: ['project-003', 'project-004'],
    tags: ['competition', 'international', 'large-scale']
  },
  {
    sourceEntity: {
      type: 'office',
      id: 'GBLO002' // Foster + Partners
    },
    targetEntity: {
      type: 'office',
      id: 'USNE004' // Gensler
    },
    relationshipType: 'collaborator',
    strength: 8,
    sentiment: 'positive',
    startDate: Timestamp.fromDate(new Date('2018-01-01')),
    endDate: undefined,
    details: {
      context: 'Strategic partnership for global projects',
      outcomes: ['Shared resources and expertise', 'Joint project delivery'],
      notes: 'Strong strategic partnership with excellent results'
    },
    evidence: ['project-005', 'project-006'],
    tags: ['partnership', 'global', 'strategic']
  }
];

// ============================================================================
// SEED DATA SERVICE
// ============================================================================

export class SeedDataService {
  private static instance: SeedDataService;

  private constructor() {}

  public static getInstance(): SeedDataService {
    if (!SeedDataService.instance) {
      SeedDataService.instance = new SeedDataService();
    }
    return SeedDataService.instance;
  }

  // ============================================================================
  // MAIN SEED DATA METHODS
  // ============================================================================

  /**
   * Seed all active collections
   */
  public async seedAllCollections(options: SeedDataOptions = {}): Promise<SeedDataSummary> {
    const startTime = Date.now();
    const {
      clearExisting = false,
      batchSize = 10,
      validateData = true,
      generateIds = true,
      includeRelationships = true,
      maxConcurrent = 3
    } = options;

    const results: SeedDataResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Clear existing data if requested
      if (clearExisting) {
        await this.clearExistingData();
      }

      // Seed collections in batches
      const collectionsToSeed = ACTIVE_COLLECTIONS;
      
      for (let i = 0; i < collectionsToSeed.length; i += maxConcurrent) {
        const batch = collectionsToSeed.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(collection => 
          this.seedCollection(collection, { batchSize, validateData, generateIds })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Seed relationships if requested
      if (includeRelationships) {
        const relationshipResult = await this.seedRelationships({ batchSize, validateData });
        results.push(relationshipResult);
      }

      // Calculate summary
      const successfulCollections = results.filter(r => r.success).length;
      const failedCollections = results.filter(r => !r.success).length;
      const totalDocuments = results.reduce((sum, r) => sum + r.documentsCreated, 0);
      
      results.forEach(result => {
        if (!result.success && result.error) {
          errors.push(`${result.collection}: ${result.error}`);
        }
      });

      return {
        success: failedCollections === 0,
        totalCollections: collectionsToSeed.length + (includeRelationships ? 1 : 0),
        totalDocuments,
        successfulCollections,
        failedCollections,
        duration: Date.now() - startTime,
        results,
        errors,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        totalCollections: 0,
        totalDocuments: 0,
        successfulCollections: 0,
        failedCollections: 0,
        duration: Date.now() - startTime,
        results,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings
      };
    }
  }

  /**
   * Seed a specific collection
   */
  public async seedCollection(
    collectionName: CollectionName,
    options: Omit<SeedDataOptions, 'clearExisting' | 'includeRelationships' | 'maxConcurrent'> = {}
  ): Promise<SeedDataResult> {
    const startTime = Date.now();
    const { batchSize = 10, validateData = true, generateIds = true } = options;

    try {
      let documentsCreated = 0;
      let documentsSkipped = 0;
      let documentsFailed = 0;

      switch (collectionName) {
        case 'offices':
          const officeResult = await this.seedOffices({ batchSize, validateData, generateIds });
          documentsCreated = officeResult.documentsCreated;
          documentsSkipped = officeResult.documentsSkipped;
          documentsFailed = officeResult.documentsFailed;
          break;

        case 'projects':
          const projectResult = await this.seedProjects({ batchSize, validateData, generateIds });
          documentsCreated = projectResult.documentsCreated;
          documentsSkipped = projectResult.documentsSkipped;
          documentsFailed = projectResult.documentsFailed;
          break;

        case 'regulations':
          const regulationResult = await this.seedRegulations({ batchSize, validateData, generateIds });
          documentsCreated = regulationResult.documentsCreated;
          documentsSkipped = regulationResult.documentsSkipped;
          documentsFailed = regulationResult.documentsFailed;
          break;

        default:
          return {
            success: false,
            collection: collectionName,
            documentsCreated: 0,
            documentsSkipped: 0,
            documentsFailed: 0,
            duration: Date.now() - startTime,
            error: `No seed data available for collection: ${collectionName}`
          };
      }

      return {
        success: documentsFailed === 0,
        collection: collectionName,
        documentsCreated,
        documentsSkipped,
        documentsFailed,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        collection: collectionName,
        documentsCreated: 0,
        documentsSkipped: 0,
        documentsFailed: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // SPECIFIC COLLECTION SEEDING
  // ============================================================================

  /**
   * Seed offices collection
   */
  private async seedOffices(options: {
    batchSize: number;
    validateData: boolean;
    generateIds: boolean;
  }): Promise<{ documentsCreated: number; documentsSkipped: number; documentsFailed: number }> {
    let documentsCreated = 0;
    let documentsSkipped = 0;
    let documentsFailed = 0;

    for (const officeData of architectureOffices) {
      try {
        // Generate office ID if requested
        if (options.generateIds && officeData.location?.headquarters) {
          const country = officeData.location.headquarters.country;
          const city = officeData.location.headquarters.city;
          
          const idResult = await generateOfficeId({
            country,
            city,
            checkCollision: false
          });
          
          if (idResult.success) {
            officeData.id = idResult.officeId;
          }
        }

        // Create office
        const result = await createOffice(officeData as any, {
          generateId: options.generateIds,
          country: officeData.location?.headquarters?.country || 'GB',
          city: officeData.location?.headquarters?.city || 'London',
          validate: options.validateData
        });

        if (result.success) {
          documentsCreated++;
        } else {
          documentsFailed++;
        }
      } catch (error) {
        documentsFailed++;
      }
    }

    return { documentsCreated, documentsSkipped, documentsFailed };
  }

  /**
   * Seed projects collection
   */
  private async seedProjects(options: {
    batchSize: number;
    validateData: boolean;
    generateIds: boolean;
  }): Promise<{ documentsCreated: number; documentsSkipped: number; documentsFailed: number }> {
    let documentsCreated = 0;
    let documentsSkipped = 0;
    let documentsFailed = 0;

    for (const projectData of architectureProjects) {
      try {
        // Generate project ID if requested
        if (options.generateIds) {
          projectData.id = projectData.projectName
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
        }

        // Create project
        const result = await createProject(projectData as any, {
          linkToOffice: false,
          validate: options.validateData
        });

        if (result.success) {
          documentsCreated++;
        } else {
          documentsFailed++;
        }
      } catch (error) {
        documentsFailed++;
      }
    }

    return { documentsCreated, documentsSkipped, documentsFailed };
  }

  /**
   * Seed regulations collection
   */
  private async seedRegulations(options: {
    batchSize: number;
    validateData: boolean;
    generateIds: boolean;
  }): Promise<{ documentsCreated: number; documentsSkipped: number; documentsFailed: number }> {
    let documentsCreated = 0;
    let documentsSkipped = 0;
    let documentsFailed = 0;

    for (const regulationData of buildingRegulations) {
      try {
        // Generate regulation ID if requested
        if (options.generateIds) {
          const nameSlug = regulationData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'regulation';
          const country = regulationData.jurisdiction?.country?.toLowerCase() || 'unknown';
          const year = new Date().getFullYear();
          regulationData.id = `${country}-${nameSlug}-${year}`;
        }

        // Create regulation
        const result = await createRegulation(regulationData as any, {
          jurisdiction: regulationData.jurisdiction,
          validate: options.validateData
        });

        if (result.success) {
          documentsCreated++;
        } else {
          documentsFailed++;
        }
      } catch (error) {
        documentsFailed++;
      }
    }

    return { documentsCreated, documentsSkipped, documentsFailed };
  }

  /**
   * Seed relationships collection
   */
  private async seedRelationships(options: {
    batchSize: number;
    validateData: boolean;
  }): Promise<SeedDataResult> {
    const startTime = Date.now();
    let documentsCreated = 0;
    let documentsSkipped = 0;
    let documentsFailed = 0;

    for (const relationshipData of relationships) {
      try {
        // Generate relationship ID
        const source = `${relationshipData.sourceEntity?.type}-${relationshipData.sourceEntity?.id}`;
        const target = `${relationshipData.targetEntity?.type}-${relationshipData.targetEntity?.id}`;
        const type = relationshipData.relationshipType?.toLowerCase();
        relationshipData.id = `${source}-${type}-${target}`;

        // Create relationship
        const result = await createRelationship(relationshipData as any, {
          sourceEntity: relationshipData.sourceEntity as any,
          targetEntity: relationshipData.targetEntity as any,
          relationshipType: relationshipData.relationshipType as string,
          validate: options.validateData
        });

        if (result.success) {
          documentsCreated++;
        } else {
          documentsFailed++;
        }
      } catch (error) {
        documentsFailed++;
      }
    }

    return {
      success: documentsFailed === 0,
      collection: 'relationships',
      documentsCreated,
      documentsSkipped,
      documentsFailed,
      duration: Date.now() - startTime
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Clear existing data from all collections
   */
  private async clearExistingData(): Promise<void> {
    // In a real implementation, this would clear existing data
    // For now, we'll just log the action
    console.log('Clearing existing data from all collections...');
  }

  /**
   * Get seed data statistics
   */
  public getSeedDataStatistics(): {
    offices: number;
    projects: number;
    regulations: number;
    relationships: number;
    total: number;
  } {
    return {
      offices: architectureOffices.length,
      projects: architectureProjects.length,
      regulations: buildingRegulations.length,
      relationships: relationships.length,
      total: architectureOffices.length + architectureProjects.length + 
             buildingRegulations.length + relationships.length
    };
  }

  /**
   * Validate seed data
   */
  public validateSeedData(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate offices data
    architectureOffices.forEach((office, index) => {
      if (!office.name) {
        errors.push(`Office ${index}: Missing name`);
      }
      if (!office.location?.headquarters?.city) {
        errors.push(`Office ${index}: Missing headquarters city`);
      }
      if (!office.location?.headquarters?.country) {
        errors.push(`Office ${index}: Missing headquarters country`);
      }
    });

    // Validate projects data
    architectureProjects.forEach((project, index) => {
      if (!project.projectName) {
        errors.push(`Project ${index}: Missing project name`);
      }
      if (!project.location?.city) {
        errors.push(`Project ${index}: Missing city`);
      }
      if (!project.location?.country) {
        errors.push(`Project ${index}: Missing country`);
      }
    });

    // Validate regulations data
    buildingRegulations.forEach((regulation, index) => {
      if (!regulation.name) {
        errors.push(`Regulation ${index}: Missing name`);
      }
      if (!regulation.jurisdiction?.country) {
        errors.push(`Regulation ${index}: Missing jurisdiction country`);
      }
    });

    // Validate relationships data
    relationships.forEach((relationship, index) => {
      if (!relationship.sourceEntity?.id) {
        errors.push(`Relationship ${index}: Missing source entity ID`);
      }
      if (!relationship.targetEntity?.id) {
        errors.push(`Relationship ${index}: Missing target entity ID`);
      }
      if (!relationship.relationshipType) {
        errors.push(`Relationship ${index}: Missing relationship type`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const seedDataService = SeedDataService.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function seedAllCollections(options?: SeedDataOptions): Promise<SeedDataSummary> {
  return seedDataService.seedAllCollections(options);
}

export async function seedCollection(
  collectionName: CollectionName,
  options?: Omit<SeedDataOptions, 'clearExisting' | 'includeRelationships' | 'maxConcurrent'>
): Promise<SeedDataResult> {
  return seedDataService.seedCollection(collectionName, options);
}

export function getSeedDataStatistics(): {
  offices: number;
  projects: number;
  regulations: number;
  relationships: number;
  total: number;
} {
  return seedDataService.getSeedDataStatistics();
}

export function validateSeedData(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  return seedDataService.validateSeedData();
}
