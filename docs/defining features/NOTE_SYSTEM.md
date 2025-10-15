# Intelligent Note System - Data Categorization & Storage

**Purpose:** Automatically parse unstructured input, identify data type, extract relevant fields, and save to the correct Firestore collection

---

## System Overview

The Intelligent Note System acts as a smart data router that:
1. **Receives** random/unstructured text input from the user
2. **Analyzes** the content using AI (Claude)
3. **Identifies** which data category it belongs to
4. **Extracts** relevant fields and values
5. **Validates** the data against schema requirements
6. **Saves** to the appropriate Firestore collection with proper structure

---

## Data Categories & Collections Mapping

### Tier 1: Core Entities
| Category | Collection | Primary Use |
|----------|-----------|-------------|
| Architecture Office | `offices` | Firm information, founding, location |
| Project | `projects` | Building projects, timelines, budgets |
| Relationship | `relationships` | Office-to-office, office-to-client connections |
| Historical Event | `archHistory` | Awards, acquisitions, milestones |

### Tier 2: Operational Data (16 Categories)
| Category | Collection | Primary Use |
|----------|-----------|-------------|
| Regulatory & Zoning | `regulations` | Zoning laws, building codes, compliance |
| Client Info | `clients` | Client details, relationships |
| Company Structure | `companyStructure` | Org charts, departments, leadership |
| Financial Record | `financials` | Transactions, funding, expenses |
| Technology | `technology` | BIM, AI, software adoption |
| Supply Chain | `supplyChain` | Suppliers, materials |
| Land Data | `landData` | Parcels, sites, development |
| City Data | `cityData` | City-level trends, demographics |
| Division Analytics | `divisionPercentages` | Breakdowns, distributions |
| Workforce | `workforce` | Employees, talent, retention |

### Tier 3: Intelligence Layer (AI-Computed)
| Category | Collection | Primary Use |
|----------|-----------|-------------|
| Market Intelligence | `marketIntelligence` | Market share, consolidation |
| Trends | `trends` | Industry trends, trajectories |
| Competitive Analysis | `competitiveAnalysis` | SWOT, positioning |
| Financial Metrics | `financialMetrics` | KPIs, performance |
| Network Graph | `networkGraph` | Relationship networks |

---

## AI Categorization Engine

### Phase 1: Intent Detection

When user inputs text, the AI analyzes and identifies:

```typescript
interface ParsedInput {
  primaryIntent: DataCategory;
  confidence: number;           // 0-1 confidence score
  entities: ExtractedEntity[];  // Key information found
  relationships: string[];      // IDs of related entities
  suggestedCollection: string;  // Target Firestore collection
}

type DataCategory = 
  | 'office'
  | 'project'
  | 'relationship'
  | 'regulation'
  | 'client'
  | 'financial'
  | 'technology'
  | 'supply-chain'
  | 'land'
  | 'city'
  | 'workforce'
  | 'company-structure'
  | 'division'
  | 'history'
  | 'trend'
  | 'market'
  | 'competitive'
  | 'metric';
```

### Phase 2: Entity Extraction

AI extracts structured data from unstructured text:

```typescript
interface ExtractedEntity {
  type: string;           // office, project, person, location, etc.
  value: any;             // The actual value
  field: string;          // Which database field it maps to
  confidence: number;     // 0-1 confidence
}
```

### Phase 3: Field Mapping

Maps extracted entities to Firestore schema fields:

```typescript
interface FieldMapping {
  collection: string;
  documentId?: string;     // If updating existing doc
  fields: {
    [key: string]: any;    // Field name → value
  };
  metadata: {
    source: 'user-input';
    parsedAt: Timestamp;
    confidence: number;
  };
}
```

---

## Example Parsing Flows

### Example 1: Architecture Office

**User Input:**
```
"Zaha Hadid Architects was founded in 1980 in London. They specialize in parametric design 
and have completed over 950 projects worldwide. Currently employing 400 people."
```

