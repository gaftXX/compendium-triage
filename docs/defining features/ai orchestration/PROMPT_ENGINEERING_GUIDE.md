# Prompt Engineering Guide - Claude AI Integration

**Purpose:** Guide for building effective prompts for Claude to power the AI orchestrator

---

## System Prompt Architecture

### Core System Prompt Template
```
You are an AI orchestrator for an architecture database application. Your role is to interpret natural language commands from users and translate them into structured actions.

## Available Actions

You have access to the following actions:

{ACTION_REGISTRY}

## Your Task

When a user sends a message:
1. Understand their intent
2. Extract relevant parameters
3. Choose the appropriate action(s)
4. Return a structured JSON response

## Response Format

Always respond with valid JSON in this exact format:

{
  "action": "ACTION_NAME",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  },
  "confidence": 0.95,
  "reasoning": "Brief explanation of why you chose this action"
}

For multiple actions, use an array:

{
  "actions": [
    {
      "action": "ACTION_1",
      "parameters": {...},
      "confidence": 0.95
    },
    {
      "action": "ACTION_2",
      "parameters": {...},
      "confidence": 0.85
    }
  ],
  "reasoning": "Explanation"
}

## Context

Current application state:
{CURRENT_CONTEXT}

## Guidelines

- Always prefer specific actions over generic ones
- If uncertain, ask for clarification instead of guessing
- Use the office name format: "office-name-lowercase" (e.g., "zaha-hadid-architects")
- Categories must match exactly: {CATEGORY_LIST}
- For dates, use ISO 8601 format
- For locations, include city and country
- Extract all relevant metadata from user input

## Examples

{FEW_SHOT_EXAMPLES}
```

---

## Action Registry Injection

### Registry Format for Prompt
```typescript
// services/ai/promptBuilder.ts

function buildActionRegistry(): string {
  const registry = {
    // Note Actions
    "CREATE_NOTE": {
      description: "Create a new note in any category",
      parameters: {
        category: "string (required) - One of: regulatory, laws, clients, company, financials, technology, projects, economic, metrics, market, competitive, workforce, supply, city, land, divisions",
        title: "string (required) - Title of the note",
        content: "string (required) - Main content",
        architectureOffice: "string (optional) - Office name",
        tags: "array of strings (optional)",
        relatedNotes: "array of note IDs (optional)"
      },
      examples: [
        "Add a note about Zaha Hadid's parametric design approach",
        "Create a regulatory note for new London zoning laws"
      ]
    },
    
    "UPDATE_NOTE": {
      description: "Update an existing note",
      parameters: {
        noteId: "string (required) - ID of note to update",
        updates: "object (required) - Fields to update"
      },
      examples: [
        "Update the Zaha Hadid note to include their latest project",
        "Change the title of note abc123"
      ]
    },
    
    "DELETE_NOTE": {
      description: "Delete a note",
      parameters: {
        noteId: "string (required) - ID of note to delete"
      },
      examples: [
        "Delete note abc123",
        "Remove the outdated regulatory note"
      ]
    },
    
    // Search Actions
    "SEARCH_NOTES": {
      description: "Search for notes by keyword, category, office, or tags",
      parameters: {
        query: "string (optional) - Search query",
        category: "string (optional) - Filter by category",
        office: "string (optional) - Filter by architecture office",
        tags: "array (optional) - Filter by tags",
        dateRange: "object (optional) - { start: ISO date, end: ISO date }"
      },
      examples: [
        "Find all notes about Zaha Hadid",
        "Search for regulatory notes from 2023",
        "Show me all financial notes"
      ]
    },
    
    // ... all other actions
  };
  
  return JSON.stringify(registry, null, 2);
}
```

---

## Context Building

### Current Application State
```typescript
interface ApplicationContext {
  currentView: string;              // e.g., "NotesList", "CategoryView:regulatory"
  selectedItems: string[];          // Currently selected note IDs
  recentActions: Action[];          // Last 5 actions performed
  userPreferences: {
    defaultOffice?: string;
    defaultCategory?: string;
  };
  currentFilters: {
    category?: string;
    office?: string;
    dateRange?: { start: string; end: string };
  };
}

function buildContext(state: ApplicationContext): string {
  return `
Current View: ${state.currentView}
Selected Items: ${state.selectedItems.join(', ') || 'none'}
Recent Actions: ${state.recentActions.map(a => a.action).join(', ')}
Active Filters: ${JSON.stringify(state.currentFilters)}
  `.trim();
}
```

---

## Few-Shot Examples

