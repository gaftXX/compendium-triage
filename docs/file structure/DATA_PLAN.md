# Architecture Data - Note System Specification

**Purpose:** Complete specification of the note system architecture and all data categories

---

## Note System Overview

The note system is the core data structure of the application. It organizes all architecture-related information into 16 distinct categories, each designed to capture specific aspects of architecture practices, projects, and business operations.

### Design Principles
- **Office-Centric**: Architecture office names used as primary identifiers
- **Category-Based**: 16 specialized categories for different data types
- **Relational**: Notes can link to each other across categories
- **Flexible**: Metadata and tags for custom organization
- **AI-Accessible**: Structured for AI orchestrator queries

### Implementation Phases

**BASE BUILD (Initial):**
-  Architecture Offices (Core/Primary)
-  Regulatory and Zoning Influences

**FUTURE EXPANSION (14 categories to be added incrementally):**
- All other categories below

---

## The 16 Note Categories

### BASE BUILD Categories

### 0. Architecture Offices (PRIMARY COLLECTION) 
**Purpose:** Core collection - all architecture firms and their basic information

**Key Fields:**
- Office name (official and display names)
- Founded year
- Location (city, country, coordinates)
- Office type (firm size, specialization)
- Related notes from all categories
- Metadata and tags

**Use Cases:**
- "Zaha Hadid Architects - founded 1980, London"
- "Foster + Partners - global practice, 500+ employees"
- "OMA - Rotterdam-based, theoretical approach"

**Firestore Collection:** `offices`

**Notes:**
- Office ID used as document ID (e.g., "zaha-hadid-architects")
- Central hub connecting all other note categories
- Primary entity in the system

---

### 1. Regulatory and Zoning Influences 
**Purpose:** Track zoning laws, land use regulations, and regulatory impacts

**Key Fields:**
- Jurisdiction (city/region)
- Regulation type (zoning, environmental, safety)
- Description
- Impact on projects
- Related project IDs
- Effective dates

**Use Cases:**
- "New height restriction in Manhattan affecting residential projects"
- "Environmental compliance requirements for Foster + Partners in London"
- "Historic district zoning changes impacting OMA's museum project"

**Firestore Collection:** `regulatory`

---

### FUTURE EXPANSION Categories

*The following 14 categories will be added incrementally after the base build is complete.*

---

### 2. Regulations and Laws 
**Purpose:** Legal compliance, building codes, and law requirements

**Key Fields:**
- Law name
- Region/jurisdiction
- Effective date
- Compliance status
- Details and requirements
- Penalties for non-compliance

**Use Cases:**
- "California Title 24 energy efficiency standards"
- "ADA compliance requirements for public buildings"
- "Fire safety codes for high-rise construction"

**Firestore Collection:** `regulations`

---

### 3. Client Relationships
**Purpose:** Track client information, project relationships, and business connections

**Key Fields:**
- Client name
- Client type (private, public, corporate)
- Relationship start date
- Associated projects
- Contact information
- Relationship notes

**Use Cases:**
- "Apple Inc. - long-term client of Foster + Partners"
- "City of London - public sector client for infrastructure"
- "Private residential client for Zaha Hadid villa project"

**Firestore Collection:** `clients`

---

### 4. Company Structure
**Purpose:** Organizational hierarchy, departments, and internal structure

**Key Fields:**
- Organizational chart
- Department breakdown
- Leadership team
- Employee count
- Office locations
- Division structure

**Use Cases:**
- "Zaha Hadid Architects expanded to 500 employees"
- "Foster + Partners opened new digital innovation department"
- "OMA restructured into 4 regional divisions"

**Firestore Collection:** `companyStructure`

---

### 5. Funding/Debt/Financials
**Purpose:** Financial transactions, funding rounds, debt, revenue, expenses

**Key Fields:**
- Record type (funding, debt, revenue, expense)
- Amount
- Currency
- Transaction date
- Source/recipient
- Details

**Use Cases:**
- "Foster + Partners received $10M Series B funding"
- "$5M debt financing for new office expansion"
- "Q3 revenue of £25M from residential projects"