**AI Analysis:**
```typescript
{
  primaryIntent: 'office',
  confidence: 0.95,
  suggestedCollection: 'offices',
  documentId: 'GBLO482',  // Generated using CCccNNN format: GB(UK)-LO(ndon)-482
  entities: [
    { type: 'office-name', value: 'Zaha Hadid Architects', field: 'name' },
    { type: 'founded', value: 1980, field: 'founded' },
    { type: 'location-city', value: 'London', field: 'location.headquarters.city' },
    { type: 'location-country', value: 'UK', field: 'location.headquarters.country' },
    { type: 'specialization', value: 'parametric design', field: 'specializations' },
    { type: 'employee-count', value: 400, field: 'size.employeeCount' }
  ]
}
```

**Firestore Save:**
```typescript
// Collection: offices
// Document ID: GBLO482 (GB-London-482 in CCccNNN format)
{
  id: 'GBLO482',  // CCccNNN format: CC=ISO country, cc=city, NNN=random
  name: 'Zaha Hadid Architects',
  officialName: 'Zaha Hadid Architects',
  founded: 1980,
  status: 'active',
  location: {
    headquarters: {
      city: 'London',
      country: 'UK',  // AI infers from context or asks
      coordinates: null  // Can be filled later
    },
    otherOffices: []
  },
  size: {
    employeeCount: 400,
    sizeCategory: 'large',  // AI infers from employee count
    annualRevenue: null
  },
  specializations: ['parametric-design'],
  notableWorks: [],
  connectionCounts: {
    totalProjects: 0,
    activeProjects: 0,
    clients: 0,
    competitors: 0,
    suppliers: 0
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### Example 2: Project Information

**User Input:**
```
"The Heydar Aliyev Center in Baku was designed by Zaha Hadid Architects. 
Construction started in 2007 and completed in 2012. Budget was $250 million USD. 
It's a cultural center with 57,500 square meters."
```

**AI Analysis:**
```typescript
{
  primaryIntent: 'project',
  confidence: 0.92,
  suggestedCollection: 'projects',
  entities: [
    { type: 'project-name', value: 'Heydar Aliyev Center', field: 'projectName' },
    { type: 'location', value: 'Baku', field: 'location.city' },
    { type: 'office', value: 'GBLO482', field: 'officeId' },  // Zaha Hadid's office ID
    { type: 'start-date', value: '2007-01-01', field: 'timeline.startDate' },
    { type: 'completion-date', value: '2012-05-10', field: 'timeline.actualCompletion' },
    { type: 'budget', value: 250000000, field: 'financial.budget' },
    { type: 'currency', value: 'USD', field: 'financial.currency' },
    { type: 'type', value: 'cultural', field: 'details.projectType' },
    { type: 'size', value: 57500, field: 'details.size' }
  ],
  relationships: ['GBLO482']  // Links to Zaha Hadid Architects office
}
```

**Firestore Save:**
```typescript
// Collection: projects
// Document ID: heydar-aliyev-center
{
  id: 'heydar-aliyev-center',
  projectName: 'Heydar Aliyev Center',
  officeId: 'GBLO482',  // Zaha Hadid Architects office ID in CCccNNN format
  clientId: null,  // Can be added later
  status: 'completed',
  timeline: {
    startDate: Timestamp.fromDate(new Date('2007-01-01')),
    expectedCompletion: Timestamp.fromDate(new Date('2012-01-01')),
    actualCompletion: Timestamp.fromDate(new Date('2012-05-10')),
    phases: []
  },
  location: {
    city: 'Baku',
    country: 'Azerbaijan',
    address: '',
    coordinates: null
  },
  financial: {
    budget: 250000000,
    currency: 'USD',
    actualCost: null,
    fundingSources: []
  },
  details: {
    projectType: 'cultural',
    size: 57500,
    description: 'Cultural center with parametric flowing design',
    awards: []
  },
  landParcelId: null,
  technologies: [],
  suppliers: [],
  regulations: [],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### Example 3: Regulatory Information

**User Input:**
```
"New York City updated height restrictions in Manhattan's Upper East Side to 
150 feet for residential buildings, effective January 2024. This impacts 
luxury residential projects."
```

**AI Analysis:**
```typescript
{
  primaryIntent: 'regulation',
  confidence: 0.88,
  suggestedCollection: 'regulations',
  entities: [
    { type: 'location', value: 'New York City', field: 'jurisdiction.region' },
    { type: 'regulation-type', value: 'zoning', field: 'regulationType' },
    { type: 'name', value: 'Manhattan Upper East Side Height Restriction', field: 'name' },
    { type: 'effective-date', value: '2024-01-01', field: 'effectiveDate' },
    { type: 'impact', value: 'residential buildings', field: 'description' }
  ]
}
```

**Firestore Save:**
```typescript
// Collection: regulations
{
  id: 'nyc-manhattan-height-restriction-2024',
  regulationType: 'zoning',
  name: 'Manhattan Upper East Side Height Restriction',
  jurisdiction: {
    type: 'city',
    region: 'New York City',
    applicableCities: ['new-york']
  },
  effectiveDate: Timestamp.fromDate(new Date('2024-01-01')),
  expirationDate: null,
  description: 'Height restrictions updated to 150 feet for residential buildings in Upper East Side',
  requirements: ['Maximum height: 150 feet'],
  affectedEntities: {
    offices: [],
    projects: [],
    landParcels: []
  },
  compliance: {
    mandatory: true,
    penalties: '',
    certifications: []
  },
  impact: 'High',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### Example 4: Financial Record

**User Input:**
```
"Foster + Partners received $10 million in Series B funding on March 15, 2024 
from Sequoia Capital for their digital innovation division."
```

**AI Analysis:**
```typescript
{
  primaryIntent: 'financial',
  confidence: 0.90,
  suggestedCollection: 'financials',
  entities: [
    { type: 'office', value: 'GBLO127', field: 'officeId' },  // Foster + Partners office ID
    { type: 'record-type', value: 'funding', field: 'recordType' },
    { type: 'amount', value: 10000000, field: 'amount' },
    { type: 'currency', value: 'USD', field: 'currency' },
    { type: 'date', value: '2024-03-15', field: 'date' },
    { type: 'source', value: 'Sequoia Capital', field: 'source' }
  ],
  relationships: ['GBLO127']  // Links to Foster + Partners
}
```

**Firestore Save:**
```typescript
// Collection: financials
{
  id: 'auto-generated-id',
  officeId: 'GBLO127',  // Foster + Partners office ID in CCccNNN format
  projectId: null,
  recordType: 'funding',
  amount: 10000000,
  currency: 'USD',
  date: Timestamp.fromDate(new Date('2024-03-15')),
  period: null,
  source: 'Sequoia Capital',
  destination: 'Foster + Partners - Digital Innovation Division',
  category: 'investment',
  details: 'Series B funding for digital innovation division',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### Example 5: Relationship

**User Input:**
```
"Zaha Hadid Architects and Foster + Partners are competitors in the luxury 
cultural architecture market. They frequently compete for museum projects 
in Europe and the Middle East."
```

**AI Analysis:**
```typescript
{
  primaryIntent: 'relationship',
  confidence: 0.85,
  suggestedCollection: 'relationships',
  entities: [
    { type: 'office-1', value: 'GBLO482', field: 'sourceEntity.id' },  // Zaha Hadid Architects
    { type: 'office-2', value: 'GBLO127', field: 'targetEntity.id' },  // Foster + Partners
    { type: 'relationship-type', value: 'competitor', field: 'relationshipType' },
    { type: 'context', value: 'luxury cultural architecture', field: 'details.context' }
  ],
  relationships: ['GBLO482', 'GBLO127']  // Both offices involved
}
```

**Firestore Save:**
```typescript
// Collection: relationships
{
  id: 'auto-generated-id',
  sourceEntity: {
    type: 'office',
    id: 'GBLO482'  // Zaha Hadid Architects in CCccNNN format
  },
  targetEntity: {
    type: 'office',
    id: 'GBLO127'  // Foster + Partners in CCccNNN format
  },
  relationshipType: 'competitor',
  strength: 7,  // AI estimates based on frequency mention
  sentiment: 'neutral',
  startDate: Timestamp.now(),
  endDate: null,
  details: {
    context: 'Compete for luxury cultural architecture projects',
    outcomes: ['Museum projects', 'European market', 'Middle East market'],
    notes: 'Frequently compete for museum projects in Europe and Middle East'
  },
  evidence: [],
  tags: ['cultural-architecture', 'museums', 'europe', 'middle-east'],
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

## AI Prompt Engineering for Categorization

### System Prompt Template

```
You are a data categorization expert for an architecture intelligence database.

Your task is to:
1. Analyze user input (unstructured text)
2. Identify the primary data category
3. Extract all relevant entities and values
4. Map them to the correct Firestore collection and fields

### Available Collections (Tier 1 - Core Entities):
- offices: Architecture firms (name, founded, location, size, specializations)
- projects: Building projects (name, location, budget, timeline, type)
- relationships: Connections between entities (competitors, clients, suppliers)
- archHistory: Historical events (awards, acquisitions, milestones)

### Available Collections (Tier 2 - Operational):
- regulations: Zoning laws, building codes, compliance requirements
- clients: Client information and relationships
- companyStructure: Org charts, departments, leadership
- financials: Transactions, funding, expenses, revenue
- technology: Software, BIM, AI adoption
- supplyChain: Suppliers, materials, sourcing
- landData: Land parcels, development sites
- cityData: City-level demographics, trends
- workforce: Employees, talent, retention
- divisionPercentages: Analytics breakdowns

### Your Response Format:
Return a JSON object with:
{
  "category": "collection-name",
  "confidence": 0.0-1.0,
  "entities": [
    { "field": "fieldName", "value": extractedValue, "type": "dataType" }
  ],
  "documentId": "suggested-document-id-if-applicable",
  "relationships": ["id-of-related-entity"],
  "needsMoreInfo": ["field1", "field2"] // If critical info is missing
}

### Field Naming Rules:
- Use exact Firestore field names (e.g., "officeId", "projectName", "regulationType")
- Nested fields use dot notation (e.g., "location.city", "financial.budget")
- Arrays should be indicated with type "array"

### Entity Recognition:
- Office names → CCccNNN format (CC=ISO country, cc=city, NNN=3-digit random)
  - Examples: "GBLO482" (GB-London), "USNE891" (US-NewYork), "AEDU356" (AE-Dubai)
  - AI must extract city and country to generate ID, or look up existing office by name
  - Use ISO 3166-1 alpha-2 country codes (GB for UK, US for USA, AE for UAE, etc.)
- Dates → ISO format or Timestamp
- Numbers → numeric values (remove currency symbols, commas)
- Locations → extract city, country, coordinates if mentioned

### Relationship Detection:
If input mentions multiple entities, identify:
- What type of relationship (competitor, client, supplier, collaborator)
- Strength (1-10 based on context)
- Sentiment (positive, neutral, negative)

Now analyze the following input:
"""
{USER_INPUT}
"""
```

---

## Data Validation & Quality Control

### Validation Layers

#### Layer 1: Schema Validation
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  suggestions: string[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

**Checks:**
- Required fields present
- Field types match schema
- Value ranges valid (e.g., founded year 1800-2024)
- Foreign key references exist (e.g., officeId must exist in offices collection)
- Enum values valid (e.g., status must be 'active' | 'acquired' | 'dissolved')

#### Layer 2: Business Logic Validation
```typescript
// Example validations
- Project start date < completion date
- Budget > 0
- Employee count >= 0
- Coordinates in valid range (-90 to 90 lat, -180 to 180 long)
- Related entities exist in database
```

#### Layer 3: AI Confidence Check
```typescript
if (confidence < 0.7) {
  // Low confidence - ask user to confirm
  return {
    status: 'needs-confirmation',
    parsedData: extractedData,
    message: 'AI is not fully confident. Please review before saving.'
  };
}
```

---

## Handling Ambiguity & Missing Data

### Strategy 1: Smart Defaults

```typescript
const smartDefaults = {
  office: {
    status: 'active',
    connectionCounts: { /* all zeros */ },
    specializations: [],
    notableWorks: []
  },
  project: {
    status: 'ongoing', // if no completion date
    phases: [],
    technologies: [],
    suppliers: []
  },
  regulation: {
    compliance: { mandatory: true },
    impact: 'Medium'
  }
};
```

### Strategy 2: Ask for Clarification

```typescript
if (needsMoreInfo.length > 0) {
  return {
    status: 'needs-more-info',
    message: `Please provide: ${needsMoreInfo.join(', ')}`,
    partialData: extractedData,
    suggestedQuestions: [
      `What is the location of ${entityName}?`,
      `What year was ${entityName} founded?`
    ]
  };
}
```

### Strategy 3: Progressive Enhancement

```typescript
// Save what we have, flag for later enrichment
{
  ...extractedData,
  _incomplete: true,
  _missingFields: ['coordinates', 'employeeCount'],
  _enrichmentSuggestions: [
    'Add geographic coordinates',
    'Update employee count'
  ]
}
```

---

## Update vs Create Logic

### Detection Strategy

```typescript
async function determineOperation(parsedData: ParsedInput): Promise<'create' | 'update'> {
  const { category, entities } = parsedData;
  
  // Check if entity already exists
  if (category === 'office') {
    const officeName = entities.find(e => e.type === 'office-name')?.value;
    
    // Search by name first (office might already exist)
    const existingOffice = await db.collection('offices')
      .where('name', '==', officeName)
      .limit(1)
      .get();
    
    if (!existingOffice.empty) {
      // Office exists, return its ID for update
      parsedData.documentId = existingOffice.docs[0].id;  // e.g., 'GBLO482'
      return 'update';
    }
    
    // Office doesn't exist, generate new CCccNNN ID
    const city = entities.find(e => e.type === 'location-city')?.value;
    const country = entities.find(e => e.type === 'location-country')?.value;
    parsedData.documentId = await generateUniqueOfficeId(city, country, db);
    return 'create';
  }
  
  if (category === 'project') {
    const projectName = entities.find(e => e.type === 'project-name')?.value;
    // Search for existing project with same name
    const existing = await searchExistingProject(projectName);
    return existing ? 'update' : 'create';
  }
  
  // Default: create new
  return 'create';
}

// Country code mapping (ISO 3166-1 alpha-2)
const COUNTRY_CODES: Record<string, string> = {
  'UK': 'GB', 'United Kingdom': 'GB',
  'USA': 'US', 'United States': 'US',
  'UAE': 'AE', 'United Arab Emirates': 'AE',
  'France': 'FR', 'Germany': 'DE', 'Netherlands': 'NL',
  'Spain': 'ES', 'Italy': 'IT', 'China': 'CN',
  'Japan': 'JP', 'Australia': 'AU', 'Canada': 'CA',
  'Brazil': 'BR', 'India': 'IN', 'Singapore': 'SG',
  'Denmark': 'DK', 'Switzerland': 'CH', 'Sweden': 'SE'
  // ... more countries
};

// Helper function to generate office ID in CCccNNN format
function generateOfficeId(city: string, country: string): string {
  // Get ISO country code (2 letters)
  const countryCode = COUNTRY_CODES[country] || country.substring(0, 2).toUpperCase();
  
  // Get city code (first 2 letters)
  const cityCode = city
    .replace(/[^a-zA-Z\s]/g, '')  // Remove special chars
    .replace(/\s+/g, '')          // Remove spaces
    .substring(0, 2)
    .toUpperCase();
  
  // Generate random 3-digit number
  const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
  
  // Combine: CCccNNN
  return `${countryCode}${cityCode}${randomNum}`;
}

// Generate unique office ID (checks for collisions)
async function generateUniqueOfficeId(
  city: string,
  country: string,
  db: Firestore
): Promise<string> {
  let attempts = 0;
  
  while (attempts < 10) {
    const id = generateOfficeId(city, country);
    const exists = await db.collection('offices').doc(id).get();
    
    if (!exists.exists) {
      return id; // Found unique ID
    }
    
    attempts++;
  }
  
  // Fallback: add timestamp
  return generateOfficeId(city, country) + Date.now().toString().slice(-2);
}
```

### Merge Strategy for Updates

```typescript
async function mergeUpdate(existingDoc: any, newData: any): Promise<any> {
  return {
    ...existingDoc,
    ...newData,
    
    // Merge arrays (don't overwrite)
    specializations: [
      ...new Set([
        ...(existingDoc.specializations || []),
        ...(newData.specializations || [])
      ])
    ],
    
    // Update nested objects
    location: {
      ...existingDoc.location,
      ...newData.location
    },
    
    // Update timestamp
    updatedAt: Timestamp.now()
  };
}
```

---

## Relationship Auto-Linking

When saving data, automatically create relationships:

### Auto-Link Patterns

```typescript
// When saving a project
if (newProject.officeId) {
  // Create office → project relationship
  await createRelationship({
    sourceEntity: { type: 'office', id: newProject.officeId },
    targetEntity: { type: 'project', id: newProject.id },
    relationshipType: 'creator',
    strength: 10,
    sentiment: 'positive'
  });
  
  // Update office connection counts
  await updateOfficeConnectionCounts(newProject.officeId, {
    totalProjects: FieldValue.increment(1),
    activeProjects: newProject.status === 'ongoing' ? FieldValue.increment(1) : 0
  });
}

// When saving a client relationship
if (parsedData.category === 'client') {
  // Auto-link to associated projects
  for (const projectId of clientData.projects) {
    await createRelationship({
      sourceEntity: { type: 'office', id: clientData.associatedOffice },
      targetEntity: { type: 'client', id: clientData.id },
      relationshipType: 'client-of',
      strength: 8,
      sentiment: 'positive'
    });
  }
}
```

---

## User Feedback Loop

### Confirmation UI Flow

```typescript
interface ConfirmationData {
  status: 'pending-confirmation';
  parsedData: ParsedInput;
  preview: DocumentPreview;
  confidence: number;
  warnings: string[];
  suggestedEdits: Array<{
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
  }>;
}

// User sees:
{
  collection: 'offices',
  action: 'create',
  data: {
    name: 'Zaha Hadid Architects',
    founded: 1980,
    location: { city: 'London', country: 'UK' }
  },
  confidence: 0.92,
  warnings: ['Country inferred from city name'],
  suggestedEdits: [
    {
      field: 'sizeCategory',
      currentValue: 'large',
      suggestedValue: 'large',
      reason: '400 employees indicates large firm'
    }
  ]
}

// User can:
// - Accept all
// - Edit specific fields
// - Reject and re-enter
```

---

## Implementation Architecture

### Service Layer

```typescript
// /renderer/src/services/noteSystem/intelligentParser.ts

export class IntelligentNoteParser {
  constructor(
    private claudeClient: ClaudeClient,
    private db: Firestore
  ) {}
  
  async parseAndSave(userInput: string): Promise<SaveResult> {
    // 1. Parse with AI
    const parsed = await this.parseInput(userInput);
    
    // 2. Validate
    const validation = await this.validate(parsed);
    if (!validation.isValid) {
      return { status: 'error', errors: validation.errors };
    }
    
    // 3. Check for existing entity
    const operation = await this.determineOperation(parsed);
    
    // 4. Get user confirmation if needed
    if (parsed.confidence < 0.8 || validation.warnings.length > 0) {
      return {
        status: 'needs-confirmation',
        data: parsed,
        validation
      };
    }
    
    // 5. Save to Firestore
    const result = await this.saveToFirestore(parsed, operation);
    
    // 6. Create auto-relationships
    await this.createRelationships(result);
    
    // 7. Update denormalized counts
    await this.updateConnectionCounts(result);
    
    return { status: 'success', data: result };
  }
  
  private async parseInput(input: string): Promise<ParsedInput> {
    const prompt = this.buildCategorizationPrompt(input);
    const response = await this.claudeClient.sendMessage(prompt);
    return JSON.parse(response);
  }
  
  private async saveToFirestore(
    parsed: ParsedInput, 
    operation: 'create' | 'update'
  ): Promise<any> {
    const collection = parsed.suggestedCollection;
    const docRef = this.db.collection(collection).doc(parsed.documentId);
    
    if (operation === 'create') {
      await docRef.set(parsed.fields);
    } else {
      const existing = await docRef.get();
      const merged = await this.mergeUpdate(existing.data(), parsed.fields);
      await docRef.update(merged);
    }
    
    return { id: docRef.id, ...parsed.fields };
  }
}
```

---

## Performance & Optimization

### Batch Processing

For multiple notes at once:

```typescript
async function batchParseAndSave(inputs: string[]): Promise<BatchResult> {
  // Parse all inputs in parallel
  const parsed = await Promise.all(
    inputs.map(input => parser.parseInput(input))
  );
  
  // Group by collection for efficient batch writes
  const grouped = groupByCollection(parsed);
  
  // Firestore batch writes (max 500 per batch)
  const batches = createBatches(grouped, 500);
  
  for (const batch of batches) {
    await batch.commit();
  }
  
  return { saved: parsed.length, errors: [] };
}
```

### Caching

```typescript
// Cache common office lookups
const officeCache = new Map<string, Office>();
const officeNameToIdCache = new Map<string, string>();

async function getOffice(officeName: string): Promise<Office | null> {
  // Check if we've cached the name → ID mapping
  if (officeNameToIdCache.has(officeName)) {
    const officeId = officeNameToIdCache.get(officeName)!;
    if (officeCache.has(officeId)) {
      return officeCache.get(officeId)!;
    }
  }
  
  // Search by name
  const query = await db.collection('offices')
    .where('name', '==', officeName)
    .limit(1)
    .get();
  
  if (!query.empty) {
    const doc = query.docs[0];
    const office = doc.data() as Office;
    
    // Cache both the office and the name → ID mapping (CCccNNN format)
    officeCache.set(doc.id, office);  // e.g., 'GBLO482'
    officeNameToIdCache.set(officeName, doc.id);
    
    return office;
  }
  
  return null;
}

async function getOfficeById(officeId: string): Promise<Office | null> {
  // officeId is in CCccNNN format (e.g., 'GBLO482')
  if (officeCache.has(officeId)) {
    return officeCache.get(officeId)!;
  }
  
  const doc = await db.collection('offices').doc(officeId).get();
  if (doc.exists) {
    const office = doc.data() as Office;
    officeCache.set(officeId, office);
    return office;
  }
  
  return null;
}
```

---

## Error Handling

### Error Types

```typescript
type ParseError = 
  | { type: 'ambiguous-category'; suggestions: string[] }
  | { type: 'missing-required-field'; field: string }
  | { type: 'invalid-value'; field: string; reason: string }
  | { type: 'reference-not-found'; entity: string; id: string }
  | { type: 'ai-confidence-low'; confidence: number }
  | { type: 'schema-validation-failed'; errors: ValidationError[] };

function handleParseError(error: ParseError): UserFeedback {
  switch (error.type) {
    case 'ambiguous-category':
      return {
        message: 'Could not determine data category.',
        suggestions: error.suggestions,
        action: 'Please clarify or select category manually'
      };
    
    case 'missing-required-field':
      return {
        message: `Missing required field: ${error.field}`,
        action: `Please provide ${error.field}`
      };
    
    case 'reference-not-found':
      return {
        message: `Could not find ${error.entity}: ${error.id}`,
        action: 'Create this entity first or check the name'
      };
    
    // ... other cases
  }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('IntelligentNoteParser', () => {
  it('should parse office information correctly', async () => {
    const input = 'Zaha Hadid Architects founded in 1980';
    const result = await parser.parseInput(input);
    
    expect(result.category).toBe('office');
    expect(result.entities).toContainEqual({
      field: 'name',
      value: 'Zaha Hadid Architects'
    });
    expect(result.entities).toContainEqual({
      field: 'founded',
      value: 1980
    });
  });
  
  it('should detect update vs create', async () => {
    // Create office first
    await createOffice('test-office');
    
    const input = 'Test Office now has 500 employees';
    const operation = await parser.determineOperation(input);
    
    expect(operation).toBe('update');
  });
});
```

---

## Summary

The Intelligent Note System provides:

✅ **Automatic Categorization** - AI determines the right collection
✅ **Field Extraction** - Pulls structured data from unstructured text
✅ **Schema Validation** - Ensures data matches Firestore structure
✅ **Smart Updates** - Detects existing entities and merges data
✅ **Auto-Relationships** - Creates connections between entities
✅ **User Confirmation** - Shows preview before saving
✅ **Error Handling** - Graceful handling of ambiguous/missing data
✅ **Batch Processing** - Efficient for multiple notes
✅ **Progressive Enhancement** - Saves partial data, flags for completion

The system bridges the gap between natural language input and structured database storage, making data entry seamless and intelligent.

