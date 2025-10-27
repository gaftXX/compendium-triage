# Firestore Database Plan - AI Orchestrator Architecture App

## Important: Flat Collection Structure

**All collections use a flat structure with indexed fields for filtering.**

This means:
- ✅ **No subcollections**: All documents are at the root level of their collection
- ✅ **Indexed fields**: Location, type, status, etc. are fields within documents for easy querying
- ✅ **Simple queries**: No need to traverse hierarchical paths or hardcode city/country lists
- ✅ **Scalable**: Works efficiently with Firestore's query engine

### Query Examples

```typescript
// Query projects in a specific city
query(collection(db, 'projects'), 
  where('location.country', '==', 'Spain'),
  where('location.city', '==', 'Barcelona')
);

// Query offices by specialization
query(collection(db, 'offices'),
  where('specializations', 'array-contains', 'sustainable-design')
);

// Query regulations by type and jurisdiction
query(collection(db, 'regulations'),
  where('regulationType', '==', 'building-code'),
  where('jurisdiction.country', '==', 'ES')
);

// Query regulations in a specific city
query(collection(db, 'regulations'),
  where('jurisdiction.cityName', '==', 'Barcelona')
);

// Query regulations by jurisdiction level
query(collection(db, 'regulations'),
  where('jurisdiction.level', '==', 'national')
);
```

See the [FLAT_STRUCTURE_BENEFITS.md](./FLAT_STRUCTURE_BENEFITS.md) file for more details on why this approach is better than hierarchical subcollections.

## Database Architecture Overview

### Design Principles
1. **Office-Centric Design**: Architecture offices are the primary entity
2. **Relationship-First**: Explicit tracking of connections between all entities
3. **Graph Database Pattern**: Enable network analysis and trend tracking
4. **Unique ID System**: Use CCccNNN format for office IDs (country + city + random number)
5. **Denormalize for Queries**: Store computed relationship data for fast lookups
6. **Enable Market Intelligence**: Structure supports consolidation tracking, trend analysis, competitive insights

### Why This Structure?

**Argument 1: Graph Pattern for Connections**
Architecture intelligence requires understanding networks: office→project→client, office→supplier→project, office→competitor relationships. A flat collection structure makes these queries expensive. By centering on core entities (offices, projects) with explicit relationship collections, we enable fast graph traversal.

**Argument 2: Market Consolidation Tracking**
To track market trends, we need aggregated views (market share, competitive landscape, economic trends). These are separate collections with computed data, updated when underlying entities change, enabling instant trend queries without expensive aggregations.

**Argument 3: Historical Intelligence**
Architecture history isn't just office history—it's how offices, projects, regulations, and market forces evolved together. Separate historical snapshots collection allows time-series analysis without cluttering current data.

---

## Office ID System: CCccNNN Format

**Format:** [CC][cc][NNN] = ISO country code + city code + random number  
**Examples:** GBLO482 (London, UK), USNE567 (NYC, USA), AEDU891 (Dubai, UAE), FRPA123 (Paris, France)  
**Purpose:** Offices are identified exclusively by this unique ID; office names are stored but not used for identification or relationships.

---

## 4-Tier Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│ TIER 1: PRIMARY ENTITIES (3 collections)                │
│ The big standalone entities with core info              │
├─────────────────────────────────────────────────────────┤
│ • cities (geographic markets)                           │
│ • offices (CCccNNN IDs)                                 │
│ • projects                                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ TIER 2: CONNECTIVE TISSUE (3 collections)               │
│ Links, context, and connections between entities        │
├─────────────────────────────────────────────────────────┤
│ • relationships (graph edges)                           │
│ • archHistory (temporal context, M&A)                   │
│ • networkGraph (connection metrics)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ TIER 3: DETAILED DATA (20 collections)                  │
│ Enrichment attributes + External Forces data            │
├─────────────────────────────────────────────────────────┤
│ ENRICHMENT (13):                                        │
│ • clients           • supplyChain    • companyStructure │
│ • workforce         • landData       • divisionPercent. │
│ • technology        • cityData       • newsArticles     │
│ • financials        • regulations    • projectData      │
│ • politicalContext  (NEW - governance & institutions)   │
│                                                         │
│ EXTERNAL FORCES (7):                                    │
│ • externalMacroeconomic  • externalTechnology           │
│ • externalSupplyChain    • externalDemographics         │
│ • externalClimate        • externalPolicy               │
│ • externalEvents                                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ TIER 4: MARKET INTELLIGENCE (5 collections)             │
│ Market-specific computed consolidation analytics        │
├─────────────────────────────────────────────────────────┤
│ • marketIntelligence (HHI, Gini, consolidation)         │
│ • trends (market dynamics)                              │
│ • competitiveAnalysis (SWOT, positioning)               │
│ • financialMetrics (KPIs, performance)                  │
│ • externalForcesImpact (impact analysis & scenarios)    │
└─────────────────────────────────────────────────────────┘
```

**Total: 31 Collections** (3 + 3 + 20 + 5)

---

## Regulation Hierarchy Examples

Regulations follow a hierarchical structure: **International → National → State → City**

### Example 1: UK Building Code Hierarchy

```typescript
// NATIONAL LEVEL
{
  id: 'uk-building-regs-2023',
  regulationType: 'building-code',
  name: 'UK Building Regulations 2023',
  jurisdiction: {
    level: 'national',
    country: 'GB',
    countryName: 'United Kingdom',
    scope: {
      appliesToCountry: true,
      appliesToCities: [], // ALL UK cities
      appliesToProjectTypes: ['residential', 'commercial', 'institutional']
    }
  },
  hierarchy: {
    derivedFrom: 'eu-building-directive-2010'
  }
}

// CITY LEVEL (extends national)
{
  id: 'london-height-restriction-2020',
  regulationType: 'zoning',
  name: 'London Protected Views Height Restriction',
  jurisdiction: {
    level: 'city',
    country: 'GB',
    cityId: 'london-uk',
    scope: {
      appliesToCities: ['london-uk'],
      appliesToProjectTypes: ['commercial', 'residential']
    }
  },
  hierarchy: {
    parentRegulation: 'uk-building-regs-2023' // Extends national code
  }
}
```

### Example 2: US Building Code Hierarchy

```typescript
// NATIONAL → STATE → CITY
'us-ibc-2021' (International Building Code)
    ↓ extends
'california-building-code-2022' (State adopts IBC with amendments)
    ↓ extends
'san-francisco-seismic-2023' (City adds seismic requirements)
```

### Query Pattern: Get ALL regulations for a project

```typescript
// For a commercial project in London:
// 1. UK National building codes
// 2. London city-specific codes
// Both apply simultaneously

