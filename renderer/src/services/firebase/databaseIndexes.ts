// Database Indexes Configuration - Optimized indexes for all collections

import { 
  CollectionName, 
  ACTIVE_COLLECTIONS,
  DORMANT_COLLECTIONS
} from '../../types/firestore';

// ============================================================================
// INDEX TYPES
// ============================================================================

export interface FirestoreIndex {
  collectionGroup: string;
  queryScope: 'COLLECTION' | 'COLLECTION_GROUP';
  fields: Array<{
    fieldPath: string;
    order: 'ASCENDING' | 'DESCENDING';
    arrayConfig?: 'CONTAINS';
  }>;
}

export interface CompositeIndex extends FirestoreIndex {
  name: string;
  description: string;
  queryPatterns: string[];
  performanceImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  storageCost: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SingleFieldIndex {
  collectionGroup: string;
  fieldPath: string;
  order: 'ASCENDING' | 'DESCENDING';
  arrayConfig?: 'CONTAINS';
  description: string;
  queryPatterns: string[];
}

export interface IndexConfiguration {
  indexes: CompositeIndex[];
  singleFieldIndexes: SingleFieldIndex[];
  collectionGroups: string[];
  totalIndexes: number;
  estimatedStorage: string;
  performanceOptimization: string[];
}

// ============================================================================
// TIER 1: PRIMARY ENTITIES INDEXES
// ============================================================================

// Cities Collection Indexes
const citiesIndexes: CompositeIndex[] = [
  {
    name: 'cities-country-region',
    collectionGroup: 'cities',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'country', order: 'ASCENDING' },
      { fieldPath: 'region', order: 'ASCENDING' },
      { fieldPath: 'cityName', order: 'ASCENDING' }
    ],
    description: 'Query cities by country and region',
    queryPatterns: [
      'where("country", "==", "GB").where("region", "==", "England")',
      'where("country", "==", "US").where("region", "==", "California")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'cities-market-profile',
    collectionGroup: 'cities',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'marketProfile.stage', order: 'ASCENDING' },
      { fieldPath: 'marketProfile.marketSize', order: 'DESCENDING' },
      { fieldPath: 'cityName', order: 'ASCENDING' }
    ],
    description: 'Query cities by market stage and size',
    queryPatterns: [
      'where("marketProfile.stage", "==", "mature").orderBy("marketProfile.marketSize", "desc")',
      'where("marketProfile.stage", "==", "emerging").orderBy("marketProfile.marketSize", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'cities-consolidation',
    collectionGroup: 'cities',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'consolidation.hhiIndex', order: 'ASCENDING' },
      { fieldPath: 'consolidation.cr4', order: 'ASCENDING' },
      { fieldPath: 'cityName', order: 'ASCENDING' }
    ],
    description: 'Query cities by consolidation metrics',
    queryPatterns: [
      'where("consolidation.hhiIndex", ">=", 1500).orderBy("consolidation.cr4", "desc")',
      'where("consolidation.hhiIndex", "<=", 1000).orderBy("consolidation.cr4", "asc")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'LOW'
  }
];

