# Action Registry Specification

**Purpose:** Complete specification of all AI actions available to the orchestrator, mapped to the 16 note system categories.

---

## Registry Structure

### Action Definition Schema
```typescript
interface ActionDefinition {
  id: string;                          // Unique action identifier
  name: string;                        // Human-readable name
  description: string;                 // What this action does
  category: string;                    // Which note category it belongs to
  handler: string;                     // Handler function reference
  parameters: ParameterDefinition[];   // Required and optional parameters
  returns: ReturnDefinition;           // What the action returns
  examples: string[];                  // Example user inputs
  permissions: string[];               // Required permissions (future)
}

interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  required: boolean;
  description: string;
  validation?: ValidationRule;
  default?: any;
}

interface ReturnDefinition {
  type: string;
  description: string;
  schema?: object;
}
```

---

## Core Actions (All Categories)

### 1. Note Management Actions

#### CREATE_NOTE
```typescript
{
  id: 'CREATE_NOTE',
  name: 'Create Note',
  description: 'Create a new note in any of the 16 categories',
  category: 'all',
  handler: 'noteActions.createNote',
  parameters: [
    {
      name: 'category',
      type: 'string',
      required: true,
      description: 'Note category',
      validation: {
        enum: ['regulatory', 'laws', 'clients', 'company', 'financials', 'technology', 
               'projects', 'economic', 'metrics', 'market', 'competitive', 'workforce', 
               'supply', 'city', 'land', 'divisions']
      }
    },
    {
      name: 'title',
      type: 'string',
      required: true,
      description: 'Note title'
    },
    {
      name: 'content',
      type: 'string',
      required: true,
      description: 'Note content/body'
    },
    {
      name: 'architectureOffice',
      type: 'string',
      required: false,
      description: 'Associated architecture office (use format: office-name-lowercase)'
    },
    {
      name: 'tags',
      type: 'array',
      required: false,
      description: 'Array of tags',
      default: []
    },
    {
      name: 'relatedNotes',
      type: 'array',
      required: false,
      description: 'Array of related note IDs',
      default: []
    },
    {
      name: 'metadata',
      type: 'object',
      required: false,
      description: 'Additional metadata'
    }
  ],
  returns: {
    type: 'Note',
    description: 'The created note object with generated ID'
  },
  examples: [
    'Add a note about Zaha Hadid\'s parametric design',
    'Create a regulatory note for London zoning',
    'New client note for Apple Inc working with Foster + Partners'
  ],
  permissions: ['notes:create']
}
```

#### UPDATE_NOTE
```typescript
{
  id: 'UPDATE_NOTE',
  name: 'Update Note',
  description: 'Update an existing note',
  category: 'all',
  handler: 'noteActions.updateNote',
  parameters: [
    {
      name: 'noteId',
      type: 'string',
      required: true,
      description: 'ID of the note to update'
    },
    {
      name: 'updates',
      type: 'object',
      required: true,
      description: 'Object containing fields to update'
    }
  ],
  returns: {
    type: 'Note',
    description: 'The updated note object'
  },
  examples: [
    'Update note abc123 title to "New Title"',
    'Add tag "BIM" to note xyz789',
    'Change the content of the Zaha Hadid note'
  ],
  permissions: ['notes:update']
}
```

#### DELETE_NOTE
```typescript
{
  id: 'DELETE_NOTE',
  name: 'Delete Note',
  description: 'Delete a note by ID',
  category: 'all',
  handler: 'noteActions.deleteNote',
  parameters: [
    {
      name: 'noteId',
      type: 'string',
      required: true,
      description: 'ID of the note to delete'
    }
  ],
  returns: {
    type: 'boolean',
    description: 'True if deletion was successful'
  },
  examples: [
    'Delete note abc123',
    'Remove the outdated regulatory note'
  ],
  permissions: ['notes:delete']
}
```