const applicable = await getAllApplicableRegulations('london-uk', 'commercial');
// Returns: International + National (GB) + City (London) regulations
```

---

## Market Consolidation Tracking Data

### Critical Data Points for Consolidation Analysis:

**1. Merger & Acquisition Events**
- Acquisition dates, acquiring firm, acquired firm, deal value
- Post-merger integration status, retained vs. laid-off employees
- Brand retention (kept separate vs. absorbed)

**2. Market Share Shifts**
- Revenue concentration (top 10 firms % of total market)
- Project count concentration (# of projects by firm size)
- Geographic monopolies (single firm dominating a city/region)
- Sector dominance (firm controlling >30% of a specific field)

**3. Pricing Power Indicators**
- Fee premium changes (top firms vs. market average)
- Bidding competition reduction (fewer firms per RFP)
- Client switching costs (how often clients change firms)

**4. Barrier to Entry Signals**
- New firm formation rate (declining = consolidating market)
- Small firm survival rate (closures vs. growth)
- Capital requirements escalation (tech, talent costs rising)

**5. Network Centralization**
- Concentration of client relationships (few firms, many clients)
- Supplier exclusivity deals (major firms locking suppliers)
- Talent poaching patterns (large firms absorbing boutique talent)

**6. Strategic Behavior**
- Joint ventures and partnerships (cooperation vs. competition)
- Non-compete agreements prevalence
- Cross-market expansion (firms entering new geographies/sectors)

**7. Time-Series Metrics**
- Herfindahl-Hirschman Index (HHI) for market concentration
- Gini coefficient for revenue inequality among firms
- Survival analysis (firm longevity by size category)

---

## Collections Hierarchy - Four Tiers

### Tier 1: Primary Entities (The Big Entities)
Main standalone entities we track as complete units - 3 collections

### Tier 2: Connective Tissue (Links & Context)
Collections that connect entities, provide temporal/relational context - 3 collections

### Tier 3: Detailed Data (Enrichment Data)
Specific attributes and data types that enrich primary entities - 12 collections

### Tier 4: Market Intelligence (Consolidation & Market Analytics)
Computed market-specific data for consolidation tracking - 4 collections

---

```
/firestore
│
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ TIER 1: PRIMARY ENTITIES (The Big Entities)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── /cities                         # Cities - GEOGRAPHIC MARKETS
│   ├── [cityId]                    # Doc ID: "london-uk", "new-york-usa", "dubai-uae"
│   │   ├── id: string
│   │   ├── cityName: string        # Display: "London", "New York", "Dubai"
│   │   ├── country: string
│   │   ├── region: string          # State/province
│   │   ├── coordinates: geopoint
│   │   ├── marketProfile: object   # Core market snapshot
│   │   │   ├── marketSize: number  # Total annual architecture market revenue
│   │   │   ├── growthRate: number  # % YoY growth
│   │   │   ├── stage: string       # emerging, growth, mature, declining
│   │   │   └── status: string      # competitive, consolidating, oligopoly
│   │   ├── consolidation: object   # City-level consolidation metrics
│   │   │   ├── hhiIndex: number    # HHI for this city
│   │   │   ├── cr4: number         # Top 4 concentration %
│   │   │   └── activeOffices: number
│   │   ├── activeOffices: string[] # Office IDs (CCccNNN) operating here
│   │   ├── activeProjects: string[]# Project IDs in this city
│   │   ├── regulations: string[]   # Regulation IDs for this city
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /offices                        # Architecture Offices - PRIMARY ENTITY (Flat Structure)
│   ├── [officeId]                  # Doc ID: CCccNNN format (e.g., "SPBA831")
│   │   │   │   ├── id: string      # Same as document ID: CCccNNN format
│   │   │   │   ├── name: string    # Display: "Zaha Hadid Architects" (not used for ID)
│   │   │   │   ├── officialName: string    # Legal: "Zaha Hadid Architects Ltd."
│   │   │   │   ├── founder: string         # Person who founded the office
│   │   │   │   ├── founded: number         # Year established
│   │   │   │   ├── status: string          # active, acquired, dissolved
│   │   │   │   ├── location: object
│   │   │   │   │   ├── headquarters: object
│   │   │   │   │   │   ├── city: string
│   │   │   │   │   │   ├── country: string
│   │   │   │   │   │   └── coordinates: geopoint
│   │   │   │   │   └── otherOffices: array  # Additional locations
│   │   │   │   ├── size: object
│   │   │   │   │   ├── employeeCount: number
│   │   │   │   │   ├── sizeCategory: string  # boutique, medium, large, global
│   │   │   │   │   └── annualRevenue: number
│   │   │   │   ├── specializations: string[]
│   │   │   │   ├── notableWorks: string[]   # Famous projects
│   │   │   │   ├── connectionCounts: object  # DENORMALIZED for fast queries
│   │   │   │   │   ├── totalProjects: number
│   │   │   │   │   ├── activeProjects: number
│   │   │   │   │   ├── clients: number
│   │   │   │   │   ├── competitors: number
│   │   │   │   │   └── suppliers: number
│   │   │   │   ├── createdAt: timestamp
│   │   │   │   └── updatedAt: timestamp
│   │   │   │
├── /projects                       # Projects - CORE ENTITY (Flat Structure)
│   ├── [projectId]                 # Doc ID: unique project identifier
│   │   ├── id: string
│   │   ├── projectName: string
│   │   ├── officeId: string        # PRIMARY relationship
│   │   ├── cityId: string          # City where project is located
│   │   ├── clientId: string        # Reference to clients collection
│   │   ├── status: string          # concept, planning, construction, completed, cancelled
│   │   ├── timeline: object        # Basic timeline
│   │   │   ├── startDate: timestamp
│   │   │   ├── expectedCompletion: timestamp
│   │   │   └── actualCompletion: timestamp  # if completed
│   │   ├── location: object
│   │   │   ├── city: string
│   │   │   ├── country: string
│   │   │   ├── address: string
│   │   │   └── coordinates: geopoint
│   │   ├── financial: object       # Basic financial snapshot
│   │   │   ├── budget: number
│   │   │   ├── currency: string
│   │   │   └── actualCost: number   # if completed
│   │   ├── details: object
│   │   │   ├── projectType: string  # residential, commercial, cultural, etc.
│   │   │   ├── size: number         # sq meters
│   │   │   └── description: string  # Brief description
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│   │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ TIER 2: CONNECTIVE TISSUE (Links & Context Between Entities)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── /relationships                  # EXPLICIT RELATIONSHIP TRACKING - Graph Edges
│   ├── [relationshipId]            # Connects any entity to any entity
│   │   ├── id: string
│   │   ├── sourceEntity: object
│   │   │   ├── type: string        # "office", "project", "client", etc.
│   │   │   └── id: string
│   │   ├── targetEntity: object
│   │   │   ├── type: string
│   │   │   └── id: string
│   │   ├── relationshipType: string
│   │   │   # Types: "collaborator", "competitor", "client-of", 
│   │   │   # "supplier-to", "influenced-by", "acquired", "merged",
│   │   │   # "partner", "subcontractor"
│   │   ├── strength: number        # 1-10 scale (for weighted graph analysis)
│   │   ├── sentiment: string       # positive, neutral, negative
│   │   ├── startDate: timestamp
│   │   ├── endDate: timestamp      # null if ongoing
│   │   ├── details: object
│   │   │   ├── context: string
│   │   │   ├── outcomes: string[]
│   │   │   └── notes: string
│   │   ├── evidence: string[]      # Project IDs, document refs proving relationship
│   │   ├── tags: string[]
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /networkGraph                   # PRECOMPUTED GRAPH DATA - Connection Metrics
│   ├── [nodeId]                    # Each node in the relationship graph
│   │   ├── id: string
│   │   ├── nodeType: string        # office, project, client, etc.
│   │   ├── entityId: string        # Reference to actual entity
│   │   ├── connections: object
│   │   │   ├── totalConnections: number
│   │   │   ├── strongConnections: number  # strength > 7
│   │   │   ├── byType: object
│   │   │   │   # e.g., { "clients": 12, "projects": 45, "suppliers": 8 }
│   │   │   └── topConnections: array  # Most important connections
│   │   │       ├── nodeId: string
│   │   │       ├── relationshipType: string
│   │   │       └── strength: number
│   │   ├── centrality: object      # Graph analysis metrics
│   │   │   ├── degree: number      # Number of connections
│   │   │   ├── betweenness: number # How often node is bridge
│   │   │   ├── closeness: number   # Average distance to other nodes
│   │   │   └── influence: number   # Computed influence score
│   │   ├── clusters: string[]      # Which network clusters/communities
│   │   ├── lastComputed: timestamp
│   │   └── updatedAt: timestamp
│   │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ TIER 3: DETAILED DATA (Enrichment Data for Primary Entities)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── /clients                        # Client Entities
│   ├── [clientId]
│   │   ├── id: string
│   │   ├── clientName: string
│   │   ├── clientType: string      # private, public, corporate, institutional
│   │   ├── industry: string
│   │   ├── location: object
│   │   ├── projects: string[]      # All projects with this client
│   │   ├── preferredOffices: string[]  # Offices they work with repeatedly
│   │   ├── totalSpend: number      # Lifetime project value
│   │   ├── relationshipQuality: number  # 1-10
│   │   ├── contactInfo: object
│   │   ├── notes: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /workforce                      # Talent, Employees, Networks
│   ├── [workforceId]               # Can be office-level or individual talent
│   │   ├── id: string
│   │   ├── officeId: string        # null if individual talent
│   │   ├── recordType: string      # office-aggregate, individual, team
│   │   ├── aggregate: object       # For office-level data
│   │   │   ├── totalEmployees: number
│   │   │   ├── distribution: object
│   │   │   │   ├── architects: number
│   │   │   │   ├── engineers: number
│   │   │   │   ├── designers: number
│   │   │   │   └── administrative: number
│   │   │   ├── retentionRate: number
│   │   │   └── growthRate: number
│   │   ├── talentSources: string[]
│   │   ├── partnerships: array     # University partnerships
│   │   │   ├── institution: string
│   │   │   └── relationship: string
│   │   ├── keyPersonnel: array     # Notable architects/leaders
│   │   ├── skillsMatrix: object
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /technology                     # Technology Adoption & Innovation
│   ├── [techId]
│   │   ├── id: string
│   │   ├── officeId: string
│   │   ├── technologyName: string
│   │   ├── category: string        # BIM, AI, parametric, VR, fabrication, etc.
│   │   ├── vendor: string
│   │   ├── adoptionDate: timestamp
│   │   ├── usageLevel: string      # experimental, partial, full, enterprise
│   │   ├── relatedProjects: string[]
│   │   ├── roi: object
│   │   │   ├── costSavings: number
│   │   │   ├── timeReduction: number
│   │   │   └── qualityImprovement: string
│   │   ├── notes: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /financials                     # Financial Transactions & Records
│   ├── [financialId]
│   │   ├── id: string
│   │   ├── officeId: string
│   │   ├── projectId: string       # Optional: project-specific
│   │   ├── recordType: string      # funding, debt, revenue, expense, investment
│   │   ├── amount: number
│   │   ├── currency: string
│   │   ├── date: timestamp
│   │   ├── period: object          # For recurring/period data
│   │   │   ├── type: string        # monthly, quarterly, annual
│   │   │   ├── year: number
│   │   │   └── quarter: number
│   │   ├── source: string          # Where money came from
│   │   ├── destination: string     # Where money went
│   │   ├── category: string        # Operating expense, capital, etc.
│   │   ├── details: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /supplyChain                    # Suppliers & Materials
│   ├── [supplierId]
│   │   ├── id: string
│   │   ├── supplierName: string
│   │   ├── supplierType: string    # materials, services, equipment
│   │   ├── materialTypes: string[] # steel, glass, concrete, timber, etc.
│   │   ├── location: object
│   │   ├── serviceRegions: string[]
│   │   ├── reliability: object
│   │   │   ├── score: number       # 1-10
│   │   │   ├── onTimeDelivery: number
│   │   │   └── qualityRating: number
│   │   ├── pricing: object
│   │   │   ├── priceLevel: string  # budget, mid-range, premium
│   │   │   └── negotiable: boolean
│   │   ├── relationships: array
│   │   │   ├── officeId: string
│   │   │   ├── contractStatus: string
│   │   │   └── projects: string[]
│   │   ├── sustainability: object
│   │   │   ├── certified: boolean
│   │   │   └── certifications: string[]
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /landData                       # Land Parcels & Development Sites
│   ├── [landParcelId]
│   │   ├── id: string
│   │   ├── location: object
│   │   │   ├── city: string
│   │   │   ├── address: string
│   │   │   ├── neighborhood: string
│   │   │   └── coordinates: geopoint
│   │   ├── size: object
│   │   │   ├── area: number        # sq meters
│   │   │   └── dimensions: object
│   │   ├── zoning: object
│   │   │   ├── classification: string
│   │   │   ├── allowedUses: string[]
│   │   │   ├── restrictions: string[]
│   │   │   └── density: string
│   │   ├── ownership: object
│   │   │   ├── owner: string
│   │   │   ├── ownerType: string
│   │   │   └── acquisitionDate: timestamp
│   │   ├── valuation: object
│   │   │   ├── assessedValue: number
│   │   │   ├── marketValue: number
│   │   │   ├── currency: string
│   │   │   └── lastAssessed: timestamp
│   │   ├── development: object
│   │   │   ├── status: string      # vacant, planned, under-construction
│   │   │   ├── potential: string
│   │   │   └── limitations: string[]
│   │   ├── relatedProjects: string[]
│   │   ├── applicableRegulations: string[]
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /cityData                       # Detailed City Enrichment (enriches Tier 1 /cities)
│   ├── [cityId]                    # Doc ID: must match Tier 1 cities.id
│   │   ├── id: string              # Same as Tier 1 city ID
│   │   ├── cityId: string          # Reference to Tier 1 cities collection
│   │   ├── demographics: object    # Detailed population data
│   │   │   ├── population: number
│   │   │   ├── density: number
│   │   │   ├── growthTrend: array  # Historical growth data
│   │   │   ├── ageDistribution: object
│   │   │   ├── wealthDistribution: object
│   │   │   └── educationLevel: object
│   │   ├── economic: object        # Detailed economic context
│   │   │   ├── gdp: number
│   │   │   ├── gdpPerCapita: number
│   │   │   ├── constructionVolume: number
│   │   │   ├── realEstateMarket: object
│   │   │   ├── majorIndustries: string[]
│   │   │   ├── employmentRate: number
│   │   │   └── costOfLiving: object
│   │   ├── architectural: object   # Cultural & architectural heritage
│   │   │   ├── dominantStyles: string[]
│   │   │   ├── notableBuildings: string[]
│   │   │   ├── architecturalHeritage: string
│   │   │   ├── constructionActivity: string
│   │   │   ├── landmarkProjects: string[]
│   │   │   └── urbanPlanningHistory: string
│   │   ├── cultural: object        # Cultural context
│   │   │   ├── culturalInfluences: string[]
│   │   │   ├── designTraditions: string[]
│   │   │   └── aestheticPreferences: string
│   │   ├── infrastructure: object  # City infrastructure
│   │   │   ├── transportNetwork: string
│   │   │   ├── utilities: object
│   │   │   └── connectivity: string
│   │   ├── trends: string[]        # Current trends affecting city (IDs)
│   │   ├── newsArticles: string[]  # News about this city (IDs)
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /regulations                    # Laws, Codes, Regulatory Requirements (Flat Structure)
│   ├── [regulationId]              # Document: regulation with all details
│   │   ├── id: string
│   │   ├── regulationType: string  # building-code, zoning, environmental, etc.
│   │   ├── name: string
│   │   ├── jurisdiction: object    # Geographic applicability
│   │   │   ├── level: string       # international, national, state, city
│   │   │   ├── country: string     # ISO country code (e.g., "GB", "US", "FR")
│   │   │   ├── countryName: string # "United Kingdom", "United States"
│   │   │   ├── state: string       # If state/province level (e.g., "California", "New York")
│   │   │   ├── cityId: string      # If city-specific (references cities.id)
│   │   │   ├── cityName: string    # For display
│   │   │   └── scope: object       # What this regulation applies to
│   │   │       ├── appliesToCountry: boolean
│   │   │       ├── appliesToState: boolean
│   │   │       ├── appliesToCities: string[]  # City IDs if multi-city
│   │   │       └── appliesToProjectTypes: string[]  # residential, commercial, etc.
│   │   │
│   │   ├── hierarchy: object       # Regulation inheritance chain
│   │   │   ├── parentRegulation: string  # ID of parent regulation (e.g., national code that this extends)
│   │   │   ├── supersededBy: string      # If replaced by newer regulation
│   │   │   ├── relatedRegulations: string[]  # Related/complementary regulations
│   │   │   └── derivedFrom: string       # If based on international standard
│   │   │
│   │   ├── effectiveDate: timestamp
│   │   ├── expirationDate: timestamp  # null if ongoing
│   │   ├── version: string         # e.g., "2023", "v2.1"
│   │   ├── description: string
│   │   │
│   │   ├── requirements: array
│   │   │   ├── requirement: string
│   │   │   ├── mandatory: boolean
│   │   │   ├── applicableTo: string[]  # project types this applies to
│   │   │   ├── exceptions: string[]
│   │   │   └── technicalSpec: string
│   │   │
│   │   ├── compliance: object
│   │   │   ├── mandatory: boolean
│   │   │   ├── penalties: object
│   │   │   │   ├── fines: string
│   │   │   │   ├── criminal: boolean
│   │   │   │   └── projectStoppage: boolean
│   │   │   ├── requiredCertifications: array
│   │   │   ├── inspectionRequired: boolean
│   │   │   ├── complianceCost: object
│   │   │   │   ├── estimated: number
│   │   │   │   ├── currency: string
│   │   │   │   └── perProjectType: object
│   │   │   └── documentationRequired: string[]
│   │   │
│   │   ├── enforcement: object
│   │   │   ├── enforcingAuthority: string
│   │   │   ├── inspectionFrequency: string
│   │   │   ├── complianceRate: number  # % of projects compliant
│   │   │   └── violationCount: number  # Historical violations
│   │   │
│   │   ├── impact: object
│   │   │   ├── level: string       # High, Medium, Low
│   │   │   ├── affectedProjects: string[]
│   │   │   ├── economicImpact: string
│   │   │   ├── timelineImpact: string
│   │   │   └── designImpact: string
│   │   │
│   │   ├── newsArticles: string[]
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /projectData                    # Comprehensive Project Data (enriches Tier 1 /projects)
│   ├── [projectId]                 # Doc ID: must match Tier 1 project ID
│   │   ├── id: string
│   │   ├── projectId: string       # Reference to Tier 1
│   │   ├── vision: object
│   │   │   ├── designPhilosophy: string
│   │   │   ├── inspirations: string[]
│   │   │   ├── conceptualApproach: string
│   │   │   └── architecturalIntent: string
│   │   ├── team: object
│   │   │   ├── leadArchitect: string
│   │   │   ├── designTeam: array
│   │   │   ├── engineers: array
│   │   │   ├── consultants: array
│   │   │   └── contractors: object
│   │   ├── performance: object
│   │   │   ├── schedulePerformance: object
│   │   │   ├── budgetPerformance: object
│   │   │   ├── qualityMetrics: object
│   │   │   └── clientSatisfaction: object
│   │   ├── technical: object
│   │   │   ├── structure: object
│   │   │   ├── systems: object
│   │   │   ├── materials: array
│   │   │   └── innovations: array
│   │   ├── compliance: object
│   │   │   ├── regulations: string[]
│   │   │   ├── permits: array
│   │   │   ├── certifications: array
│   │   │   └── inspections: array
│   │   ├── legacy: object
│   │   │   ├── awards: array
│   │   │   ├── influence: object
│   │   │   ├── culturalSignificance: object
│   │   │   └── marketImpact: object
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /companyStructure               # Organizational Structure
│   ├── [officeId]                  # One per office
│   │   ├── officeId: string
│   │   ├── structure: object
│   │   │   ├── organizationType: string  # partnership, corporation, etc.
│   │   │   ├── departments: array
│   │   │   └── hierarchy: object
│   │   ├── leadership: array
│   │   │   ├── name: string
│   │   │   ├── role: string
│   │   │   └── tenure: number
│   │   ├── divisions: array
│   │   │   ├── name: string
│   │   │   ├── focus: string
│   │   │   └── headCount: number
│   │   ├── governance: object
│   │   │   ├── ownership: string
│   │   │   └── boardMembers: array
│   │   ├── updatedAt: timestamp
│   │   └── createdAt: timestamp
│   │
├── /divisionPercentages            # Analytics Breakdowns
│   ├── [divisionId]
│   │   ├── id: string
│   │   ├── officeId: string
│   │   ├── divisionType: string    # revenue, workforce, projects, regions
│   │   ├── breakdown: object
│   │   │   # Key-value pairs: category -> percentage
│   │   │   # e.g., { "commercial": 60, "residential": 30, "cultural": 10 }
│   │   ├── period: object
│   │   │   ├── year: number
│   │   │   ├── quarter: number     # optional
│   │   │   └── type: string        # annual, quarterly
│   │   ├── methodology: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /newsArticles                   # News & Media Coverage
│   ├── [articleId]
│   │   ├── id: string
│   │   ├── title: string
│   │   ├── url: string
│   │   ├── publishedDate: timestamp
│   │   ├── source: object
│   │   │   ├── outletName: string  # "Financial Times", "ArchDaily", "Dezeen"
│   │   │   ├── author: string
│   │   │   ├── credibility: number  # 1-10 rating
│   │   │   └── type: string        # news, trade-publication, blog, press-release
│   │   ├── content: string         # Full text or summary
│   │   ├── excerpt: string         # Short snippet for previews
│   │   ├── category: string        # M&A, project-announcement, award, scandal, etc.
│   │   ├── entities: object        # What the article is about
│   │   │   ├── offices: string[]   # Office IDs (CCccNNN format)
│   │   │   ├── projects: string[]  # Project IDs
│   │   │   ├── people: string[]    # Key personnel mentioned
│   │   │   └── cities: string[]    # Cities mentioned
│   │   ├── topics: string[]        # consolidation, technology, sustainability, etc.
│   │   ├── sentiment: string       # positive, neutral, negative
│   │   ├── relevance: number       # 1-10 importance score
│   │   ├── extractedData: object   # AI-parsed structured data
│   │   │   ├── mentionedRevenue: number
│   │   │   ├── employeeCount: number
│   │   │   ├── dealValue: number
│   │   │   ├── projectBudget: number
│   │   │   └── otherMetrics: object
│   │   ├── usedInCollections: object  # Track where this article was used as evidence
│   │   │   ├── archHistory: string[]  # Event IDs that cite this article
│   │   │   ├── trends: string[]       # Trend IDs
│   │   │   ├── relationships: string[]
│   │   │   └── marketIntelligence: string[]
│   │   ├── tags: string[]
│   │   ├── language: string        # en, es, fr, etc.
│   │   ├── imageUrl: string        # Featured image
│   │   ├── scrapedAt: timestamp    # When article was scraped
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /politicalContext              # Political & Institutional Context (City Governance)
│   ├── [cityId]                    # Doc ID: must match Tier 1 cities.id (e.g., "london-uk")
│   │   ├── id: string
│   │   ├── cityId: string          # Reference to Tier 1 cities collection
│   │   │
│   │   ├── governance: object      # Political structure & stability
│   │   │   ├── governmentType: string  # municipal-council, mayor-council, commission, etc.
│   │   │   ├── stabilityIndex: number  # 1-10, political stability
│   │   │   ├── electionCycle: object
│   │   │   │   ├── nextElection: timestamp
│   │   │   │   ├── frequency: string  # "every 4 years", "every 5 years"
│   │   │   │   └── recentTurnover: boolean
│   │   │   ├── currentLeadership: object
│   │   │   │   ├── mayorName: string   # if applicable
│   │   │   │   ├── party: string
│   │   │   │   ├── termStart: timestamp
│   │   │   │   └── termEnd: timestamp
│   │   │   ├── proBusinessClimate: number  # 1-10 rating
│   │   │   └── politicalPriorities: string[]  # Current admin's focus
│   │   │
│   │   ├── planningAuthority: object  # Development control & approval
│   │   │   ├── authorityName: string  # e.g., "Greater London Authority Planning"
│   │   │   ├── developmentPolicy: string  # pro-growth, controlled-growth, preservation
│   │   │   ├── planningApproach: object
│   │   │   │   ├── philosophy: string  # market-driven, interventionist, mixed
│   │   │   │   ├── masterPlan: object
│   │   │   │   │   ├── name: string    # "London Plan 2021"
│   │   │   │   │   ├── adoptedDate: timestamp
│   │   │   │   │   ├── nextUpdate: timestamp
│   │   │   │   │   └── keyThemes: string[]
│   │   │   │   └── strategicVision: string
│   │   │   ├── designReview: object
│   │   │   │   ├── exists: boolean
│   │   │   │   ├── boardName: string   # e.g., "London Design Review Panel"
│   │   │   │   ├── stringency: string  # low, medium, high, very-high
│   │   │   │   ├── avgApprovalTime: number  # days
│   │   │   │   ├── designStandards: string
│   │   │   │   └── mandatoryThreshold: string  # "All projects >5000 sqm"
│   │   │   ├── permitProcess: object
│   │   │   │   ├── avgTimeResidential: number  # months
│   │   │   │   ├── avgTimeCommercial: number
│   │   │   │   ├── approvalRate: number  # %
│   │   │   │   ├── appealRate: number    # %
│   │   │   │   └── complexity: string    # simple, moderate, complex
│   │   │   └── communityEngagement: object
│   │   │       ├── required: boolean
│   │   │       ├── avgConsultationPeriod: number  # days
│   │   │       ├── influence: string   # low, medium, high
│   │   │       └── commonObjections: string[]
│   │   │
│   │   ├── majorInstitutionalClients: array  # Key institutional players
│   │   │   ├── name: string
│   │   │   ├── type: string        # university, hospital, museum, corporate-hq, government
│   │   │   ├── architecturalActivity: string  # high, medium, low
│   │   │   ├── recentProjects: string[]  # Project IDs
│   │   │   ├── avgProjectBudget: number
│   │   │   ├── buildingPipeline: object
│   │   │   │   ├── planned: number  # Count of planned projects
│   │   │   │   ├── totalValue: number
│   │   │   │   └── timeline: string
│   │   │   ├── preferredOffices: string[]  # Office IDs (CCccNNN)
│   │   │   ├── procurementMethod: string  # RFP, invited-competition, direct-award
│   │   │   └── designPriorities: string[]
│   │   │
│   │   ├── publicSector: object    # Government investment & activity
│   │   │   ├── annualCapitalBudget: number  # Total public construction budget
│   │   │   ├── breakdown: object
│   │   │   │   ├── infrastructureSpend: number
│   │   │   │   ├── culturalSpend: number  # Museums, libraries, civic buildings
│   │   │   │   ├── housingSpend: number   # Public/social housing
│   │   │   │   ├── educationSpend: number # Schools, universities
│   │   │   │   └── healthcareSpend: number # Hospitals, clinics
│   │   │   ├── investmentTrend: string  # increasing, stable, declining
│   │   │   ├── majorInfrastructureProjects: array
│   │   │   │   ├── projectName: string
│   │   │   │   ├── projectId: string  # Reference to projects collection
│   │   │   │   ├── budget: number
│   │   │   │   ├── status: string
│   │   │   │   └── expectedCompletion: timestamp
│   │   │   ├── publicProcurement: object
│   │   │   │   ├── transparency: string  # high, medium, low
│   │   │   │   ├── localPreference: boolean  # Do they prefer local firms?
│   │   │   │   └── sustainabilityRequirements: string[]
│   │   │   └── pppActivity: object  # Public-Private Partnerships
│   │   │       ├── active: boolean
│   │   │       ├── projectCount: number
│   │   │       └── sectorFocus: string[]
│   │   │
│   │   ├── corporateSector: object # Corporate institutional presence
│   │   │   ├── fortuneGlobal500Count: number  # Headquartered here
│   │   │   ├── majorCorporateClients: array
│   │   │   │   ├── companyName: string
│   │   │   │   ├── industry: string
│   │   │   │   ├── realEstateActivity: string  # high, medium, low
│   │   │   │   ├── recentProjects: string[]
│   │   │   │   └── expansionPlans: string
│   │   │   ├── corporateRealEstateDemand: string  # high, medium, low
│   │   │   ├── hqRelocations: object
│   │   │   │   ├── inflow: number   # Companies moving HQ here
│   │   │   │   ├── outflow: number  # Companies leaving
│   │   │   │   └── netTrend: string
│   │   │   ├── businessDistrictDevelopment: string
│   │   │   └── employmentCenters: string[]  # Key business districts
│   │   │
│   │   ├── educationalSector: object  # Universities & schools
│   │   │   ├── universities: number
│   │   │   ├── architectureSchools: number
│   │   │   ├── majorInstitutions: array
│   │   │   │   ├── name: string
│   │   │   │   ├── studentPopulation: number
│   │   │   │   ├── campusExpansion: boolean
│   │   │   │   ├── buildingPipeline: string
│   │   │   │   └── recentProjects: string[]
│   │   │   ├── studentHousingDemand: string  # very-high, high, medium, low
│   │   │   ├── researchFacilities: object
│   │   │   │   ├── count: number
│   │   │   │   ├── specializedLabs: boolean
│   │   │   │   └── futureNeeds: string
│   │   │   └── publicSchools: object
│   │   │       ├── newSchoolsPlanned: number
│   │   │       └── capitalProgramBudget: number
│   │   │
│   │   ├── healthcareSector: object  # Hospitals & medical facilities
│   │   │   ├── majorHospitals: number
│   │   │   ├── keyInstitutions: array
│   │   │   │   ├── name: string
│   │   │   │   ├── type: string     # teaching-hospital, general, specialist
│   │   │   │   ├── expansionPlanned: boolean
│   │   │   │   ├── recentProjects: string[]
│   │   │   │   └── capitalBudget: number
│   │   │   ├── healthcareRealEstateTrend: string
│   │   │   ├── privateHealthcare: object
│   │   │   │   ├── growing: boolean
│   │   │   │   ├── newFacilities: number
│   │   │   │   └── investmentLevel: string
│   │   │   └── agingInfrastructure: boolean  # Need for modernization?
│   │   │
│   │   ├── culturalSector: object  # Museums, arts, cultural venues
│   │   │   ├── museums: number
│   │   │   ├── performingArtsVenues: number
│   │   │   ├── majorInstitutions: array
│   │   │   │   ├── name: string
│   │   │   │   ├── type: string     # museum, theater, concert-hall, gallery
│   │   │   │   ├── expansionPlans: boolean
│   │   │   │   └── recentProjects: string[]
│   │   │   ├── culturalInvestmentLevel: string  # high, medium, low
│   │   │   ├── governmentSupport: object
│   │   │   │   ├── annualFunding: number
│   │   │   │   ├── capitalProjects: string[]
│   │   │   │   └── trend: string
│   │   │   ├── philanthropicActivity: string
│   │   │   └── culturalDistricts: string[]  # Areas of concentration
│   │   │
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number  # %
│   │   │   ├── sources: string[]
│   │   │   └── lastVerified: timestamp
│   │   │
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ TIER 3 CONTINUED: EXTERNAL FORCES DATA (7 Collections)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── /externalMacroeconomic         # Macroeconomic Data (Interest Rates, Inflation, GDP)
│   ├── [cityId-period]            # Doc ID: "london-uk-2024-q4"
│   │   ├── id: string
│   │   ├── cityId: string         # Reference to cities collection
│   │   ├── period: object
│   │   │   ├── year: number
│   │   │   ├── quarter: number
│   │   │   └── type: string       # quarterly, annual
│   │   ├── interestRates: object
│   │   │   ├── current: number
│   │   │   ├── historicalAverage: number
│   │   │   ├── trend: string      # rising, falling, stable
│   │   │   ├── changeRate: number # basis points per period
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── inflation: object
│   │   │   ├── overall: number
│   │   │   ├── construction: number
│   │   │   ├── labor: number
│   │   │   ├── materials: number
│   │   │   ├── trend: string
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── gdp: object
│   │   │   ├── current: number
│   │   │   ├── growthRate: number
│   │   │   ├── constructionShare: number
│   │   │   ├── projectedGrowth: number
│   │   │   ├── economicCycle: string  # expansion, peak, contraction, trough
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── capitalFlows: object
│   │   │   ├── fdi: object
│   │   │   │   ├── totalInflow: number
│   │   │   │   ├── trend: string
│   │   │   │   ├── majorSources: array
│   │   │   │   │   ├── country: string
│   │   │   │   │   ├── amount: number
│   │   │   │   │   ├── percentage: number
│   │   │   │   │   └── focusSegments: string[]
│   │   │   │   └── sentimentIndex: number
│   │   │   ├── bankLending: object
│   │   │   │   ├── volume: number
│   │   │   │   ├── approvalRate: number
│   │   │   │   ├── avgLTV: number
│   │   │   │   └── trend: string
│   │   │   ├── publicFunding: object
│   │   │   │   ├── infrastructureSpend: number
│   │   │   │   ├── culturalSpend: number
│   │   │   │   ├── housingSubsidies: number
│   │   │   │   └── trendDirection: string
│   │   │   └── capitalAccessibility: string  # abundant, adequate, constrained, scarce
│   │   ├── exchangeRates: object
│   │   │   ├── localCurrency: string
│   │   │   ├── strength: string   # strong, stable, weak
│   │   │   ├── volatility: number
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalSupplyChain           # Supply Chain & Materials Data
│   ├── [cityId-period]            # Doc ID: "london-uk-2024-q4"
│   │   ├── id: string
│   │   ├── cityId: string
│   │   ├── period: object
│   │   │   ├── year: number
│   │   │   └── quarter: number
│   │   ├── overallHealth: object
│   │   │   ├── status: string     # healthy, stressed, disrupted, critical
│   │   │   ├── rating: number     # 1-10
│   │   │   ├── lastAssessment: timestamp
│   │   │   └── majorIssues: string[]
│   │   ├── materials: array
│   │   │   ├── material: string   # steel, concrete, timber, glass, etc.
│   │   │   ├── availability: string  # abundant, normal, constrained, scarce
│   │   │   ├── priceIndex: number # relative to baseline (100 = normal)
│   │   │   ├── priceChange: number  # % change vs last period
│   │   │   ├── leadTime: number   # days
│   │   │   ├── leadTimeNormal: number  # normal days for comparison
│   │   │   ├── volatility: number # 1-10
│   │   │   ├── majorSuppliers: string[]
│   │   │   ├── risks: array
│   │   │   │   ├── type: string   # geopolitical, weather, capacity, transport
│   │   │   │   ├── description: string
│   │   │   │   ├── likelihood: string  # low, medium, high
│   │   │   │   └── impact: string # minor, moderate, severe
│   │   │   ├── alternatives: array
│   │   │   │   ├── material: string
│   │   │   │   ├── costDelta: number
│   │   │   │   └── performanceTradeoff: string
│   │   │   ├── trend: string      # improving, stable, deteriorating
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── labor: object
│   │   │   ├── skilledWorkers: object
│   │   │   │   ├── availability: string  # abundant, adequate, shortage, critical-shortage
│   │   │   │   ├── avgWageRate: number
│   │   │   │   ├── wageInflation: number
│   │   │   │   ├── trades: array
│   │   │   │   │   ├── trade: string
│   │   │   │   │   ├── availabilityRating: number
│   │   │   │   │   ├── unfilledPositions: number
│   │   │   │   │   ├── avgWage: number
│   │   │   │   │   ├── wageInflation: number
│   │   │   │   │   └── trainingPipeline: string
│   │   │   │   ├── unionStrength: string
│   │   │   │   └── strikeRisk: string
│   │   │   └── professionalServices: object
│   │   │       ├── architects: string  # surplus, balanced, shortage
│   │   │       ├── engineers: string
│   │   │       ├── avgBillingRate: number
│   │   │       └── talentDrain: boolean
│   │   ├── logistics: object
│   │   │   ├── shipping: object
│   │   │   │   ├── costIndex: number
│   │   │   │   ├── portCongestion: string
│   │   │   │   ├── avgDelay: number
│   │   │   │   ├── affectedRoutes: string[]
│   │   │   │   └── source: string
│   │   │   └── localTransport: object
│   │   │       ├── truckingCapacity: string
│   │   │       ├── fuelCosts: number
│   │   │       └── driverShortage: boolean
│   │   ├── manufacturingCapacity: object
│   │   │   ├── prefab: object
│   │   │   │   ├── utilizationRate: number
│   │   │   │   ├── expansionPlanned: boolean
│   │   │   │   └── leadTimes: number
│   │   │   └── customFabrication: object
│   │   │       ├── availability: string
│   │   │       └── costTrend: string
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalClimate               # Climate & Environmental Data
│   ├── [cityId-year]              # Doc ID: "london-uk-2024"
│   │   ├── id: string
│   │   ├── cityId: string
│   │   ├── assessmentYear: number
│   │   ├── risks: array
│   │   │   ├── hazardType: string  # flooding, hurricane, wildfire, earthquake, heat, etc.
│   │   │   ├── overallRisk: string # low, moderate, high, severe
│   │   │   ├── likelihood: string  # rare, occasional, frequent, constant
│   │   │   ├── severity: string    # minor, moderate, catastrophic
│   │   │   ├── trendDirection: string  # worsening, stable, improving
│   │   │   ├── lastMajorEvent: timestamp
│   │   │   ├── affectedZones: string[]
│   │   │   ├── insuranceCostImpact: number
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── adaptationMandates: array
│   │   │   ├── mandateType: string
│   │   │   ├── applicability: string[]
│   │   │   ├── costImpact: number
│   │   │   ├── effectiveDate: timestamp
│   │   │   ├── complianceRate: number
│   │   │   └── penalties: string
│   │   ├── adaptationNeeds: object
│   │   │   ├── totalCityInvestment: number
│   │   │   ├── perProjectAverage: number
│   │   │   ├── fundingGap: number
│   │   │   └── priorityProjects: string[]
│   │   ├── sustainability: object
│   │   │   ├── netZeroTarget: number  # year
│   │   │   ├── currentProgress: number  # % toward goal
│   │   │   ├── buildingSectorReduction: number
│   │   │   ├── pathStatus: string  # on-track, behind, ahead
│   │   │   ├── regulatoryTrend: string  # tightening, stable, relaxing
│   │   │   └── source: string
│   │   ├── carbonLimits: object
│   │   │   ├── residential: number  # kgCO2e/m²
│   │   │   ├── commercial: number
│   │   │   ├── regulated: boolean
│   │   │   ├── reportingRequired: boolean
│   │   │   └── effectiveDate: timestamp
│   │   ├── resourceConstraints: object
│   │   │   ├── waterScarcity: object
│   │   │   │   ├── status: string  # abundant, adequate, stressed, critical
│   │   │   │   ├── grayWaterMandates: boolean
│   │   │   │   └── landscapingRestrictions: string
│   │   │   ├── landAvailability: object
│   │   │   │   ├── developableLand: number  # hectares
│   │   │   │   ├── brownfieldSupply: number
│   │   │   │   └── redevelopmentPressure: string
│   │   │   └── wasteManagement: object
│   │   │       ├── recyclingRate: number
│   │   │       └── circularEconomyInfra: string
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalTechnology            # Technology Disruption Data
│   ├── [cityId-year]              # Doc ID: "london-uk-2024"
│   │   ├── id: string
│   │   ├── cityId: string
│   │   ├── assessmentYear: number
│   │   ├── remoteWork: object
│   │   │   ├── officeMarketImpact: object
│   │   │   │   ├── vacancyRate: number
│   │   │   │   ├── vacancyChange: number  # pp change vs baseline
│   │   │   │   ├── rentDecline: number    # %
│   │   │   │   ├── conversionActivity: object
│   │   │   │   │   ├── officeToResidential: number  # count
│   │   │   │   │   ├── officeToMixed: number
│   │   │   │   │   └── regulatorySupport: boolean
│   │   │   │   └── newOfficeDemand: object
│   │   │   │       ├── trend: string  # declining, stable, recovering, growing
│   │   │   │       ├── shiftToFlex: boolean
│   │   │   │       ├── qualityFlight: boolean
│   │   │   │       └── preferredLocations: string[]
│   │   │   ├── residentialImpact: object
│   │   │   │   ├── homeOfficeDemand: boolean
│   │   │   │   ├── spaceRequirements: string
│   │   │   │   └── locationShift: object
│   │   │   │       ├── exurbanGrowth: boolean
│   │   │   │       └── secondaryMarkets: string[]
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── constructionTech: object
│   │   │   ├── bimAdoption: number  # %
│   │   │   ├── prefabAdoption: number  # %
│   │   │   ├── droneUsage: number  # %
│   │   │   ├── aiDesignTools: number  # %
│   │   │   ├── roboticsAdoption: number  # %
│   │   │   ├── iotSensors: number  # %
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── proptech: object
│   │   │   ├── smartBuildingDemand: string  # nice-to-have, expected, mandatory
│   │   │   ├── costPremium: number
│   │   │   └── vrAdoption: number  # %
│   │   ├── evAdoption: object
│   │   │   ├── percentageOfVehicles: number
│   │   │   ├── chargingInfrastructure: number  # count of chargers
│   │   │   ├── growthRate: number
│   │   │   └── source: string
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalDemographics          # Demographic & Social Data
│   ├── [cityId-year]              # Doc ID: "london-uk-2024"
│   │   ├── id: string
│   │   ├── cityId: string
│   │   ├── censusYear: number
│   │   ├── population: object
│   │   │   ├── total: number
│   │   │   ├── growthRate: number  # % per year
│   │   │   ├── naturalGrowth: number
│   │   │   ├── netMigration: number
│   │   │   ├── projectedPopulation: number  # 10 years out
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── ageDistribution: object
│   │   │   ├── under18: number     # %
│   │   │   ├── age18to34: number
│   │   │   ├── age35to64: number
│   │   │   ├── over65: number
│   │   │   └── medianAge: number
│   │   ├── households: object
│   │   │   ├── avgSize: number     # persons per household
│   │   │   ├── singlePerson: number  # %
│   │   │   ├── multigenerational: number  # %
│   │   │   ├── homeownership: number  # %
│   │   │   └── impactOnUnitMix: string
│   │   ├── income: object
│   │   │   ├── medianIncome: number
│   │   │   ├── giniCoefficient: number
│   │   │   ├── top10Percent: number  # % of total income
│   │   │   ├── povertyRate: number
│   │   │   └── affordabilityCrisis: boolean
│   │   ├── culturalMovements: object
│   │   │   ├── gentrificationResistance: object
│   │   │   │   ├── strength: string  # weak, moderate, strong, organized
│   │   │   │   ├── affectedNeighborhoods: string[]
│   │   │   │   ├── tactics: string[]
│   │   │   │   ├── impactOnDevelopment: string
│   │   │   │   └── projectsCancelled: number
│   │   │   ├── heritageConservation: object
│   │   │   │   ├── sentiment: string  # strong, moderate, weak
│   │   │   │   ├── protectedBuildings: number
│   │   │   │   └── adaptiveReuseIncentives: boolean
│   │   │   └── communityEngagement: object
│   │   │       ├── expectation: string  # low, moderate, high
│   │   │       ├── processLength: number  # months
│   │   │       └── designImpact: string
│   │   ├── lifestylePreferences: object
│   │   │   ├── urbanVsSuburban: object
│   │   │   │   ├── trend: string  # urbanizing, stable, suburbanizing
│   │   │   │   └── driverFactors: string[]
│   │   │   ├── mixedUse: object
│   │   │   │   ├── demand: string  # declining, stable, growing
│   │   │   │   ├── preferredMix: string
│   │   │   │   └── zoningSupport: boolean
│   │   │   └── aestheticPreferences: object
│   │   │       ├── dominantStyle: string
│   │   │       ├── traditionalVsModern: string
│   │   │       └── preferredMaterials: string[]
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalPolicy                # Policy & Political Data
│   ├── [cityId-period]            # Doc ID: "london-uk-2024-q4"
│   │   ├── id: string
│   │   ├── cityId: string
│   │   ├── period: object
│   │   │   ├── year: number
│   │   │   └── quarter: number
│   │   ├── politicalStability: object
│   │   │   ├── index: number      # 1-10
│   │   │   ├── trend: string      # stable, volatile, improving, declining
│   │   │   ├── nextElection: timestamp
│   │   │   ├── expectedPolicyShift: boolean
│   │   │   ├── businessConfidence: number  # 1-10
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── regulatoryTrend: object
│   │   │   ├── direction: string  # tightening, stable, relaxing
│   │   │   ├── newRegulationsThisYear: number
│   │   │   ├── complianceCostTrend: string
│   │   │   └── source: string
│   │   ├── nationalPolicies: array
│   │   │   ├── policyName: string
│   │   │   ├── policyType: string  # housing, infrastructure, sustainability, trade, etc.
│   │   │   ├── description: string
│   │   │   ├── effectiveDate: timestamp
│   │   │   ├── localImpact: object
│   │   │   │   ├── level: string  # high, medium, low
│   │   │   │   ├── description: string
│   │   │   │   └── quantifiedEffect: string
│   │   │   └── sentiment: string  # positive, neutral, negative
│   │   ├── tariffs: array
│   │   │   ├── material: string
│   │   │   ├── tariffRate: number  # %
│   │   │   ├── impactOnCost: number
│   │   │   └── source: string
│   │   ├── incentives: array
│   │   │   ├── name: string
│   │   │   ├── type: string       # tax-credit, abatement, depreciation, grant
│   │   │   ├── value: number
│   │   │   ├── eligibility: string[]
│   │   │   ├── utilizationRate: number
│   │   │   ├── effectiveDate: timestamp
│   │   │   └── source: string
│   │   ├── affordableHousingMandates: object
│   │   │   ├── percentage: number
│   │   │   ├── enforcement: string  # weak, moderate, strict
│   │   │   ├── exemptions: string[]
│   │   │   └── impactOnFeasibility: string
│   │   ├── permitProcessing: object
│   │   │   ├── avgTimeResidential: number  # months
│   │   │   ├── avgTimeCommercial: number
│   │   │   ├── approvalRate: number  # %
│   │   │   ├── trend: string
│   │   │   └── source: string
│   │   ├── immigrationPolicy: object
│   │   │   ├── impactOnLaborSupply: string  # positive, neutral, negative
│   │   │   ├── skilledWorkerVisas: object
│   │   │   │   ├── availability: string
│   │   │   │   ├── processingTime: number  # months
│   │   │   │   └── costToEmployer: number
│   │   │   └── constructionWorkers: string
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
├── /externalEvents                # Global Events & Crises
│   ├── [scope-period]             # Doc ID: "global-2024-q4" or "europe-2024-q4"
│   │   ├── id: string
│   │   ├── scope: string          # global, regional, or specific cityId
│   │   ├── period: object
│   │   │   ├── year: number
│   │   │   └── quarter: number
│   │   ├── activeEvents: array
│   │   │   ├── eventId: string
│   │   │   ├── eventType: string  # pandemic, war, financial-crisis, natural-disaster, etc.
│   │   │   ├── name: string
│   │   │   ├── startDate: timestamp
│   │   │   ├── status: string     # ongoing, resolved, escalating
│   │   │   ├── endDate: timestamp  # if resolved
│   │   │   ├── impacts: object
│   │   │   │   ├── materialSupply: string
│   │   │   │   ├── energyCosts: string
│   │   │   │   ├── laborSupply: string
│   │   │   │   ├── investmentSentiment: string
│   │   │   │   └── other: string
│   │   │   ├── affectedCities: string[]  # City IDs
│   │   │   ├── severity: string   # minor, moderate, severe, catastrophic
│   │   │   ├── recoveryTimeline: string
│   │   │   ├── adaptations: string[]
│   │   │   ├── permanentShifts: string[]
│   │   │   ├── source: string
│   │   │   └── lastUpdated: timestamp
│   │   ├── geopoliticalTensions: object
│   │   │   ├── affectedTradeRoutes: string[]
│   │   │   ├── materialSourcingRisks: string[]
│   │   │   ├── investmentFlightRisk: boolean
│   │   │   └── scenarioPlanning: string
│   │   ├── dataQuality: object
│   │   │   ├── completeness: number
│   │   │   └── sources: string[]
│   │   ├── createdAt: timestamp
│   │   └── lastUpdated: timestamp
│   │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ TIER 4: MARKET INTELLIGENCE (Consolidation & Market Analytics)
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├── /marketIntelligence             # Market Consolidation & Analysis
│   ├── [analysisId]
│   │   ├── id: string
│   │   ├── analysisType: string    # market-share, trend, consolidation
│   │   ├── scope: object
│   │   │   ├── region: string      # Global, regional, city-specific
│   │   │   ├── segment: string     # Luxury residential, commercial, etc.
│   │   │   └── timeframe: object
│   │   ├── marketShare: object     # COMPUTED from projects, financials
│   │   │   ├── leaders: array
│   │   │   │   ├── officeId: string
│   │   │   │   ├── share: number
│   │   │   │   └── change: number   # vs previous period
│   │   │   └── distribution: object
│   │   ├── consolidation: object
│   │   │   ├── acquisitions: array  # Recent M&A activity
│   │   │   ├── partnerships: array
│   │   │   ├── trend: string        # consolidating, fragmenting, stable
│   │   │   ├── hhiIndex: number     # Herfindahl-Hirschman Index (0-10000)
│   │   │   ├── giniCoefficient: number  # Revenue inequality (0-1)
│   │   │   ├── top4Concentration: number  # % market share of top 4 firms
│   │   │   ├── barrierToEntry: string   # low, medium, high
│   │   │   └── newFirmFormationRate: number  # New firms/year
│   │   ├── pricing: object
│   │   │   ├── median: number
│   │   │   ├── range: object
│   │   │   ├── trends: string
│   │   │   ├── premiumIndex: number  # Top firms premium vs average
│   │   │   └── byOffice: array
│   │   ├── competitiveIntensity: object
│   │   │   ├── avgBiddersPerRFP: number
│   │   │   ├── clientSwitchingRate: number
│   │   │   └── exclusivityDeals: number
│   │   ├── generatedAt: timestamp
│   │   ├── dataPoints: number      # How many records analyzed
│   │   └── createdAt: timestamp
│   │
├── /trends                         # Trend Tracking Across All Dimensions
│   ├── [trendId]
│   │   ├── id: string
│   │   ├── trendType: string       # economic, technological, stylistic, regulatory
│   │   ├── category: string        # Specific category within type
│   │   ├── name: string
│   │   ├── description: string
│   │   ├── scope: object
│   │   │   ├── geographic: string[]
│   │   │   ├── segments: string[]
│   │   │   └── timespan: object
│   │   ├── metrics: object
│   │   │   ├── strength: number    # 1-10 how strong is trend
│   │   │   ├── trajectory: string  # rising, peaking, declining
│   │   │   ├── velocity: number    # Rate of change
│   │   │   └── confidence: number  # Data confidence level
│   │   ├── impact: object
│   │   │   ├── affectedOffices: string[]
│   │   │   ├── affectedProjects: string[]
│   │   │   └── impactLevel: string
│   │   ├── drivers: array          # What's causing the trend
│   │   ├── evidence: array         # Data points supporting trend
│   │   │   ├── entityType: string
│   │   │   └── entityId: string
│   │   ├── predictions: object
│   │   │   ├── futureState: string
│   │   │   └── timeline: string
│   │   ├── lastAnalyzed: timestamp
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
├── /competitiveAnalysis            # Office-to-Office Competitive Intelligence
│   ├── [analysisId]
│   │   ├── id: string
│   │   ├── officeId: string        # Primary office being analyzed
│   │   ├── competitors: array
│   │   │   ├── officeId: string
│   │   │   ├── competitionLevel: number  # How directly competitive
│   │   │   ├── sharedMarkets: string[]
│   │   │   └── wins: array         # Projects won from them
│   │   │   └── losses: array       # Projects lost to them
│   │   ├── positioning: object
│   │   │   ├── strengths: string[]
│   │   │   ├── weaknesses: string[]
│   │   │   ├── opportunities: string[]
│   │   │   ├── threats: string[]
│   │   │   └── uniqueValue: string
│   │   ├── differentiators: array
│   │   │   ├── factor: string
│   │   │   ├── description: string
│   │   │   └── strength: number
│   │   ├── marketPosition: object
│   │   │   ├── rank: number
│   │   │   ├── segment: string
│   │   │   └── share: number
│   │   ├── comparisonMetrics: object
│   │   │   # Head-to-head comparison data
│   │   ├── lastUpdated: timestamp
│   │   └── createdAt: timestamp
│   │
└── /financialMetrics               # KPIs & Performance Metrics
    ├── [metricId]                  # COMPUTED from financials collection
    │   ├── id: string
    │   ├── officeId: string
    │   ├── period: object
    │   │   ├── year: number
    │   │   ├── quarter: number
    │   │   └── type: string
    │   ├── metrics: object
    │   │   ├── revenue: number
    │   │   ├── profit: number
    │   │   ├── margin: number
    │   │   ├── roi: number
    │   │   ├── growthRate: number
    │   │   └── projectValue: number
    │   ├── comparisons: object
    │   │   ├── previousPeriod: object
    │   │   ├── yearOverYear: object
    │   │   └── industryAverage: object
    │   ├── projections: object     # Forward-looking
    │   │   ├── nextQuarter: number
    │   │   └── confidence: number
    │   ├── dataQuality: object
    │   │   ├── completeness: number
    │   │   └── sources: string[]
    │   ├── computedAt: timestamp
    │   └── createdAt: timestamp
    │
