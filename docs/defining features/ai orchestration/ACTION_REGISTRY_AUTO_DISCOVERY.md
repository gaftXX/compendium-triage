# Action Registry - Auto-Discovery System

## Overview

Automatic system that scans the codebase and discovers all available actions, keeping the AI Orchestra's tool registry always up to date without manual maintenance.

## Core Concept

**Instead of manually maintaining a list of tools, the system automatically:**
1. Scans all action files in the tools directory
2. Extracts action definitions using standard format
3. Categorizes actions by domain
4. Generates domain configurations
5. Updates AI Orchestra registry
6. Happens at build time, zero manual work

## Standard Action Definition Format

### Every Action Exports This Structure

```
File: tools/dataTools.ts

export const CREATE_OFFICE_ACTION = {
  name: "create_office",
  domain: "DATA_CRUD",
  description: "Create a new architecture office with name and location",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Office name" },
      city: { type: "string", description: "City location" },
      country: { type: "string", description: "Country location" },
      founded: { type: "number", description: "Year founded (optional)" },
      website: { type: "string", description: "Website URL (optional)" }
    },
    required: ["name", "city", "country"]
  },
  handler: async (params) => {
    const { firestoreOperations } = await import('../firebase/firestoreOperations');
    return await firestoreOperations.createOffice(params);
  },
  requiresConfirmation: false
};

// Export all actions for auto-discovery
export const ACTION_DEFINITIONS = [
  CREATE_OFFICE_ACTION,
  UPDATE_OFFICE_ACTION,
  DELETE_OFFICE_ACTION
];
```

### Action Definition Schema

```
ActionDefinition {
  name: string                    // Unique identifier (snake_case)
  domain: DomainType             // Which domain this belongs to
  description: string            // What this action does
  parameters: ParameterSchema    // Claude API tool parameter format
  handler: Function              // Actual implementation
  requiresConfirmation: boolean  // If user approval needed
  context?: string[]             // Required context (optional)
  examples?: string[]            // Usage examples (optional)
}
```

### Domain Types

```
DomainType:
  - "DATA_CRUD"         // Create, update, delete
  - "DATA_QUERY"        // Get, search, count
  - "NAVIGATION"        // Navigate between pages
  - "RESEARCH"          // Web search, scraping
  - "ANALYSIS"          // Analyze, compare, insights
  - "NOTE_PROCESSING"   // Entity extraction
  - "SYSTEM"            // Help, settings, meta
```

## Auto-Discovery Scanner

### Scanner Implementation

```
File: registry/actionScanner.ts

class ActionScanner {
  async scanActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];
    
    // 1. Find all files matching *Tools.ts in tools/
    const toolFiles = await this.findToolFiles();
    
    // 2. Import each file
    for (const file of toolFiles) {
      const module = await import(file);
      
      // 3. Extract ACTION_DEFINITIONS export
      if (module.ACTION_DEFINITIONS) {
        actions.push(...module.ACTION_DEFINITIONS);
      }
    }
    
    // 4. Validate all actions
    for (const action of actions) {
      this.validateAction(action);
    }
    
    return actions;
  }
  
  private async findToolFiles(): Promise<string[]> {
    // Scan tools/ directory for *Tools.ts files
    return glob('tools/**/*Tools.ts');
  }
  
  private validateAction(action: ActionDefinition): void {
    // Ensure required fields present
    if (!action.name) throw new Error('Action missing name');
    if (!action.domain) throw new Error('Action missing domain');
    if (!action.description) throw new Error('Action missing description');
    if (!action.parameters) throw new Error('Action missing parameters');
    if (!action.handler) throw new Error('Action missing handler');
  }
}
```

### Domain Mapper

```
File: registry/domainMapper.ts

class DomainMapper {
  groupByDomain(actions: ActionDefinition[]): Map<DomainType, ActionDefinition[]> {
    const domains = new Map();
    
    for (const action of actions) {
      if (!domains.has(action.domain)) {
        domains.set(action.domain, []);
      }
      domains.get(action.domain).push(action);
    }
    
    return domains;
  }
  
  generateDomainConfig(domain: DomainType, actions: ActionDefinition[]): DomainConfig {
    return {
      name: domain,
      tools: actions.map(a => ({
        name: a.name,
        description: a.description,
        parameters: a.parameters
      })),
      handlers: new Map(actions.map(a => [a.name, a.handler])),
      promptTemplate: this.generatePromptTemplate(domain, actions)
    };
  }
}
```

