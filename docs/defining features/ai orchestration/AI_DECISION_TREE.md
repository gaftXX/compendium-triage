# AI Orchestra Decision Tree - Multi-Tier Routing System

## Architecture Philosophy

**Problem:** Sending all 50+ tools in one prompt is inefficient, expensive, and confusing for the AI.

**Solution:** Multi-tier decision system where AI makes progressively refined decisions, only loading relevant tools at each stage.

## How Production AI Agents Work (Cursor Model)

### Stage 1: Intent Classification
First prompt is tiny, just classifies intent into broad categories.

### Stage 2: Domain Routing
Based on intent, route to specialized domain handler with relevant tools only.

### Stage 3: Action Execution
Domain handler has focused toolset, executes action efficiently.

### Stage 4: Result Synthesis
Final response generation with context of what was done.

## Multi-Tier Decision System

### Tier 1: Intent Router (Lightweight Prompt)

**Purpose:** Classify user intent into one of 7 domains

**Input:** User query + current app state (page, selected items)

**AI Prompt:** 200 tokens
```
You are an intent classifier. Classify this user request into ONE domain:

Domains:
1. DATA_CRUD - Creating, updating, deleting entities
2. DATA_QUERY - Asking questions about existing data
3. NAVIGATION - Moving between pages or views
4. RESEARCH - Web search or external data gathering
5. ANALYSIS - Analyzing, comparing, or generating insights
6. NOTE_PROCESSING - Extracting entities from unstructured text
7. SYSTEM - App settings, help, or meta commands

User: "{query}"
Current context: {currentPage}, {selectedOffice}

Respond with ONLY the domain name.
```

**Output:** Domain name (e.g., "DATA_CRUD")

**Cost:** ~$0.0002 per classification

### Tier 2: Domain Handler (Focused Toolset)

Based on domain, load ONLY relevant tools.

#### Domain 1: DATA_CRUD Handler
**Tools Loaded:** (10 tools)
- create_office
- update_office
- delete_office
- create_project
- update_project
- delete_project
- create_regulation
- update_regulation
- delete_regulation
- create_meditation

**Prompt Size:** 800 tokens

#### Domain 2: DATA_QUERY Handler
**Tools Loaded:** (8 tools)
- get_office
- get_project
- search_offices
- search_projects
- count_offices
- count_projects
- get_office_with_most_projects
- get_project_details

**Prompt Size:** 700 tokens

#### Domain 3: NAVIGATION Handler
**Tools Loaded:** (6 tools)
- navigate_to_offices
- navigate_to_projects
- navigate_to_regulations
- navigate_to_map
- navigate_to_meditations
- open_office_detail

**Prompt Size:** 500 tokens

#### Domain 4: RESEARCH Handler
**Tools Loaded:** (5 tools)
- search_web
- scrape_website
- extract_website_data
- enrich_office_data
- find_company_website

**Prompt Size:** 600 tokens

#### Domain 5: ANALYSIS Handler
**Tools Loaded:** (7 tools)
- analyze_market
- compare_offices
- compare_projects
- generate_insights
- calculate_metrics
- identify_trends
- summarize_data

**Prompt Size:** 800 tokens

#### Domain 6: NOTE_PROCESSING Handler
**Tools Loaded:** (1 tool)
- process_note

**Prompt Size:** 300 tokens
**Special:** Asks user for confirmation before activating

#### Domain 7: SYSTEM Handler
**Tools Loaded:** (4 tools)
- get_help
- list_features
- check_api_status
- reset_session

**Prompt Size:** 400 tokens

### Tier 3: Action Execution

Domain handler calls tools, gathers results.

### Tier 4: Response Synthesis

Final prompt with results, generates user response.

## Comparison: Naive vs Multi-Tier

### Naive Approach (Bad)
```
Single prompt with ALL 50 tools listed
Prompt size: 3500 tokens
Cost per query: $0.010
AI confusion: High (too many options)
```

### Multi-Tier Approach (Good)
```
Tier 1 (Router): 200 tokens = $0.0002
Tier 2 (Domain): 800 tokens = $0.002
Total: 1000 tokens = $0.0022
AI accuracy: Higher (focused toolset)
```

**Savings:** 78% cost reduction, better accuracy

## Auto-Discovery Action Registry

### System Architecture