└── /externalForcesImpact          # External Forces Impact Analysis (COMPUTED)
    ├── [cityId-period]            # Doc ID: "london-uk-2024-q4"
    │   ├── id: string
    │   ├── cityId: string
    │   ├── period: object
    │   │   ├── year: number
    │   │   ├── quarter: number
    │   │   └── type: string
    │   │
    │   ├── overallMarketConditions: object
    │   │   ├── rating: string     # favorable, neutral, challenging, severe
    │   │   ├── trend: string      # improving, stable, deteriorating
    │   │   ├── confidence: number # 1-10
    │   │   └── summary: string    # Human-readable market assessment
    │   │
    │   ├── topDrivers: array       # Most impactful external forces right now
    │   │   ├── forceCategory: string  # macroeconomic, supplyChain, climate, etc.
    │   │   ├── specificForce: string  # e.g., "interestRates", "materials.steel"
    │   │   ├── impact: string     # high, medium, low
    │   │   ├── direction: string  # positive, negative, mixed
    │   │   ├── quantifiedImpact: object
    │   │   │   ├── projectStarts: number  # % change
    │   │   │   ├── costIncrease: number
    │   │   │   ├── delays: number  # months
    │   │   │   ├── cancellations: number  # count
    │   │   │   └── other: object
    │   │   ├── affectedOffices: string[]  # Office IDs (CCccNNN)
    │   │   ├── affectedProjects: string[]
    │   │   └── narrative: string  # Description of impact
    │   │
    │   ├── compoundingEffects: array  # When multiple forces interact
    │   │   ├── forces: string[]   # Which forces are interacting
    │   │   ├── compoundedImpact: string  # combined severity
    │   │   ├── description: string
    │   │   ├── affectedSegment: string
    │   │   └── quantified: object
    │   │
    │   ├── segmentImpacts: array  # Impact by market segment
    │   │   ├── segment: string    # luxury-residential, affordable-housing, etc.
    │   │   ├── overallImpact: string  # severe, high, moderate, low
    │   │   ├── primaryDrivers: string[]  # Top external forces affecting this segment
    │   │   ├── metrics: object
    │   │   │   ├── projectStarts: number  # % change
    │   │   │   ├── avgBudgetOverrun: number
    │   │   │   ├── avgDelay: number  # months
    │   │   │   └── cancellationRate: number
    │   │   ├── outlook: string    # positive, neutral, negative
    │   │   └── recommendations: string[]
    │   │
    │   ├── officeImpacts: array   # Office-specific impact assessments
    │   │   ├── officeId: string   # CCccNNN format
    │   │   ├── impactLevel: string  # high, medium, low
    │   │   ├── exposures: array
    │   │   │   ├── externalForce: string  # Which force affects them
    │   │   │   ├── exposure: string  # high, medium, low
    │   │   │   ├── mitigationStrategy: string
    │   │   │   └── effectiveness: string
    │   │   ├── overallStrategicPosition: string
    │   │   ├── opportunities: string[]
    │   │   └── threats: string[]
    │   │
    │   ├── scenarios: array       # Scenario planning
    │   │   ├── scenario: string   # e.g., "rates-drop-2025"
    │   │   ├── probability: number  # 0-1
    │   │   ├── assumptions: string[]
    │   │   ├── projectedImpact: object
    │   │   │   └── [various metrics]: number
    │   │   ├── timeline: string
    │   │   └── strategicImplications: string
    │   │
    │   ├── historicalComparison: object
    │   │   ├── previousQuarter: object
    │   │   │   ├── topDriversChanged: boolean
    │   │   │   ├── conditionsChange: string
    │   │   │   └── keyShifts: string[]
    │   │   └── yearAgo: object
    │   │       ├── conditionsChange: string
    │   │       └── keyShifts: string[]
    │   │
    │   ├── outlook: object        # Forward-looking assessment
    │   │   ├── nextQuarter: string
    │   │   ├── nextYear: string
    │   │   └── turnaroundCatalysts: string[]
    │   │
    │   ├── analysisMetadata: object
    │   │   ├── computedFrom: string[]  # Source collections
    │   │   ├── analystNotes: string
    │   │   ├── confidence: number  # 1-10
    │   │   ├── lastAnalyzedBy: string
    │   │   └── nextReviewDate: timestamp
    │   │
    │   ├── generatedAt: timestamp
    │   └── lastUpdated: timestamp