### Registry Generator

```
File: registry/registryGenerator.ts

class RegistryGenerator {
  async generateRegistry(): Promise<ActionRegistry> {
    // 1. Scan all actions
    const scanner = new ActionScanner();
    const actions = await scanner.scanActions();
    
    // 2. Group by domain
    const mapper = new DomainMapper();
    const domainGroups = mapper.groupByDomain(actions);
    
    // 3. Generate domain configs
    const domainConfigs = new Map();
    for (const [domain, domainActions] of domainGroups) {
      domainConfigs.set(domain, mapper.generateDomainConfig(domain, domainActions));
    }
    
    // 4. Create registry
    return {
      actions: actions,
      domains: domainConfigs,
      metadata: {
        totalActions: actions.length,
        totalDomains: domainConfigs.size,
        generatedAt: new Date(),
        version: '1.0.0'
      }
    };
  }
  
  async saveRegistry(registry: ActionRegistry): Promise<void> {
    // Cache registry to file
    const path = 'cache/actionRegistry.json';
    await fs.writeFile(path, JSON.stringify(registry, null, 2));
  }
}
```

## Build-Time Generation

### Integration with Build System

```
File: scripts/generateRegistry.ts

async function generateActionRegistry() {
  console.log('Generating action registry...');
  
  const generator = new RegistryGenerator();
  const registry = await generator.generateRegistry();
  
  console.log(`Found ${registry.metadata.totalActions} actions across ${registry.metadata.totalDomains} domains`);
  
  await generator.saveRegistry(registry);
  
  console.log('Registry saved to cache/actionRegistry.json');
}

// Run during build
generateActionRegistry();
```

### Package.json Integration

```
"scripts": {
  "prebuild": "npm run generate:registry",
  "generate:registry": "ts-node scripts/generateRegistry.ts",
  "build": "vite build"
}
```

## Runtime Loading

### Registry Loader

```
File: registry/registryLoader.ts

class RegistryLoader {
  private registry: ActionRegistry | null = null;
  
  async loadRegistry(): Promise<ActionRegistry> {
    if (this.registry) return this.registry;
    
    // Load from cache
    const cached = await fs.readFile('cache/actionRegistry.json', 'utf-8');
    this.registry = JSON.parse(cached);
    
    return this.registry;
  }
  
  getDomainConfig(domain: DomainType): DomainConfig {
    const registry = this.registry;
    if (!registry) throw new Error('Registry not loaded');
    
    const config = registry.domains.get(domain);
    if (!config) throw new Error(`Domain ${domain} not found`);
    
    return config;
  }
  
  getActionHandler(actionName: string): ActionHandler {
    // Find action across all domains
    for (const [domain, config] of this.registry.domains) {
      const handler = config.handlers.get(actionName);
      if (handler) return handler;
    }
    
    throw new Error(`Action ${actionName} not found`);
  }
}
```

## Tool File Organization

### File Structure

```
tools/
├── dataTools.ts              # CRUD operations
├── queryTools.ts             # Data queries
├── navigationTools.ts        # Navigation actions
├── researchTools.ts          # Web search, scraping
├── analysisTools.ts          # Analysis actions
├── noteProcessingTools.ts    # Note system wrapper
└── systemTools.ts            # System commands
```

### Example Tool File

```
File: tools/queryTools.ts

import { firestoreOperations } from '../firebase/firestoreOperations';

// Action 1: Get office by ID
export const GET_OFFICE_ACTION = {
  name: "get_office",
  domain: "DATA_QUERY",
  description: "Get details of a specific office by ID",
  parameters: {
    type: "object",
    properties: {
      officeId: { type: "string", description: "Office ID (e.g., SPBA001)" }
    },
    required: ["officeId"]
  },
  handler: async ({ officeId }) => {
    return await firestoreOperations.getDocument('offices', officeId);
  },
  requiresConfirmation: false
};

// Action 2: Search offices
export const SEARCH_OFFICES_ACTION = {
  name: "search_offices",
  domain: "DATA_QUERY",
  description: "Search for offices by name, location, or other criteria",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      location: { type: "string", description: "Filter by location (optional)" },
      limit: { type: "number", description: "Max results (optional, default 10)" }
    },
    required: ["query"]
  },
  handler: async ({ query, location, limit = 10 }) => {
    return await firestoreOperations.searchOffices({ query, location, limit });
  },
  requiresConfirmation: false
};

// Action 3: Count offices
export const COUNT_OFFICES_ACTION = {
  name: "count_offices",
  domain: "DATA_QUERY",
  description: "Count total number of offices, optionally filtered by location",
  parameters: {
    type: "object",
    properties: {
      location: { type: "string", description: "Filter by location (optional)" }
    }
  },
  handler: async ({ location }) => {
    return await firestoreOperations.countOffices(location);
  },
  requiresConfirmation: false
};

// Export all for auto-discovery
export const ACTION_DEFINITIONS = [
  GET_OFFICE_ACTION,
  SEARCH_OFFICES_ACTION,
  COUNT_OFFICES_ACTION
];
```