```
Action Registry (Auto-Discovery)
    ↓
Scans codebase for action files
    ↓
Extracts tool definitions automatically
    ↓
Categorizes into domains
    ↓
Generates domain handler configs
    ↓
Updates at build time
```

### File Structure

```
renderer/src/services/aiOrchestra/
├── registry/
│   ├── actionRegistry.ts           # Auto-discovery system
│   ├── actionScanner.ts            # Scans code for actions
│   ├── domainMapper.ts             # Maps actions to domains
│   └── registryGenerator.ts        # Generates configs
├── domains/
│   ├── dataCrudDomain.ts
│   ├── dataQueryDomain.ts
│   ├── navigationDomain.ts
│   ├── researchDomain.ts
│   ├── analysisDomain.ts
│   ├── noteProcessingDomain.ts
│   └── systemDomain.ts
├── router/
│   ├── intentRouter.ts             # Tier 1 classifier
│   └── domainRouter.ts             # Routes to domain handler
└── orchestrator.ts                 # Main orchestrator
```

## Auto-Discovery System

### Action Definition Format

Every action file exports a standard format:

```
File: tools/dataTools.ts

export const createOfficeAction = {
  name: "create_office",
  domain: "DATA_CRUD",
  description: "Create a new architecture office",
  parameters: {
    name: "Office name",
    city: "City location",
    country: "Country location"
  },
  handler: async (params) => {
    // Implementation
  }
}

// Auto-export for registry
export const ACTION_DEFINITIONS = [
  createOfficeAction,
  updateOfficeAction,
  deleteOfficeAction
];
```

### Registry Scanner

Automatically scans all action files and builds registry:

```
Registry Scanner Process:
1. Scan tools/ directory
2. Import all *Tools.ts files
3. Extract ACTION_DEFINITIONS exports
4. Group by domain
5. Generate domain configs
6. Cache registry
```

### Domain Config Generation

```
Generated config for DATA_CRUD domain:
{
  name: "DATA_CRUD",
  tools: [
    { name: "create_office", description: "...", parameters: {...} },
    { name: "update_office", description: "...", parameters: {...} },
    { name: "delete_office", description: "...", parameters: {...} }
  ],
  promptTemplate: "You can create, update, or delete offices, projects, regulations..."
}
```

## Decision Flow Example

### Example 1: "Create office Foster Partners in London"

**Tier 1: Intent Router**
- Input: "Create office Foster Partners in London"
- Classification: DATA_CRUD
- Route to: DATA_CRUD Domain Handler

**Tier 2: DATA_CRUD Handler**
- Loaded tools: 10 CRUD tools only
- AI decides: Use create_office tool
- Parameters: {name: "Foster Partners", city: "London", country: "UK"}

**Tier 3: Execution**
- Execute: create_office(params)
- Result: Office created with ID UKLD001

**Tier 4: Response**
- Synthesize: "Created Foster Partners office (UKLD001) in London"

**Total tokens:** 1000
**Cost:** $0.0022

### Example 2: "Which office has the most projects?"

**Tier 1: Intent Router**
- Input: "Which office has the most projects?"
- Classification: DATA_QUERY
- Route to: DATA_QUERY Domain Handler

**Tier 2: DATA_QUERY Handler**
- Loaded tools: 8 query tools only
- AI decides: Use get_office_with_most_projects tool

**Tier 3: Execution**
- Execute: get_office_with_most_projects()
- Result: {name: "Zaha Hadid", id: "UKLD001", projects: 47}

**Tier 4: Response**
- Synthesize: "Zaha Hadid Architects (UKLD001) has the most projects with 47"

**Total tokens:** 900
**Cost:** $0.0020

### Example 3: "Boris Pena Arquitectos based in Barcelona, 25 employees..."

**Tier 1: Intent Router**
- Input: Long descriptive text
- Classification: NOTE_PROCESSING
- Route to: NOTE_PROCESSING Domain Handler

**Tier 2: NOTE_PROCESSING Handler**
- Loaded tools: 1 tool (process_note)
- AI asks: "This looks like a note. Activate note system?"
- User confirms: "yes"

**Tier 3: Execution**
- Execute: process_note(fullText)
- Note system extracts entities
- Result: Office created with employees

**Tier 4: Response**
- Synthesize: "Note processed. Created Boris Pena Arquitectos (SPBA001) with 25 employees"