```

---

## Why This Structure? - Detailed Arguments

### 1. Four-Tier Architecture

**Tier 1: Primary Entities** - The big standalone entities (3 collections)
- **Cities**: Geographic markets (fundamental market boundaries)
- **Offices**: Architecture firms (PRIMARY with CCccNNN IDs)
- **Projects**: Building projects
- **Why?** These are the main "things" we track - complete entities with core info (name, size, base data)

**Tier 2: Connective Tissue** - Links and context (3 collections)
- **Relationships**: Explicit graph edges connecting any entities
- **ArchHistory**: Timeline events and M&A tracking
- **NetworkGraph**: Precomputed connection metrics and influence
- **Why?** These don't stand alone - they connect, contextualize, and provide relational meaning between Tier 1 entities

**Tier 3: Detailed Data** - Enrichment attributes (12 collections)
- Clients, workforce, technology, financials, supplyChain, landData, cityData, companyStructure, divisionPercentages, newsArticles, regulations, projectData
- **Why?** These are specific data types that enrich primary entities - they describe offices/projects/cities in detail but aren't "big entities" themselves
- **Note:** cityData provides detailed enrichment for Tier 1 cities; projectData provides detailed execution data for Tier 1 projects; regulations are rules/constraints that apply to projects and cities

**Tier 4: Market Intelligence** - Computed market analytics (4 collections)
- Market consolidation metrics (HHI, Gini), trends, competitive analysis, financial KPIs
- **Why?** Specifically for market tracking - computed from all other tiers, focused on consolidation and market dynamics

### 2. Connective Tissue Tier - The Relational Layer

**Why a Separate Tier for Connections?**
Relationships and historical context aren't standalone entities - they exist BETWEEN entities. They're the connective tissue that makes the database a living network.

**The `/relationships` Collection** (Graph Edges)
Instead of scattered relationship data across collections, we have ONE source for all connections:
- Office → Office (competitors, collaborators, acquisitions)
- Office → Client (client relationships with sentiment tracking)
- Office → Supplier (good/bad supplier relationships)
- Project → Project (influenced by, part of series)

**Arguments:**
1. **Graph Queries**: "Show me all offices connected to Foster + Partners" becomes a simple query on relationships collection
2. **Network Analysis**: Can compute centrality, influence, communities from one collection
3. **Relationship History**: Track when relationships started/ended, their strength over time
4. **Sentiment Tracking**: Explicitly track good vs. bad relationships (your requirement)
5. **Evidence-Based**: Store project IDs that prove the relationship exists

**Example Use Case:**
```typescript
// Find all competitors of Zaha Hadid Architects
db.collection('relationships')
  .where('sourceEntity.id', '==', 'zaha-hadid-architects')
  .where('relationshipType', '==', 'competitor')
  .get()