// Offices Collection Indexes
const officesIndexes: CompositeIndex[] = [
  {
    name: 'offices-location-status',
    collectionGroup: 'offices',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'location.headquarters.country', order: 'ASCENDING' },
      { fieldPath: 'location.headquarters.city', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query offices by location and status',
    queryPatterns: [
      'where("location.headquarters.country", "==", "GB").where("location.headquarters.city", "==", "London").where("status", "==", "active")',
      'where("location.headquarters.country", "==", "US").where("status", "==", "active")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'offices-size-category',
    collectionGroup: 'offices',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'size.sizeCategory', order: 'ASCENDING' },
      { fieldPath: 'size.employeeCount', order: 'DESCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query offices by size category and employee count',
    queryPatterns: [
      'where("size.sizeCategory", "==", "large").orderBy("size.employeeCount", "desc")',
      'where("size.sizeCategory", "==", "boutique").orderBy("size.employeeCount", "asc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'offices-founded-status',
    collectionGroup: 'offices',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'founded', order: 'DESCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query offices by founding year and status',
    queryPatterns: [
      'where("founded", ">=", 2000).where("status", "==", "active").orderBy("founded", "desc")',
      'where("founded", "<=", 1990).where("status", "==", "active").orderBy("founded", "asc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'offices-specializations',
    collectionGroup: 'offices',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'specializations', order: 'ASCENDING', arrayConfig: 'CONTAINS' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query offices by specializations',
    queryPatterns: [
      'where("specializations", "array-contains", "commercial").where("status", "==", "active")',
      'where("specializations", "array-contains-any", ["residential", "cultural"])'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'offices-revenue-size',
    collectionGroup: 'offices',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'size.annualRevenue', order: 'DESCENDING' },
      { fieldPath: 'size.sizeCategory', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query offices by revenue and size category',
    queryPatterns: [
      'where("size.annualRevenue", ">=", 10000000).orderBy("size.sizeCategory", "asc")',
      'where("size.annualRevenue", "<=", 1000000).orderBy("size.sizeCategory", "asc")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'MEDIUM'
  }
];

// Projects Collection Indexes
const projectsIndexes: CompositeIndex[] = [
  {
    name: 'projects-office-name',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'officeId', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by office ordered by name',
    queryPatterns: [
      'where("officeId", "==", "GBLO482").orderBy("projectName", "asc")',
      'where("officeId", "==", "USNE567").orderBy("projectName", "asc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'projects-office-status',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'officeId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by office and status',
    queryPatterns: [
      'where("officeId", "==", "GBLO482").where("status", "==", "construction")',
      'where("officeId", "==", "USNE567").where("status", "==", "completed")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'projects-city-status',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'cityId', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by city and status',
    queryPatterns: [
      'where("cityId", "==", "london-uk").where("status", "==", "construction")',
      'where("cityId", "==", "new-york-usa").where("status", "==", "completed")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'projects-timeline-status',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'timeline.startDate', order: 'DESCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by timeline and status',
    queryPatterns: [
      'where("timeline.startDate", ">=", "2023-01-01").where("status", "==", "construction")',
      'where("timeline.startDate", "<=", "2022-12-31").where("status", "==", "completed")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'projects-budget-status',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'financial.budget', order: 'DESCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by budget and status',
    queryPatterns: [
      'where("financial.budget", ">=", 10000000).where("status", "==", "construction")',
      'where("financial.budget", "<=", 1000000).where("status", "==", "completed")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'MEDIUM'
  },
  {
    name: 'projects-client-office',
    collectionGroup: 'projects',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'clientId', order: 'ASCENDING' },
      { fieldPath: 'officeId', order: 'ASCENDING' },
      { fieldPath: 'projectName', order: 'ASCENDING' }
    ],
    description: 'Query projects by client and office',
    queryPatterns: [
      'where("clientId", "==", "client-001").where("officeId", "==", "GBLO482")',
      'where("clientId", "==", "client-002").orderBy("officeId", "asc")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'MEDIUM'
  }
];

// ============================================================================
// TIER 2: CONNECTIVE TISSUE INDEXES
// ============================================================================

// Relationships Collection Indexes
const relationshipsIndexes: CompositeIndex[] = [
  {
    name: 'relationships-source-entity',
    collectionGroup: 'relationships',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'sourceEntity.type', order: 'ASCENDING' },
      { fieldPath: 'sourceEntity.id', order: 'ASCENDING' },
      { fieldPath: 'relationshipType', order: 'ASCENDING' }
    ],
    description: 'Query relationships by source entity',
    queryPatterns: [
      'where("sourceEntity.type", "==", "office").where("sourceEntity.id", "==", "GBLO482")',
      'where("sourceEntity.type", "==", "project").where("sourceEntity.id", "==", "project-001")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'relationships-target-entity',
    collectionGroup: 'relationships',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'targetEntity.type', order: 'ASCENDING' },
      { fieldPath: 'targetEntity.id', order: 'ASCENDING' },
      { fieldPath: 'relationshipType', order: 'ASCENDING' }
    ],
    description: 'Query relationships by target entity',
    queryPatterns: [
      'where("targetEntity.type", "==", "office").where("targetEntity.id", "==", "USNE567")',
      'where("targetEntity.type", "==", "client").where("targetEntity.id", "==", "client-001")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'relationships-type-strength',
    collectionGroup: 'relationships',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'relationshipType', order: 'ASCENDING' },
      { fieldPath: 'strength', order: 'DESCENDING' },
      { fieldPath: 'startDate', order: 'DESCENDING' }
    ],
    description: 'Query relationships by type and strength',
    queryPatterns: [
      'where("relationshipType", "==", "collaborator").orderBy("strength", "desc")',
      'where("relationshipType", "==", "competitor").orderBy("strength", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'relationships-sentiment-strength',
    collectionGroup: 'relationships',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'sentiment', order: 'ASCENDING' },
      { fieldPath: 'strength', order: 'DESCENDING' },
      { fieldPath: 'startDate', order: 'DESCENDING' }
    ],
    description: 'Query relationships by sentiment and strength',
    queryPatterns: [
      'where("sentiment", "==", "positive").orderBy("strength", "desc")',
      'where("sentiment", "==", "negative").orderBy("strength", "desc")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'MEDIUM'
  },
  {
    name: 'relationships-tags',
    collectionGroup: 'relationships',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'tags', order: 'ASCENDING', arrayConfig: 'CONTAINS' },
      { fieldPath: 'relationshipType', order: 'ASCENDING' },
      { fieldPath: 'startDate', order: 'DESCENDING' }
    ],
    description: 'Query relationships by tags',
    queryPatterns: [
      'where("tags", "array-contains", "sustainability").where("relationshipType", "==", "collaborator")',
      'where("tags", "array-contains-any", ["technology", "innovation"])'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'HIGH'
  }
];

// Arch History Collection Indexes
const archHistoryIndexes: CompositeIndex[] = [
  {
    name: 'arch-history-event-type',
    collectionGroup: 'archHistory',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'eventType', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'DESCENDING' },
      { fieldPath: 'title', order: 'ASCENDING' }
    ],
    description: 'Query historical events by type and date',
    queryPatterns: [
      'where("eventType", "==", "merger").orderBy("date", "desc")',
      'where("eventType", "==", "acquisition").orderBy("date", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'arch-history-entities',
    collectionGroup: 'archHistory',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'entities.primary.type', order: 'ASCENDING' },
      { fieldPath: 'entities.primary.id', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'DESCENDING' }
    ],
    description: 'Query historical events by primary entity',
    queryPatterns: [
      'where("entities.primary.type", "==", "office").where("entities.primary.id", "==", "GBLO482")',
      'where("entities.primary.type", "==", "project").where("entities.primary.id", "==", "project-001")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  }
];

// Network Graph Collection Indexes
const networkGraphIndexes: CompositeIndex[] = [
  {
    name: 'network-graph-node-type',
    collectionGroup: 'networkGraph',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'nodeType', order: 'ASCENDING' },
      { fieldPath: 'connections.totalConnections', order: 'DESCENDING' },
      { fieldPath: 'entityId', order: 'ASCENDING' }
    ],
    description: 'Query network nodes by type and connection count',
    queryPatterns: [
      'where("nodeType", "==", "office").orderBy("connections.totalConnections", "desc")',
      'where("nodeType", "==", "project").orderBy("connections.totalConnections", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'network-graph-centrality',
    collectionGroup: 'networkGraph',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'centrality.influence', order: 'DESCENDING' },
      { fieldPath: 'centrality.degree', order: 'DESCENDING' },
      { fieldPath: 'entityId', order: 'ASCENDING' }
    ],
    description: 'Query network nodes by centrality metrics',
    queryPatterns: [
      'orderBy("centrality.influence", "desc").orderBy("centrality.degree", "desc")',
      'where("centrality.influence", ">=", 0.8).orderBy("centrality.degree", "desc")'
    ],
    performanceImpact: 'MEDIUM',
    storageCost: 'MEDIUM'
  }
];