#### SEARCH_NOTES
```typescript
{
  id: 'SEARCH_NOTES',
  name: 'Search Notes',
  description: 'Search notes by query, category, office, tags, or date range',
  category: 'all',
  handler: 'searchActions.searchNotes',
  parameters: [
    {
      name: 'query',
      type: 'string',
      required: false,
      description: 'Search query string'
    },
    {
      name: 'category',
      type: 'string',
      required: false,
      description: 'Filter by category'
    },
    {
      name: 'office',
      type: 'string',
      required: false,
      description: 'Filter by architecture office'
    },
    {
      name: 'tags',
      type: 'array',
      required: false,
      description: 'Filter by tags (any match)'
    },
    {
      name: 'dateRange',
      type: 'object',
      required: false,
      description: 'Filter by date range { start: ISO date, end: ISO date }'
    }
  ],
  returns: {
    type: 'Note[]',
    description: 'Array of matching notes'
  },
  examples: [
    'Find all notes about Zaha Hadid',
    'Search for regulatory notes from 2023',
    'Show me all financial notes for Foster + Partners'
  ],
  permissions: ['notes:read']
}
```

#### LINK_NOTES
```typescript
{
  id: 'LINK_NOTES',
  name: 'Link Notes',
  description: 'Create a relationship between two notes',
  category: 'all',
  handler: 'relationshipActions.linkNotes',
  parameters: [
    {
      name: 'noteId1',
      type: 'string',
      required: true,
      description: 'First note ID'
    },
    {
      name: 'noteId2',
      type: 'string',
      required: true,
      description: 'Second note ID'
    },
    {
      name: 'relationshipType',
      type: 'string',
      required: false,
      description: 'Type of relationship',
      default: 'related'
    }
  ],
  returns: {
    type: 'boolean',
    description: 'True if linking was successful'
  },
  examples: [
    'Link note abc123 to note def456',
    'Connect these two project notes',
    'Associate regulatory note with project note'
  ],
  permissions: ['notes:update']
}
```

---

## Category-Specific Actions

### Regulatory and Zoning Influences

#### CREATE_REGULATORY_RECORD
```typescript
{
  id: 'CREATE_REGULATORY_RECORD',
  name: 'Create Regulatory Record',
  description: 'Create a regulatory or zoning record',
  category: 'regulatory',
  handler: 'categoryActions.createRegulatory',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'jurisdiction',
      type: 'string',
      required: true,
      description: 'Legal jurisdiction (e.g., "London", "New York")'
    },
    {
      name: 'regulationType',
      type: 'string',
      required: true,
      description: 'Type of regulation (e.g., "zoning", "environmental", "safety")'
    },
    {
      name: 'description',
      type: 'string',
      required: true,
      description: 'Description of the regulation'
    },
    {
      name: 'impact',
      type: 'string',
      required: false,
      description: 'Impact on projects'
    },
    {
      name: 'relatedProjects',
      type: 'array',
      required: false,
      description: 'Related project IDs'
    }
  ],
  returns: {
    type: 'RegulatoryRecord',
    description: 'Created regulatory record'
  },
  examples: [
    'Add new zoning regulation for London affecting Zaha Hadid projects',
    'Create environmental regulation record for Foster + Partners in NYC'
  ],
  permissions: ['regulatory:create']
}
```

### Regulations and Laws

#### CREATE_LAW_RECORD
```typescript
{
  id: 'CREATE_LAW_RECORD',
  name: 'Create Law Record',
  description: 'Create a legal/law compliance record',
  category: 'laws',
  handler: 'categoryActions.createLaw',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'lawName',
      type: 'string',
      required: true,
      description: 'Name of the law/regulation'
    },
    {
      name: 'region',
      type: 'string',
      required: true,
      description: 'Geographic region'
    },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      description: 'When law becomes effective (ISO 8601)'
    },
    {
      name: 'details',
      type: 'string',
      required: true,
      description: 'Law details and requirements'
    },
    {
      name: 'compliance',
      type: 'boolean',
      required: false,
      description: 'Whether office is compliant',
      default: false
    }
  ],
  returns: {
    type: 'LawRecord',
    description: 'Created law record'
  },
  examples: [
    'Record new building code for California effective Jan 2024',
    'Add ADA compliance law for Foster + Partners'
  ],
  permissions: ['laws:create']
}
```

### Client Relationships