```

**The `/archHistory` Collection** (Temporal Connections)
- Timeline of events that connect entities over time
- Awards, scandals, acquisitions, mergers, eras
- Provides temporal/historical context between entities (when did Office A acquire Office B?)
- M&A tracking with detailed consolidation data

**The `/networkGraph` Collection** (Connection Metrics)
- Precomputed metrics about HOW entities are connected
- Centrality, influence, clusters
- Shows network structure and importance of connections
- Powers "who's most influential?" queries

**Why These Are Connective Tissue:**
- They don't exist independently - they need Tier 1 entities to connect
- They provide CONTEXT and LINKS, not standalone data
- They enable network/graph thinking about your data

---

### 3. Detailed Data Tier - Entity Enrichment

**The Tier 3 Collections**
These add depth and detail to primary entities but aren't "big entities" themselves:

- **Clients**: Who offices work for (client data enriches understanding of offices)
- **Workforce**: Employee data (enriches offices with people details)
- **Technology**: Software/tools (enriches offices with innovation data)
- **Financials**: Money data (enriches offices/projects with financial details)
- **Supply Chain**: Materials (enriches projects with sourcing data)
- **Land Data**: Sites (enriches projects with property data)
- **City Data**: Detailed demographics/cultural context (enriches Tier 1 cities with deep data)
- **Company Structure**: Org charts (enriches offices with internal structure)
- **Division Percentages**: Analytics (enriches offices with breakdowns)
- **News Articles**: Media coverage (enriches entities with news evidence and public information)

**Why Separate from Primary Entities?**
- They describe/enrich primary entities but aren't tracked as standalone "big things"
- They're detailed attributes, not complete entities themselves

---

### 4. Market Intelligence Tier - Consolidation Analytics

**The Tier 4 Collections** (Market-Specific)

**Why a Separate Market Intelligence Tier?**

**Focus:** These collections are SPECIFICALLY for market consolidation tracking and competitive intelligence

**Collections:**
- **marketIntelligence**: HHI, Gini coefficient, CR4, consolidation metrics
- **trends**: Industry trends (rising, declining, velocity)
- **competitiveAnalysis**: SWOT, market positioning
- **financialMetrics**: Computed KPIs for market comparison

**Why Separate:**
1. **Market-Specific**: All about consolidation, competition, market dynamics
2. **Computed**: Aggregated from Tiers 1-3, updated periodically
3. **Performance**: Pre-computed for instant market queries
4. **Specialized Purpose**: Different from general enrichment data - focused on market intelligence

**Example:**
```typescript
// Instead of this expensive query:
// Aggregate all projects by office, compute percentages, rank them...

// You do this instant query:
db.collection('marketIntelligence')
  .where('analysisType', '==', 'market-share')
  .where('scope.segment', '==', 'luxury-residential')
  .where('scope.region', '==', 'london')
  .orderBy('generatedAt', 'desc')
  .limit(1)
```

### 5. Why Move `/regulations` to Tier 1 (Primary Entities)?

**Before:** Regulations were in Tier 2 (operational data)  
**Now:** Regulations are in Tier 1 (primary entities)

**Arguments:**
1. **Fundamental to All Projects**: Every project must comply with regulations - they're not optional enrichment
2. **Affects Multiple Entities**: Regulations impact offices, projects, land parcels - they're a connective force
3. **Core Business Logic**: Can't understand architecture without understanding regulatory environment
4. **Primary Queries**: Users will ask "what regulations apply?" as often as "what projects?"
5. **Source of Truth**: Like offices and projects, regulations are tracked as complete entities

---

### 6. Why Merge Regulatory + Laws Into `/regulations`?

**Before:** Two collections (`regulatory`, `regulations`) with overlapping purposes
**After:** One `/regulations` collection with `regulationType` field

**Arguments:**
1. **No Redundancy**: Zoning IS a type of regulation, so is building code
2. **Simpler Queries**: Don't need to query two collections to find "all regulations affecting London"
3. **Single Source of Truth**: One collection to maintain
4. **Clearer Data Model**: regulationType makes it explicit what kind of regulation it is

### 7. Enhanced Data Structures

**Examples of improvements:**

**Projects:**
- Added `timeline.phases` - projects have phases, not just start/end dates
- Nested `financial` object - budget, actual cost, funding sources together
- Direct references to `technologies`, `suppliers`, `regulations` - enables "which projects use AI?" queries

**Offices:**
- Added `connectionCounts` (denormalized) - instant answers to "how many clients does this office have?"
- Added `status` field - track if office was acquired or dissolved
- Added `size.sizeCategory` - enables queries like "all large firms in London"

**Clients:**
- Added `preferredOffices` - track which offices they repeatedly work with
- Added `totalSpend` - lifetime value of the client
- Added `relationshipQuality` - good vs. bad client relationships

---

## Indexing Strategy

### Composite Indexes for Core Queries

**Tier 1: Primary Entities**
```javascript
// cities
(country, marketProfile.marketSize DESC)
(consolidation.status, consolidation.hhiIndex DESC)
(marketProfile.stage, marketProfile.growthRate DESC)
(consolidation.activeOffices DESC)

// offices
(status, location.headquarters.city)
(size.sizeCategory, founded DESC)
(specializations array-contains, founded)

// projects
(officeId, status, timeline.startDate DESC)
(location.city, status)
(details.projectType, timeline.startDate DESC)
(status, financial.budget DESC)

// regulations
(jurisdiction.type, jurisdiction.region)
(regulationType, effectiveDate DESC)
(affectedEntities.offices array-contains, impact)
```

**Tier 2: Connective Tissue**
```javascript
// relationships - CRITICAL for graph queries
(sourceEntity.type, sourceEntity.id, relationshipType)
(targetEntity.type, targetEntity.id, relationshipType)
(relationshipType, strength DESC)
(sourceEntity.id, strength DESC, startDate DESC)
(sentiment, relationshipType)

// archHistory
(entityType, entityId, date DESC)
(era, significance DESC)
(eventType, date DESC)

// networkGraph
(nodeType, centrality.influence DESC)
(nodeType, connections.totalConnections DESC)
(clusters array-contains, centrality.degree DESC)
```

**Tier 3: Detailed Data**
```javascript

// clients
(clientType, totalSpend DESC)
(preferredOffices array-contains, relationshipQuality DESC)

// technology
(officeId, category)
(category, adoptionDate DESC)
(usageLevel, adoptionDate DESC)

// financials
(officeId, recordType, date DESC)
(recordType, period.year DESC, period.quarter)
(projectId, recordType, date DESC)

// supplyChain
(materialTypes array-contains, reliability.score DESC)
(serviceRegions array-contains, reliability.score DESC)

// landData
(location.city, zoning.classification)
(development.status, valuation.marketValue DESC)

// cityData
(country, economic.constructionVolume DESC)
(architectural.constructionActivity, demographics.population DESC)

// regulations - HIERARCHICAL QUERIES
(jurisdiction.level, jurisdiction.country, effectiveDate DESC)
(jurisdiction.country, regulationType, effectiveDate DESC)
(jurisdiction.state, regulationType, effectiveDate DESC)
(jurisdiction.cityId, regulationType, effectiveDate DESC)
(jurisdiction.scope.appliesToCities array-contains, regulationType)
(jurisdiction.scope.appliesToProjectTypes array-contains, effectiveDate DESC)
(hierarchy.parentRegulation, effectiveDate DESC)

// projectData
(projectId)

// companyStructure
(officeId)

// divisionPercentages
(officeId, period.year DESC)
(divisionType, period.year DESC)

// newsArticles
(entities.offices array-contains, publishedDate DESC)
(entities.projects array-contains, publishedDate DESC)
(category, publishedDate DESC)
(topics array-contains, publishedDate DESC)
(source.outletName, publishedDate DESC)
(sentiment, relevance DESC)
```

**Tier 4: Market Intelligence**
```javascript
// marketIntelligence
(analysisType, scope.region, scope.segment, generatedAt DESC)

// trends
(trendType, metrics.strength DESC)
(scope.geographic array-contains, metrics.trajectory)
(metrics.trajectory, metrics.strength DESC)

// competitiveAnalysis
(officeId, lastUpdated DESC)
(officeId, marketPosition.rank)

// financialMetrics
(officeId, period.year DESC, period.quarter DESC)
```

### Single Field Indexes (Auto-Created)
- All `officeId`, `projectId`, `clientId` reference fields
- All `createdAt`, `updatedAt` timestamps
- All `coordinates` (geopoint) for geographic queries

---

## Query Patterns for AI Orchestrator

### Your Core Use Cases - How to Query Them

**1. Market Consolidation Tracking**

```typescript
// Get current market consolidation status for a region
const consolidation = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'consolidation')
  .where('scope.region', '==', 'london')
  .orderBy('generatedAt', 'desc')
  .limit(1)
  .get();

// Track M&A activity (acquisitions, mergers)
const acquisitions = await db.collection('relationships')
  .where('relationshipType', 'in', ['acquired', 'merged'])
  .where('startDate', '>=', lastYearTimestamp)
  .get();

// Market share leaders in a segment
const leaders = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'market-share')
  .where('scope.segment', '==', 'luxury-residential')
  .where('scope.region', '==', 'global')
  .orderBy('generatedAt', 'desc')
  .limit(1)
  .get();
// Then access: leaders.data().marketShare.leaders
```

**2. Tracking Trends**

```typescript
// Rising trends in technology
const techTrends = await db.collection('trends')
  .where('trendType', '==', 'technological')
  .where('metrics.trajectory', '==', 'rising')
  .orderBy('metrics.strength', 'desc')
  .limit(10)
  .get();

// Economic trends affecting specific offices
const economicImpact = await db.collection('trends')
  .where('trendType', '==', 'economic')
  .where('impact.affectedOffices', 'array-contains', 'foster-partners')
  .orderBy('metrics.strength', 'desc')
  .get();

// Stylistic trends by era
const stylisticTrends = await db.collection('archHistory')
  .where('eventType', '==', 'era')
  .where('era', '==', 'contemporary')
  .orderBy('significance', 'desc')
  .get();
```

**3. Connecting Offices with Projects**

```typescript
// All projects by an office
const officeProjects = await db.collection('projects')
  .where('officeId', '==', 'zaha-hadid-architects')
  .orderBy('timeline.startDate', 'desc')
  .get();

// Active projects in a specific city
const cityProjects = await db.collection('projects')
  .where('location.city', '==', 'London')
  .where('status', 'in', ['ongoing', 'construction'])
  .get();

// Projects by type and budget range
const luxuryProjects = await db.collection('projects')
  .where('details.projectType', '==', 'luxury-residential')
  .where('financial.budget', '>=', 50000000)
  .orderBy('financial.budget', 'desc')
  .get();

// Projects using specific technology
const aiProjects = await db.collection('projects')
  .where('technologies', 'array-contains', techIdForAI)
  .get();
```

**4. Good and Bad Relationships**

```typescript
// All good relationships for an office
const goodRelationships = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'foster-partners')
  .where('sentiment', '==', 'positive')
  .orderBy('strength', 'desc')
  .get();

// Bad relationships (competitors, failed partnerships)
const badRelationships = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'foster-partners')
  .where('sentiment', '==', 'negative')
  .get();

// Strongest client relationships
const topClients = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'zaha-hadid-architects')
  .where('relationshipType', '==', 'client-of')
  .where('strength', '>=', 8)
  .orderBy('strength', 'desc')
  .get();

// Competitor relationships
const competitors = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'oma')
  .where('relationshipType', '==', 'competitor')
  .orderBy('strength', 'desc')
  .get();
```

**5. Office History**

```typescript
// Complete history of an office
const officeHistory = await db.collection('archHistory')
  .where('entityType', '==', 'office')
  .where('entityId', '==', 'zaha-hadid-architects')
  .orderBy('date', 'desc')
  .get();

// Significant events for an office
const significantEvents = await db.collection('archHistory')
  .where('entityType', '==', 'office')
  .where('entityId', '==', 'foster-partners')
  .where('significance', '>=', 7)
  .orderBy('significance', 'desc')
  .get();

// Awards and recognition
const awards = await db.collection('archHistory')
  .where('entityType', '==', 'office')
  .where('entityId', '==', 'big')
  .where('eventType', '==', 'award')
  .orderBy('date', 'desc')
  .get();

// Acquisitions timeline
const acquisitions = await db.collection('archHistory')
  .where('eventType', '==', 'acquisition')
  .orderBy('date', 'desc')
  .get();
```

**6. Complex Multi-Collection Queries**

```typescript
// "Which offices in London have the most active projects and who are their top clients?"

// Step 1: Get London offices
const londonOffices = await db.collection('offices')
  .where('location.headquarters.city', '==', 'London')
  .get();

// Step 2: For each office, get connection counts (denormalized!)
const officesWithCounts = londonOffices.docs.map(doc => ({
  id: doc.id,
  name: doc.data().name,
  activeProjects: doc.data().connectionCounts.activeProjects,
  clients: doc.data().connectionCounts.clients
})).sort((a, b) => b.activeProjects - a.activeProjects);

// Step 3: For top office, get their client relationships
const topOffice = officesWithCounts[0];
const clientRelationships = await db.collection('relationships')
  .where('sourceEntity.id', '==', topOffice.id)
  .where('relationshipType', '==', 'client-of')
  .orderBy('strength', 'desc')
  .limit(5)
  .get();

// Step 4: Get actual client details
const clientIds = clientRelationships.docs.map(doc => 
  doc.data().targetEntity.id
);
const clients = await Promise.all(
  clientIds.map(id => db.collection('clients').doc(id).get())
);
```

```typescript
// "Show me the competitive landscape for parametric design specialists"

// Step 1: Find offices specializing in parametric design
const parametricOffices = await db.collection('offices')
  .where('specializations', 'array-contains', 'parametric-design')
  .get();

// Step 2: Get competitive analysis for these offices
const analyses = await Promise.all(
  parametricOffices.docs.map(doc =>
    db.collection('competitiveAnalysis')
      .where('officeId', '==', doc.id)
      .orderBy('lastUpdated', 'desc')
      .limit(1)
  .get()
  )
);

// Step 3: Aggregate competitive relationships
const allCompetitors = new Set();
analyses.forEach(analysis => {
  if (!analysis.empty) {
    const competitors = analysis.docs[0].data().competitors;
    competitors.forEach(c => allCompetitors.add(c.officeId));
  }
});

// Step 4: Get network positions
const networkPositions = await Promise.all(
  Array.from(allCompetitors).map(officeId =>
    db.collection('networkGraph')
      .where('nodeType', '==', 'office')
      .where('entityId', '==', officeId)
      .limit(1)
      .get()
  )
);
```

```typescript
// "What are the current trends affecting sustainable architecture projects?"

// Step 1: Get sustainability-related trends
const sustainabilityTrends = await db.collection('trends')
  .where('scope.segments', 'array-contains', 'sustainable-architecture')
  .where('metrics.trajectory', 'in', ['rising', 'peaking'])
  .orderBy('metrics.strength', 'desc')
  .get();

// Step 2: Get affected projects
const affectedProjectIds = new Set();
sustainabilityTrends.docs.forEach(doc => {
  doc.data().impact.affectedProjects.forEach(id => 
    affectedProjectIds.add(id)
  );
});

// Step 3: Get project details
const projects = await Promise.all(
  Array.from(affectedProjectIds).slice(0, 20).map(id =>
    db.collection('projects').doc(id).get()
  )
);

// Step 4: Group by office to see who's leading
const projectsByOffice = {};
projects.forEach(project => {
  const officeId = project.data().officeId;
  if (!projectsByOffice[officeId]) {
    projectsByOffice[officeId] = [];
  }
  projectsByOffice[officeId].push(project.data());
});
```

### AI Orchestrator Integration Patterns

**User:** "What's the market consolidation status in London?"

**AI Query Flow:**
```typescript
// Get London city entity (Tier 1)
const london = await db.collection('cities').doc('london-uk').get();
const cityData = london.data();

// Get detailed enrichment (Tier 3)
const londonDetails = await db.collection('cityData').doc('london-uk').get();