**Firestore Collection:** `financials`

---

### 6. Technology Adoption
**Purpose:** Track technology usage, BIM, AI, software, and digital tools

**Key Fields:**
- Technology name
- Category (BIM, AI, VR, parametric design, etc.)
- Adoption date
- Usage level (experimental, partial, full)
- Related projects
- ROI/impact notes

**Use Cases:**
- "Zaha Hadid fully adopted Grasshopper for parametric design"
- "BIG implementing AI-driven structural optimization"
- "Foster + Partners using VR for client presentations"

**Firestore Collection:** `technology`

---

### 7. Projects (Ongoing & Upcoming)
**Purpose:** Architecture projects at any stage of development

**Key Fields:**
- Project name
- Status (upcoming, ongoing, completed, cancelled)
- Location (city, country, coordinates)
- Start date / expected completion
- Budget
- Client reference
- Project type (residential, commercial, cultural, etc.)
- Description

**Use Cases:**
- "Apple Park - ongoing by Foster + Partners in Cupertino"
- "Heydar Aliyev Center - completed by Zaha Hadid in Baku"
- "London Museum expansion - upcoming by OMA"

**Firestore Collection:** `projects`

---

### 8. Economic and Market Trends
**Purpose:** Economic conditions, market forces, industry trends

**Key Fields:**
- Trend type
- Geographic region
- Timeframe
- Description
- Impact assessment
- Affected offices/projects

**Use Cases:**
- "Construction material costs up 15% in London (2024)"
- "Labor shortage impacting US architecture firms"
- "Sustainable design trend driving 40% of new projects"

**Firestore Collection:** `economicTrends`

---

### 9. Financial Metrics
**Purpose:** Performance metrics, KPIs, profitability data

**Key Fields:**
- Metric type (revenue, profit, ROI, margin, etc.)
- Value
- Period (quarterly, annual)
- Year
- Quarter (if applicable)
- Comparison to previous period

**Use Cases:**
- "Foster + Partners annual revenue: $120M (2023)"
- "Zaha Hadid Architects profit margin: 18% (Q2 2024)"
- "ROI on parametric design tools: 250%"

**Firestore Collection:** `financialMetrics`

---

### 10. Market Share & Medium Pricing
**Purpose:** Market position, competitive share, pricing benchmarks

**Key Fields:**
- Market segment (luxury residential, commercial, etc.)
- Share percentage
- Medium pricing (per sq ft, per project)
- Currency
- Region
- Year

**Use Cases:**
- "Foster + Partners: 12% market share in luxury commercial (London)"
- "Median pricing: $800/sq ft for high-end residential design"
- "Zaha Hadid commands 30% premium in cultural projects"

**Firestore Collection:** `marketShare`

---

### 11. Competitive Landscape and Differentiation
**Purpose:** Competitive analysis, SWOT, market positioning

**Key Fields:**
- Competitor offices
- Differentiating factors
- Strengths
- Weaknesses
- Opportunities
- Threats

**Use Cases:**
- "Foster vs Zaha: Foster leads in sustainable design, Zaha in parametric"
- "OMA differentiates through theoretical/research approach"
- "BIG's competitive advantage: innovative urban planning"

**Firestore Collection:** `competitiveLandscape`

---

### 12. Workforce and Talent Networks
**Purpose:** Employee data, talent acquisition, university partnerships

**Key Fields:**
- Total employees
- Distribution (architects, engineers, designers, admin)
- Talent sources (universities, recruitment)
- Partnerships (academic institutions)
- Retention rate
- Skills matrix

**Use Cases:**
- "Zaha Hadid recruits from AA School and Harvard GSD"
- "Foster + Partners: 60% retention rate, industry-leading"
- "OMA partnership with Delft University for research talent"

**Firestore Collection:** `workforce`

---

### 13. Supply Chain and Material Suppliers
**Purpose:** Supplier relationships, material sourcing, supply chain

**Key Fields:**
- Supplier name
- Material type (steel, glass, concrete, etc.)
- Location
- Contract status (active, inactive)
- Reliability score
- Related projects
- Pricing