#### CREATE_CLIENT
```typescript
{
  id: 'CREATE_CLIENT',
  name: 'Create Client',
  description: 'Create a new client relationship record',
  category: 'clients',
  handler: 'categoryActions.createClient',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'clientName',
      type: 'string',
      required: true,
      description: 'Client name'
    },
    {
      name: 'clientType',
      type: 'string',
      required: true,
      description: 'Client type: private, public, or corporate',
      validation: {
        enum: ['private', 'public', 'corporate']
      }
    },
    {
      name: 'relationshipStart',
      type: 'date',
      required: false,
      description: 'When relationship started'
    },
    {
      name: 'projects',
      type: 'array',
      required: false,
      description: 'Associated project IDs'
    },
    {
      name: 'contactInfo',
      type: 'object',
      required: false,
      description: 'Contact information'
    }
  ],
  returns: {
    type: 'Client',
    description: 'Created client record'
  },
  examples: [
    'Add Apple as corporate client for Foster + Partners',
    'Create new public client: City of London'
  ],
  permissions: ['clients:create']
}
```

### Company Structure

#### UPDATE_COMPANY_STRUCTURE
```typescript
{
  id: 'UPDATE_COMPANY_STRUCTURE',
  name: 'Update Company Structure',
  description: 'Update organizational structure for an office',
  category: 'company',
  handler: 'categoryActions.updateCompanyStructure',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'structure',
      type: 'object',
      required: false,
      description: 'Org chart structure'
    },
    {
      name: 'leadership',
      type: 'array',
      required: false,
      description: 'Leadership team'
    },
    {
      name: 'employeeCount',
      type: 'number',
      required: false,
      description: 'Total employees'
    },
    {
      name: 'departments',
      type: 'array',
      required: false,
      description: 'List of departments'
    }
  ],
  returns: {
    type: 'CompanyStructure',
    description: 'Updated company structure'
  },
  examples: [
    'Update Zaha Hadid Architects to 500 employees',
    'Add new department: Digital Innovation for Foster'
  ],
  permissions: ['company:update']
}
```

### Funding/Debt/Financials

#### CREATE_FINANCIAL_RECORD
```typescript
{
  id: 'CREATE_FINANCIAL_RECORD',
  name: 'Create Financial Record',
  description: 'Record financial transaction (funding, debt, revenue, expense)',
  category: 'financials',
  handler: 'categoryActions.createFinancial',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'recordType',
      type: 'string',
      required: true,
      description: 'Type: funding, debt, revenue, expense',
      validation: {
        enum: ['funding', 'debt', 'revenue', 'expense']
      }
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      description: 'Amount in base currency'
    },
    {
      name: 'currency',
      type: 'string',
      required: true,
      description: 'Currency code (USD, EUR, GBP, etc.)',
      default: 'USD'
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      description: 'Transaction date (ISO 8601)'
    },
    {
      name: 'source',
      type: 'string',
      required: false,
      description: 'Source of funds or recipient'
    },
    {
      name: 'details',
      type: 'string',
      required: false,
      description: 'Additional details'
    }
  ],
  returns: {
    type: 'FinancialRecord',
    description: 'Created financial record'
  },
  examples: [
    'Record $5M funding for Foster + Partners in March 2024',
    'Add revenue of £2.5M from Apple project'
  ],
  permissions: ['financials:create']
}
```

### Technology Adoption

#### CREATE_TECHNOLOGY_RECORD
```typescript
{
  id: 'CREATE_TECHNOLOGY_RECORD',
  name: 'Create Technology Record',
  description: 'Record technology adoption by an architecture office',
  category: 'technology',
  handler: 'categoryActions.createTechnology',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'technologyName',
      type: 'string',
      required: true,
      description: 'Name of technology'
    },
    {
      name: 'category',
      type: 'string',
      required: true,
      description: 'Tech category: BIM, AI, VR, parametric, etc.'
    },
    {
      name: 'adoptionDate',
      type: 'date',
      required: false,
      description: 'When technology was adopted'
    },
    {
      name: 'usageLevel',
      type: 'string',
      required: false,
      description: 'Usage: experimental, partial, full',
      validation: {
        enum: ['experimental', 'partial', 'full']
      }
    },
    {
      name: 'relatedProjects',
      type: 'array',
      required: false,
      description: 'Projects using this technology'
    }
  ],
  returns: {
    type: 'TechnologyRecord',
    description: 'Created technology record'
  },
  examples: [
    'Zaha Hadid adopted Grasshopper for parametric design',
    'Foster + Partners using AI for energy optimization'
  ],
  permissions: ['technology:create']
}
```

### Projects (Ongoing & Upcoming)

