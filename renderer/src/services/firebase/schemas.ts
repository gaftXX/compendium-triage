// Firestore Collection Schemas and Document Templates
// Defines the structure and default values for all 31 collections

// User Input Schema for tracking all user inputs
export interface UserInput {
  id: string;
  text: string; // Truncated text for queries
  fullText?: string; // Full text stored separately
  textHash: string; // Hash for unique identification
  timestamp: Date;
  processed: boolean;
  length: number;
  wordCount: number;
  entitiesCreated?: {
    offices: number;
    projects: number;
    regulations: number;
  };
  processingResult?: string;
  translation?: {
    wasTranslated: boolean;
    originalLanguage?: string;
    translatedText?: string;
  };
}

import { 
  CollectionName, 
  DocumentType,
  City,
  Office,
  Project,
  Relationship,
  ArchHistory,
  NetworkGraph,
  Client,
  Workforce,
  Technology,
  Financial,
  SupplyChain,
  LandData,
  CityData,
  Regulation,
  ProjectData,
  CompanyStructure,
  DivisionPercentages,
  NewsArticle,
  PoliticalContext,
  ExternalMacroeconomic,
  ExternalTechnology,
  ExternalSupplyChain,
  ExternalDemographics,
  ExternalClimate,
  ExternalPolicy,
  ExternalEvent,
  MarketIntelligence,
  Trend,
  CompetitiveAnalysis,
  FinancialMetrics,
  ExternalForcesImpact,
  ACTIVE_COLLECTIONS,
  DORMANT_COLLECTIONS
} from '../../types/firestore';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

export interface CollectionSchema<T extends DocumentType> {
  name: CollectionName;
  type: 'active' | 'dormant';
  tier: 1 | 2 | 3 | 4;
  category?: 'enrichment' | 'external-forces' | 'market-intelligence';
  template: () => Partial<T>;
  requiredFields: (keyof T)[];
  optionalFields: (keyof T)[];
  validationRules?: {
    [K in keyof T]?: {
      required?: boolean;
      type?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: RegExp;
      enum?: any[];
    };
  };
}

// ============================================================================
// TIER 1: PRIMARY ENTITIES (3 collections)
// ============================================================================