return {
  city: cityData.cityName,
  marketSize: cityData.marketProfile.marketSize,
  growthRate: cityData.marketProfile.growthRate,
  consolidationStatus: cityData.marketProfile.status,
  hhiIndex: cityData.consolidation.hhiIndex,
  cr4: cityData.consolidation.cr4 + '%',
  activeOffices: cityData.consolidation.activeOffices,
  demographics: londonDetails.data().demographics,
  economicContext: londonDetails.data().economic
};
```

**User:** "Which cities have the most consolidated markets?"

**AI Query Flow:**
```typescript
// Query cities by HHI index
const consolidatedCities = await db.collection('cities')
  .where('consolidation.hhiIndex', '>=', 2500)
  .orderBy('consolidation.hhiIndex', 'desc')
  .limit(10)
  .get();

return {
  mostConsolidated: consolidatedCities.docs.map(doc => ({
    city: doc.data().cityName,
    country: doc.data().country,
    hhiIndex: doc.data().consolidation.hhiIndex,
    cr4: doc.data().consolidation.cr4,
    status: doc.data().consolidation.status,
    activeOffices: doc.data().consolidation.activeOffices
  }))
};
```

**User:** "Show me Foster + Partners' biggest competitors"

**AI Query Flow:**
```typescript
// 1. Get competitive analysis
const analysis = await db.collection('competitiveAnalysis')
  .where('officeId', '==', 'foster-partners')
  .orderBy('lastUpdated', 'desc')
  .limit(1)
  .get();

const competitors = analysis.docs[0].data().competitors;

// 2. Get competitor details
const competitorOffices = await Promise.all(
  competitors.slice(0, 5).map(c => 
    db.collection('offices').doc(c.officeId).get()
  )
);

// 3. Return formatted response
return {
  primaryOffice: 'Foster + Partners',
  topCompetitors: competitorOffices.map(doc => ({
    name: doc.data().name,
    competitionLevel: competitors.find(c => c.officeId === doc.id).competitionLevel,
    sharedMarkets: competitors.find(c => c.officeId === doc.id).sharedMarkets
  }))
};
```

**User:** "What's the market share for luxury residential in Dubai?"

**AI Query Flow:**
```typescript
// Single query to intelligence layer
const marketData = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'market-share')
  .where('scope.region', '==', 'dubai')
  .where('scope.segment', '==', 'luxury-residential')
  .orderBy('generatedAt', 'desc')
  .limit(1)
  .get();

// Instant answer from pre-computed data
return {
  segment: 'Luxury Residential',
  region: 'Dubai',
  leaders: marketData.docs[0].data().marketShare.leaders,
  generatedAt: marketData.docs[0].data().generatedAt
};
```

**User:** "Which offices have the strongest supplier relationships?"

**AI Query Flow:**
```typescript
// Query relationship graph for supplier connections
const supplierRelationships = await db.collection('relationships')
  .where('relationshipType', '==', 'supplier-to')
  .where('strength', '>=', 8)
  .where('sentiment', '==', 'positive')
  .orderBy('strength', 'desc')
  .get();

// Group by office
const officeSupplierCounts = {};
supplierRelationships.docs.forEach(doc => {
  const officeId = doc.data().sourceEntity.id;
  if (!officeSupplierCounts[officeId]) {
    officeSupplierCounts[officeId] = { count: 0, avgStrength: 0, relationships: [] };
  }
  officeSupplierCounts[officeId].count++;
  officeSupplierCounts[officeId].relationships.push(doc.data().strength);
});

// Calculate averages and sort
Object.keys(officeSupplierCounts).forEach(officeId => {
  const relationships = officeSupplierCounts[officeId].relationships;
  officeSupplierCounts[officeId].avgStrength = 
    relationships.reduce((a, b) => a + b, 0) / relationships.length;
});

// Get top offices
const topOfficeIds = Object.entries(officeSupplierCounts)
  .sort((a, b) => b[1].avgStrength - a[1].avgStrength)
  .slice(0, 10)
  .map(([id, _]) => id);

// Get office details
const offices = await Promise.all(
  topOfficeIds.map(id => db.collection('offices').doc(id).get())
);

return offices.map((office, i) => ({
  name: office.data().name,
  strongSuppliers: officeSupplierCounts[office.id].count,
  avgRelationshipStrength: officeSupplierCounts[office.id].avgStrength
}));
```

**User:** "Show me recent news about Foster + Partners"

**AI Query Flow:**
```typescript
// Query news articles mentioning Foster + Partners
const news = await db.collection('newsArticles')
  .where('entities.offices', 'array-contains', 'GBLO127')  // Foster + Partners ID
  .orderBy('publishedDate', 'desc')
  .limit(10)
  .get();

return {
  office: 'Foster + Partners',
  articles: news.docs.map(doc => ({
    title: doc.data().title,
    source: doc.data().source.outletName,
    date: doc.data().publishedDate,
    category: doc.data().category,
    sentiment: doc.data().sentiment,
    url: doc.data().url
  }))
};
```

**User:** "What are the latest M&A announcements in architecture?"

**AI Query Flow:**
```typescript
// Get recent M&A news
const maNews = await db.collection('newsArticles')
  .where('category', '==', 'M&A')
  .orderBy('publishedDate', 'desc')
  .limit(20)
  .get();

// Extract deal information from AI-parsed data
return {
  recentAcquisitions: maNews.docs.map(doc => {
    const data = doc.data();
    return {
      title: data.title,
      acquirer: data.entities.offices[0],
      target: data.entities.offices[1],
      dealValue: data.extractedData.dealValue,
      date: data.publishedDate,
      source: data.source.outletName,
      articleUrl: data.url
    };
  })
};
```

**User:** "What building codes apply to a commercial project in London?"

**AI Query Flow:**
```typescript
// Get all regulations that apply to London commercial projects
// Hierarchical: International → UK National → England State → London City

// 1. Get UK national building codes
const nationalCodes = await db.collection('regulations')
  .where('jurisdiction.level', '==', 'national')
  .where('jurisdiction.country', '==', 'GB')
  .where('jurisdiction.scope.appliesToProjectTypes', 'array-contains', 'commercial')
  .orderBy('effectiveDate', 'desc')
  .get();

// 2. Get London-specific codes
const londonCodes = await db.collection('regulations')
  .where('jurisdiction.cityId', '==', 'london-uk')
  .where('jurisdiction.scope.appliesToProjectTypes', 'array-contains', 'commercial')
  .orderBy('effectiveDate', 'desc')
  .get();

// 3. Combine and show hierarchy
return {
  project: 'Commercial in London',
  regulations: {
    national: nationalCodes.docs.map(doc => ({
      name: doc.data().name,
      type: doc.data().regulationType,
      mandatory: doc.data().compliance.mandatory,
      complianceCost: doc.data().compliance.complianceCost
    })),
    city: londonCodes.docs.map(doc => ({
      name: doc.data().name,
      type: doc.data().regulationType,
      parentRegulation: doc.data().hierarchy.parentRegulation,
      mandatory: doc.data().compliance.mandatory
    }))
  }
};
```

**User:** "What are all fire safety regulations in the United States?"

**AI Query Flow:**
```typescript
// Get all US fire safety regulations (national + state + city)
const usFireRegs = await db.collection('regulations')
  .where('jurisdiction.country', '==', 'US')
  .where('regulationType', '==', 'fire-safety')
  .orderBy('effectiveDate', 'desc')
  .get();

// Group by jurisdiction level
const grouped = {
  national: [],
  state: [],
  city: []
};

usFireRegs.docs.forEach(doc => {
  const data = doc.data();
  grouped[data.jurisdiction.level].push({
    name: data.name,
    jurisdiction: data.jurisdiction.state || data.jurisdiction.cityName || 'Federal',
    effectiveDate: data.effectiveDate,
    requirements: data.requirements.length
  });
});

return {
  country: 'United States',
  regulationType: 'fire-safety',
  total: usFireRegs.size,
  byLevel: grouped
};
```

---

## Relationships Between Collections - The 4-Tier Model

### How Tiers Connect

```
TIER 1: PRIMARY ENTITIES
offices, projects, regulations
   ↓ (referenced by)
   ↓
TIER 2: CONNECTIVE TISSUE
relationships (connects entities), archHistory (temporal context), networkGraph (metrics)
   ↓ (enriches)
   ↓
TIER 3: DETAILED DATA
clients, workforce, technology, financials, supplyChain, landData, cityData, companyStructure, divisionPercentages
   ↓ (feeds into)
   ↓
TIER 4: MARKET INTELLIGENCE
marketIntelligence, trends, competitiveAnalysis, financialMetrics (computed from all above)
```

### Tier 1: Primary Entity References

**Direct References:**
- `cities.activeOffices[]` → `offices.id` (CCccNNN)
- `cities.activeProjects[]` → `projects.id`
- `cities.regulations[]` → `regulations.id`
- `offices.location.headquarters.city` → implicit city reference
- `projects.location.city` → implicit city reference
- `projects.officeId` → `offices.id` (CCccNNN)
- `projects.clientId` → `clients.id`
- `projects.landParcelId` → `landData.id`
- `projects.regulations[]` → `regulations.id`

### Tier 2: Connective Tissue References

**Relationships Collection (connects ANY entities):**
- Office → Office (competitor, collaborator, acquired, merged)
- Office → Client (client-of, with sentiment and strength)
- Office → Supplier (supplier-to, with quality metrics)
- Project → Project (influenced-by, part-of-series)
- Office → Regulation (affected-by)

**ArchHistory Collection (temporal connections):**
- `archHistory.entityId` → any Tier 1 entity
- `consolidationEvent.acquirerOfficeId` → `offices.id`
- `consolidationEvent.targetOfficeId` → `offices.id`

**NetworkGraph Collection (computed connections):**
- `networkGraph.entityId` → any Tier 1 entity
- Computed FROM `relationships` collection

### Tier 3: Detailed Data References

All Tier 3 collections reference back to Tier 1:

```
clients.projects[] → projects.id
clients.preferredOffices[] → offices.id

workforce.officeId → offices.id

technology.officeId → offices.id
technology.relatedProjects[] → projects.id

financials.officeId → offices.id
financials.projectId → projects.id (optional)

supplyChain.relationships[].officeId → offices.id
supplyChain.relationships[].projects[] → projects.id

landData.relatedProjects[] → projects.id
landData.applicableRegulations[] → regulations.id

cityData.cityId → cities.id (1:1 enrichment relationship)
cityData.trends[] → trends.id
cityData.newsArticles[] → newsArticles.id

companyStructure.officeId → offices.id (1:1)

divisionPercentages.officeId → offices.id

newsArticles.entities.offices[] → offices.id
newsArticles.entities.projects[] → projects.id
newsArticles.entities.cities[] → cityData.id
newsArticles.usedInCollections.archHistory[] → archHistory.id
newsArticles.usedInCollections.trends[] → trends.id
newsArticles.usedInCollections.relationships[] → relationships.id
```

### Tier 4: Market Intelligence References

Tier 4 collections aggregate/compute from Tiers 1, 2, and 3:

```
marketIntelligence
  - Computed FROM: Tier 1 (offices, projects), Tier 2 (relationships), Tier 3 (financials)
  - References: offices.id in leaders array
  - Purpose: Market consolidation metrics (HHI, Gini, CR4)

trends
  - Computed FROM: All Tier 3 collections + Tier 2 (archHistory)
  - References: affectedOffices[], affectedProjects[]
  - Purpose: Industry trend detection

competitiveAnalysis
  - Computed FROM: Tier 2 (relationships), Tier 1 (projects), Tier 3 (financials)
  - References: officeId, competitors[].officeId
  - Purpose: SWOT and competitive positioning

financialMetrics
  - Computed FROM: Tier 3 (financials collection)
  - References: officeId
  - Purpose: Performance KPIs and market comparison
```

### Reference Patterns

**1. Direct References (Foreign Keys)**
```typescript
// Simple 1:many relationship
project.officeId = "zaha-hadid-architects"
```

**2. Array References (Many:Many)**
```typescript
// Project uses multiple technologies
project.technologies = ["tech-id-1", "tech-id-2", "tech-id-3"]
```

**3. Explicit Graph Edges**
```typescript
// Relationship with metadata
relationship = {
  sourceEntity: { type: "office", id: "foster-partners" },
  targetEntity: { type: "office", id: "zaha-hadid-architects" },
  relationshipType: "competitor",
  strength: 8,
  sentiment: "neutral"
}
```

**4. Denormalized Counts (Performance)**
```typescript
// Pre-computed counts on office doc
office.connectionCounts = {
  totalProjects: 145,
  activeProjects: 23,
  clients: 67,
  competitors: 12,
  suppliers: 34
}
// Updated whenever relationships change
```

### Graph Traversal Patterns

**Pattern 1: Find all connections of an entity**
```typescript
const connections = await db.collection('relationships')
  .where('sourceEntity.id', '==', entityId)
  .get();
```

**Pattern 2: Find specific relationship type**
```typescript
const competitors = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'oma')
  .where('relationshipType', '==', 'competitor')
  .get();
```

**Pattern 3: Bidirectional search (A→B or B→A)**
```typescript
// Get all relationships involving an entity (either direction)
const batch1 = db.collection('relationships')
  .where('sourceEntity.id', '==', entityId)
  .get();

const batch2 = db.collection('relationships')
  .where('targetEntity.id', '==', entityId)
  .get();

const [forward, reverse] = await Promise.all([batch1, batch2]);
const allRelationships = [...forward.docs, ...reverse.docs];
```

**Pattern 4: Path finding (A→B→C)**
```typescript
// Find offices connected through shared clients
// Step 1: Get office A's clients
const officeAClients = await db.collection('relationships')
  .where('sourceEntity.id', '==', 'office-a')
  .where('relationshipType', '==', 'client-of')
  .get();

const clientIds = officeAClients.docs.map(doc => 
  doc.data().targetEntity.id
);

// Step 2: Find other offices with same clients
const officesWithSharedClients = await Promise.all(
  clientIds.map(clientId =>
    db.collection('relationships')
      .where('targetEntity.id', '==', clientId)
      .where('relationshipType', '==', 'client-of')
      .get()
  )
);
// Filter out office-a, remaining offices are connected via shared clients
```

**Pattern 5: Network metrics (use precomputed networkGraph)**
```typescript
// Instead of computing on every query, use precomputed graph
const officeNode = await db.collection('networkGraph')
  .where('nodeType', '==', 'office')
  .where('entityId', '==', 'foster-partners')
  .limit(1)
  .get();

const metrics = officeNode.docs[0].data();
console.log(`
  Total connections: ${metrics.connections.totalConnections}
  Influence score: ${metrics.centrality.influence}
  Network clusters: ${metrics.clusters}
  Top connections: ${metrics.connections.topConnections}
`);

---

## Summary: Complete Collection List

### 31 Collections Across 4 Tiers

**TIER 1: PRIMARY ENTITIES (3 collections - The Big Entities)**
1. `cities` - Geographic markets (core market profile, consolidation metrics)
2. `offices` - Architecture offices (PRIMARY with CCccNNN IDs, core info: name, size, founded)
3. `projects` - Building projects (basic shell: name, location, timeline, budget)

**TIER 2: CONNECTIVE TISSUE (3 collections - Links & Context)**
4. `relationships` - Explicit graph edges connecting any entities (competitor, client, supplier, etc.)
5. `archHistory` - Timeline events, M&A, awards, milestones (temporal connections)
6. `networkGraph` - Precomputed connection metrics, centrality, influence (relational analytics)

**TIER 3: DETAILED DATA (20 collections - Enrichment + External Forces)**

*Enrichment Attributes (13 collections):*
7. `clients` - Client details (enriches offices/projects with client info)
8. `workforce` - Talent, employees (enriches offices with people data)
9. `technology` - Tech adoption (enriches offices with innovation data)
10. `financials` - Transactions, revenue (enriches offices with financial data)
11. `supplyChain` - Suppliers, materials (enriches projects with supply data)
12. `landData` - Land parcels (enriches projects with site data)
13. `cityData` - Detailed demographics, cultural context (enriches Tier 1 cities)
14. `regulations` - Laws, codes, zoning (rules/constraints for projects and cities)
15. `projectData` - Comprehensive execution data (enriches Tier 1 projects with vision, team, performance, legacy)
16. `companyStructure` - Org charts (enriches offices with structure)
17. `divisionPercentages` - Analytics breakdowns (enriches offices with metrics)
18. `newsArticles` - News & media coverage (enriches entities with news evidence and sources)
19. `politicalContext` - Governance, planning authority, institutional clients (political & institutional landscape)

*External Forces Data (7 collections):*
20. `externalMacroeconomic` - Interest rates, inflation, GDP, capital flows (raw economic data)
21. `externalSupplyChain` - Material prices, lead times, labor availability (raw supply data)
22. `externalClimate` - Climate risks, adaptation needs, sustainability targets (raw environmental data)
23. `externalTechnology` - Remote work impact, tech adoption rates, automation (raw tech disruption data)
24. `externalDemographics` - Population, migration, income, cultural movements (raw demographic data)
25. `externalPolicy` - Political stability, tariffs, incentives, regulations (raw policy data)
26. `externalEvents` - Global crises, wars, pandemics, disruptions (raw event data)