#### CREATE_PROJECT
```typescript
{
  id: 'CREATE_PROJECT',
  name: 'Create Project',
  description: 'Create a new architecture project record',
  category: 'projects',
  handler: 'categoryActions.createProject',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'projectName',
      type: 'string',
      required: true,
      description: 'Project name'
    },
    {
      name: 'status',
      type: 'string',
      required: true,
      description: 'Project status',
      validation: {
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled']
      }
    },
    {
      name: 'location',
      type: 'object',
      required: true,
      description: 'Location: { city, country, coordinates }'
    },
    {
      name: 'startDate',
      type: 'date',
      required: false,
      description: 'Project start date'
    },
    {
      name: 'expectedCompletion',
      type: 'date',
      required: false,
      description: 'Expected completion date'
    },
    {
      name: 'budget',
      type: 'number',
      required: false,
      description: 'Project budget'
    },
    {
      name: 'client',
      type: 'string',
      required: false,
      description: 'Client ID reference'
    },
    {
      name: 'projectType',
      type: 'string',
      required: false,
      description: 'Type of project (residential, commercial, etc.)'
    }
  ],
  returns: {
    type: 'Project',
    description: 'Created project record'
  },
  examples: [
    'Add new project: Apple Park by Foster + Partners in Cupertino',
    'Create upcoming project: London Museum by Zaha Hadid'
  ],
  permissions: ['projects:create']
}
```

#### UPDATE_PROJECT_STATUS
```typescript
{
  id: 'UPDATE_PROJECT_STATUS',
  name: 'Update Project Status',
  description: 'Update the status of a project',
  category: 'projects',
  handler: 'categoryActions.updateProjectStatus',
  parameters: [
    {
      name: 'projectId',
      type: 'string',
      required: true,
      description: 'Project ID'
    },
    {
      name: 'newStatus',
      type: 'string',
      required: true,
      description: 'New status',
      validation: {
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled']
      }
    },
    {
      name: 'notes',
      type: 'string',
      required: false,
      description: 'Notes about status change'
    }
  ],
  returns: {
    type: 'Project',
    description: 'Updated project'
  },
  examples: [
    'Mark Apple Park project as completed',
    'Change London Museum to ongoing status'
  ],
  permissions: ['projects:update']
}
```

### Economic and Market Trends

#### CREATE_ECONOMIC_TREND
```typescript
{
  id: 'CREATE_ECONOMIC_TREND',
  name: 'Create Economic Trend',
  description: 'Record an economic or market trend',
  category: 'economic',
  handler: 'categoryActions.createEconomicTrend',
  parameters: [
    {
      name: 'trendType',
      type: 'string',
      required: true,
      description: 'Type of trend'
    },
    {
      name: 'region',
      type: 'string',
      required: true,
      description: 'Geographic region'
    },
    {
      name: 'timeframe',
      type: 'string',
      required: true,
      description: 'Timeframe (e.g., "Q1 2024", "2023")'
    },
    {
      name: 'description',
      type: 'string',
      required: true,
      description: 'Trend description'
    },
    {
      name: 'impact',
      type: 'string',
      required: false,
      description: 'Impact assessment'
    },
    {
      name: 'affectedOffices',
      type: 'array',
      required: false,
      description: 'Office IDs affected by this trend'
    }
  ],
  returns: {
    type: 'EconomicTrend',
    description: 'Created trend record'
  },
  examples: [
    'Record construction cost increase in London for 2024',
    'Add labor shortage trend affecting US architecture firms'
  ],
  permissions: ['economic:create']
}
```

### Financial Metrics

#### CREATE_FINANCIAL_METRIC
```typescript
{
  id: 'CREATE_FINANCIAL_METRIC',
  name: 'Create Financial Metric',
  description: 'Record a financial metric (revenue, profit, ROI, etc.)',
  category: 'metrics',
  handler: 'categoryActions.createFinancialMetric',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'metricType',
      type: 'string',
      required: true,
      description: 'Metric type: revenue, profit, ROI, etc.'
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      description: 'Metric value'
    },
    {
      name: 'period',
      type: 'string',
      required: true,
      description: 'Period: quarterly, annual',
      validation: {
        enum: ['quarterly', 'annual']
      }
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      description: 'Year (e.g., 2024)'
    },
    {
      name: 'quarter',
      type: 'number',
      required: false,
      description: 'Quarter (1-4) if period is quarterly'
    }
  ],
  returns: {
    type: 'FinancialMetric',
    description: 'Created metric'
  },
  examples: [
    'Record $50M annual revenue for Foster + Partners in 2023',
    'Add Q1 2024 profit of $2.5M for Zaha Hadid'
  ],
  permissions: ['metrics:create']
}
```