### Example Library
```typescript
const EXAMPLES = [
  {
    userInput: "Add a note about Zaha Hadid's use of parametric design in the Heydar Aliyev Center",
    expectedResponse: {
      action: "CREATE_NOTE",
      parameters: {
        category: "technology",
        title: "Zaha Hadid's Parametric Design - Heydar Aliyev Center",
        content: "Use of parametric design in the Heydar Aliyev Center",
        architectureOffice: "zaha-hadid-architects",
        tags: ["parametric-design", "heydar-aliyev-center"]
      },
      confidence: 0.95,
      reasoning: "User wants to document technology adoption (parametric design) for a specific office and project"
    }
  },
  
  {
    userInput: "Find all notes about London regulations",
    expectedResponse: {
      action: "SEARCH_NOTES",
      parameters: {
        query: "London regulations",
        category: "regulatory"
      },
      confidence: 0.90,
      reasoning: "User is searching for regulatory information specific to London"
    }
  },
  
  {
    userInput: "Show me Foster + Partners' recent projects",
    expectedResponse: {
      action: "SEARCH_NOTES",
      parameters: {
        category: "projects",
        office: "foster-partners",
        dateRange: {
          start: "2023-01-01",
          end: "2024-12-31"
        }
      },
      confidence: 0.88,
      reasoning: "User wants recent project information for specific office. 'Recent' interpreted as last 2 years"
    }
  },
  
  {
    userInput: "Update note abc123 to add BIM tag",
    expectedResponse: {
      action: "UPDATE_NOTE",
      parameters: {
        noteId: "abc123",
        updates: {
          tags: ["BIM"]
        }
      },
      confidence: 0.95,
      reasoning: "User explicitly wants to add a tag to an existing note"
    }
  },
  
  {
    userInput: "Create a financial record: Foster got $5M funding in March 2024",
    expectedResponse: {
      action: "CREATE_FINANCIAL_RECORD",
      parameters: {
        officeId: "foster-partners",
        recordType: "funding",
        amount: 5000000,
        currency: "USD",
        date: "2024-03-01",
        details: "Funding received"
      },
      confidence: 0.92,
      reasoning: "User wants to record financial information (funding) for Foster + Partners"
    }
  },
  
  {
    userInput: "Link note abc123 to note def456",
    expectedResponse: {
      action: "LINK_NOTES",
      parameters: {
        noteId1: "abc123",
        noteId2: "def456"
      },
      confidence: 0.98,
      reasoning: "User explicitly wants to create a relationship between two notes"
    }
  },
  
  {
    userInput: "Delete all outdated regulatory notes from 2020",
    expectedResponse: {
      actions: [
        {
          action: "SEARCH_NOTES",
          parameters: {
            category: "regulatory",
            dateRange: {
              start: "2020-01-01",
              end: "2020-12-31"
            }
          },
          confidence: 0.85
        },
        {
          action: "ASK_CONFIRMATION",
          parameters: {
            message: "This will delete all regulatory notes from 2020. Please confirm which notes to delete.",
            requiresReview: true
          },
          confidence: 0.95
        }
      ],
      reasoning: "Bulk deletion is risky. First search for matching notes, then ask user to confirm specific deletions"
    }
  }
];

function buildFewShotExamples(): string {
  return EXAMPLES.map(ex => `
User: "${ex.userInput}"
Response: ${JSON.stringify(ex.expectedResponse, null, 2)}
  `).join('\n---\n');
}
```

---

## Conversation History Management

### Context Window Strategy
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actionResult?: any;
}

class ConversationManager {
  private messages: Message[] = [];
  private maxMessages = 10; // Keep last 10 exchanges
  
  addUserMessage(content: string) {
    this.messages.push({
      role: 'user',
      content,
      timestamp: Date.now()
    });
    this.trimHistory();
  }
  
  addAssistantMessage(content: string, actionResult?: any) {
    this.messages.push({
      role: 'assistant',
      content,
      timestamp: Date.now(),
      actionResult
    });
    this.trimHistory();
  }
  
  private trimHistory() {
    if (this.messages.length > this.maxMessages * 2) {
      // Keep system message + last N exchanges
      this.messages = this.messages.slice(-this.maxMessages * 2);
    }
  }
  