**TIER 4: MARKET INTELLIGENCE (5 collections - Consolidation & Market Analytics)**
27. `marketIntelligence` - HHI, Gini, consolidation metrics (market-specific computed data)
28. `trends` - Industry trends (market dynamics tracking)
29. `competitiveAnalysis` - SWOT, positioning (market competition data)
30. `financialMetrics` - KPIs, performance (market financial analysis)
31. `externalForcesImpact` - External forces impact analysis, scenario planning (computed from Tier 3 external forces)

**Total: 31 collections** (3 primary + 3 connective + 20 detailed + 5 market intelligence)

---

## Why This Beats the Old Structure

### Old Structure Problems:
1. ❌ `notes` collection was trying to do everything (16 categories in one collection)
2. ❌ Two overlapping collections: `regulatory` AND `regulations`
3. ❌ No explicit relationship tracking - relationships buried in arrays
4. ❌ No historical timeline - just founding dates
5. ❌ No market intelligence - would require expensive real-time aggregations
6. ❌ No network analysis - couldn't answer "who's most influential?"
7. ❌ Trend tracking would be manual and expensive

### New Structure Benefits:
1. ✅ **Clear separation**: Core entities, operational data, intelligence
2. ✅ **Graph-first**: Explicit `relationships` collection enables network analysis
3. ✅ **Historical intelligence**: `archHistory` tracks timeline of events
4. ✅ **Performance**: Pre-computed intelligence layer (Tier 3) for instant queries
5. ✅ **Scalability**: Each collection has single responsibility
6. ✅ **AI-ready**: Structure designed for AI orchestrator queries
7. ✅ **Market tracking**: Dedicated collections for trends, consolidation, competition
8. ✅ **Connection tracking**: Good/bad relationships explicitly tracked with sentiment
9. ✅ **Denormalization where needed**: `connectionCounts` on offices for fast lookups
10. ✅ **All 16 categories present**: Nothing lost, everything better organized
11. ✅ **External Forces Tracking**: 7 collections capture market-wide conditions affecting all players

---

## External Forces Architecture

### What Are External Forces?

External forces are **market-wide conditions outside any single actor's control** that affect all players in the architecture market. Think of them as "the weather" - everyone operates within these conditions but no one controls them.

### The Key Distinction

**INTERNAL DATA (Tiers 1-2 + most of Tier 3):**
- Office-specific: "Zaha Hadid Architects has 400 employees"
- Project-specific: "This building costs $50M"
- Relationship-specific: "These two firms compete"

**EXTERNAL FORCES DATA (Tier 3: 7 Collections):**
- Market-wide: "Interest rates are 5.25% and rising"
- Systemic: "Steel prices are up 45%, 180-day lead times"
- Environmental: "London faces high flood risk"

**EXTERNAL FORCES IMPACT (Tier 4: 1 Collection):**
- Analyzed: "Rising rates reducing luxury starts by 30%"
- Synthesized: "Steel shortage + high rates = severe impact on luxury segment"
- Strategic: "Scenario: if rates drop to 3.5%, market recovers in 6-9 months"

### The 7 External Forces Categories

#### 1. **Macroeconomic Forces** (`/externalMacroeconomic`)
**What:** The big economy-wide numbers that create the financial environment

**Data Types:**
- Interest rates (%, trend, change rate)
- Inflation (overall, construction-specific, materials, labor)
- GDP growth (%, economic cycle phase)
- Capital flows (FDI, lending volumes, approval rates)
- Exchange rates (strength, volatility)

**Sources:** Central banks, statistics offices, financial data services

**Update Frequency:** Daily (rates), Monthly (inflation), Quarterly (GDP)

**Impact:** Affects project financing, construction costs, development feasibility

#### 2. **Supply Chain Forces** (`/externalSupplyChain`)
**What:** Availability and cost of physical inputs to construction

**Data Types:**
- Material prices (indexes, % changes)
- Material availability (abundant → scarce)
- Lead times (days, comparison to normal)
- Labor availability (shortage levels by trade)
- Wage rates ($/hour, inflation %)
- Logistics costs (shipping, trucking indexes)
- Manufacturing capacity (utilization %)

**Sources:** Commodity exchanges, industry associations, labor bureaus

**Update Frequency:** Weekly (prices), Monthly (availability, labor)

**Impact:** Direct effect on project costs, timelines, material choices

#### 3. **Climate & Environmental Forces** (`/externalClimate`)
**What:** Physical/natural world conditions and environmental pressures

**Data Types:**
- Climate risk levels (low → severe by hazard type)
- Hazard frequency (events per period)
- Insurance cost impacts (% increases)
- Adaptation costs ($ per project, total city investment)
- Carbon limits (kgCO2e/m²)
- Net-zero targets (year, progress %)
- Resource constraints (water, land, waste capacity)

**Sources:** Climate agencies (NOAA, IPCC), insurance firms, environmental authorities

**Update Frequency:** Annually (risk assessments), After major events

**Impact:** Where/how you can build, design requirements, costs

#### 4. **Technology Disruption Forces** (`/externalTechnology`)
**What:** Industry-wide technology shifts changing how work gets done

**Data Types:**
- Remote work impact (office vacancy %, rent changes)
- Conversion activity (office-to-residential counts)
- Tech adoption rates (BIM, prefab, drones, AI %)
- Automation penetration (robots deployed, % of work)
- EV adoption (%, charging infrastructure needs)

**Sources:** Real estate data providers, industry surveys, trade associations

**Update Frequency:** Quarterly (real estate), Annually (tech adoption)

**Impact:** What building types are needed, how construction is done

#### 5. **Demographic & Social Forces** (`/externalDemographics`)
**What:** Population trends and societal attitudes shaping demand

**Data Types:**
- Population (total, growth %, projections)
- Migration (net migration, sources)
- Age distribution (% by cohort)
- Household composition (size, types)
- Income distribution (Gini coefficient, median)
- Cultural movements (gentrification resistance strength, tactics)
- Lifestyle preferences (urban vs suburban, aesthetics)

**Sources:** Census, demographic research, surveys, news monitoring

**Update Frequency:** Annually (demographics), Quarterly (movements)

**Impact:** What to build, where to build, community acceptance

#### 6. **Policy & Political Forces** (`/externalPolicy`)
**What:** Government actions and political environment affecting business climate

**Data Types:**
- Political stability (index 1-10, trend)
- Regulatory trend (tightening/relaxing)
- New regulations count (per period)
- Tariffs (% by material)
- Tax incentives (value, eligibility, utilization %)
- Affordable housing mandates (% requirements)
- Permit processing times (months, approval rates)
- Immigration policy (visa availability, impact on labor)

**Sources:** Government agencies, political risk firms, planning departments

**Update Frequency:** Quarterly, As policies change

**Impact:** Regulatory burden, costs, project feasibility

#### 7. **Global Events & Crises** (`/externalEvents`)
**What:** Acute disruptions from wars, pandemics, disasters

**Data Types:**
- Event type (pandemic, war, disaster, crisis)
- Status (ongoing, resolved, escalating)
- Severity (minor → catastrophic)
- Impacts (material supply, energy, labor, investment)
- Affected cities (city IDs)
- Recovery timeline (estimated)
- Permanent shifts (lasting changes)

**Sources:** News monitoring, geopolitical analysts, emergency management

**Update Frequency:** As events occur

**Impact:** Sudden supply disruptions, market shocks, lasting changes

---

### External Forces Impact Analysis (`/externalForcesImpact`)

This Tier 4 collection **synthesizes** the 7 raw external forces collections into **actionable intelligence**:

**What it contains:**
1. **Overall market conditions** - Current state rating and trend
2. **Top drivers** - Which external forces are most impactful right now
3. **Compounding effects** - How multiple forces interact (e.g., high rates + material shortage)
4. **Segment impacts** - How each market segment is affected
5. **Office-specific impacts** - Which offices are most exposed
6. **Scenario planning** - What-if analysis with probabilities
7. **Historical comparison** - How conditions have changed
8. **Outlook** - Forward-looking assessment

**How it's computed:**
- Combines data from all 7 external forces collections
- Cross-references with offices, projects, marketIntelligence
- Analyst input for qualitative assessment
- Updated quarterly or when major forces shift

**Example Query:**
"What's affecting London's luxury residential market?"

→ Queries `externalForcesImpact` → Instant answer:
- Rising interest rates (5.25%) = -30% project starts
- Steel shortage (+45% cost) = +18% average project cost
- Combined effect = "severe" impact
- Outlook: "Deteriorating until rate cuts (earliest mid-2025)"

---

### Data Flow: External Forces

```
TIER 3: RAW DATA (What IS)
┌─────────────────────────────────┐
│ externalMacroeconomic           │ → Interest rates: 5.25%
│ externalSupplyChain             │ → Steel: constrained, +45%
│ externalClimate                 │ → Flood risk: high
│ externalTechnology              │ → Office vacancy: 18.5%
│ externalDemographics            │ → Population: +2.1%/year
│ externalPolicy                  │ → Regulatory: tightening
│ externalEvents                  │ → War: ongoing, severe
└─────────────────────────────────┘
            ↓
      Data ingestion from
      external sources
            ↓
TIER 4: ANALYZED IMPACT (What it MEANS)
┌─────────────────────────────────┐
│ externalForcesImpact            │
├─────────────────────────────────┤
│ • Market conditions: challenging│
│ • Top driver: interest rates    │
│ • Impact: -30% project starts   │
│ • Affected: luxury segment      │
│ • Scenario: rate drop = recovery│
│ • Outlook: deteriorating        │
└─────────────────────────────────┘
            ↓
      Used by AI to answer:
      "Why is the market slow?"
      "When will it recover?"
      "Which offices are at risk?"
```

### Integration with Existing Collections

**1. Projects Collection - Track External Impacts**
```typescript
{
  projectId: 'luxury-tower-london',
  externalImpacts: [
    {
      factorType: 'material-shortage',
      factorId: 'steel',
      impactType: 'delay',
      severity: 'major',
      quantifiedImpact: {
        costDelta: 2500000,  // +$2.5M
        scheduleDelta: 135,   // +135 days
        description: 'Steel lead time 180 days vs normal 60'
      },
      mitigationStrategy: 'Early procurement, alternative suppliers',
      dateIdentified: Timestamp
    }
  ]
}
```

**2. Trends Collection - Link to External Forces**
```typescript
{
  trendId: 'steel-shortage-2024',
  trendType: 'supply-chain',
  externalForceDriver: {
    category: 'supplyChain',
    specific: 'materials.steel',
    changeDirection: 'deteriorating'
  },
  impact: {
    affectedOffices: ['GBLO482', 'GBLO127'],
    adaptationStrategies: [
      { strategy: 'Substitution to timber', effectiveness: 'high' }
    ]
  }
}
```

**3. Market Intelligence - Reference External Context**
```typescript
{
  analysisId: 'london-luxury-2024-q4',
  analysisType: 'market-share',
  externalFactors: {
    primaryDrivers: ['interestRates', 'materials.steel'],
    impactAnalysis: 'Rising rates + material costs = 55% drop in starts',
    projectedInfluence: 'High - external forces dominating market'
  }
}
```

---

### Query Patterns for External Forces

**Get all external conditions for a city:**
```typescript
// Get all 7 external forces for London Q4 2024
const [macro, supply, climate, tech, demo, policy, events] = await Promise.all([
  db.collection('externalMacroeconomic').doc('london-uk-2024-q4').get(),
  db.collection('externalSupplyChain').doc('london-uk-2024-q4').get(),
  db.collection('externalClimate').doc('london-uk-2024').get(),
  db.collection('externalTechnology').doc('london-uk-2024').get(),
  db.collection('externalDemographics').doc('london-uk-2024').get(),
  db.collection('externalPolicy').doc('london-uk-2024-q4').get(),
  db.collection('externalEvents').doc('europe-2024-q4').get()
]);

// Get the synthesized impact analysis
const impact = await db.collection('externalForcesImpact')
  .doc('london-uk-2024-q4').get();
```

**Find constrained materials:**
```typescript
const london = await db.collection('externalSupplyChain')
  .doc('london-uk-2024-q4').get();

const constrained = london.data().materials.filter(m => 
  m.availability === 'constrained' || m.availability === 'scarce'
);
// Returns: steel, aluminum, etc. with price impacts and lead times
```

**Get top market drivers:**
```typescript
const impact = await db.collection('externalForcesImpact')
  .doc('london-uk-2024-q4').get();

const topDrivers = impact.data().topDrivers;
// Returns: [
//   { force: 'interestRates', impact: 'high', direction: 'negative' },
//   { force: 'materials.steel', impact: 'high', direction: 'negative' }
// ]
```

**Scenario planning:**
```typescript
const impact = await db.collection('externalForcesImpact')
  .doc('london-uk-2024-q4').get();

const scenarios = impact.data().scenarios;
// Returns multiple scenarios with probabilities:
// - Rate drop (40% probability): +45% project starts
// - Prolonged high rates (35%): -40% market contraction
```

---

### Update Strategy

**Automated Updates (via Cloud Functions/scheduled tasks):**
- **externalMacroeconomic**: Daily (interest rates), Monthly (inflation), Quarterly (GDP)
- **externalSupplyChain**: Weekly (prices), Monthly (availability)
- **externalClimate**: Annually, After major events
- **externalTechnology**: Quarterly (real estate data), Annually (tech adoption)
- **externalDemographics**: Annually
- **externalPolicy**: As policies change
- **externalEvents**: As events occur

**Computed Updates:**
- **externalForcesImpact**: Recomputed quarterly, or when major external forces change significantly

**Data Sources:**
- APIs: Central banks, commodity exchanges, real estate data providers
- Scraping: News for events, regulatory announcements
- Manual: Analyst assessment, scenario planning, qualitative impacts

---

### Why This Architecture Works

**1. Separation of Facts from Analysis**
- Tier 3 = What IS (objective data from sources)
- Tier 4 = What it MEANS (analyzed implications)

**2. Reusable Raw Data**
- Same external forces data can feed multiple analyses
- Don't need to re-collect data for different questions

**3. Clear Data Lineage**
- Know where every insight comes from
- Can trace analysis back to source data

**4. Update Efficiency**
- Update raw data on its natural schedule
- Recompute analysis only when needed

**5. Scalability**
- Add new cities by creating their external forces docs
- Add new force categories without restructuring

**6. AI-Friendly**
- AI can query raw data for detailed facts
- AI can query impact analysis for strategic insights
- Structure enables natural language Q&A

---

## Data Update Patterns

### When a Project is Created:

```typescript
// 1. Create project document
const projectRef = await db.collection('projects').add(projectData);

// 2. Create office→project relationship
await db.collection('relationships').add({
  sourceEntity: { type: 'office', id: projectData.officeId },
  targetEntity: { type: 'project', id: projectRef.id },
  relationshipType: 'creator',
  strength: 10,
  sentiment: 'positive',
  startDate: Timestamp.now()
});

// 3. Update office connection counts (denormalized)
const officeRef = db.collection('offices').doc(projectData.officeId);
await officeRef.update({
  'connectionCounts.totalProjects': FieldValue.increment(1),
  'connectionCounts.activeProjects': FieldValue.increment(1)
});

// 4. Update city data if new to city
const cityRef = db.collection('cityData').doc(projectData.location.city);
await cityRef.update({
  activeProjects: FieldValue.arrayUnion(projectRef.id)
});

// 5. Trigger background job to update intelligence layer
// (marketIntelligence, trends, networkGraph will be recomputed)
```

### When a Relationship Changes:

```typescript
// 1. Update or create relationship
const relationshipRef = await db.collection('relationships')
  .doc(relationshipId)
  .set(relationshipData);

// 2. Update connection counts on both entities
if (relationshipData.sourceEntity.type === 'office') {
  await db.collection('offices')
    .doc(relationshipData.sourceEntity.id)
    .update({
      [`connectionCounts.${relationshipData.targetEntity.type}s`]: 
        FieldValue.increment(1)
    });
}

// 3. Trigger networkGraph recomputation
// Run graph algorithms to update centrality, clusters, influence
```

### Periodic Intelligence Updates:

```typescript
// Run nightly/weekly to keep Tier 3 fresh

// 1. Recompute market intelligence
async function updateMarketIntelligence() {
  // Aggregate all projects, financials
  const marketData = await computeMarketShare();
  await db.collection('marketIntelligence').add({
    analysisType: 'market-share',
    scope: { region: 'global', segment: 'all' },
    marketShare: marketData,
    generatedAt: Timestamp.now()
  });
}

// 2. Detect and update trends
async function updateTrends() {
  // Analyze technology adoption over time
  const techTrend = await analyzeTechnologyTrend('AI');
  await db.collection('trends').doc('ai-adoption').set({
    trendType: 'technological',
    metrics: {
      strength: techTrend.strength,
      trajectory: techTrend.trajectory,
      velocity: techTrend.velocity
    },
    lastAnalyzed: Timestamp.now()
  });
}

// 3. Recompute network graph
async function updateNetworkGraph() {
  // Get all relationships
  const relationships = await db.collection('relationships').get();
  
  // Run graph algorithms
  const graphMetrics = computeGraphMetrics(relationships);
  
  // Update each node's metrics
  for (const [nodeId, metrics] of Object.entries(graphMetrics)) {
    await db.collection('networkGraph').doc(nodeId).set(metrics);
  }
}
```

---

## Security Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.admin == true;
    }
    
    // ============ TIER 1: CORE ENTITIES ============
    
    // Offices - read by all, write by admin
    match /offices/{officeName} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Projects - read by all, write by admin
    match /projects/{projectId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Relationships - read by all, write by admin
    match /relationships/{relationshipId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Architecture History - read by all, write by admin
    match /archHistory/{historyId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // ============ TIER 2: OPERATIONAL DATA ============
    
    // All Tier 2 collections: authenticated read, admin write
    match /regulations/{regulationId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /workforce/{workforceId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /technology/{techId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /financials/{financialId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /supplyChain/{supplierId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /landData/{landParcelId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /cityData/{cityId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /companyStructure/{officeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /divisionPercentages/{divisionId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // ============ TIER 3: INTELLIGENCE LAYER ============
    
    // Intelligence data - read by all, write by system only
    match /marketIntelligence/{analysisId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin(); // Or system service account
    }
    
    match /trends/{trendId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /competitiveAnalysis/{analysisId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /financialMetrics/{metricId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /networkGraph/{nodeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Default deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Data Migration & Seeding

### Initial Setup Steps

1. **Create Firebase Project**
   - Set up Firebase project in console
   - Enable Firestore in production mode
   - Configure authentication

2. **Deploy Security Rules**
   - Copy security rules above
   - Deploy via Firebase console or CLI: `firebase deploy --only firestore:rules`

3. **Create Composite Indexes**
   - Deploy indexes via `firestore.indexes.json` or create in console
   - Use index specifications from "Indexing Strategy" section above

4. **Seed Core Entities (Tier 1)**
   - Start with offices (the foundation)
   - Add some projects
   - Create relationship edges
   - Add historical events

5. **Add Operational Data (Tier 2)**
   - Populate based on what data you have
   - Can add incrementally as you collect data

6. **Generate Intelligence Layer (Tier 3)**
   - Run computation scripts to populate
   - Set up periodic updates (Cloud Functions or scheduled tasks)

### Seed Data Structure

```typescript
// Example: Seeding architecture offices (using CCccNNN format)
const seedOffices = [
  {
    id: 'GBLO482',  // CCccNNN: London, UK
    name: 'Zaha Hadid Architects',
    officialName: 'Zaha Hadid Architects Ltd.',
    founded: 1980,
    status: 'active',
    location: {
      headquarters: {
      city: 'London',
      country: 'UK',
      coordinates: new GeoPoint(51.5074, -0.1278)
    },
      otherOffices: []
    },
    size: {
      employeeCount: 400,
      sizeCategory: 'large',
      annualRevenue: 50000000
    },
    specializations: ['parametric-design', 'cultural-architecture', 'luxury-residential'],
    notableWorks: ['heydar-aliyev-center', 'guangzhou-opera-house', 'maxxi-museum'],
    connectionCounts: {
      totalProjects: 0,
      activeProjects: 0,
      clients: 0,
      competitors: 0,
      suppliers: 0
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'GBLO127',  // CCccNNN: London, UK
    name: 'Foster + Partners',
    officialName: 'Foster + Partners Ltd.',
    founded: 1967,
    status: 'active',
    location: {
      headquarters: {
        city: 'London',
        country: 'UK',
        coordinates: new GeoPoint(51.5074, -0.1278)
      },
      otherOffices: ['new-york', 'hong-kong', 'dubai']
    },
    size: {
      employeeCount: 1200,
      sizeCategory: 'global',
      annualRevenue: 150000000
    },
    specializations: ['sustainable-design', 'high-tech', 'skyscrapers'],
    notableWorks: ['apple-park', 'gherkin', 'bloomberg-hq'],
    connectionCounts: {
      totalProjects: 0,
      activeProjects: 0,
      clients: 0,
      competitors: 0,
      suppliers: 0
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  // ... more offices
];

// Seed function
async function seedOffices() {
  const batch = db.batch();
  seedOffices.forEach(office => {
    const ref = db.collection('offices').doc(office.id);
    batch.set(ref, office);
  });
  await batch.commit();
  console.log(`Seeded ${seedOffices.length} offices`);
}
```

```typescript
// Example: Seeding projects
const seedProjects = [
  {
    id: 'heydar-aliyev-center',
    projectName: 'Heydar Aliyev Center',
    officeId: 'GBLO482',  // Zaha Hadid Architects ID
    clientId: 'azerbaijan-government',
    status: 'completed',
    timeline: {
      startDate: Timestamp.fromDate(new Date('2007-01-01')),
      expectedCompletion: Timestamp.fromDate(new Date('2012-05-01')),
      actualCompletion: Timestamp.fromDate(new Date('2012-05-10')),
      phases: ['design', 'planning', 'construction', 'completion']
    },
    location: {
      city: 'Baku',
      country: 'Azerbaijan',
      address: 'Heydar Aliyev Avenue',
      coordinates: new GeoPoint(40.3947, 49.8678)
    },
    financial: {
      budget: 250000000,
      currency: 'USD',
      actualCost: 250000000,
      fundingSources: ['government']
    },
    details: {
      projectType: 'cultural',
      size: 57500,
      description: 'Cultural center with parametric flowing design',
      awards: ['Design Museum Design of the Year 2014']
    },
    landParcelId: 'baku-site-001',
    technologies: ['parametric-design', 'grasshopper'],
    suppliers: [],
    regulations: ['baku-building-code-2007'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  // ... more projects
];
```

```typescript
// Example: Seeding relationships
const seedRelationships = [
  {
    sourceEntity: { type: 'office', id: 'GBLO482' },  // Zaha Hadid Architects
    targetEntity: { type: 'office', id: 'GBLO127' },  // Foster + Partners
    relationshipType: 'competitor',
    strength: 7,
    sentiment: 'neutral',
    startDate: Timestamp.fromDate(new Date('1980-01-01')),
    endDate: null,
    details: {
      context: 'Compete for luxury cultural projects',
      outcomes: ['Both won major museum projects'],
      notes: 'Different stylistic approaches'
    },
    evidence: ['project-id-1', 'project-id-2'],
    tags: ['cultural-architecture', 'high-profile'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  // ... more relationships
];
```

### Migration from Old Structure

If migrating from the old notes-based structure:

```typescript
async function migrateFromOldStructure() {
  // 1. Extract offices from old notes
  const officeNotes = await db.collection('notes')
    .where('category', '==', 'Architecture Offices')
    .get();
  
  for (const doc of officeNotes.docs) {
    const oldData = doc.data();
    const officeId = await generateUniqueOfficeId(
      oldData.city,
      oldData.country,
      db
    );  // Generate CCccNNN ID
    const newOffice = {
      id: officeId,
      name: oldData.architectureOffice,
      // ... map other fields
    };
    await db.collection('offices').doc(officeId).set(newOffice);
  }
  
  // 2. Extract projects from old notes
  const projectNotes = await db.collection('notes')
    .where('category', '==', 'Projects')
    .get();
  
  // ... similar migration logic
  
  // 3. Create relationships from relatedNotes arrays
  // Parse through old relatedNotes fields and create explicit relationships
  
  // 4. Compute initial intelligence layer
  await updateMarketIntelligence();
  await updateNetworkGraph();
}
```

---

## Firestore Configuration for Client-Side

### Firebase Config (works on any machine)
```typescript
// renderer/src/services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth };
```

### Environment Variables (.env.example)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### TypeScript Interfaces

```typescript
// types/firestore.ts

// ============ TIER 1: CORE ENTITIES ============

export interface City {
  id: string;
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
  activeOffices: string[];
  activeProjects: string[];
  regulations: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Office {
  id: string;
  name: string;
  officialName: string;
  founded: number;
  status: 'active' | 'acquired' | 'dissolved';
  location: {
    headquarters: {
      city: string;
      country: string;
      coordinates: GeoPoint;
    };
    otherOffices: string[];
  };
  size: {
    employeeCount: number;
    sizeCategory: 'boutique' | 'medium' | 'large' | 'global';
    annualRevenue: number;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id: string;
  projectName: string;
  officeId: string;
  clientId: string;
  status: 'concept' | 'planning' | 'construction' | 'completed' | 'cancelled';
  timeline: {
    startDate: Timestamp;
    expectedCompletion: Timestamp;
    actualCompletion?: Timestamp;
    phases: string[];
  };
  location: {
    city: string;
    country: string;
    address: string;
    coordinates: GeoPoint;
  };
  financial: {
    budget: number;
    currency: string;
    actualCost?: number;
    fundingSources: string[];
  };
  details: {
    projectType: string;
    size: number;
    description: string;
    awards: string[];
  };
  landParcelId?: string;
  technologies: string[];
  suppliers: string[];
  regulations: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Relationship {
  id: string;
  sourceEntity: {
    type: 'office' | 'project' | 'client' | 'supplier';
    id: string;
  };
  targetEntity: {
    type: 'office' | 'project' | 'client' | 'supplier';
    id: string;
  };
  relationshipType: 'collaborator' | 'competitor' | 'client-of' | 'supplier-to' | 
                    'influenced-by' | 'acquired' | 'merged' | 'partner' | 'subcontractor';
  strength: number; // 1-10
  sentiment: 'positive' | 'neutral' | 'negative';
  startDate: Timestamp;
  endDate?: Timestamp;
  details: {
    context: string;
    outcomes: string[];
    notes: string;
  };
  evidence: string[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ArchHistory {
  id: string;
  eventType: 'founding' | 'award' | 'scandal' | 'acquisition' | 'era' | 'milestone';
  entityType: 'office' | 'project' | 'movement';
  entityId: string;
  date: Timestamp;
  era: 'modernist' | 'postmodern' | 'contemporary' | 'futurist';
  title: string;
  description: string;
  significance: number; // 1-10
  relatedEntities: Array<{
    entityType: string;
    entityId: string;
  }>;
  culturalContext: {
    movements: string[];
    influences: string[];
    legacy: string;
  };
  sources: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ TIER 3: INTELLIGENCE LAYER (examples) ============

export interface MarketIntelligence {
  id: string;
  analysisType: 'market-share' | 'trend' | 'consolidation';
  scope: {
    region: string;
    segment: string;
    timeframe: {
      start: Timestamp;
      end: Timestamp;
    };
  };
  marketShare: {
    leaders: Array<{
      officeId: string;
      share: number;
      change: number;
    }>;
    distribution: Record<string, number>;
  };
  consolidation: {
    acquisitions: Array<{
      acquirer: string;
      target: string;
      date: Timestamp;
    }>;
    partnerships: string[];
    trend: 'consolidating' | 'fragmenting' | 'stable';
  };
  pricing: {
    median: number;
    range: { min: number; max: number };
    trends: string;
    byOffice: Array<{
      officeId: string;
      avgPrice: number;
    }>;
  };
  generatedAt: Timestamp;
  dataPoints: number;
  createdAt: Timestamp;
}

export interface NetworkGraphNode {
  id: string;
  nodeType: 'office' | 'project' | 'client';
  entityId: string;
  connections: {
    totalConnections: number;
    strongConnections: number;
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
  updatedAt: Timestamp;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  publishedDate: Timestamp;
  source: {
    outletName: string;  // "Financial Times", "ArchDaily", "Dezeen"
    author: string;
    credibility: number;  // 1-10 rating
    type: 'news' | 'trade-publication' | 'blog' | 'press-release';
  };
  content: string;
  excerpt: string;
  category: 'M&A' | 'project-announcement' | 'award' | 'scandal' | 'technology' | 'regulation' | 'opinion' | 'market-analysis';
  entities: {
    offices: string[];   // Office IDs (CCccNNN format)
    projects: string[];
    people: string[];
    cities: string[];
  };
  topics: string[];  // consolidation, technology, sustainability, etc.
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number;  // 1-10
  extractedData: {
    mentionedRevenue?: number;
    employeeCount?: number;
    dealValue?: number;
    projectBudget?: number;
    otherMetrics?: Record<string, any>;
  };
  usedInCollections: {
    archHistory: string[];
    trends: string[];
    relationships: string[];
    marketIntelligence: string[];
  };
  tags: string[];
  language: string;  // en, es, fr, etc.
  imageUrl?: string;
  scrapedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ Design database structure (this document)
- Set up Firebase project
- Deploy security rules
- Create composite indexes
- Seed initial office data (10-20 major firms)

### Phase 2: Core Data (Weeks 3-4)
- Seed project data (50-100 notable projects)
- Create relationship edges
- Add architecture history timeline
- Set up basic regulations and city data

### Phase 3: Operational Data (Weeks 5-6)
- Add client data
- Populate technology adoption records
- Add financial data (where available)
- Supply chain and workforce data

### Phase 4: Intelligence Layer (Weeks 7-8)
- Develop market intelligence computation scripts
- Implement trend detection algorithms
- Build network graph analysis
- Create competitive analysis generator
- Set up automated updates (Cloud Functions)

### Phase 5: Integration & Testing (Weeks 9-10)
- Integrate with AI orchestrator
- Test all query patterns
- Performance optimization
- Load testing with realistic data volumes

---

## Performance Considerations

### Expected Collection Sizes
- **offices**: 500-5,000 documents
- **projects**: 5,000-50,000 documents
- **relationships**: 10,000-100,000 documents (grows with network)
- **archHistory**: 1,000-10,000 documents
- **newsArticles**: 10,000-500,000 documents (grows with scraping)
- **Tier 2 collections**: 10,000-100,000 each
- **Tier 3 collections**: 1,000-10,000 each (periodically updated)

### Query Performance
- Simple queries (single collection, indexed): <100ms
- Graph traversal (relationships): 200-500ms
- Complex multi-collection: 500ms-2s
- Intelligence layer queries: <100ms (pre-computed)

### Optimization Strategies
1. **Denormalization**: Connection counts on offices
2. **Pre-computation**: Intelligence layer updated periodically
3. **Composite indexes**: All critical query patterns indexed
4. **Batching**: Use batch operations for bulk updates
5. **Caching**: Cache frequently accessed intelligence data client-side

### Firestore Limits to Consider
- Max document size: 1MB (not an issue with this structure)
- Max writes/second to single document: 1 write/second (use sharding for high-traffic)
- Max writes in transaction: 500 documents
- Max index entries per document: 40,000 (track array sizes)

---

## Notes & Best Practices

### Data Integrity
- All timestamps use Firestore `Timestamp` type (not JavaScript Date)
- GeoPoint type for location coordinates (enables geoqueries)
- Use FieldValue.increment() for atomic counter updates
- Validate data before writing (use validation library like Zod)

### Naming Conventions
- Office IDs: CCccNNN format (e.g., "GBLO482", "USNE567")
- Project IDs: descriptive slugs (e.g., "heydar-aliyev-center")
- Collection names: plural camelCase (matches Firestore conventions)
- Field names: camelCase for consistency

### Relationship Management
- Always create bidirectional relationships when relevant
- Update connection counts when relationships change
- Use strength (1-10) consistently across all relationship types
- Document evidence for all relationships (project IDs, sources)

### Intelligence Layer
- Update market intelligence weekly/monthly (not real-time)
- Recompute network graph nightly
- Trends analyzed periodically (daily for active trends)
- Track generatedAt/lastComputed timestamps for data freshness

### Scalability
- This structure scales to millions of documents
- Graph operations may need optimization at very large scale (100k+ nodes)
- Consider BigQuery integration for large-scale analytics
- Use Firestore backup/export for data archival

---

## Final Summary

This database structure achieves all your goals:

✅ **Centralized system for info lookup** - Everything connected through core entities
✅ **Market consolidation tracking** - Dedicated marketIntelligence collection
✅ **Trend tracking** - Comprehensive trends collection with metrics
✅ **Connecting offices with projects** - Direct references + relationship graph
✅ **Good and bad relationships** - Explicit relationships with sentiment tracking
✅ **Office history** - Complete archHistory timeline
✅ **All 16 categories present** - Organized into operational tier
✅ **Graph/network analysis** - Explicit relationships + precomputed networkGraph
✅ **AI-ready queries** - Optimized for orchestrator patterns
✅ **Performance** - Denormalization + pre-computation where needed

**This is a production-ready architecture intelligence database.**