// ============================================================================
// TIER 3: DETAILED DATA INDEXES
// ============================================================================

// Regulations Collection Indexes
const regulationsIndexes: CompositeIndex[] = [
  {
    name: 'regulations-jurisdiction-type',
    collectionGroup: 'regulations',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'jurisdiction.country', order: 'ASCENDING' },
      { fieldPath: 'regulationType', order: 'ASCENDING' },
      { fieldPath: 'effectiveDate', order: 'DESCENDING' }
    ],
    description: 'Query regulations by jurisdiction and type',
    queryPatterns: [
      'where("jurisdiction.country", "==", "GB").where("regulationType", "==", "building-code")',
      'where("jurisdiction.country", "==", "US").where("regulationType", "==", "zoning")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  },
  {
    name: 'regulations-mandatory-impact',
    collectionGroup: 'regulations',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'compliance.mandatory', order: 'ASCENDING' },
      { fieldPath: 'impact.level', order: 'ASCENDING' },
      { fieldPath: 'effectiveDate', order: 'DESCENDING' }
    ],
    description: 'Query regulations by mandatory status and impact',
    queryPatterns: [
      'where("compliance.mandatory", "==", true).where("impact.level", "==", "high")',
      'where("compliance.mandatory", "==", false).where("impact.level", "==", "medium")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  },
  {
    name: 'regulations-effective-date',
    collectionGroup: 'regulations',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'effectiveDate', order: 'DESCENDING' },
      { fieldPath: 'regulationType', order: 'ASCENDING' },
      { fieldPath: 'name', order: 'ASCENDING' }
    ],
    description: 'Query regulations by effective date',
    queryPatterns: [
      'where("effectiveDate", ">=", "2023-01-01").orderBy("regulationType", "asc")',
      'where("effectiveDate", "<=", "2022-12-31").orderBy("regulationType", "asc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'MEDIUM'
  }
];