## Developer Workflow

### Adding New Action

**Step 1:** Choose appropriate tool file (or create new)

**Step 2:** Define action using standard format
```
export const MY_NEW_ACTION = {
  name: "my_new_action",
  domain: "DATA_CRUD",
  description: "What this does",
  parameters: { /* Claude tool format */ },
  handler: async (params) => { /* implementation */ },
  requiresConfirmation: false
};
```

**Step 3:** Add to ACTION_DEFINITIONS export
```
export const ACTION_DEFINITIONS = [
  EXISTING_ACTION,
  MY_NEW_ACTION  // <-- Add here
];
```

**Step 4:** Build app
```
npm run build
```

**That's it!** Registry auto-updates, AI now has access to new action.

## Benefits

### Zero Manual Maintenance
- No manually maintained action list
- No risk of forgetting to update registry
- Actions and registry stay in sync automatically

### Enforced Standards
- All actions follow same format
- Validation at build time
- Type safety

### Easy Discovery
- New developers see all actions in tool files
- Standard location and format
- Self-documenting

### Scalability
- Can grow to 100+ actions
- No maintenance burden
- Organized by domain

### Build-Time Safety
- Errors caught at build time, not runtime
- Invalid actions prevent build
- Registry always valid

## Registry Cache Structure

```
cache/actionRegistry.json

{
  "metadata": {
    "totalActions": 42,
    "totalDomains": 7,
    "generatedAt": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  },
  "domains": {
    "DATA_CRUD": {
      "tools": [
        {
          "name": "create_office",
          "description": "Create a new architecture office",
          "parameters": { /* Claude format */ }
        }
      ]
    },
    "DATA_QUERY": {
      "tools": [ /* query tools */ ]
    }
  }
}
```

## Hot Reload in Development

### Watch Mode

```
File: scripts/watchRegistry.ts

const watcher = chokidar.watch('tools/**/*Tools.ts');

watcher.on('change', async (path) => {
  console.log(`Tool file changed: ${path}`);
  console.log('Regenerating registry...');
  
  await generateActionRegistry();
  
  console.log('Registry updated!');
});
```

### Dev Experience

1. Developer modifies action in tool file
2. File watcher detects change
3. Registry auto-regenerates
4. App hot-reloads with new registry
5. AI immediately has access to updated action

## Validation Rules

### Action Name Rules
- Must be unique across all actions
- Must be snake_case
- Must be descriptive

### Domain Rules
- Must be valid DomainType
- All actions in domain must be related

### Parameter Rules
- Must follow Claude tool parameter format
- Required fields must be marked
- Descriptions must be clear

### Handler Rules
- Must be async function
- Must return result or throw error
- Must handle errors gracefully

## Testing

### Registry Generation Tests

```
Test: Scanner finds all tool files
Test: Scanner extracts all action definitions
Test: Validator catches invalid actions
Test: Domain mapper groups correctly
Test: Registry generator creates valid output
```

### Action Tests

```
Test each action handler:
- Correct parameters → Success
- Missing required param → Error
- Invalid param → Error
- Database error → Graceful handling
```

## Migration from Manual System

### Phase 1: Create Standard Format
Convert existing actions to standard format

### Phase 2: Build Scanner
Implement scanner and generator

### Phase 3: Generate Registry
Generate first registry from existing actions

### Phase 4: Update Orchestra
Update orchestra to use generated registry

### Phase 5: Remove Manual List
Delete old manually maintained list

### Phase 6: Add New Actions
New actions use standard format, auto-discovered

## Conclusion

Auto-discovery action registry:
- Eliminates manual maintenance
- Keeps AI always up to date
- Enforces standards
- Scales to any number of actions
- Catches errors at build time
- Provides great developer experience

Combined with multi-tier routing, creates a sophisticated, maintainable, and scalable AI Orchestra system.