  buildConversationContext(): string {
    return this.messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      let context = `${role}: ${msg.content}`;
      
      if (msg.actionResult) {
        context += `\nResult: ${msg.actionResult.success ? 'Success' : 'Failed'}`;
      }
      
      return context;
    }).join('\n\n');
  }
}
```

---

## Intent Recognition Patterns

### Common Intent Categories
```typescript
const INTENT_PATTERNS = {
  CREATE: {
    keywords: ['add', 'create', 'new', 'make', 'insert', 'record'],
    examples: [
      "Add a note about...",
      "Create a new project...",
      "Record financial data..."
    ]
  },
  
  READ: {
    keywords: ['show', 'find', 'search', 'get', 'list', 'display', 'view'],
    examples: [
      "Show me all...",
      "Find notes about...",
      "Search for..."
    ]
  },
  
  UPDATE: {
    keywords: ['update', 'edit', 'modify', 'change', 'revise', 'add to'],
    examples: [
      "Update note...",
      "Change the title...",
      "Add tag to..."
    ]
  },
  
  DELETE: {
    keywords: ['delete', 'remove', 'erase', 'clear'],
    examples: [
      "Delete note...",
      "Remove all...",
      "Clear outdated..."
    ]
  },
  
  LINK: {
    keywords: ['link', 'connect', 'relate', 'associate'],
    examples: [
      "Link note A to note B",
      "Connect these projects",
      "Associate with..."
    ]
  },
  
  ANALYZE: {
    keywords: ['analyze', 'calculate', 'compare', 'summarize', 'breakdown'],
    examples: [
      "Calculate division percentages",
      "Analyze market share",
      "Compare offices..."
    ]
  }
};
```

---

## Parameter Extraction Guidelines

### Office Names
```typescript
const OFFICE_NAME_MAPPING = {
  // Common variations → standardized format
  "zaha hadid": "zaha-hadid-architects",
  "zaha": "zaha-hadid-architects",
  "ZHA": "zaha-hadid-architects",
  
  "foster": "foster-partners",
  "foster + partners": "foster-partners",
  "norman foster": "foster-partners",
  
  "OMA": "oma",
  "rem koolhaas": "oma",
  "office for metropolitan architecture": "oma",
  
  // ... more mappings
};

// Include in system prompt:
const officeNameGuidance = `
When extracting office names:
- Convert to lowercase
- Replace spaces with hyphens
- Use full official name format
- Examples: ${JSON.stringify(OFFICE_NAME_MAPPING, null, 2)}
`;
```

### Categories
```typescript
const VALID_CATEGORIES = [
  'regulatory',
  'laws',
  'clients',
  'company',
  'financials',
  'technology',
  'projects',
  'economic',
  'metrics',
  'market',
  'competitive',
  'workforce',
  'supply',
  'city',
  'land',
  'divisions'
];

const CATEGORY_ALIASES = {
  "regulation": "regulatory",
  "zoning": "regulatory",
  "legal": "laws",
  "law": "laws",
  "client": "clients",
  "structure": "company",
  "org": "company",
  "money": "financials",
  "funding": "financials",
  "tech": "technology",
  "project": "projects",
  "economy": "economic",
  "financial": "metrics",
  "marketshare": "market",
  "competition": "competitive",
  "employees": "workforce",
  "talent": "workforce",
  "suppliers": "supply",
  "materials": "supply",
  "cities": "city",
  "percentage": "divisions",
  "breakdown": "divisions"
};
```

### Dates
```typescript
const dateExtractionGuidance = `
For date extraction:
- Always use ISO 8601 format: YYYY-MM-DD
- "Today" → current date
- "Yesterday" → current date - 1 day
- "Last week" → 7 days ago
- "Last month" → 30 days ago
- "Last year" → 365 days ago
- "Q1 2024" → { start: "2024-01-01", end: "2024-03-31" }
- "March 2024" → { start: "2024-03-01", end: "2024-03-31" }
- "2024" → { start: "2024-01-01", end: "2024-12-31" }
`;
```

---

## Error Handling & Clarification

### Ambiguity Detection
```typescript
const clarificationPrompts = {
  MULTIPLE_OFFICES: {
    trigger: "Multiple architecture offices mentioned",
    response: {
      action: "ASK_CLARIFICATION",
      parameters: {
        question: "I found multiple architecture offices mentioned. Which one did you mean?",
        options: ["office1", "office2"],
        originalIntent: "CREATE_NOTE"
      }
    }
  },
  
  UNCLEAR_CATEGORY: {
    trigger: "Category cannot be determined",
    response: {
      action: "ASK_CLARIFICATION",
      parameters: {
        question: "Which category should this note belong to?",
        options: VALID_CATEGORIES,
        suggestion: "Based on your input, I recommend 'projects'"
      }
    }
  },
  
  MISSING_REQUIRED_PARAM: {
    trigger: "Required parameter missing",
    response: {
      action: "ASK_CLARIFICATION",
      parameters: {
        question: "I need more information. What should the {PARAM_NAME} be?",
        requiredFor: "CREATE_NOTE"
      }
    }
  }
};
```

---

## Confidence Scoring

### Confidence Guidelines
```
System guidance for Claude:

Confidence score interpretation:
- 0.95-1.0: Very confident - clear, unambiguous intent
- 0.85-0.94: Confident - minor assumptions made
- 0.70-0.84: Moderate - some uncertainty, may need confirmation
- 0.50-0.69: Low - significant assumptions, should ask for clarification
- Below 0.50: Very uncertain - must ask for clarification

Set confidence based on:
1. Intent clarity (is the action obvious?)
2. Parameter completeness (all required params present?)
3. Ambiguity (multiple interpretations possible?)
4. Context match (does it fit current app state?)

If confidence < 0.70, include an "ASK_CLARIFICATION" action.
```

---

## Complete Prompt Builder

### Implementation
```typescript
// services/ai/promptBuilder.ts

export class PromptBuilder {
  buildSystemPrompt(
    actionRegistry: ActionRegistry,
    context: ApplicationContext
  ): string {
    const basePrompt = this.getBaseSystemPrompt();
    const registrySection = this.buildActionRegistrySection(actionRegistry);
    const contextSection = this.buildContextSection(context);
    const examplesSection = this.buildFewShotExamples();
    const guidelinesSection = this.buildGuidelines();
    
    return `
${basePrompt}

${registrySection}

${contextSection}

${guidelinesSection}

${examplesSection}
    `.trim();
  }
  
  buildUserPrompt(
    userInput: string,
    conversationHistory: Message[]
  ): string {
    const history = this.formatConversationHistory(conversationHistory);
    
    return `
${history}

User: ${userInput}

Please analyze this request and provide your structured JSON response.
    `.trim();
  }
  
  private getBaseSystemPrompt(): string {
    return `You are an AI orchestrator for an architecture database application...`;
  }
  
  // ... other helper methods
}
```

---

## Response Parsing

### Parse Claude Response
```typescript
interface ParsedResponse {
  action?: string;
  actions?: Array<{
    action: string;
    parameters: Record<string, any>;
    confidence: number;
  }>;
  parameters?: Record<string, any>;
  confidence: number;
  reasoning: string;
}

function parseClaudeResponse(response: string): ParsedResponse {
  try {
    // Extract JSON from response (may have markdown formatting)
    const jsonMatch = response.match(/```json\n(.*?)\n```/s) 
      || response.match(/```\n(.*?)\n```/s)
      || response.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    // Validate structure
    if (!parsed.action && !parsed.actions) {
      throw new Error('Invalid response: missing action(s)');
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    throw error;
  }
}
```

---

## Testing Prompts

### Test Cases
```typescript
const TEST_CASES = [
  {
    input: "Add a note about Zaha Hadid's parametric design",
    expectedAction: "CREATE_NOTE",
    expectedCategory: "technology",
    expectedOffice: "zaha-hadid-architects"
  },
  
  {
    input: "Show me all projects from 2023",
    expectedAction: "SEARCH_NOTES",
    expectedCategory: "projects",
    expectedDateRange: { start: "2023-01-01", end: "2023-12-31" }
  },
  
  {
    input: "Delete note abc123",
    expectedAction: "DELETE_NOTE",
    expectedNoteId: "abc123"
  },
  
  // Edge cases
  {
    input: "Foster",
    expectedAction: "ASK_CLARIFICATION",
    reason: "Ambiguous - search for Foster or create note about Foster?"
  },
  
  {
    input: "Add something",
    expectedAction: "ASK_CLARIFICATION",
    reason: "Too vague - what to add?"
  }
];
```

---

## Best Practices

### Prompt Design Principles
1. **Be Specific**: Clearly define expected output format
2. **Provide Examples**: Few-shot learning works best
3. **Include Context**: Current app state helps Claude make better decisions
4. **Handle Ambiguity**: Always allow for clarification requests
5. **Validate Outputs**: Parse and validate all responses
6. **Iterate**: Test with real user inputs and refine prompts

### Performance Optimization
- Keep system prompt under 4000 tokens
- Use conversation history efficiently (last 10 exchanges)
- Cache action registry (doesn't change often)
- Batch similar requests when possible

---

*This guide ensures Claude can reliably interpret user intent and execute the correct actions in the AI orchestrator system.*