// Records Collection Indexes
const recordsIndexes: CompositeIndex[] = [
  {
    name: 'records-office-created',
    collectionGroup: 'records',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'officeId', order: 'ASCENDING' },
      { fieldPath: 'createdAt', order: 'DESCENDING' }
    ],
    description: 'Query records by office ordered by creation date',
    queryPatterns: [
      'where("officeId", "==", "GBLO482").orderBy("createdAt", "desc")',
      'where("officeId", "==", "USNE567").orderBy("createdAt", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  }
];

// Financials Collection Indexes
const financialsIndexes: CompositeIndex[] = [
  {
    name: 'financials-office-date',
    collectionGroup: 'financials',
    queryScope: 'COLLECTION',
    fields: [
      { fieldPath: 'officeId', order: 'ASCENDING' },
      { fieldPath: 'date', order: 'DESCENDING' }
    ],
    description: 'Query financials by office ordered by date',
    queryPatterns: [
      'where("officeId", "==", "GBLO482").orderBy("date", "desc")',
      'where("officeId", "==", "USNE567").orderBy("date", "desc")'
    ],
    performanceImpact: 'HIGH',
    storageCost: 'HIGH'
  }
];

// ============================================================================
// SINGLE FIELD INDEXES
// ============================================================================

const singleFieldIndexes: SingleFieldIndex[] = [
  // Cities
  {
    collectionGroup: 'cities',
    fieldPath: 'country',
    order: 'ASCENDING',
    description: 'Single field index for country queries',
    queryPatterns: ['where("country", "==", "GB")', 'where("country", "==", "US")']
  },
  {
    collectionGroup: 'cities',
    fieldPath: 'marketProfile.marketSize',
    order: 'DESCENDING',
    description: 'Single field index for market size queries',
    queryPatterns: ['orderBy("marketProfile.marketSize", "desc")']
  },

  // Offices
  {
    collectionGroup: 'offices',
    fieldPath: 'status',
    order: 'ASCENDING',
    description: 'Single field index for office status queries',
    queryPatterns: ['where("status", "==", "active")', 'where("status", "==", "acquired")']
  },
  {
    collectionGroup: 'offices',
    fieldPath: 'founded',
    order: 'DESCENDING',
    description: 'Single field index for founding year queries',
    queryPatterns: ['orderBy("founded", "desc")']
  },
  {
    collectionGroup: 'offices',
    fieldPath: 'size.employeeCount',
    order: 'DESCENDING',
    description: 'Single field index for employee count queries',
    queryPatterns: ['orderBy("size.employeeCount", "desc")']
  },
  {
    collectionGroup: 'offices',
    fieldPath: 'size.annualRevenue',
    order: 'DESCENDING',
    description: 'Single field index for annual revenue queries',
    queryPatterns: ['orderBy("size.annualRevenue", "desc")']
  },

  // Projects
  {
    collectionGroup: 'projects',
    fieldPath: 'status',
    order: 'ASCENDING',
    description: 'Single field index for project status queries',
    queryPatterns: ['where("status", "==", "construction")', 'where("status", "==", "completed")']
  },
  {
    collectionGroup: 'projects',
    fieldPath: 'timeline.startDate',
    order: 'DESCENDING',
    description: 'Single field index for project start date queries',
    queryPatterns: ['orderBy("timeline.startDate", "desc")']
  },
  {
    collectionGroup: 'projects',
    fieldPath: 'financial.budget',
    order: 'DESCENDING',
    description: 'Single field index for project budget queries',
    queryPatterns: ['orderBy("financial.budget", "desc")']
  },

  // Relationships
  {
    collectionGroup: 'relationships',
    fieldPath: 'relationshipType',
    order: 'ASCENDING',
    description: 'Single field index for relationship type queries',
    queryPatterns: ['where("relationshipType", "==", "collaborator")', 'where("relationshipType", "==", "competitor")']
  },
  {
    collectionGroup: 'relationships',
    fieldPath: 'strength',
    order: 'DESCENDING',
    description: 'Single field index for relationship strength queries',
    queryPatterns: ['orderBy("strength", "desc")']
  },
  {
    collectionGroup: 'relationships',
    fieldPath: 'sentiment',
    order: 'ASCENDING',
    description: 'Single field index for relationship sentiment queries',
    queryPatterns: ['where("sentiment", "==", "positive")', 'where("sentiment", "==", "negative")']
  },

  // Regulations
  {
    collectionGroup: 'regulations',
    fieldPath: 'regulationType',
    order: 'ASCENDING',
    description: 'Single field index for regulation type queries',
    queryPatterns: ['where("regulationType", "==", "building-code")', 'where("regulationType", "==", "zoning")']
  },
  {
    collectionGroup: 'regulations',
    fieldPath: 'effectiveDate',
    order: 'DESCENDING',
    description: 'Single field index for regulation effective date queries',
    queryPatterns: ['orderBy("effectiveDate", "desc")']
  }
];