**Use Cases:**
- "Permasteelisa - primary glass supplier for Foster + Partners"
- "Local concrete supplier for Zaha Hadid's London projects"
- "Sustainable timber supplier partnership with BIG"

**Firestore Collection:** `supplyChain`

---

### 14. City Data
**Purpose:** City-level information affecting architecture projects

**Key Fields:**
- City name
- Country
- Coordinates (GeoPoint)
- Population
- Economic indicators
- Construction trends
- Active regulations
- Related offices/projects

**Use Cases:**
- "London: 9M population, strong luxury residential demand"
- "Dubai: boom in cultural institution projects"
- "NYC: stringent zoning, high construction costs"

**Firestore Collection:** `cityData`

---

### 15. Land Data
**Purpose:** Land parcels, development sites, property information

**Key Fields:**
- Location (city, address, coordinates)
- Size (square meters)
- Zoning classification
- Ownership
- Assessed value
- Development restrictions
- Related projects

**Use Cases:**
- "5000 sq m commercial parcel in Shoreditch, London"
- "Apple Park site: 175 acres in Cupertino"
- "Mixed-use zoning, $50M valuation, available for development"

**Firestore Collection:** `landData`

---

### 16. Division Percentages
**Purpose:** Breakdown analytics, percentage distributions

**Key Fields:**
- Division type (revenue, workforce, project types, etc.)
- Breakdown (object with category: percentage pairs)
- Period/timeframe
- Year
- Calculations and methodology

**Use Cases:**
- "Revenue breakdown: 60% commercial, 30% residential, 10% cultural"
- "Workforce: 45% architects, 30% engineers, 15% designers, 10% admin"
- "Project distribution: 50% ongoing, 30% upcoming, 20% proposals"

**Firestore Collection:** `divisionPercentages`

---

## Note Structure Schema

### Base Note Interface
```typescript
interface Note {
  id: string;                          // Auto-generated or office-name-based
  category: NoteCategory;              // One of 16 categories
  title: string;
  content: string;
  architectureOffice?: string;         // Office name (e.g., "zaha-hadid-architects")
  tags: string[];
  relatedNotes: string[];              // IDs of linked notes
  metadata: {
    source?: string;
    priority?: number;                 // 1-5
    status?: 'draft' | 'published' | 'archived';
    [key: string]: any;                // Flexible metadata
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type NoteCategory = 
  | 'regulatory' 
  | 'laws' 
  | 'clients' 
  | 'company' 
  | 'financials' 
  | 'technology' 
  | 'projects' 
  | 'economic' 
  | 'metrics' 
  | 'market' 
  | 'competitive' 
  | 'workforce' 
  | 'supply' 
  | 'city' 
  | 'land' 
  | 'divisions';
```

---

## Relationships Between Notes

### Link Types
- **Related**: General relationship
- **Depends-On**: One note depends on another
- **References**: Cites or references
- **Supersedes**: Replaces an older note
- **Part-Of**: Belongs to a larger topic

### Relationship Patterns
```
Project Note → Client Note (project belongs to client)
Project Note → City Note (project located in city)
Project Note → Land Note (project built on land)
Project Note → Technology Note (project uses technology)
Regulatory Note → City Note (regulation applies to city)
Financial Note → Project Note (financing for project)
Workforce Note → Company Note (workforce is part of company structure)
```

---

## Architecture Office Format

### Naming Convention
All office names stored in lowercase with hyphens:
- "Zaha Hadid Architects" → `zaha-hadid-architects`
- "Foster + Partners" → `foster-partners`
- "OMA" → `oma`
- "BIG - Bjarke Ingels Group" → `big`
- "Herzog & de Meuron" → `herzog-de-meuron`

