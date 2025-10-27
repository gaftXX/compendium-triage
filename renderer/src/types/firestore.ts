// Firestore Database Types - 4-Tier Architecture
// Based on FIRESTORE_DATABASE_PLAN.md

import { Timestamp, GeoPoint } from 'firebase/firestore';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Location {
  city: string;
  country: string;
  coordinates?: GeoPoint;
  address?: string;
  neighborhood?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ============================================================================
// TIER 1: PRIMARY ENTITIES (3 collections)
// ============================================================================

// Cities Collection
export interface City extends BaseDocument {
  cityName: string;
  country: string;
  region: string;
  coordinates: GeoPoint;
  marketProfile: {
    marketSize: number;
    growthRate: number;
    stage: 'emerging' | 'growth' | 'mature' | 'declining';
    status: 'competitive' | 'consolidating' | 'oligopoly';
  };
  consolidation: {
    hhiIndex: number;
    cr4: number;
    activeOffices: number;
  };
  activeOffices: string[]; // Office IDs (CCccNNN format)
  activeProjects: string[]; // Project IDs
  regulations: string[]; // Regulation IDs
}

// Offices Collection - PRIMARY ENTITY
export interface Office extends BaseDocument {
  name: string;
  officialName: string;
  founded: number;
  founder?: string; // Person who founded the office
  status: 'active' | 'acquired' | 'dissolved';
  location: {
    headquarters: Location;
    otherOffices: Location[];
  };
  size?: {
    employeeCount?: number;
    sizeCategory?: 'boutique' | 'medium' | 'large' | 'global';
    annualRevenue?: number;
  };
  specializations: string[];
  notableWorks: string[];
  connectionCounts: {
    totalProjects: number;
    activeProjects: number;
    clients: number;
    competitors: number;
    suppliers: number;
  };
}

// Projects Collection - CORE ENTITY (Basic Shell)
export interface Project extends BaseDocument {
  projectName: string;
  officeId: string; // PRIMARY relationship
  cityId: string; // City where project is located
  clientId: string; // Reference to clients collection
  status: 'concept' | 'planning' | 'construction' | 'completed' | 'cancelled';
  timeline: {
    startDate: Timestamp;
    expectedCompletion: Timestamp;
    actualCompletion?: Timestamp;
  };
  location: Location;
  financial: {
    budget: number;
    currency: string;
    actualCost?: number;
  };
  details: {
    projectType: string; // residential, commercial, cultural, etc.
    size: number; // sq meters
    description: string;
  };
}

// ============================================================================
// TIER 2: CONNECTIVE TISSUE (3 collections)
// ============================================================================

// Relationships Collection - Graph Edges
export interface Relationship extends BaseDocument {
  sourceEntity: {
    type: string; // "office", "project", "client", etc.
    id: string;
  };
  targetEntity: {
    type: string;
    id: string;
  };
  relationshipType: 'collaborator' | 'competitor' | 'client-of' | 'supplier-to' | 
                   'influenced-by' | 'acquired' | 'merged' | 'partner' | 'subcontractor';
  strength: number; // 1-10 scale
  sentiment: 'positive' | 'neutral' | 'negative';
  startDate: Timestamp;
  endDate?: Timestamp;
  details: {
    context: string;
    outcomes: string[];
    notes: string;
  };
  evidence: string[]; // Project IDs, document refs
  tags: string[];
}

// ArchHistory Collection - Timeline Events and M&A Tracking
export interface ArchHistory extends BaseDocument {
  eventType: 'merger' | 'acquisition' | 'partnership' | 'dissolution' | 'founding' | 'expansion';
  title: string;
  description: string;
  date: Timestamp;
  entities: {
    primary: {
      type: string;
      id: string;
    };
    secondary?: {
      type: string;
      id: string;
    };
  };
  financial?: {
    dealValue: number;
    currency: string;
  };
  impact: {
    level: 'high' | 'medium' | 'low';
    affectedEntities: string[];
    marketImpact: string;
  };
  sources: string[]; // News article IDs
}

// NetworkGraph Collection - Precomputed Connection Metrics
export interface NetworkGraph extends BaseDocument {
  nodeType: string; // office, project, client, etc.
  entityId: string; // Reference to actual entity
  connections: {
    totalConnections: number;
    strongConnections: number; // strength > 7
    byType: Record<string, number>;
    topConnections: Array<{
      nodeId: string;
      relationshipType: string;
      strength: number;
    }>;
  };
  centrality: {
    degree: number;
    betweenness: number;
    closeness: number;
    influence: number;
  };
  clusters: string[];
  lastComputed: Timestamp;
}

// ============================================================================
// TIER 3: DETAILED DATA (20 collections)
// ============================================================================

// Enrichment Data (13 collections)

// Clients Collection
export interface Client extends BaseDocument {
  clientName: string;
  clientType: 'private' | 'public' | 'corporate' | 'institutional';
  industry: string;
  location: Location;
  projects: string[]; // All projects with this client
  preferredOffices: string[]; // Offices they work with repeatedly
  totalSpend: number;
  relationshipQuality: number; // 1-10
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
  notes: string;
}

// Workforce Collection
export interface Workforce extends BaseDocument {
  officeId?: string; // null if individual talent
  recordType: 'office-aggregate' | 'individual' | 'team';
  aggregate?: {
    totalEmployees: number;
    distribution: {
      architects: number;
      engineers: number;
      designers: number;
      administrative: number;
    };
    retentionRate: number;
    growthRate: number;
  };
  talentSources: string[];
  partnerships: Array<{
    institution: string;
    relationship: string;
  }>;
  keyPersonnel: Array<{
    name: string;
    role: string;
    expertise: string[];
  }>;
  skillsMatrix: Record<string, number>;
}

// Technology Collection
export interface Technology extends BaseDocument {
  officeId: string;
  technologyName: string;
  category: 'BIM' | 'AI' | 'parametric' | 'VR' | 'fabrication' | 'sustainability' | 'other';
  vendor: string;
  adoptionDate: Timestamp;
  usageLevel: 'experimental' | 'partial' | 'full' | 'enterprise';
  relatedProjects: string[];
  roi: {
    costSavings: number;
    timeReduction: number;
    qualityImprovement: string;
  };
  notes: string;
}

// Financials Collection
export interface Financial extends BaseDocument {
  officeId: string;
  projectId?: string; // Optional: project-specific
  recordType: 'funding' | 'debt' | 'revenue' | 'expense' | 'investment';
  amount: number;
  currency: string;
  date: Timestamp;
  period?: {
    type: 'monthly' | 'quarterly' | 'annual';
    year: number;
    quarter?: number;
  };
  source: string;
  destination: string;
  category: string;
  details: string;
}

// SupplyChain Collection
export interface SupplyChain extends BaseDocument {
  supplierName: string;
  supplierType: 'materials' | 'services' | 'equipment';
  materialTypes: string[]; // steel, glass, concrete, timber, etc.
  location: Location;
  serviceRegions: string[];
  reliability: {
    score: number; // 1-10
    onTimeDelivery: number;
    qualityRating: number;
  };
  pricing: {
    priceLevel: 'budget' | 'mid-range' | 'premium';
    negotiable: boolean;
  };
  relationships: Array<{
    officeId: string;
    contractStatus: string;
    projects: string[];
  }>;
  sustainability: {
    certified: boolean;
    certifications: string[];
  };
}

// LandData Collection
export interface LandData extends BaseDocument {
  location: Location;
  size: {
    area: number; // sq meters
    dimensions: {
      length: number;
      width: number;
    };
  };
  zoning: {
    classification: string;
    allowedUses: string[];
    restrictions: string[];
    density: string;
  };
  ownership: {
    owner: string;
    ownerType: string;
    acquisitionDate: Timestamp;
  };
  valuation: {
    assessedValue: number;
    marketValue: number;
    currency: string;
    lastAssessed: Timestamp;
  };
  development: {
    status: 'vacant' | 'planned' | 'under-construction';
    potential: string;
    limitations: string[];
  };
  relatedProjects: string[];
  applicableRegulations: string[];
}

// CityData Collection - Detailed City Enrichment
export interface CityData extends BaseDocument {
  cityId: string; // Reference to Tier 1 cities collection
  demographics: {
    population: number;
    density: number;
    growthTrend: Array<{
      year: number;
      population: number;
    }>;
    ageDistribution: Record<string, number>;
    wealthDistribution: Record<string, number>;
    educationLevel: Record<string, number>;
  };
  economic: {
    gdp: number;
    gdpPerCapita: number;
    constructionVolume: number;
    realEstateMarket: {
      averagePrice: number;
      priceGrowth: number;
    };
    majorIndustries: string[];
    employmentRate: number;
    costOfLiving: {
      index: number;
      housing: number;
      transportation: number;
    };
  };
  architectural: {
    dominantStyles: string[];
    notableBuildings: string[];
    architecturalHeritage: string;
    constructionActivity: string;
    landmarkProjects: string[];
    urbanPlanningHistory: string;
  };
  cultural: {
    culturalInfluences: string[];
    designTraditions: string[];
    aestheticPreferences: string;
  };
  infrastructure: {
    transportNetwork: string;
    utilities: {
      water: string;
      electricity: string;
      internet: string;
    };
    connectivity: string;
  };
  trends: string[]; // Current trends affecting city (IDs)
  newsArticles: string[]; // News about this city (IDs)
}

// Regulations Collection - Laws, Codes, Regulatory Requirements
export interface Regulation extends BaseDocument {
  regulationType: 'zoning' | 'building-code' | 'environmental' | 'safety' | 'accessibility' | 'fire-safety' | 'energy';
  name: string;
  jurisdiction: {
    level: 'international' | 'national' | 'state' | 'city';
    country: string; // ISO country code
    countryName: string;
    state?: string;
    cityId?: string;
    cityName?: string;
    scope: {
      appliesToCountry: boolean;
      appliesToState: boolean;
      appliesToCities: string[];
      appliesToProjectTypes: string[];
    };
  };
  hierarchy: {
    parentRegulation?: string;
    supersededBy?: string;
    relatedRegulations: string[];
    derivedFrom?: string;
  };
  effectiveDate: Timestamp;
  expirationDate?: Timestamp;
  version: string;
  description: string;
  requirements: Array<{
    requirement: string;
    mandatory: boolean;
    applicableTo: string[];
    exceptions: string[];
    technicalSpec: string;
  }>;
  compliance: {
    mandatory: boolean;
    penalties: {
      fines: string;
      criminal: boolean;
      projectStoppage: boolean;
    };
    requiredCertifications: string[];
    inspectionRequired: boolean;
    complianceCost: {
      estimated: number;
      currency: string;
      perProjectType: Record<string, number>;
    };
    documentationRequired: string[];
  };
  enforcement: {
    enforcingAuthority: string;
    inspectionFrequency: string;
    complianceRate: number;
    violationCount: number;
  };
  impact: {
    level: 'high' | 'medium' | 'low';
    affectedProjects: string[];
    economicImpact: string;
    timelineImpact: string;
    designImpact: string;
  };
  newsArticles: string[];
}

// ProjectData Collection - Comprehensive Project Data
export interface ProjectData extends BaseDocument {
  projectId: string; // Reference to Tier 1
  vision: {
    designPhilosophy: string;
    inspirations: string[];
    conceptualApproach: string;
    architecturalIntent: string;
  };
  team: {
    leadArchitect: string;
    designTeam: string[];
    engineers: string[];
    consultants: string[];
    contractors: {
      general: string;
      specialty: string[];
    };
  };
  performance: {
    schedulePerformance: {
      plannedDuration: number;
      actualDuration: number;
      delays: string[];
    };
    budgetPerformance: {
      plannedBudget: number;
      actualCost: number;
      overruns: string[];
    };
    qualityMetrics: {
      clientRating: number;
      industryRating: number;
      awards: string[];
    };
    clientSatisfaction: {
      rating: number;
      feedback: string;
      repeatClient: boolean;
    };
  };
  technical: {
    structure: {
      type: string;
      materials: string[];
      innovations: string[];
    };
    systems: {
      hvac: string;
      electrical: string;
      plumbing: string;
      smart: string[];
    };
    materials: string[];
    innovations: string[];
  };
  compliance: {
    regulations: string[];
    permits: Array<{
      type: string;
      status: string;
      date: Timestamp;
    }>;
    certifications: string[];
    inspections: Array<{
      type: string;
      date: Timestamp;
      result: string;
    }>;
  };
  legacy: {
    awards: Array<{
      name: string;
      year: number;
      organization: string;
    }>;
    influence: {
      designTrends: string[];
      industryImpact: string;
    };
    culturalSignificance: {
      landmark: boolean;
      heritage: boolean;
      tourism: boolean;
    };
    marketImpact: {
      propertyValues: number;
      neighborhoodDevelopment: string;
    };
  };
}

// CompanyStructure Collection
export interface CompanyStructure extends BaseDocument {
  officeId: string;
  structure: {
    organizationType: 'partnership' | 'corporation' | 'llc' | 'sole-proprietorship';
    departments: Array<{
      name: string;
      headCount: number;
      responsibilities: string[];
    }>;
    hierarchy: {
      levels: number;
      reportingStructure: string;
    };
  };
  leadership: Array<{
    name: string;
    role: string;
    tenure: number;
  }>;
  divisions: Array<{
    name: string;
    focus: string;
    headCount: number;
  }>;
  governance: {
    ownership: string;
    boardMembers: Array<{
      name: string;
      role: string;
    }>;
  };
}

// DivisionPercentages Collection
export interface DivisionPercentages extends BaseDocument {
  officeId: string;
  divisionType: 'revenue' | 'workforce' | 'projects' | 'regions';
  breakdown: Record<string, number>; // category -> percentage
  period: {
    year: number;
    quarter?: number;
    type: 'annual' | 'quarterly';
  };
  methodology: string;
}

// NewsArticles Collection
export interface NewsArticle extends BaseDocument {
  title: string;
  url: string;
  publishedDate: Timestamp;
  source: {
    outletName: string;
    author: string;
    credibility: number; // 1-10 rating
    type: 'news' | 'trade-publication' | 'blog' | 'press-release';
  };
  content: string;
  excerpt: string;
  category: 'M&A' | 'project-announcement' | 'award' | 'scandal' | 'technology' | 'sustainability' | 'other';
  entities: {
    offices: string[]; // Office IDs (CCccNNN format)
    projects: string[]; // Project IDs
    people: string[]; // Key personnel mentioned
    cities: string[]; // Cities mentioned
  };
  topics: string[]; // consolidation, technology, sustainability, etc.
  sentiment: 'positive' | 'neutral' | 'negative';
  impact: {
    level: 'high' | 'medium' | 'low';
    affectedEntities: string[];
    marketReaction: string;
  };
  tags: string[];
}

// PoliticalContext Collection
export interface PoliticalContext extends BaseDocument {
  jurisdiction: {
    level: 'national' | 'state' | 'city';
    country: string;
    state?: string;
    cityId?: string;
  };
  governance: {
    governmentType: string;
    stability: 'stable' | 'moderate' | 'unstable';
    corruptionIndex: number;
    transparency: number;
  };
  institutions: {
    regulatoryBodies: string[];
    enforcementAgencies: string[];
    planningAuthorities: string[];
  };
  policies: Array<{
    name: string;
    type: string;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  }>;
  elections: Array<{
    date: Timestamp;
    type: string;
    outcome: string;
    impact: string;
  }>;
  stability: {
    level: 'high' | 'medium' | 'low';
    risks: string[];
    opportunities: string[];
  };
}

// External Forces Data (7 collections)

// ExternalMacroeconomic Collection
export interface ExternalMacroeconomic extends BaseDocument {
  jurisdiction: {
    level: 'global' | 'national' | 'regional';
    country?: string;
    region?: string;
  };
  period: {
    year: number;
    quarter?: number;
    type: 'annual' | 'quarterly' | 'monthly';
  };
  gdp: {
    value: number;
    growth: number;
    perCapita: number;
  };
  inflation: {
    rate: number;
    trend: 'rising' | 'stable' | 'falling';
  };
  interestRates: {
    centralBank: number;
    commercial: number;
    mortgage: number;
  };
  employment: {
    rate: number;
    construction: number;
    architecture: number;
  };
  construction: {
    volume: number;
    growth: number;
    investment: number;
  };
  realEstate: {
    prices: number;
    growth: number;
    transactions: number;
  };
}

// ExternalTechnology Collection
export interface ExternalTechnology extends BaseDocument {
  technologyName: string;
  category: 'AI' | 'BIM' | 'sustainability' | 'materials' | 'construction' | 'design';
  maturity: 'emerging' | 'developing' | 'mature' | 'declining';
  adoption: {
    level: number; // 0-100%
    trend: 'rising' | 'stable' | 'falling';
    barriers: string[];
    drivers: string[];
  };
  impact: {
    architecture: 'high' | 'medium' | 'low';
    construction: 'high' | 'medium' | 'low';
    market: 'high' | 'medium' | 'low';
  };
  timeline: {
    firstAdoption: Timestamp;
    peakAdoption?: Timestamp;
    expectedMaturity: Timestamp;
  };
  cost: {
    implementation: number;
    maintenance: number;
    roi: number;
  };
  regulations: string[]; // Related regulation IDs
  newsArticles: string[]; // Related news IDs
}

// ExternalSupplyChain Collection
export interface ExternalSupplyChain extends BaseDocument {
  materialType: string;
  category: 'raw-materials' | 'processed' | 'equipment' | 'services';
  globalMarket: {
    size: number;
    growth: number;
    majorProducers: string[];
  };
  pricing: {
    current: number;
    trend: 'rising' | 'stable' | 'falling';
    volatility: number;
    currency: string;
  };
  availability: {
    level: 'abundant' | 'adequate' | 'scarce' | 'critical';
    bottlenecks: string[];
    alternatives: string[];
  };
  sustainability: {
    environmentalImpact: 'high' | 'medium' | 'low';
    carbonFootprint: number;
    recyclability: number;
  };
  disruptions: Array<{
    type: string;
    impact: 'high' | 'medium' | 'low';
    duration: number;
    affectedRegions: string[];
  }>;
  regulations: string[]; // Related regulation IDs
}

// ExternalDemographics Collection
export interface ExternalDemographics extends BaseDocument {
  jurisdiction: {
    level: 'global' | 'national' | 'regional' | 'city';
    country?: string;
    region?: string;
    cityId?: string;
  };
  period: {
    year: number;
    type: 'annual' | 'decadal';
  };
  population: {
    total: number;
    growth: number;
    density: number;
  };
  ageDistribution: Record<string, number>;
  urbanization: {
    rate: number;
    trend: 'rising' | 'stable' | 'falling';
    megacities: number;
  };
  migration: {
    internal: number;
    international: number;
    net: number;
  };
  housing: {
    demand: number;
    supply: number;
    affordability: number;
  };
  workforce: {
    size: number;
    architecture: number;
    construction: number;
    skills: Record<string, number>;
  };
}

// ExternalClimate Collection
export interface ExternalClimate extends BaseDocument {
  jurisdiction: {
    level: 'global' | 'national' | 'regional';
    country?: string;
    region?: string;
  };
  period: {
    year: number;
    type: 'annual' | 'seasonal';
  };
  temperature: {
    average: number;
    trend: 'rising' | 'stable' | 'falling';
    extremes: {
      max: number;
      min: number;
    };
  };
  precipitation: {
    average: number;
    trend: 'rising' | 'stable' | 'falling';
    patterns: string[];
  };
  seaLevel: {
    current: number;
    rise: number;
    impact: string[];
  };
  extremeEvents: Array<{
    type: string;
    frequency: number;
    intensity: 'high' | 'medium' | 'low';
    impact: string[];
  }>;
  regulations: {
    carbon: string[];
    sustainability: string[];
    adaptation: string[];
  };
  risks: {
    flooding: 'high' | 'medium' | 'low';
    drought: 'high' | 'medium' | 'low';
    storms: 'high' | 'medium' | 'low';
    heat: 'high' | 'medium' | 'low';
  };
}

// ExternalPolicy Collection
export interface ExternalPolicy extends BaseDocument {
  jurisdiction: {
    level: 'international' | 'national' | 'state' | 'city';
    country: string;
    state?: string;
    cityId?: string;
  };
  policyType: 'tax' | 'trade' | 'environmental' | 'infrastructure' | 'housing' | 'economic';
  name: string;
  description: string;
  effectiveDate: Timestamp;
  expirationDate?: Timestamp;
  impact: {
    level: 'high' | 'medium' | 'low';
    sectors: string[];
    positive: string[];
    negative: string[];
  };
  incentives: Array<{
    type: string;
    value: number;
    conditions: string[];
  }>;
  penalties: Array<{
    type: string;
    value: number;
    conditions: string[];
  }>;
  compliance: {
    requirements: string[];
    reporting: string[];
    deadlines: Timestamp[];
  };
  relatedRegulations: string[];
}

// ExternalEvents Collection
export interface ExternalEvent extends BaseDocument {
  eventType: 'war' | 'pandemic' | 'natural-disaster' | 'economic-crisis' | 'political-upheaval' | 'technological-breakthrough';
  name: string;
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  severity: 'high' | 'medium' | 'low';
  affectedRegions: string[];
  impact: {
    economic: 'high' | 'medium' | 'low';
    social: 'high' | 'medium' | 'low';
    political: 'high' | 'medium' | 'low';
    environmental: 'high' | 'medium' | 'low';
  };
  consequences: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  recovery: {
    timeline: string;
    challenges: string[];
    opportunities: string[];
  };
  relatedNews: string[];
}

// ============================================================================
// TIER 4: MARKET INTELLIGENCE (5 collections)
// ============================================================================

// MarketIntelligence Collection
export interface MarketIntelligence extends BaseDocument {
  scope: {
    level: 'global' | 'national' | 'regional' | 'city';
    country?: string;
    region?: string;
    cityId?: string;
  };
  period: {
    year: number;
    quarter?: number;
    type: 'annual' | 'quarterly';
  };
  hhi: {
    value: number;
    trend: 'rising' | 'stable' | 'falling';
    interpretation: string;
  };
  gini: {
    value: number;
    trend: 'rising' | 'stable' | 'falling';
    interpretation: string;
  };
  concentration: {
    cr4: number; // Top 4 concentration %
    cr8: number; // Top 8 concentration %
    topFirms: Array<{
      officeId: string;
      marketShare: number;
    }>;
  };
  consolidation: {
    level: 'high' | 'medium' | 'low';
    trend: 'accelerating' | 'stable' | 'decelerating';
    recentMergers: number;
    expectedMergers: number;
  };
  barriers: {
    entry: 'high' | 'medium' | 'low';
    exit: 'high' | 'medium' | 'low';
    factors: string[];
  };
  competition: {
    intensity: 'high' | 'medium' | 'low';
    type: 'perfect' | 'monopolistic' | 'oligopolistic' | 'monopolistic';
    dynamics: string[];
  };
}

// Trends Collection
export interface Trend extends BaseDocument {
  trendName: string;
  category: 'technology' | 'sustainability' | 'design' | 'market' | 'regulatory' | 'social';
  description: string;
  stage: 'emerging' | 'growing' | 'mature' | 'declining';
  strength: number; // 1-10
  direction: 'positive' | 'neutral' | 'negative';
  timeline: {
    start: Timestamp;
    peak?: Timestamp;
    end?: Timestamp;
  };
  impact: {
    offices: string[];
    projects: string[];
    cities: string[];
    magnitude: 'high' | 'medium' | 'low';
  };
  drivers: string[];
  barriers: string[];
  indicators: Array<{
    metric: string;
    value: number;
    trend: 'rising' | 'stable' | 'falling';
  }>;
  relatedNews: string[];
  relatedTechnologies: string[];
}

// CompetitiveAnalysis Collection
export interface CompetitiveAnalysis extends BaseDocument {
  scope: {
    level: 'global' | 'national' | 'regional' | 'city';
    country?: string;
    region?: string;
    cityId?: string;
  };
  period: {
    year: number;
    quarter?: number;
  };
  marketPositioning: Array<{
    officeId: string;
    position: 'leader' | 'challenger' | 'follower' | 'niche';
    strengths: string[];
    weaknesses: string[];
    marketShare: number;
  }>;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitiveDynamics: {
    rivalry: 'high' | 'medium' | 'low';
    threats: {
      newEntrants: 'high' | 'medium' | 'low';
      substitutes: 'high' | 'medium' | 'low';
    };
    bargaining: {
      suppliers: 'high' | 'medium' | 'low';
      buyers: 'high' | 'medium' | 'low';
    };
  };
  strategies: Array<{
    officeId: string;
    strategy: string;
    focus: string[];
    differentiation: string[];
  }>;
  futureOutlook: {
    consolidation: 'likely' | 'possible' | 'unlikely';
    disruptions: string[];
    opportunities: string[];
  };
}

// FinancialMetrics Collection
export interface FinancialMetrics extends BaseDocument {
  scope: {
    level: 'global' | 'national' | 'regional' | 'city';
    country?: string;
    region?: string;
    cityId?: string;
  };
  period: {
    year: number;
    quarter?: number;
    type: 'annual' | 'quarterly';
  };
  marketSize: {
    total: number;
    growth: number;
    segments: Record<string, number>;
  };
  pricing: {
    average: number;
    range: {
      min: number;
      max: number;
    };
    trends: 'rising' | 'stable' | 'falling';
  };
  profitability: {
    average: number;
    topPerformers: number;
    bottomPerformers: number;
  };
  investment: {
    total: number;
    growth: number;
    sources: Record<string, number>;
  };
  performance: {
    revenue: number;
    growth: number;
    margins: number;
    roi: number;
  };
  benchmarks: Array<{
    metric: string;
    value: number;
    percentile: number;
  }>;
}

// ExternalForcesImpact Collection
export interface ExternalForcesImpact extends BaseDocument {
  scope: {
    level: 'global' | 'national' | 'regional' | 'city';
    country?: string;
    region?: string;
    cityId?: string;
  };
  period: {
    year: number;
    quarter?: number;
  };
  forces: Array<{
    type: 'macroeconomic' | 'technology' | 'supply-chain' | 'demographics' | 'climate' | 'policy' | 'events';
    name: string;
    impact: 'high' | 'medium' | 'low';
    direction: 'positive' | 'neutral' | 'negative';
    probability: number; // 0-100%
  }>;
  scenarios: Array<{
    name: string;
    probability: number;
    description: string;
    outcomes: string[];
    timeline: string;
  }>;
  risks: Array<{
    type: string;
    impact: 'high' | 'medium' | 'low';
    probability: number;
    mitigation: string[];
  }>;
  opportunities: Array<{
    type: string;
    potential: 'high' | 'medium' | 'low';
    probability: number;
    requirements: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    resources: string[];
  }>;
}

// ============================================================================
// COLLECTION NAMES AND TYPES MAPPING
// ============================================================================

export type CollectionName = 
  // Tier 1: Primary Entities
  | 'cities'
  | 'offices' 
  | 'projects'
  // Tier 2: Connective Tissue
  | 'relationships'
  | 'archHistory'
  | 'networkGraph'
  // Tier 3: Detailed Data - Enrichment
  | 'clients'
  | 'workforce'
  | 'technology'
  | 'financials'
  | 'supplyChain'
  | 'landData'
  | 'cityData'
  | 'regulations'
  | 'projectData'
  | 'companyStructure'
  | 'divisionPercentages'
  | 'newsArticles'
  | 'politicalContext'
  // Tier 3: Detailed Data - External Forces
  | 'externalMacroeconomic'
  | 'externalTechnology'
  | 'externalSupplyChain'
  | 'externalDemographics'
  | 'externalClimate'
  | 'externalPolicy'
  | 'externalEvents'
  // Tier 4: Market Intelligence
  | 'marketIntelligence'
  | 'trends'
  | 'competitiveAnalysis'
  | 'financialMetrics'
  | 'externalForcesImpact';

export type DocumentType = 
  | City
  | Office
  | Project
  | Relationship
  | ArchHistory
  | NetworkGraph
  | Client
  | Workforce
  | Technology
  | Financial
  | SupplyChain
  | LandData
  | CityData
  | Regulation
  | ProjectData
  | CompanyStructure
  | DivisionPercentages
  | NewsArticle
  | PoliticalContext
  | ExternalMacroeconomic
  | ExternalTechnology
  | ExternalSupplyChain
  | ExternalDemographics
  | ExternalClimate
  | ExternalPolicy
  | ExternalEvent
  | MarketIntelligence
  | Trend
  | CompetitiveAnalysis
  | FinancialMetrics
  | ExternalForcesImpact;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface CollectionConfig {
  name: CollectionName;
  type: 'active' | 'dormant';
  tier: 1 | 2 | 3 | 4;
  category?: 'enrichment' | 'external-forces' | 'market-intelligence';
}

export const COLLECTION_CONFIGS: Record<CollectionName, CollectionConfig> = {
  // Tier 1: Primary Entities
  cities: { name: 'cities', type: 'dormant', tier: 1 },
  offices: { name: 'offices', type: 'active', tier: 1 },
  projects: { name: 'projects', type: 'active', tier: 1 },
  
  // Tier 2: Connective Tissue
  relationships: { name: 'relationships', type: 'active', tier: 2 },
  archHistory: { name: 'archHistory', type: 'dormant', tier: 2 },
  networkGraph: { name: 'networkGraph', type: 'dormant', tier: 2 },
  
  // Tier 3: Detailed Data - Enrichment
  clients: { name: 'clients', type: 'dormant', tier: 3, category: 'enrichment' },
  workforce: { name: 'workforce', type: 'dormant', tier: 3, category: 'enrichment' },
  technology: { name: 'technology', type: 'dormant', tier: 3, category: 'enrichment' },
  financials: { name: 'financials', type: 'dormant', tier: 3, category: 'enrichment' },
  supplyChain: { name: 'supplyChain', type: 'dormant', tier: 3, category: 'enrichment' },
  landData: { name: 'landData', type: 'dormant', tier: 3, category: 'enrichment' },
  cityData: { name: 'cityData', type: 'dormant', tier: 3, category: 'enrichment' },
  regulations: { name: 'regulations', type: 'active', tier: 3, category: 'enrichment' },
  projectData: { name: 'projectData', type: 'dormant', tier: 3, category: 'enrichment' },
  companyStructure: { name: 'companyStructure', type: 'dormant', tier: 3, category: 'enrichment' },
  divisionPercentages: { name: 'divisionPercentages', type: 'dormant', tier: 3, category: 'enrichment' },
  newsArticles: { name: 'newsArticles', type: 'dormant', tier: 3, category: 'enrichment' },
  politicalContext: { name: 'politicalContext', type: 'dormant', tier: 3, category: 'enrichment' },
  
  // Tier 3: Detailed Data - External Forces
  externalMacroeconomic: { name: 'externalMacroeconomic', type: 'dormant', tier: 3, category: 'external-forces' },
  externalTechnology: { name: 'externalTechnology', type: 'dormant', tier: 3, category: 'external-forces' },
  externalSupplyChain: { name: 'externalSupplyChain', type: 'dormant', tier: 3, category: 'external-forces' },
  externalDemographics: { name: 'externalDemographics', type: 'dormant', tier: 3, category: 'external-forces' },
  externalClimate: { name: 'externalClimate', type: 'dormant', tier: 3, category: 'external-forces' },
  externalPolicy: { name: 'externalPolicy', type: 'dormant', tier: 3, category: 'external-forces' },
  externalEvents: { name: 'externalEvents', type: 'dormant', tier: 3, category: 'external-forces' },
  
  // Tier 4: Market Intelligence
  marketIntelligence: { name: 'marketIntelligence', type: 'dormant', tier: 4, category: 'market-intelligence' },
  trends: { name: 'trends', type: 'dormant', tier: 4, category: 'market-intelligence' },
  competitiveAnalysis: { name: 'competitiveAnalysis', type: 'dormant', tier: 4, category: 'market-intelligence' },
  financialMetrics: { name: 'financialMetrics', type: 'dormant', tier: 4, category: 'market-intelligence' },
  externalForcesImpact: { name: 'externalForcesImpact', type: 'dormant', tier: 4, category: 'market-intelligence' },
};

// ============================================================================
// ACTIVE COLLECTIONS (for Phase 2 implementation)
// ============================================================================

export const ACTIVE_COLLECTIONS: CollectionName[] = [
  'offices',
  'projects', 
  'regulations',
  'relationships'
];

export const DORMANT_COLLECTIONS: CollectionName[] = Object.keys(COLLECTION_CONFIGS)
  .filter(name => !ACTIVE_COLLECTIONS.includes(name as CollectionName)) as CollectionName[];