// ============================================================================
// COMPLETE INDEX CONFIGURATION
// ============================================================================

export const databaseIndexes: IndexConfiguration = {
  indexes: [
    ...citiesIndexes,
    ...officesIndexes,
    ...projectsIndexes,
    ...relationshipsIndexes,
    ...archHistoryIndexes,
    ...networkGraphIndexes,
    ...regulationsIndexes,
    ...recordsIndexes,
    ...financialsIndexes
  ],
  singleFieldIndexes,
  collectionGroups: [
    'cities',
    'offices',
    'projects',
    'relationships',
    'archHistory',
    'networkGraph',
    'regulations',
    'records'
  ],
  totalIndexes: citiesIndexes.length + officesIndexes.length + projectsIndexes.length + 
                relationshipsIndexes.length + archHistoryIndexes.length + 
                networkGraphIndexes.length + regulationsIndexes.length + recordsIndexes.length + singleFieldIndexes.length,
  estimatedStorage: '~500MB - 2GB (depending on data volume)',
  performanceOptimization: [
    'Composite indexes for complex queries',
    'Single field indexes for simple queries',
    'Array indexes for array-contains operations',
    'Optimized field ordering for query performance',
    'Strategic index placement for common query patterns'
  ]
};

// ============================================================================
// INDEX UTILITY FUNCTIONS
// ============================================================================