### Office as Document ID
Architecture offices have their own collection with office name as ID:
```typescript
interface ArchitectureOffice {
  id: string;                    // Office slug (e.g., "foster-partners")
  name: string;                  // Display name
  officialName: string;          // Legal/full name
  founded: number;               // Year
  location: {
    city: string;
    country: string;
    coordinates: GeoPoint;
  };
  relatedNotes: string[];        // All notes about this office
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Tags System

### Tag Categories
- **Technology Tags**: `BIM`, `parametric-design`, `AI`, `VR`, `3D-printing`
- **Style Tags**: `modernist`, `parametric`, `sustainable`, `brutalist`
- **Scale Tags**: `large-scale`, `residential`, `institutional`, `urban-planning`
- **Status Tags**: `award-winning`, `ongoing`, `completed`, `cancelled`
- **Material Tags**: `concrete`, `steel`, `glass`, `timber`, `composite`

### Tag Usage
```typescript
// Example note with rich tagging
{
  title: "Heydar Aliyev Center - Parametric Design Implementation",
  category: "technology",
  tags: [
    "parametric-design",
    "grasshopper",
    "award-winning",
    "cultural-architecture",
    "zaha-hadid",
    "completed-2012"
  ]
}
```

---

## Search & Query Patterns

### By Category
```typescript
searchNotes({ category: 'projects' })
// Returns all project notes
```

### By Office
```typescript
searchNotes({ office: 'foster-partners' })
// Returns all notes about Foster + Partners
```

### By Tags
```typescript
searchNotes({ tags: ['parametric-design', 'award-winning'] })
// Returns notes with any of these tags
```

### By Date Range
```typescript
searchNotes({ 
  dateRange: { 
    start: '2023-01-01', 
    end: '2023-12-31' 
  } 
})
// Returns notes from 2023
```

### Combined Filters
```typescript
searchNotes({
  category: 'projects',
  office: 'zaha-hadid-architects',
  tags: ['parametric-design'],
  dateRange: { start: '2020-01-01', end: '2024-12-31' }
})
// Returns Zaha Hadid parametric design projects from 2020-2024
```

---

## AI Orchestrator Integration

### How AI Uses Note Categories

**User Input:** "Show me all Foster + Partners sustainable projects"

**AI Processing:**
1. Identifies intent: SEARCH_NOTES
2. Extracts parameters:
   - office: "foster-partners"
   - category: "projects"
   - tags: ["sustainable"]
3. Executes query
4. Returns results

**User Input:** "What's the market share of luxury commercial in London?"

**AI Processing:**
1. Identifies intent: SEARCH_NOTES
2. Extracts parameters:
   - category: "market"
   - query: "luxury commercial London"
3. Returns market share data

---

## Data Validation Rules

### Required Fields
- All notes: `category`, `title`, `content`
- Office notes: `name`, `founded`, `location`
- Project notes: `projectName`, `status`, `location`
- Financial notes: `amount`, `currency`, `date`

### Field Constraints
- `category`: Must be one of 16 valid categories
- `architectureOffice`: Must match existing office ID
- `tags`: Array of strings, max 20 tags per note
- `relatedNotes`: Must reference valid note IDs
- `priority`: Number 1-5
- `status`: 'draft' | 'published' | 'archived'

---

## Usage Statistics & Analytics

### Queryable Metrics
- Notes per category
- Notes per office
- Most-used tags
- Relationship density (avg links per note)
- Activity over time
- Popular search queries

### Example Analytics
```typescript
// Get note distribution
{
  projects: 450,
  technology: 280,
  clients: 320,
  financials: 190,
  regulatory: 160,
  // ... other categories
}

// Top architecture offices by note count
{
  "foster-partners": 380,
  "zaha-hadid-architects": 340,
  "oma": 290,
  "big": 250
}
```

---

## Future Expansions

### Potential New Categories
- Sustainability & Carbon Data
- Awards & Recognition
- Media & Publications
- Academic Research
- Material Innovation
- Construction Methods

### Enhanced Features
- Version history for notes
- Collaborative editing
- File attachments (images, PDFs, CAD files)
- Automatic relationship suggestions
- AI-generated summaries
- Cross-office comparisons

---

*The note system is designed to capture the complete landscape of architecture practice, from regulatory frameworks to creative innovations, enabling comprehensive AI-powered insights and analysis.*