### Market Share & Medium Pricing

#### CREATE_MARKET_DATA
```typescript
{
  id: 'CREATE_MARKET_DATA',
  name: 'Create Market Data',
  description: 'Record market share and pricing data',
  category: 'market',
  handler: 'categoryActions.createMarketData',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'marketSegment',
      type: 'string',
      required: true,
      description: 'Market segment (e.g., "luxury residential", "commercial")'
    },
    {
      name: 'sharePercentage',
      type: 'number',
      required: true,
      description: 'Market share percentage (0-100)'
    },
    {
      name: 'mediumPricing',
      type: 'object',
      required: false,
      description: '{ pricePerSqFt, currency, region }'
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      description: 'Year of data'
    }
  ],
  returns: {
    type: 'MarketData',
    description: 'Created market data'
  },
  examples: [
    'Foster has 15% market share in luxury commercial in London',
    'Record $500/sqft median pricing for Zaha Hadid projects'
  ],
  permissions: ['market:create']
}
```

### Competitive Landscape and Differentiation

#### CREATE_COMPETITIVE_ANALYSIS
```typescript
{
  id: 'CREATE_COMPETITIVE_ANALYSIS',
  name: 'Create Competitive Analysis',
  description: 'Record competitive analysis for an office',
  category: 'competitive',
  handler: 'categoryActions.createCompetitiveAnalysis',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'competitors',
      type: 'array',
      required: true,
      description: 'Array of competitor office IDs'
    },
    {
      name: 'differentiators',
      type: 'array',
      required: false,
      description: 'Key differentiating factors'
    },
    {
      name: 'strengths',
      type: 'array',
      required: false,
      description: 'Strengths'
    },
    {
      name: 'weaknesses',
      type: 'array',
      required: false,
      description: 'Weaknesses'
    },
    {
      name: 'opportunities',
      type: 'array',
      required: false,
      description: 'Opportunities (SWOT)'
    },
    {
      name: 'threats',
      type: 'array',
      required: false,
      description: 'Threats (SWOT)'
    }
  ],
  returns: {
    type: 'CompetitiveAnalysis',
    description: 'Created analysis'
  },
  examples: [
    'Create SWOT analysis for Foster vs Zaha Hadid',
    'Record competitive positioning for OMA in parametric design market'
  ],
  permissions: ['competitive:create']
}
```

### Workforce and Talent Networks

#### CREATE_WORKFORCE_DATA
```typescript
{
  id: 'CREATE_WORKFORCE_DATA',
  name: 'Create Workforce Data',
  description: 'Record workforce and talent information',
  category: 'workforce',
  handler: 'categoryActions.createWorkforceData',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'totalEmployees',
      type: 'number',
      required: true,
      description: 'Total number of employees'
    },
    {
      name: 'distribution',
      type: 'object',
      required: false,
      description: '{ architects, engineers, designers, administrative }'
    },
    {
      name: 'talentSources',
      type: 'array',
      required: false,
      description: 'Where talent is recruited from'
    },
    {
      name: 'partnerships',
      type: 'array',
      required: false,
      description: 'University/institution partnerships'
    },
    {
      name: 'retentionRate',
      type: 'number',
      required: false,
      description: 'Employee retention rate (0-100%)'
    }
  ],
  returns: {
    type: 'WorkforceData',
    description: 'Created workforce data'
  },
  examples: [
    'Foster + Partners has 500 employees: 200 architects, 150 engineers',
    'Zaha Hadid recruits from AA School and Harvard GSD'
  ],
  permissions: ['workforce:create']
}
```

### Supply Chain and Material Suppliers

#### CREATE_SUPPLIER_RECORD
```typescript
{
  id: 'CREATE_SUPPLIER_RECORD',
  name: 'Create Supplier Record',
  description: 'Record a material supplier relationship',
  category: 'supply',
  handler: 'categoryActions.createSupplier',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'supplierName',
      type: 'string',
      required: true,
      description: 'Supplier company name'
    },
    {
      name: 'materialType',
      type: 'string',
      required: true,
      description: 'Type of material supplied'
    },
    {
      name: 'location',
      type: 'object',
      required: false,
      description: 'Supplier location'
    },
    {
      name: 'contractStatus',
      type: 'string',
      required: false,
      description: 'Contract status: active, inactive, pending'
    },
    {
      name: 'reliability',
      type: 'number',
      required: false,
      description: 'Reliability score (1-10)'
    },
    {
      name: 'relatedProjects',
      type: 'array',
      required: false,
      description: 'Projects using this supplier'
    }
  ],
  returns: {
    type: 'SupplierRecord',
    description: 'Created supplier record'
  },
  examples: [
    'Add steel supplier "Acme Steel" for Foster projects',
    'Record glass supplier partnership with Zaha Hadid'
  ],
  permissions: ['supply:create']
}
```