**Total tokens:** 500 (smaller for note processing)
**Cost:** $0.0011

## Context Awareness Layer

### Before Routing

Router receives context:
- Current page (offices-list, projects-list, etc.)
- Selected entity (if any)
- Recent actions (last 3)
- User preferences

### Smart Context Usage

If user says "open it":
- Context knows: Last query was about "Zaha Hadid office"
- Infer: "open it" = open_office_detail(UKLD001)

If user says "update the website to X":
- Context knows: Currently viewing office UKLD002
- Infer: update_office(UKLD002, {website: X})

## Caching Strategy

### Domain Config Cache

Cache domain configurations at build time:
- Generated once from action registry
- Loaded into memory on app start
- Updated only when actions change

### Tool Definition Cache

Cache tool definitions per domain:
- Pre-formatted for Claude API
- Loaded when domain handler activates
- Reduces runtime processing

### Intent Classification Cache

For common queries, cache classifications:
- "How many offices?" → Always DATA_QUERY
- "Open offices" → Always NAVIGATION
- 90% hit rate for common patterns

## Progressive Enhancement

### Basic Implementation (Phase 1)

Single-tier: All tools in one prompt (current)

### Intermediate (Phase 2)

Two-tier: Router + Domain handlers

### Advanced (Phase 3)

Multi-tier with caching and context awareness

### Production (Phase 4)

Add learning: Track which domain classifications work best, auto-improve

## Registry Update Triggers

### Automatic Updates

Registry auto-updates when:
1. New action file added to tools/
2. Action definition modified
3. App build/compile
4. Manual registry refresh command

### Developer Experience

Developer adds new action:
1. Create action in appropriate tools file
2. Export in ACTION_DEFINITIONS array
3. That's it - registry auto-discovers it
4. AI automatically has access to new action

## Error Handling

### Tier 1 Classification Error

If router can't classify:
- Fall back to general handler with all tools
- Log classification failure
- Learn from correction

### Tier 2 Domain Error

If domain handler fails:
- Try fallback domain (general)
- Provide helpful error message
- Suggest correct domain

### Tier 3 Execution Error

If tool execution fails:
- Return error to AI
- AI can try alternative approach
- Or explain error to user

## Monitoring & Analytics

### Track Metrics

- Classification accuracy (what % routed correctly)
- Average tokens per query
- Cost per query
- Response time per domain
- Tool usage frequency

### Optimization

Use metrics to:
- Improve router prompts
- Adjust domain boundaries
- Identify unused tools
- Optimize token usage

## Integration with Existing System

### Migration Path

**Phase 1:** Add registry system alongside current system

**Phase 2:** Implement router (Tier 1)

**Phase 3:** Implement domain handlers (Tier 2)

**Phase 4:** Add caching and context awareness

**Phase 5:** Remove old single-prompt system

### Backwards Compatibility

During migration:
- Gen 1 mode: Use old system (current)
- Gen 2 mode: Use new multi-tier system
- Switch seamlessly between modes

## Advantages Over Naive Approach

### Efficiency
- 78% cost reduction
- Faster response times
- Less token usage

### Accuracy
- AI sees focused toolset
- Less confusion
- Better tool selection

### Maintainability
- Auto-discovery means less manual updating
- Domain organization keeps code clean
- Easy to add new tools

### Scalability
- Can add 100+ tools without overwhelming AI
- Each domain stays focused
- Context-aware routing improves over time

## Implementation Priority

### Must Have (MVP)
1. Action registry with auto-discovery
2. Intent router (Tier 1)
3. Domain handlers (Tier 2)
4. Basic execution

### Should Have (V1.1)
1. Context awareness
2. Domain config caching
3. Error handling
4. Basic analytics

### Nice to Have (V2)
1. Intent classification caching
2. Learning from corrections
3. Advanced context handling
4. Performance optimization

## Conclusion

Multi-tier routing with auto-discovery creates a sophisticated AI system that:
- Automatically stays up to date with available actions
- Routes queries efficiently to specialized handlers
- Reduces costs by 78% compared to naive approach
- Provides better accuracy through focused toolsets
- Scales to 100+ tools without degradation
- Mimics production AI agent architectures (like Cursor)

This is how real AI agents work in production systems.

