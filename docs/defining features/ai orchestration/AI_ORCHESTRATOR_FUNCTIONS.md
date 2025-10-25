# AI Orchestrator Functions Documentation

## Overview
The AI Orchestrator is a central control system that manages app-wide operations, executes commands on demand, and coordinates between different systems using Claude AI.

## Core Services

### 1. OrchestratorService (Main)
**File**: `orchestrator.ts`
**Purpose**: Full-featured orchestrator with comprehensive action handling

**Key Methods**:
- `processCommand(request: OrchestratorRequest): Promise<OrchestratorResponse>`
- `buildContext(request: OrchestratorRequest): any`
- `buildPrompt(command: string, context: any): string`
- `parseClaudeResponse(response: string): ParsedResponse`
- `executeAction(action: string, parameters: any): Promise<any>`

**Features**:
- Conversation history management
- Context building for Claude AI
- Action execution with error handling
- Response parsing and validation

### 2. SimpleOrchestratorService (Simplified)
**File**: `simpleOrchestrator.ts`
**Purpose**: Streamlined orchestrator for basic operations

**Key Methods**:
- `processCommand(request: SimpleOrchestratorRequest): Promise<SimpleOrchestratorResponse>`
- `buildContext(request: SimpleOrchestratorRequest): any`
- `buildPrompt(command: string, context: any): string`
- `parseClaudeResponse(response: string): ParsedResponse`
- `executeAction(action: string, parameters: any): Promise<any>`
- `processNote(text: string): Promise<any>`

**Supported Actions**:
- `navigateToCross` - Navigate to Cross UI
- `navigateToOffices` - Navigate to offices list
- `navigateToProjects` - Navigate to projects list
- `navigateToRegulatory` - Navigate to regulatory records
- `navigateBack` - Navigate back to previous view
- `getCurrentState` - Get current application state
- `generalResponse` - General AI response
- `addNote` - Process and create note entities
- `searchWeb` - Web search functionality
- `searchArchitecture` - Architecture information search
- `searchRegulatory` - Regulatory information search

## Action Handlers

### 1. Office Actions
**File**: `actions/officeActions.ts`
**Purpose**: Handle office-related operations

**Key Functions**:
- `createOffice(officeData: any): Promise<any>`
- `updateOffice(officeId: string, updates: any): Promise<any>`
- `deleteOffice(officeId: string): Promise<any>`
- `getOffice(officeId: string): Promise<any>`
- `listOffices(filters?: any): Promise<any>`
- `searchOffices(query: string): Promise<any>`

### 2. Project Actions
**File**: `actions/projectActions.ts`
**Purpose**: Handle project-related operations

**Key Functions**:
- `createProject(projectData: any): Promise<any>`
- `updateProject(projectId: string, updates: any): Promise<any>`
- `deleteProject(projectId: string): Promise<any>`
- `getProject(projectId: string): Promise<any>`
- `listProjects(filters?: any): Promise<any>`
- `searchProjects(query: string): Promise<any>`

### 3. Regulatory Actions
**File**: `actions/regulatoryActions.ts`
**Purpose**: Handle regulatory-related operations

**Key Functions**:
- `createRegulation(regulationData: any): Promise<any>`
- `updateRegulation(regulationId: string, updates: any): Promise<any>`
- `deleteRegulation(regulationId: string): Promise<any>`
- `getRegulation(regulationId: string): Promise<any>`
- `listRegulations(filters?: any): Promise<any>`
- `searchRegulations(query: string): Promise<any>`

### 4. Search Actions
**File**: `actions/searchActions.ts`
**Purpose**: Handle search operations

**Key Functions**:
- `searchAll(query: string): Promise<any>`
- `searchOffices(query: string): Promise<any>`
- `searchProjects(query: string): Promise<any>`
- `searchRegulations(query: string): Promise<any>`

### 5. Relationship Actions
**File**: `actions/relationshipActions.ts`
**Purpose**: Handle entity relationships

**Key Functions**:
- `createRelationship(relationshipData: any): Promise<any>`
- `updateRelationship(relationshipId: string, updates: any): Promise<any>`
- `deleteRelationship(relationshipId: string): Promise<any>`
- `getRelationships(entityId: string): Promise<any>`

### 6. UI Actions
**File**: `actions/uiActions.ts`
**Purpose**: Handle UI navigation and state

**Key Functions**:
- `navigateToPage(page: string): Promise<any>`
- `getCurrentState(): Promise<any>`
- `updateUIState(state: any): Promise<any>`

### 7. Simple UI Actions
**File**: `actions/simpleUIActions.ts`
**Purpose**: Simplified UI navigation

**Key Functions**:
- `navigateToCross(): Promise<any>`
- `navigateToOffices(): Promise<any>`
- `navigateToProjects(): Promise<any>`
- `navigateToRegulatory(): Promise<any>`
- `navigateBack(): Promise<any>`
- `getCurrentState(): Promise<any>`

### 8. Web Search Actions
**File**: `actions/webSearchActions.ts`
**Purpose**: Handle web search operations

**Key Functions**:
- `searchWeb(query: string): Promise<any>`
- `searchArchitectureInfo(query: string): Promise<any>`
- `searchRegulatoryInfo(query: string): Promise<any>`

## Action Registry
**File**: `actions/registry.ts`
**Purpose**: Central registry for all available actions

**Key Components**:
- `ActionDefinition` interface
- `ActionRegistry` interface
- `getActiveActions()` - Get all active actions
- `getActionById(id: string)` - Get specific action
- `validateActionParameters(action: string, params: any)` - Validate parameters

## Command Combinations
**File**: `COMMAND_COMBINATIONS.md`
**Purpose**: Documentation of all supported command patterns

**Categories**:
- Navigation Commands (open, show, go to, view, list)
- Note Processing Commands (add note, create note, process note)
- Back Navigation Commands (go back, return, previous)
- Context-specific Commands (office list, project list, regulatory list)

## Claude Client Integration
**File**: `claudeClient.ts`
**Purpose**: Interface with Claude AI API

**Key Functions**:
- `sendMessage(request: ClaudeRequest, options?: ClaudeOptions): Promise<ClaudeResponse>`
- `generateResponse(prompt: string, conversationHistory: any[]): Promise<string>`

## Note Processing Integration
**Integration**: Note processing system processes text and creates entities
**Services**: 
- `NoteProcessingEngine` - AI analysis and extraction
- `NoteProcessing` - Main processing service
- `NoteService` - Service layer for note operations
- `IndependentNoteService` - Standalone note processing

## Current Integration Points
1. **Cross UI Input Field** - TextBoxComponent processes commands
2. **Navigation System** - Routes to different app sections
3. **Note System** - Creates entities from text input
4. **Web Search** - External information retrieval
5. **Firebase Integration** - Data persistence and retrieval

## Error Handling
- Comprehensive try-catch blocks
- Error logging and reporting
- Graceful degradation for failed operations
- User-friendly error messages

## Future Considerations
- Action validation and sanitization
- Rate limiting and throttling
- Caching for improved performance
- Advanced conversation management
- Multi-language support
- Plugin architecture for extensibility