### City Data

#### CREATE_CITY_DATA
```typescript
{
  id: 'CREATE_CITY_DATA',
  name: 'Create City Data',
  description: 'Record city-level data relevant to architecture',
  category: 'city',
  handler: 'categoryActions.createCityData',
  parameters: [
    {
      name: 'cityName',
      type: 'string',
      required: true,
      description: 'City name'
    },
    {
      name: 'country',
      type: 'string',
      required: true,
      description: 'Country'
    },
    {
      name: 'coordinates',
      type: 'object',
      required: false,
      description: 'GeoPoint { lat, lng }'
    },
    {
      name: 'population',
      type: 'number',
      required: false,
      description: 'City population'
    },
    {
      name: 'economicData',
      type: 'object',
      required: false,
      description: 'Economic indicators'
    },
    {
      name: 'constructionTrends',
      type: 'object',
      required: false,
      description: 'Construction activity trends'
    },
    {
      name: 'regulations',
      type: 'array',
      required: false,
      description: 'Reference to regulatory records'
    },
    {
      name: 'relatedOffices',
      type: 'array',
      required: false,
      description: 'Offices operating in this city'
    }
  ],
  returns: {
    type: 'CityData',
    description: 'Created city data'
  },
  examples: [
    'Add data for London: 9M population, strong construction activity',
    'Create NYC city record with zoning regulations'
  ],
  permissions: ['city:create']
}
```

### Land Data

#### CREATE_LAND_PARCEL
```typescript
{
  id: 'CREATE_LAND_PARCEL',
  name: 'Create Land Parcel',
  description: 'Record land parcel data',
  category: 'land',
  handler: 'categoryActions.createLandParcel',
  parameters: [
    {
      name: 'location',
      type: 'object',
      required: true,
      description: '{ city, address, coordinates }'
    },
    {
      name: 'size',
      type: 'number',
      required: true,
      description: 'Size in square meters'
    },
    {
      name: 'zoning',
      type: 'string',
      required: true,
      description: 'Zoning classification'
    },
    {
      name: 'ownership',
      type: 'string',
      required: false,
      description: 'Owner/ownership type'
    },
    {
      name: 'value',
      type: 'number',
      required: false,
      description: 'Assessed value'
    },
    {
      name: 'restrictions',
      type: 'array',
      required: false,
      description: 'Development restrictions'
    },
    {
      name: 'relatedProjects',
      type: 'array',
      required: false,
      description: 'Projects on this land'
    }
  ],
  returns: {
    type: 'LandParcel',
    description: 'Created land parcel'
  },
  examples: [
    'Record 5000 sqm commercial land in London with mixed-use zoning',
    'Add Apple Park land parcel data in Cupertino'
  ],
  permissions: ['land:create']
}
```

### Division Percentages

#### CALCULATE_DIVISION_PERCENTAGES
```typescript
{
  id: 'CALCULATE_DIVISION_PERCENTAGES',
  name: 'Calculate Division Percentages',
  description: 'Calculate and record division breakdowns (revenue, workforce, project types)',
  category: 'divisions',
  handler: 'analyticsActions.calculateDivisionPercentages',
  parameters: [
    {
      name: 'officeId',
      type: 'string',
      required: true,
      description: 'Architecture office ID'
    },
    {
      name: 'divisionType',
      type: 'string',
      required: true,
      description: 'Type: revenue, workforce, project_types, etc.'
    },
    {
      name: 'breakdown',
      type: 'object',
      required: true,
      description: 'Object with category: percentage pairs'
    },
    {
      name: 'period',
      type: 'string',
      required: true,
      description: 'Time period (e.g., "Q1 2024", "2023")'
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      description: 'Year'
    }
  ],
  returns: {
    type: 'DivisionPercentages',
    description: 'Calculated division percentages'
  },
  examples: [
    'Calculate revenue breakdown: 60% commercial, 30% residential, 10% public',
    'Workforce distribution: 40% architects, 30% engineers, 20% designers, 10% admin'
  ],
  permissions: ['divisions:create']
}
```