export const citiesSchema: CollectionSchema<City> = {
  name: 'cities',
  type: 'dormant',
  tier: 1,
  template: (): Partial<City> => ({
    id: '',
    cityName: '',
    country: '',
    region: '',
    coordinates: { latitude: 0, longitude: 0 },
    marketProfile: {
      marketSize: 0,
      growthRate: 0,
      stage: 'emerging',
      status: 'competitive'
    },
    consolidation: {
      hhiIndex: 0,
      cr4: 0,
      activeOffices: 0
    },
    activeOffices: [],
    activeProjects: [],
    regulations: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'cityName', 'country', 'coordinates', 'marketProfile', 'consolidation'],
  optionalFields: ['region', 'activeOffices', 'activeProjects', 'regulations'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    cityName: { required: true, type: 'string', minLength: 1 },
    country: { required: true, type: 'string', minLength: 2, maxLength: 2 },
    marketProfile: { required: true, type: 'object' },
    consolidation: { required: true, type: 'object' }
  }
};

export const officesSchema: CollectionSchema<Office> = {
  name: 'offices',
  type: 'active',
  tier: 1,
  template: (): Partial<Office> => ({
    id: '',
    name: '',
    officialName: '',
    founded: new Date().getFullYear(),
    founder: '',
    status: 'active',
    location: {
      headquarters: {
        city: '',
        country: '',
        coordinates: { latitude: 0, longitude: 0 }
      },
      otherOffices: [] as Array<{
        address: string;
        coordinates: { latitude: number; longitude: number };
      }>
    },
    size: {
      employeeCount: 0,
      sizeCategory: 'boutique',
      annualRevenue: 0
    },
    specializations: [],
    notableWorks: [],
    connectionCounts: {
      totalProjects: 0,
      activeProjects: 0,
      clients: 0,
      competitors: 0,
      suppliers: 0
    },
    infoEntries: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
    requiredFields: ['id', 'name', 'officialName', 'status', 'location', 'size'],
    optionalFields: ['founder', 'website', 'specializations', 'notableWorks', 'connectionCounts', 'infoEntries'],
  validationRules: {
    id: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    name: { required: true, type: 'string', minLength: 1 },
    officialName: { required: true, type: 'string', minLength: 1 },
    // founded is optional now; if provided, validate range
    founded: { required: false, type: 'number', min: 1800, max: 2030 },
    status: { required: true, enum: ['active', 'acquired', 'dissolved'] },
    location: { required: true, type: 'object' },
    size: { required: true, type: 'object' }
  }
};

export const projectsSchema: CollectionSchema<Project> = {
  name: 'projects',
  type: 'active',
  tier: 1,
  template: (): Partial<Project> => ({
    id: '',
    projectName: '',
    officeId: '',
    cityId: '',
    clientId: '',
    status: 'concept',
    timeline: {
      startDate: Timestamp.now(),
      expectedCompletion: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
    },
    location: {
      city: '',
      country: '',
      address: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    financial: {
      budget: 0,
      currency: 'USD',
      actualCost: 0
    },
    details: {
      projectType: '',
      size: 0,
      description: ''
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'projectName', 'officeId', 'cityId', 'status', 'timeline', 'location', 'financial', 'details'],
  optionalFields: ['clientId', 'actualCost'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    projectName: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    cityId: { required: true, type: 'string', minLength: 1 },
    status: { required: true, enum: ['concept', 'planning', 'construction', 'completed', 'cancelled'] },
    timeline: { required: true, type: 'object' },
    location: { required: true, type: 'object' },
    financial: { required: true, type: 'object' },
    details: { required: true, type: 'object' }
  }
};

// ============================================================================
// TIER 2: CONNECTIVE TISSUE (3 collections)
// ============================================================================

export const relationshipsSchema: CollectionSchema<Relationship> = {
  name: 'relationships',
  type: 'active',
  tier: 2,
  template: (): Partial<Relationship> => ({
    id: '',
    sourceEntity: {
      type: '',
      id: ''
    },
    targetEntity: {
      type: '',
      id: ''
    },
    relationshipType: 'collaborator',
    strength: 5,
    sentiment: 'neutral',
    startDate: Timestamp.now(),
    endDate: undefined,
    details: {
      context: '',
      outcomes: [],
      notes: ''
    },
    evidence: [],
    tags: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'sourceEntity', 'targetEntity', 'relationshipType', 'strength', 'sentiment', 'startDate'],
  optionalFields: ['endDate', 'details', 'evidence', 'tags'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    sourceEntity: { required: true, type: 'object' },
    targetEntity: { required: true, type: 'object' },
    relationshipType: { required: true, enum: ['collaborator', 'competitor', 'client-of', 'supplier-to', 'influenced-by', 'acquired', 'merged', 'partner', 'subcontractor'] },
    strength: { required: true, type: 'number', min: 1, max: 10 },
    sentiment: { required: true, enum: ['positive', 'neutral', 'negative'] },
    startDate: { required: true, type: 'object' }
  }
};

export const archHistorySchema: CollectionSchema<ArchHistory> = {
  name: 'archHistory',
  type: 'dormant',
  tier: 2,
  template: (): Partial<ArchHistory> => ({
    id: '',
    eventType: 'founding',
    title: '',
    description: '',
    date: Timestamp.now(),
    entities: {
      primary: {
        type: '',
        id: ''
      },
      secondary: undefined
    },
    financial: undefined,
    impact: {
      level: 'medium',
      affectedEntities: [],
      marketImpact: ''
    },
    sources: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'eventType', 'title', 'description', 'date', 'entities', 'impact'],
  optionalFields: ['financial', 'sources'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    eventType: { required: true, enum: ['merger', 'acquisition', 'partnership', 'dissolution', 'founding', 'expansion'] },
    title: { required: true, type: 'string', minLength: 1 },
    description: { required: true, type: 'string', minLength: 1 },
    date: { required: true, type: 'object' },
    entities: { required: true, type: 'object' },
    impact: { required: true, type: 'object' }
  }
};

export const networkGraphSchema: CollectionSchema<NetworkGraph> = {
  name: 'networkGraph',
  type: 'dormant',
  tier: 2,
  template: (): Partial<NetworkGraph> => ({
    id: '',
    nodeType: '',
    entityId: '',
    connections: {
      totalConnections: 0,
      strongConnections: 0,
      byType: {},
      topConnections: []
    },
    centrality: {
      degree: 0,
      betweenness: 0,
      closeness: 0,
      influence: 0
    },
    clusters: [],
    lastComputed: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'nodeType', 'entityId', 'connections', 'centrality', 'lastComputed'],
  optionalFields: ['clusters'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    nodeType: { required: true, type: 'string', minLength: 1 },
    entityId: { required: true, type: 'string', minLength: 1 },
    connections: { required: true, type: 'object' },
    centrality: { required: true, type: 'object' },
    lastComputed: { required: true, type: 'object' }
  }
};

// ============================================================================
// TIER 3: DETAILED DATA - ENRICHMENT (13 collections)
// ============================================================================

export const clientsSchema: CollectionSchema<Client> = {
  name: 'clients',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<Client> => ({
    id: '',
    clientName: '',
    clientType: 'private',
    industry: '',
    location: {
      city: '',
      country: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    projects: [],
    preferredOffices: [],
    totalSpend: 0,
    relationshipQuality: 5,
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    },
    notes: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'clientName', 'clientType', 'industry', 'location'],
  optionalFields: ['projects', 'preferredOffices', 'totalSpend', 'relationshipQuality', 'contactInfo', 'notes'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    clientName: { required: true, type: 'string', minLength: 1 },
    clientType: { required: true, enum: ['private', 'public', 'corporate', 'institutional'] },
    industry: { required: true, type: 'string', minLength: 1 },
    location: { required: true, type: 'object' }
  }
};

export const workforceSchema: CollectionSchema<Workforce> = {
  name: 'workforce',
  type: 'active',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<Workforce> => ({
    id: '',
    officeId: '',
    employees: [],
    aggregate: {
      totalEmployees: 0,
      distribution: {
        architects: 0,
        engineers: 0,
        designers: 0,
        administrative: 0
      },
      retentionRate: 0,
      growthRate: 0
    },
    talentSources: [],
    partnerships: [],
    keyPersonnel: [],
    skillsMatrix: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'officeId', 'employees'],
  optionalFields: ['aggregate', 'talentSources', 'partnerships', 'keyPersonnel', 'skillsMatrix'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', minLength: 1 },
    employees: { required: true, type: 'array' }
  }
};

export const technologySchema: CollectionSchema<Technology> = {
  name: 'technology',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<Technology> => ({
    id: '',
    officeId: '',
    technologyName: '',
    category: 'BIM',
    vendor: '',
    adoptionDate: Timestamp.now(),
    usageLevel: 'experimental',
    relatedProjects: [],
    roi: {
      costSavings: 0,
      timeReduction: 0,
      qualityImprovement: ''
    },
    notes: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'officeId', 'technologyName', 'category', 'vendor', 'adoptionDate', 'usageLevel'],
  optionalFields: ['relatedProjects', 'roi', 'notes'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    technologyName: { required: true, type: 'string', minLength: 1 },
    category: { required: true, enum: ['BIM', 'AI', 'parametric', 'VR', 'fabrication', 'sustainability', 'other'] },
    vendor: { required: true, type: 'string', minLength: 1 },
    adoptionDate: { required: true, type: 'object' },
    usageLevel: { required: true, enum: ['experimental', 'partial', 'full', 'enterprise'] }
  }
};

export const financialsSchema: CollectionSchema<Financial> = {
  name: 'financials',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<Financial> => ({
    id: '',
    officeId: '',
    projectId: '',
    recordType: 'revenue',
    amount: 0,
    currency: 'USD',
    date: Timestamp.now(),
    period: {
      type: 'annual',
      year: new Date().getFullYear(),
      quarter: 1
    },
    source: '',
    destination: '',
    category: '',
    details: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'officeId', 'recordType', 'amount', 'currency', 'date'],
  optionalFields: ['projectId', 'period', 'source', 'destination', 'category', 'details'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    recordType: { required: true, enum: ['funding', 'debt', 'revenue', 'expense', 'investment'] },
    amount: { required: true, type: 'number' },
    currency: { required: true, type: 'string', minLength: 3, maxLength: 3 },
    date: { required: true, type: 'object' }
  }
};

export const supplyChainSchema: CollectionSchema<SupplyChain> = {
  name: 'supplyChain',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<SupplyChain> => ({
    id: '',
    supplierName: '',
    supplierType: 'materials',
    materialTypes: [],
    location: {
      city: '',
      country: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    serviceRegions: [],
    reliability: {
      score: 5,
      onTimeDelivery: 0,
      qualityRating: 5
    },
    pricing: {
      priceLevel: 'mid-range',
      negotiable: false
    },
    relationships: [],
    sustainability: {
      certified: false,
      certifications: []
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'supplierName', 'supplierType', 'location', 'reliability', 'pricing'],
  optionalFields: ['materialTypes', 'serviceRegions', 'relationships', 'sustainability'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    supplierName: { required: true, type: 'string', minLength: 1 },
    supplierType: { required: true, enum: ['materials', 'services', 'equipment'] },
    location: { required: true, type: 'object' },
    reliability: { required: true, type: 'object' },
    pricing: { required: true, type: 'object' }
  }
};

export const landDataSchema: CollectionSchema<LandData> = {
  name: 'landData',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<LandData> => ({
    id: '',
    location: {
      city: '',
      country: '',
      address: '',
      neighborhood: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    size: {
      area: 0,
      dimensions: {
        length: 0,
        width: 0
      }
    },
    zoning: {
      classification: '',
      allowedUses: [],
      restrictions: [],
      density: ''
    },
    ownership: {
      owner: '',
      ownerType: '',
      acquisitionDate: Timestamp.now()
    },
    valuation: {
      assessedValue: 0,
      marketValue: 0,
      currency: 'USD',
      lastAssessed: Timestamp.now()
    },
    development: {
      status: 'vacant',
      potential: '',
      limitations: []
    },
    relatedProjects: [],
    applicableRegulations: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'location', 'size', 'zoning', 'ownership', 'valuation', 'development'],
  optionalFields: ['relatedProjects', 'applicableRegulations'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    location: { required: true, type: 'object' },
    size: { required: true, type: 'object' },
    zoning: { required: true, type: 'object' },
    ownership: { required: true, type: 'object' },
    valuation: { required: true, type: 'object' },
    development: { required: true, type: 'object' }
  }
};

export const cityDataSchema: CollectionSchema<CityData> = {
  name: 'cityData',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<CityData> => ({
    id: '',
    cityId: '',
    demographics: {
      population: 0,
      density: 0,
      growthTrend: [],
      ageDistribution: {},
      wealthDistribution: {},
      educationLevel: {}
    },
    economic: {
      gdp: 0,
      gdpPerCapita: 0,
      constructionVolume: 0,
      realEstateMarket: {
        averagePrice: 0,
        priceGrowth: 0
      },
      majorIndustries: [],
      employmentRate: 0,
      costOfLiving: {
        index: 0,
        housing: 0,
        transportation: 0
      }
    },
    architectural: {
      dominantStyles: [],
      notableBuildings: [],
      architecturalHeritage: '',
      constructionActivity: '',
      landmarkProjects: [],
      urbanPlanningHistory: ''
    },
    cultural: {
      culturalInfluences: [],
      designTraditions: [],
      aestheticPreferences: ''
    },
    infrastructure: {
      transportNetwork: '',
      utilities: {
        water: '',
        electricity: '',
        internet: ''
      },
      connectivity: ''
    },
    trends: [],
    newsArticles: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'cityId', 'demographics', 'economic', 'architectural', 'cultural', 'infrastructure'],
  optionalFields: ['trends', 'newsArticles'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    cityId: { required: true, type: 'string', minLength: 1 },
    demographics: { required: true, type: 'object' },
    economic: { required: true, type: 'object' },
    architectural: { required: true, type: 'object' },
    cultural: { required: true, type: 'object' },
    infrastructure: { required: true, type: 'object' }
  }
};

export const regulationsSchema: CollectionSchema<Regulation> = {
  name: 'regulations',
  type: 'active',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<Regulation> => ({
    id: '',
    regulationType: 'building-code',
    name: '',
    jurisdiction: {
      level: 'national',
      country: '',
      countryName: '',
      state: '',
      cityId: '',
      cityName: '',
      scope: {
        appliesToCountry: true,
        appliesToState: false,
        appliesToCities: [],
        appliesToProjectTypes: []
      }
    },
    hierarchy: {
      parentRegulation: '',
      supersededBy: '',
      relatedRegulations: [],
      derivedFrom: ''
    },
    effectiveDate: Timestamp.now(),
    expirationDate: undefined,
    version: '1.0',
    description: '',
    requirements: [],
    compliance: {
      mandatory: true,
      penalties: {
        fines: '',
        criminal: false,
        projectStoppage: false
      },
      requiredCertifications: [],
      inspectionRequired: false,
      complianceCost: {
        estimated: 0,
        currency: 'USD',
        perProjectType: {}
      },
      documentationRequired: []
    },
    enforcement: {
      enforcingAuthority: '',
      inspectionFrequency: '',
      complianceRate: 0,
      violationCount: 0
    },
    impact: {
      level: 'medium',
      affectedProjects: [],
      economicImpact: '',
      timelineImpact: '',
      designImpact: ''
    },
    newsArticles: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'regulationType', 'name', 'jurisdiction', 'effectiveDate', 'version', 'description', 'compliance', 'enforcement', 'impact'],
  optionalFields: ['hierarchy', 'expirationDate', 'requirements', 'newsArticles'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    regulationType: { required: true, enum: ['zoning', 'building-code', 'environmental', 'safety', 'accessibility', 'fire-safety', 'energy'] },
    name: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    effectiveDate: { required: true, type: 'object' },
    version: { required: true, type: 'string', minLength: 1 },
    description: { required: true, type: 'string', minLength: 1 },
    compliance: { required: true, type: 'object' },
    enforcement: { required: true, type: 'object' },
    impact: { required: true, type: 'object' }
  }
};

export const projectDataSchema: CollectionSchema<ProjectData> = {
  name: 'projectData',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<ProjectData> => ({
    id: '',
    projectId: '',
    vision: {
      designPhilosophy: '',
      inspirations: [],
      conceptualApproach: '',
      architecturalIntent: ''
    },
    team: {
      leadArchitect: '',
      designTeam: [],
      engineers: [],
      consultants: [],
      contractors: {
        general: '',
        specialty: []
      }
    },
    performance: {
      schedulePerformance: {
        plannedDuration: 0,
        actualDuration: 0,
        delays: []
      },
      budgetPerformance: {
        plannedBudget: 0,
        actualCost: 0,
        overruns: []
      },
      qualityMetrics: {
        clientRating: 0,
        industryRating: 0,
        awards: []
      },
      clientSatisfaction: {
        rating: 0,
        feedback: '',
        repeatClient: false
      }
    },
    technical: {
      structure: {
        type: '',
        materials: [],
        innovations: []
      },
      systems: {
        hvac: '',
        electrical: '',
        plumbing: '',
        smart: []
      },
      materials: [],
      innovations: []
    },
    compliance: {
      regulations: [],
      permits: [],
      certifications: [],
      inspections: []
    },
    legacy: {
      awards: [],
      influence: {
        designTrends: [],
        industryImpact: ''
      },
      culturalSignificance: {
        landmark: false,
        heritage: false,
        tourism: false
      },
      marketImpact: {
        propertyValues: 0,
        neighborhoodDevelopment: ''
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'projectId', 'vision', 'team', 'performance', 'technical', 'compliance', 'legacy'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    projectId: { required: true, type: 'string', minLength: 1 },
    vision: { required: true, type: 'object' },
    team: { required: true, type: 'object' },
    performance: { required: true, type: 'object' },
    technical: { required: true, type: 'object' },
    compliance: { required: true, type: 'object' },
    legacy: { required: true, type: 'object' }
  }
};

export const companyStructureSchema: CollectionSchema<CompanyStructure> = {
  name: 'companyStructure',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<CompanyStructure> => ({
    id: '',
    officeId: '',
    structure: {
      organizationType: 'corporation',
      departments: [],
      hierarchy: {
        levels: 0,
        reportingStructure: ''
      }
    },
    leadership: [],
    divisions: [],
    governance: {
      ownership: '',
      boardMembers: []
    },
    updatedAt: Timestamp.now(),
    createdAt: Timestamp.now()
  }),
  requiredFields: ['id', 'officeId', 'structure', 'leadership', 'divisions', 'governance'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    structure: { required: true, type: 'object' },
    leadership: { required: true, type: 'array' },
    divisions: { required: true, type: 'array' },
    governance: { required: true, type: 'object' }
  }
};

export const divisionPercentagesSchema: CollectionSchema<DivisionPercentages> = {
  name: 'divisionPercentages',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<DivisionPercentages> => ({
    id: '',
    officeId: '',
    divisionType: 'revenue',
    breakdown: {},
    period: {
      year: new Date().getFullYear(),
      quarter: 1,
      type: 'annual'
    },
    methodology: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'officeId', 'divisionType', 'breakdown', 'period'],
  optionalFields: ['methodology'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    officeId: { required: true, type: 'string', pattern: /^[A-Z]{2}[A-Z]{2}\d{3}$/ },
    divisionType: { required: true, enum: ['revenue', 'workforce', 'projects', 'regions'] },
    breakdown: { required: true, type: 'object' },
    period: { required: true, type: 'object' }
  }
};

export const newsArticlesSchema: CollectionSchema<NewsArticle> = {
  name: 'newsArticles',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<NewsArticle> => ({
    id: '',
    title: '',
    url: '',
    publishedDate: Timestamp.now(),
    source: {
      outletName: '',
      author: '',
      credibility: 5,
      type: 'news'
    },
    content: '',
    excerpt: '',
    category: 'project-announcement',
    entities: {
      offices: [],
      projects: [],
      people: [],
      cities: []
    },
    topics: [],
    sentiment: 'neutral',
    impact: {
      level: 'medium',
      affectedEntities: [],
      marketReaction: ''
    },
    tags: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'title', 'url', 'publishedDate', 'source', 'content', 'excerpt', 'category', 'entities', 'sentiment', 'impact'],
  optionalFields: ['topics', 'tags'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    title: { required: true, type: 'string', minLength: 1 },
    url: { required: true, type: 'string', minLength: 1 },
    publishedDate: { required: true, type: 'object' },
    source: { required: true, type: 'object' },
    content: { required: true, type: 'string', minLength: 1 },
    excerpt: { required: true, type: 'string', minLength: 1 },
    category: { required: true, enum: ['M&A', 'project-announcement', 'award', 'scandal', 'technology', 'sustainability', 'other'] },
    entities: { required: true, type: 'object' },
    sentiment: { required: true, enum: ['positive', 'neutral', 'negative'] },
    impact: { required: true, type: 'object' }
  }
};

export const politicalContextSchema: CollectionSchema<PoliticalContext> = {
  name: 'politicalContext',
  type: 'dormant',
  tier: 3,
  category: 'enrichment',
  template: (): Partial<PoliticalContext> => ({
    id: '',
    jurisdiction: {
      level: 'national',
      country: '',
      state: '',
      cityId: ''
    },
    governance: {
      governmentType: '',
      stability: 'stable',
      corruptionIndex: 0,
      transparency: 0
    },
    institutions: {
      regulatoryBodies: [],
      enforcementAgencies: [],
      planningAuthorities: []
    },
    policies: [],
    elections: [],
    stability: {
      level: 'high',
      risks: [],
      opportunities: []
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'jurisdiction', 'governance', 'institutions', 'policies', 'elections', 'stability'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    governance: { required: true, type: 'object' },
    institutions: { required: true, type: 'object' },
    policies: { required: true, type: 'array' },
    elections: { required: true, type: 'array' },
    stability: { required: true, type: 'object' }
  }
};

// ============================================================================
// TIER 3: DETAILED DATA - EXTERNAL FORCES (7 collections)
// ============================================================================

export const externalMacroeconomicSchema: CollectionSchema<ExternalMacroeconomic> = {
  name: 'externalMacroeconomic',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalMacroeconomic> => ({
    id: '',
    jurisdiction: {
      level: 'national',
      country: '',
      region: ''
    },
    period: {
      year: new Date().getFullYear(),
      quarter: 1,
      type: 'annual'
    },
    gdp: {
      value: 0,
      growth: 0,
      perCapita: 0
    },
    inflation: {
      rate: 0,
      trend: 'stable'
    },
    interestRates: {
      centralBank: 0,
      commercial: 0,
      mortgage: 0
    },
    employment: {
      rate: 0,
      construction: 0,
      architecture: 0
    },
    construction: {
      volume: 0,
      growth: 0,
      investment: 0
    },
    realEstate: {
      prices: 0,
      growth: 0,
      transactions: 0
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'jurisdiction', 'period', 'gdp', 'inflation', 'interestRates', 'employment', 'construction', 'realEstate'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    gdp: { required: true, type: 'object' },
    inflation: { required: true, type: 'object' },
    interestRates: { required: true, type: 'object' },
    employment: { required: true, type: 'object' },
    construction: { required: true, type: 'object' },
    realEstate: { required: true, type: 'object' }
  }
};

export const externalTechnologySchema: CollectionSchema<ExternalTechnology> = {
  name: 'externalTechnology',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalTechnology> => ({
    id: '',
    technologyName: '',
    category: 'AI',
    maturity: 'emerging',
    adoption: {
      level: 0,
      trend: 'rising',
      barriers: [],
      drivers: []
    },
    impact: {
      architecture: 'medium',
      construction: 'medium',
      market: 'medium'
    },
    timeline: {
      firstAdoption: Timestamp.now(),
      peakAdoption: undefined,
      expectedMaturity: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
    },
    cost: {
      implementation: 0,
      maintenance: 0,
      roi: 0
    },
    regulations: [],
    newsArticles: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'technologyName', 'category', 'maturity', 'adoption', 'impact', 'timeline', 'cost'],
  optionalFields: ['regulations', 'newsArticles'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    technologyName: { required: true, type: 'string', minLength: 1 },
    category: { required: true, enum: ['AI', 'BIM', 'sustainability', 'materials', 'construction', 'design'] },
    maturity: { required: true, enum: ['emerging', 'developing', 'mature', 'declining'] },
    adoption: { required: true, type: 'object' },
    impact: { required: true, type: 'object' },
    timeline: { required: true, type: 'object' },
    cost: { required: true, type: 'object' }
  }
};

export const externalSupplyChainSchema: CollectionSchema<ExternalSupplyChain> = {
  name: 'externalSupplyChain',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalSupplyChain> => ({
    id: '',
    materialType: '',
    category: 'raw-materials',
    globalMarket: {
      size: 0,
      growth: 0,
      majorProducers: []
    },
    pricing: {
      current: 0,
      trend: 'stable',
      volatility: 0,
      currency: 'USD'
    },
    availability: {
      level: 'adequate',
      bottlenecks: [],
      alternatives: []
    },
    sustainability: {
      environmentalImpact: 'medium',
      carbonFootprint: 0,
      recyclability: 0
    },
    disruptions: [],
    regulations: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'materialType', 'category', 'globalMarket', 'pricing', 'availability', 'sustainability'],
  optionalFields: ['disruptions', 'regulations'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    materialType: { required: true, type: 'string', minLength: 1 },
    category: { required: true, enum: ['raw-materials', 'processed', 'equipment', 'services'] },
    globalMarket: { required: true, type: 'object' },
    pricing: { required: true, type: 'object' },
    availability: { required: true, type: 'object' },
    sustainability: { required: true, type: 'object' }
  }
};

export const externalDemographicsSchema: CollectionSchema<ExternalDemographics> = {
  name: 'externalDemographics',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalDemographics> => ({
    id: '',
    jurisdiction: {
      level: 'national',
      country: '',
      region: '',
      cityId: ''
    },
    period: {
      year: new Date().getFullYear(),
      type: 'annual'
    },
    population: {
      total: 0,
      growth: 0,
      density: 0
    },
    ageDistribution: {},
    urbanization: {
      rate: 0,
      trend: 'rising',
      megacities: 0
    },
    migration: {
      internal: 0,
      international: 0,
      net: 0
    },
    housing: {
      demand: 0,
      supply: 0,
      affordability: 0
    },
    workforce: {
      size: 0,
      architecture: 0,
      construction: 0,
      skills: {}
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'jurisdiction', 'period', 'population', 'ageDistribution', 'urbanization', 'migration', 'housing', 'workforce'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    population: { required: true, type: 'object' },
    ageDistribution: { required: true, type: 'object' },
    urbanization: { required: true, type: 'object' },
    migration: { required: true, type: 'object' },
    housing: { required: true, type: 'object' },
    workforce: { required: true, type: 'object' }
  }
};

export const externalClimateSchema: CollectionSchema<ExternalClimate> = {
  name: 'externalClimate',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalClimate> => ({
    id: '',
    jurisdiction: {
      level: 'national',
      country: '',
      region: ''
    },
    period: {
      year: new Date().getFullYear(),
      type: 'annual'
    },
    temperature: {
      average: 0,
      trend: 'stable',
      extremes: {
        max: 0,
        min: 0
      }
    },
    precipitation: {
      average: 0,
      trend: 'stable',
      patterns: []
    },
    seaLevel: {
      current: 0,
      rise: 0,
      impact: []
    },
    extremeEvents: [],
    regulations: {
      carbon: [],
      sustainability: [],
      adaptation: []
    },
    risks: {
      flooding: 'low',
      drought: 'low',
      storms: 'low',
      heat: 'low'
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'jurisdiction', 'period', 'temperature', 'precipitation', 'seaLevel', 'extremeEvents', 'regulations', 'risks'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    temperature: { required: true, type: 'object' },
    precipitation: { required: true, type: 'object' },
    seaLevel: { required: true, type: 'object' },
    extremeEvents: { required: true, type: 'array' },
    regulations: { required: true, type: 'object' },
    risks: { required: true, type: 'object' }
  }
};

export const externalPolicySchema: CollectionSchema<ExternalPolicy> = {
  name: 'externalPolicy',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalPolicy> => ({
    id: '',
    jurisdiction: {
      level: 'national',
      country: '',
      state: '',
      cityId: ''
    },
    policyType: 'tax',
    name: '',
    description: '',
    effectiveDate: Timestamp.now(),
    expirationDate: undefined,
    impact: {
      level: 'medium',
      sectors: [],
      positive: [],
      negative: []
    },
    incentives: [],
    penalties: [],
    compliance: {
      requirements: [],
      reporting: [],
      deadlines: []
    },
    relatedRegulations: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'jurisdiction', 'policyType', 'name', 'description', 'effectiveDate', 'impact', 'compliance'],
  optionalFields: ['expirationDate', 'incentives', 'penalties', 'relatedRegulations'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    jurisdiction: { required: true, type: 'object' },
    policyType: { required: true, enum: ['tax', 'trade', 'environmental', 'infrastructure', 'housing', 'economic'] },
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: true, type: 'string', minLength: 1 },
    effectiveDate: { required: true, type: 'object' },
    impact: { required: true, type: 'object' },
    compliance: { required: true, type: 'object' }
  }
};

export const externalEventsSchema: CollectionSchema<ExternalEvent> = {
  name: 'externalEvents',
  type: 'dormant',
  tier: 3,
  category: 'external-forces',
  template: (): Partial<ExternalEvent> => ({
    id: '',
    eventType: 'economic-crisis',
    name: '',
    description: '',
    startDate: Timestamp.now(),
    endDate: undefined,
    severity: 'medium',
    affectedRegions: [],
    impact: {
      economic: 'medium',
      social: 'medium',
      political: 'medium',
      environmental: 'medium'
    },
    consequences: {
      immediate: [],
      shortTerm: [],
      longTerm: []
    },
    recovery: {
      timeline: '',
      challenges: [],
      opportunities: []
    },
    relatedNews: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'eventType', 'name', 'description', 'startDate', 'severity', 'affectedRegions', 'impact', 'consequences', 'recovery'],
  optionalFields: ['endDate', 'relatedNews'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    eventType: { required: true, enum: ['war', 'pandemic', 'natural-disaster', 'economic-crisis', 'political-upheaval', 'technological-breakthrough'] },
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: true, type: 'string', minLength: 1 },
    startDate: { required: true, type: 'object' },
    severity: { required: true, enum: ['high', 'medium', 'low'] },
    affectedRegions: { required: true, type: 'array' },
    impact: { required: true, type: 'object' },
    consequences: { required: true, type: 'object' },
    recovery: { required: true, type: 'object' }
  }
};

// ============================================================================
// TIER 4: MARKET INTELLIGENCE (5 collections)
// ============================================================================

export const marketIntelligenceSchema: CollectionSchema<MarketIntelligence> = {
  name: 'marketIntelligence',
  type: 'dormant',
  tier: 4,
  category: 'market-intelligence',
  template: (): Partial<MarketIntelligence> => ({
    id: '',
    scope: {
      level: 'national',
      country: '',
      region: '',
      cityId: ''
    },
    period: {
      year: new Date().getFullYear(),
      quarter: 1,
      type: 'annual'
    },
    hhi: {
      value: 0,
      trend: 'stable',
      interpretation: ''
    },
    gini: {
      value: 0,
      trend: 'stable',
      interpretation: ''
    },
    concentration: {
      cr4: 0,
      cr8: 0,
      topFirms: []
    },
    consolidation: {
      level: 'medium',
      trend: 'stable',
      recentMergers: 0,
      expectedMergers: 0
    },
    barriers: {
      entry: 'medium',
      exit: 'medium',
      factors: []
    },
    competition: {
      intensity: 'medium',
      type: 'monopolistic',
      dynamics: []
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'scope', 'period', 'hhi', 'gini', 'concentration', 'consolidation', 'barriers', 'competition'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    scope: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    hhi: { required: true, type: 'object' },
    gini: { required: true, type: 'object' },
    concentration: { required: true, type: 'object' },
    consolidation: { required: true, type: 'object' },
    barriers: { required: true, type: 'object' },
    competition: { required: true, type: 'object' }
  }
};

export const trendsSchema: CollectionSchema<Trend> = {
  name: 'trends',
  type: 'dormant',
  tier: 4,
  category: 'market-intelligence',
  template: (): Partial<Trend> => ({
    id: '',
    trendName: '',
    category: 'technology',
    description: '',
    stage: 'emerging',
    strength: 5,
    direction: 'positive',
    timeline: {
      start: Timestamp.now(),
      peak: undefined,
      end: undefined
    },
    impact: {
      offices: [],
      projects: [],
      cities: [],
      magnitude: 'medium'
    },
    drivers: [],
    barriers: [],
    indicators: [],
    relatedNews: [],
    relatedTechnologies: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'trendName', 'category', 'description', 'stage', 'strength', 'direction', 'timeline', 'impact'],
  optionalFields: ['drivers', 'barriers', 'indicators', 'relatedNews', 'relatedTechnologies'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    trendName: { required: true, type: 'string', minLength: 1 },
    category: { required: true, enum: ['technology', 'sustainability', 'design', 'market', 'regulatory', 'social'] },
    description: { required: true, type: 'string', minLength: 1 },
    stage: { required: true, enum: ['emerging', 'growing', 'mature', 'declining'] },
    strength: { required: true, type: 'number', min: 1, max: 10 },
    direction: { required: true, enum: ['positive', 'neutral', 'negative'] },
    timeline: { required: true, type: 'object' },
    impact: { required: true, type: 'object' }
  }
};

export const competitiveAnalysisSchema: CollectionSchema<CompetitiveAnalysis> = {
  name: 'competitiveAnalysis',
  type: 'dormant',
  tier: 4,
  category: 'market-intelligence',
  template: (): Partial<CompetitiveAnalysis> => ({
    id: '',
    scope: {
      level: 'national',
      country: '',
      region: '',
      cityId: ''
    },
    period: {
      year: new Date().getFullYear(),
      quarter: 1
    },
    marketPositioning: [],
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    },
    competitiveDynamics: {
      rivalry: 'medium',
      threats: {
        newEntrants: 'medium',
        substitutes: 'medium'
      },
      bargaining: {
        suppliers: 'medium',
        buyers: 'medium'
      }
    },
    strategies: [],
    futureOutlook: {
      consolidation: 'possible',
      disruptions: [],
      opportunities: []
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'scope', 'period', 'marketPositioning', 'swot', 'competitiveDynamics', 'strategies', 'futureOutlook'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    scope: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    marketPositioning: { required: true, type: 'array' },
    swot: { required: true, type: 'object' },
    competitiveDynamics: { required: true, type: 'object' },
    strategies: { required: true, type: 'array' },
    futureOutlook: { required: true, type: 'object' }
  }
};

export const financialMetricsSchema: CollectionSchema<FinancialMetrics> = {
  name: 'financialMetrics',
  type: 'dormant',
  tier: 4,
  category: 'market-intelligence',
  template: (): Partial<FinancialMetrics> => ({
    id: '',
    scope: {
      level: 'national',
      country: '',
      region: '',
      cityId: ''
    },
    period: {
      year: new Date().getFullYear(),
      quarter: 1,
      type: 'annual'
    },
    marketSize: {
      total: 0,
      growth: 0,
      segments: {}
    },
    pricing: {
      average: 0,
      range: {
        min: 0,
        max: 0
      },
      trends: 'stable'
    },
    profitability: {
      average: 0,
      topPerformers: 0,
      bottomPerformers: 0
    },
    investment: {
      total: 0,
      growth: 0,
      sources: {}
    },
    performance: {
      revenue: 0,
      growth: 0,
      margins: 0,
      roi: 0
    },
    benchmarks: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'scope', 'period', 'marketSize', 'pricing', 'profitability', 'investment', 'performance'],
  optionalFields: ['benchmarks'],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    scope: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    marketSize: { required: true, type: 'object' },
    pricing: { required: true, type: 'object' },
    profitability: { required: true, type: 'object' },
    investment: { required: true, type: 'object' },
    performance: { required: true, type: 'object' }
  }
};

export const externalForcesImpactSchema: CollectionSchema<ExternalForcesImpact> = {
  name: 'externalForcesImpact',
  type: 'dormant',
  tier: 4,
  category: 'market-intelligence',
  template: (): Partial<ExternalForcesImpact> => ({
    id: '',
    scope: {
      level: 'national',
      country: '',
      region: '',
      cityId: ''
    },
    period: {
      year: new Date().getFullYear(),
      quarter: 1
    },
    forces: [],
    scenarios: [],
    risks: [],
    opportunities: [],
    recommendations: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }),
  requiredFields: ['id', 'scope', 'period', 'forces', 'scenarios', 'risks', 'opportunities', 'recommendations'],
  optionalFields: [],
  validationRules: {
    id: { required: true, type: 'string', minLength: 1 },
    scope: { required: true, type: 'object' },
    period: { required: true, type: 'object' },
    forces: { required: true, type: 'array' },
    scenarios: { required: true, type: 'array' },
    risks: { required: true, type: 'array' },
    opportunities: { required: true, type: 'array' },
    recommendations: { required: true, type: 'array' }
  }
};

// ============================================================================
// SCHEMA REGISTRY
// ============================================================================

export const COLLECTION_SCHEMAS: Record<CollectionName, CollectionSchema<any>> = {
  // Tier 1: Primary Entities
  cities: citiesSchema,
  offices: officesSchema,
  projects: projectsSchema,
  
  // Tier 2: Connective Tissue
  relationships: relationshipsSchema,
  archHistory: archHistorySchema,
  networkGraph: networkGraphSchema,
  
  // Tier 3: Detailed Data - Enrichment
  clients: clientsSchema,
  workforce: workforceSchema,
  technology: technologySchema,
  financials: financialsSchema,
  supplyChain: supplyChainSchema,
  landData: landDataSchema,
  cityData: cityDataSchema,
  regulations: regulationsSchema,
  projectData: projectDataSchema,
  companyStructure: companyStructureSchema,
  divisionPercentages: divisionPercentagesSchema,
  newsArticles: newsArticlesSchema,
  politicalContext: politicalContextSchema,
  
  // Tier 3: Detailed Data - External Forces
  externalMacroeconomic: externalMacroeconomicSchema,
  externalTechnology: externalTechnologySchema,
  externalSupplyChain: externalSupplyChainSchema,
  externalDemographics: externalDemographicsSchema,
  externalClimate: externalClimateSchema,
  externalPolicy: externalPolicySchema,
  externalEvents: externalEventsSchema,
  
  // Tier 4: Market Intelligence
  marketIntelligence: marketIntelligenceSchema,
  trends: trendsSchema,
  competitiveAnalysis: competitiveAnalysisSchema,
  financialMetrics: financialMetricsSchema,
  externalForcesImpact: externalForcesImpactSchema
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getSchema(collectionName: CollectionName): CollectionSchema<any> {
  const schema = COLLECTION_SCHEMAS[collectionName];
  if (!schema) {
    throw new Error(`Schema not found for collection: ${collectionName}`);
  }
  return schema;
}

export function getTemplate(collectionName: CollectionName): Partial<DocumentType> {
  const schema = getSchema(collectionName);
  return schema.template();
}

export function getRequiredFields(collectionName: CollectionName): string[] {
  const schema = getSchema(collectionName);
  return schema.requiredFields as string[];
}

export function getOptionalFields(collectionName: CollectionName): string[] {
  const schema = getSchema(collectionName);
  return schema.optionalFields as string[];
}

export function getValidationRules(collectionName: CollectionName) {
  const schema = getSchema(collectionName);
  return schema.validationRules || {};
}

export function isActiveCollection(collectionName: CollectionName): boolean {
  const schema = getSchema(collectionName);
  return schema.type === 'active';
}

export function isDormantCollection(collectionName: CollectionName): boolean {
  const schema = getSchema(collectionName);
  return schema.type === 'dormant';
}

export function getCollectionsByTier(tier: 1 | 2 | 3 | 4): CollectionName[] {
  return Object.entries(COLLECTION_SCHEMAS)
    .filter(([_, schema]) => schema.tier === tier)
    .map(([name, _]) => name as CollectionName);
}

export function getCollectionsByCategory(category: 'enrichment' | 'external-forces' | 'market-intelligence'): CollectionName[] {
  return Object.entries(COLLECTION_SCHEMAS)
    .filter(([_, schema]) => schema.category === category)
    .map(([name, _]) => name as CollectionName);
}

export function getActiveSchemas(): CollectionSchema<any>[] {
  return Object.values(COLLECTION_SCHEMAS).filter(schema => schema.type === 'active');
}

export function getDormantSchemas(): CollectionSchema<any>[] {
  return Object.values(COLLECTION_SCHEMAS).filter(schema => schema.type === 'dormant');
}