export function getIndexesForCollection(collectionName: CollectionName): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => index.collectionGroup === collectionName);
}

export function getSingleFieldIndexesForCollection(collectionName: CollectionName): SingleFieldIndex[] {
  return databaseIndexes.singleFieldIndexes.filter(index => index.collectionGroup === collectionName);
}

export function getHighImpactIndexes(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => index.performanceImpact === 'HIGH');
}

export function getMediumImpactIndexes(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => index.performanceImpact === 'MEDIUM');
}

export function getLowImpactIndexes(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => index.performanceImpact === 'LOW');
}

export function getHighStorageCostIndexes(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => index.storageCost === 'HIGH');
}

export function getIndexesByQueryPattern(pattern: string): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => 
    index.queryPatterns.some(queryPattern => queryPattern.includes(pattern))
  );
}

export function getIndexesForActiveCollections(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => 
    ACTIVE_COLLECTIONS.includes(index.collectionGroup as CollectionName)
  );
}

export function getIndexesForDormantCollections(): CompositeIndex[] {
  return databaseIndexes.indexes.filter(index => 
    DORMANT_COLLECTIONS.includes(index.collectionGroup as CollectionName)
  );
}

export function generateFirestoreIndexesFile(): string {
  const indexes = databaseIndexes.indexes.map(index => ({
    collectionGroup: index.collectionGroup,
    queryScope: index.queryScope,
    fields: index.fields
  }));

  return JSON.stringify({ indexes }, null, 2);
}

export function generateFirestoreIndexesYAML(): string {
  const yaml = databaseIndexes.indexes.map(index => {
    const fields = index.fields.map(field => ({
      fieldPath: field.fieldPath,
      order: field.order,
      ...(field.arrayConfig && { arrayConfig: field.arrayConfig })
    }));

    return {
      collectionGroup: index.collectionGroup,
      queryScope: index.queryScope,
      fields
    };
  });

  return `indexes:
${yaml.map(index => `  - collectionGroup: ${index.collectionGroup}
    queryScope: ${index.queryScope}
    fields:
${index.fields.map(field => `      - fieldPath: ${field.fieldPath}
        order: ${field.order}${field.arrayConfig ? `\n        arrayConfig: ${field.arrayConfig}` : ''}`).join('\n')}`).join('\n\n')}`;
}

// ============================================================================
// INDEX VALIDATION
// ============================================================================

export function validateIndexConfiguration(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate composite indexes
  databaseIndexes.indexes.forEach((index, i) => {
    if (!index.name) {
      errors.push(`Index ${i} missing name`);
    }
    if (!index.collectionGroup) {
      errors.push(`Index ${i} missing collectionGroup`);
    }
    if (!index.fields || index.fields.length === 0) {
      errors.push(`Index ${i} missing fields`);
    }
    if (index.fields && index.fields.length > 10) {
      warnings.push(`Index ${i} has more than 10 fields, consider splitting`);
    }
  });

  // Validate single field indexes
  databaseIndexes.singleFieldIndexes.forEach((index, i) => {
    if (!index.collectionGroup) {
      errors.push(`Single field index ${i} missing collectionGroup`);
    }
    if (!index.fieldPath) {
      errors.push(`Single field index ${i} missing fieldPath`);
    }
  });

  // Check for duplicate indexes
  const indexNames = databaseIndexes.indexes.map(index => index.name);
  const duplicateNames = indexNames.filter((name, index) => indexNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    errors.push(`Duplicate index names: ${duplicateNames.join(', ')}`);
  }

  // Check for missing collection groups
  const definedCollections = new Set(databaseIndexes.collectionGroups);
  const usedCollections = new Set([
    ...databaseIndexes.indexes.map(index => index.collectionGroup),
    ...databaseIndexes.singleFieldIndexes.map(index => index.collectionGroup)
  ]);
  
  usedCollections.forEach(collection => {
    if (!definedCollections.has(collection)) {
      warnings.push(`Collection ${collection} used in indexes but not defined in collectionGroups`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