---

## Utility Actions

### ASK_CLARIFICATION
```typescript
{
  id: 'ASK_CLARIFICATION',
  name: 'Ask for Clarification',
  description: 'Request additional information from user',
  category: 'utility',
  handler: 'orchestrator.askClarification',
  parameters: [
    {
      name: 'question',
      type: 'string',
      required: true,
      description: 'Question to ask user'
    },
    {
      name: 'options',
      type: 'array',
      required: false,
      description: 'Suggested options'
    },
    {
      name: 'context',
      type: 'object',
      required: false,
      description: 'Context for the clarification'
    }
  ],
  returns: {
    type: 'ClarificationRequest',
    description: 'Clarification request to display to user'
  },
  examples: [],
  permissions: []
}
```

### BATCH_ACTIONS
```typescript
{
  id: 'BATCH_ACTIONS',
  name: 'Execute Batch Actions',
  description: 'Execute multiple actions in sequence',
  category: 'utility',
  handler: 'orchestrator.executeBatch',
  parameters: [
    {
      name: 'actions',
      type: 'array',
      required: true,
      description: 'Array of action objects to execute'
    },
    {
      name: 'stopOnError',
      type: 'boolean',
      required: false,
      description: 'Whether to stop if one action fails',
      default: true
    }
  ],
  returns: {
    type: 'BatchResult',
    description: 'Results of all executed actions'
  },
  examples: [],
  permissions: ['batch:execute']
}
```

---

## Complete Registry Export

```typescript
// actions/registry.ts

import { ActionDefinition } from '../types/action.types';

export const ACTION_REGISTRY: Record<string, ActionDefinition> = {
  // Core note actions
  CREATE_NOTE: { /* definition */ },
  UPDATE_NOTE: { /* definition */ },
  DELETE_NOTE: { /* definition */ },
  SEARCH_NOTES: { /* definition */ },
  LINK_NOTES: { /* definition */ },
  
  // Category-specific actions
  CREATE_REGULATORY_RECORD: { /* definition */ },
  CREATE_LAW_RECORD: { /* definition */ },
  CREATE_CLIENT: { /* definition */ },
  UPDATE_COMPANY_STRUCTURE: { /* definition */ },
  CREATE_FINANCIAL_RECORD: { /* definition */ },
  CREATE_TECHNOLOGY_RECORD: { /* definition */ },
  CREATE_PROJECT: { /* definition */ },
  UPDATE_PROJECT_STATUS: { /* definition */ },
  CREATE_ECONOMIC_TREND: { /* definition */ },
  CREATE_FINANCIAL_METRIC: { /* definition */ },
  CREATE_MARKET_DATA: { /* definition */ },
  CREATE_COMPETITIVE_ANALYSIS: { /* definition */ },
  CREATE_WORKFORCE_DATA: { /* definition */ },
  CREATE_SUPPLIER_RECORD: { /* definition */ },
  CREATE_CITY_DATA: { /* definition */ },
  CREATE_LAND_PARCEL: { /* definition */ },
  CALCULATE_DIVISION_PERCENTAGES: { /* definition */ },
  
  // Utility actions
  ASK_CLARIFICATION: { /* definition */ },
  BATCH_ACTIONS: { /* definition */ },
};

// Get all action IDs
export function getAllActionIds(): string[] {
  return Object.keys(ACTION_REGISTRY);
}

// Get actions by category
export function getActionsByCategory(category: string): ActionDefinition[] {
  return Object.values(ACTION_REGISTRY).filter(
    action => action.category === category
  );
}

// Get action by ID
export function getAction(id: string): ActionDefinition | undefined {
  return ACTION_REGISTRY[id];
}
```

---

## Total Actions: 24

**Core (5):** CREATE_NOTE, UPDATE_NOTE, DELETE_NOTE, SEARCH_NOTES, LINK_NOTES

**Category-Specific (17):** One or more for each of the 16 categories

**Utility (2):** ASK_CLARIFICATION, BATCH_ACTIONS

---

*This registry defines every action available to the AI orchestrator, providing Claude with a complete understanding of what it can do in the application.*

