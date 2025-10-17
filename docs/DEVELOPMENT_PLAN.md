# Development Plan - AI Orchestrator Architecture App

## Technical Steps Overview

### Phase 1: Foundation & Architecture Planning

#### 1. File System Architecture Plan
- Create clear directory structure blueprint for cursor agent
- Define naming conventions and organization patterns
- Map out component hierarchy and service layers
- Document file relationships and dependencies

#### 2. Set up ALL APIs
**Claude API** (Anthropic SDK)
- Install and configure Anthropic client
- Set up API key management
- Create Claude service wrapper

**Firebase API**
- Set up Firebase project
- Configure Firebase to work on any downloaded instance (client-side config)

#### 3. Set up Electron + React
- Initialize Electron project
- Set up React (UI only)
- **Configure build process for DOWNLOADABLE DESKTOP APPLICATION**
  - **PRIMARY TARGET: macOS application (.dmg installer)**
  - **Must be installable like any Mac software**
  - Cross-platform support (Windows, Linux) secondary
  - Code signing for macOS distribution
  - Electron-builder configuration for App Store ready build

---

### Phase 2: Database Architecture & Intelligent Note System

#### 1. Office ID System Implementation

**CCccNNN Format:**
- **CC** = ISO 3166-1 alpha-2 country code (GB, US, AE, etc.)
- **cc** = First 2 letters of city (LO=London, NE=NewYork, DU=Dubai)
- **NNN** = Random 3-digit number (100-999)
- **Examples:** GBLO482 (London, UK), USNE567 (NYC, USA), AEDU891 (Dubai, UAE)
- **Purpose:** Offices identified exclusively by unique ID; names are for display only

**Implementation:**
- Generate unique IDs using city + country + random number
- Collision detection and retry logic
- ISO country code mapping (50+ countries)
- Automatic ID generation when creating offices

#### 2. Four-Tier Database Structure

**TIER 1: Primary Entities (3 collections - The Big Entities)**
- `/cities` - Geographic markets (core market profile, consolidation metrics)
- `/offices` - Architecture offices (PRIMARY with CCccNNN IDs)
- `/projects` - Architecture projects (basic shell only)

**TIER 2: Connective Tissue (3 collections - Links & Context)**
- `/relationships` - Graph edges connecting any entities
- `/archHistory` - Timeline events and M&A tracking
- `/networkGraph` - Precomputed connection metrics

**TIER 3: Detailed Data (20 collections - Enrichment + External Forces)**

*Enrichment Data (13 collections):*
- `/clients` - Client entities and relationships
- `/workforce` - Talent, employees, skills
- `/technology` - Technology adoption and innovation
- `/financials` - Financial transactions and records
- `/supplyChain` - Suppliers and materials
- `/landData` - Land parcels and development sites
- `/cityData` - Detailed city demographics/cultural context (enriches Tier 1 cities)
- `/regulations` - Laws, codes, zoning (rules/constraints, moved from Tier 1)
- `/projectData` - Comprehensive project execution data (vision, team, performance, legacy)
- `/companyStructure` - Organizational structure
- `/divisionPercentages` - Analytics breakdowns
- `/newsArticles` - News & media coverage (evidence and sources)
- `/politicalContext` - Governance, institutions, political stability

*External Forces Data (7 collections):*
- `/externalMacroeconomic` - GDP, interest rates, inflation, economic cycles
- `/externalTechnology` - Disruptive tech, AI/ML adoption, digital transformation
- `/externalSupplyChain` - Material costs, availability, logistics disruptions
- `/externalDemographics` - Population shifts, urbanization, migration patterns
- `/externalClimate` - Climate risks, sustainability regulations, green building
- `/externalPolicy` - Tax policy, trade regulations, government incentives
- `/externalEvents` - Wars, pandemics, natural disasters, political upheaval

**TIER 4: Market Intelligence (5 collections - Market Analytics)**
- `/marketIntelligence` - HHI, Gini, consolidation metrics
- `/trends` - Industry trend tracking
- `/competitiveAnalysis` - SWOT, competitive positioning
- `/financialMetrics` - Computed KPIs and performance
- `/externalForcesImpact` - Impact analysis and scenario modeling for external forces

#### 3. Active vs. Dormant Collections

**ACTIVE COLLECTIONS (Initial Build):**
- `/offices` - Architecture offices (PRIMARY - fully exercised)
- `/projects` - Architecture projects (fully exercised)
- `/regulations` - Region-specific regulatory laws (fully exercised)

**DORMANT COLLECTIONS (Structure Only):**
- All other 28 collections are created with proper schemas but remain unpopulated
- Database structure is complete and ready for future expansion
- No UI or operations built for dormant collections in initial phases
- Market consolidation tracking (HHI, Gini, M&A) is future functionality

#### 4. Design/Plan the Database Structure
- Implement 4-tier architecture (Primary Entities, Connective Tissue, Detailed Data, Market Intelligence)
- Define document schemas with CCccNNN office ID system
- Create composite indexes for:
  - Office queries (status, location, founded)
  - Project queries (officeId, status, type, timeline)
  - Relationship queries (sourceEntity, targetEntity, type, strength)
  - Market intelligence queries (analysisType, scope, consolidation metrics)
- Establish explicit relationship tracking (graph pattern)
- Design query patterns for:
  - AI orchestrator access
  - Market consolidation analysis
  - Trend detection
  - Network graph traversal
- Set up security rules (authenticated read, admin write)
- Plan denormalization strategy (connection counts on offices)

#### 6. Initialize Firestore
- Initialize Firestore connection
- Set up Firebase config (client-side, works on any machine)
- Environment variables for API keys
- TypeScript interfaces for all collections

#### 7. Implement Database Structure
- Create all 31 Firestore collections:
  - **Tier 1 (Primary - 3 collections):** cities (geographic markets), offices (CCccNNN IDs), projects (basic shell)
  - **Tier 2 (Connective - 3 collections):** relationships, archHistory, networkGraph
  - **Tier 3 (Detailed - 20 collections):**
    - *Enrichment (13):* clients, workforce, technology, financials, supplyChain, landData, cityData, regulations, projectData, companyStructure, divisionPercentages, newsArticles, politicalContext
    - *External Forces (7):* externalMacroeconomic, externalTechnology, externalSupplyChain, externalDemographics, externalClimate, externalPolicy, externalEvents
  - **Tier 4 (Market - 5 collections):** marketIntelligence, trends, competitiveAnalysis, financialMetrics, externalForcesImpact
- Set up document templates for all collections
- Implement composite indexes (50+ index combinations)
- Apply security rules (authenticated read, admin write)
- Seed initial data (10-20 major architecture firms with CCccNNN IDs)

#### 8. Build Firestore Operations

**ACTIVE OPERATIONS (Initial Build):**
- Office operations with CCccNNN ID generation
- Project operations with office linking
- Regulatory operations (create, update, query regional laws)
- Relationship operations (link offices ↔ projects ↔ regulations)
- Query operations for active collections

**DORMANT OPERATIONS (Future):**
- All other collection operations (clients, workforce, financials, etc.)
- Market intelligence queries
- Network graph computation
- Market consolidation analysis
- ArchHistory M&A tracking

---

### Phase 3: Build Note System Features

#### 1. Create basic UI
- Single input field centered on screen
- Nothing else - no navigation, no sidebar, no buttons
- Just the input field
- **Bare minimum styling only**

#### 2. Implement Note System UI Components

**ACTIVE UI COMPONENTS (Initial Build):**
- Architecture office list view
- Office detailed view
- Project list view
- Project detailed view
- Regulatory laws list view
- Regulatory laws detailed view
- Connect UI to Firestore operations (offices, projects, regulations only)

**DORMANT UI COMPONENTS (Future Expansion):**
- Client relationship managers
- Financial metrics displays
- City/Land data visualizations
- Division percentage calculators
- External Forces monitoring interfaces (macroeconomic, technology, supply chain, demographics, climate, policy, events)
- Political Context displays
- All other enrichment category-specific interfaces

**Implementation Notes:**
- **All UI is SUPER SIMPLE, bare minimum - just functional, no styling**
- **Connect UI to active Firestore operations from Phase 2 (offices, projects, regulations)**
- **Only build UI for active collections - dormant collections have no UI yet**

---

### Phase 4: Note System (Independent Data Ingestion)

**The Note System is a standalone data ingestion system that works independently from the AI Orchestrator. It processes unstructured text input and automatically creates organized database entries.**

#### 1. Build Note Input Interface
- Create simple text input field (bare minimum styling)
- Direct text processing pipeline
- No complex UI - just functional input and processing
- Independent from main app components

#### 2. Implement Note Processing Engine
**Core Note Processing Pipeline:**
1. User inputs unstructured text
2. AI analyzes and categorizes content (office, project, or regulation)
3. Extracts relevant fields automatically:
   - **Office:** name, city, country, founded year, specializations, etc.
   - **Project:** name, location, type, timeline, status, etc.
   - **Regulation:** jurisdiction, law name, description, effective date, etc.
4. Generates CCccNNN ID for offices or looks up existing entities
5. Validates required fields
6. Shows preview for user confirmation
7. Saves to correct Firestore collection (offices, projects, or regulations only)
8. Auto-creates relationships between entities (office ↔ project ↔ regulation)

#### 3. Note System Features
**Auto-Categorization Engine:**
- AI analyzes unstructured text input
- Identifies correct data category: **office, project, or regulation**
- Extracts entities and field values automatically
- Maps to appropriate Firestore collection
- Validates against schema
- Auto-generates office IDs in CCccNNN format

**Update vs Create Logic:**
- Searches for existing entities by name
- Merges new data with existing records
- Updates connection counts automatically
- Creates bidirectional relationships

**Implementation Notes:**
- **Independent System:** Note system operates separately from orchestrator
- **Direct Firestore Access:** Bypasses orchestrator for data operations
- **Self-Contained:** Has its own AI processing and categorization logic
- **Data Ingestion Focus:** Solely focused on converting text to structured data

---

### Phase 5: AI Orchestrator Core + General Engine Foundation

**The AI Orchestrator is the central control system for the entire application. It manages app-wide operations, executes commands on demand, and coordinates between different systems. It works with data created by the Note System but operates independently.**

#### 1. Create the Function Registry
- Build registry.ts that maps all app control capabilities:
  - Action name/ID (e.g., "CREATE_OFFICE", "SEARCH_OFFICES", "ANALYZE_DATA", "GENERATE_REPORT")
  - Handler function reference
  - Required parameters with types
  - Optional parameters
  - Action description for Claude
  - Category/domain tagging

**ACTIVE ACTIONS (Initial Build):**
- Architecture Office actions:
  - CREATE_OFFICE
  - UPDATE_OFFICE
  - DELETE_OFFICE
  - SEARCH_OFFICES
  - GET_OFFICE
- Project actions:
  - CREATE_PROJECT
  - UPDATE_PROJECT
  - DELETE_PROJECT
  - SEARCH_PROJECTS
  - GET_PROJECT
- Regulatory/Zoning actions:
  - CREATE_REGULATORY_RECORD
  - UPDATE_REGULATORY_RECORD
  - DELETE_REGULATORY_RECORD
  - SEARCH_REGULATORY
  - GET_REGULATORY
- Relationship actions:
  - LINK_OFFICE_TO_PROJECT
  - LINK_OFFICE_TO_REGULATORY
  - LINK_PROJECT_TO_REGULATORY

**DORMANT ACTIONS (Future Expansion):**
- Client Relationship actions
- Financial data actions
- City/Land data actions
- External Forces actions (macroeconomic, technology, supply chain, demographics, climate, policy, events)
- Political Context actions
- All other enrichment category actions

- Dynamic registry that components can extend

#### 2. Create Action Handlers

**ACTIVE HANDLERS (Initial Build):**
- `officeActions.ts` - Architecture office CRUD operations
- `projectActions.ts` - Project CRUD operations
- `regulatoryActions.ts` - Regulatory/zoning CRUD operations
- `searchActions.ts` - Query and filter operations for offices, projects, regulations
- `relationshipActions.ts` - Link offices ↔ projects ↔ regulations

**DORMANT HANDLERS (Future Expansion):**
- `clientActions.ts` - Client relationship operations
- `financialActions.ts` - Financial operations
- `analyticsActions.ts` - Division percentages, metrics
- `externalForcesActions.ts` - Track macroeconomic, tech, supply chain, demographics, climate, policy, events
- `politicalContextActions.ts` - Governance and institutional data operations
- All other category-specific handlers

**Each handler:**
- Validates parameters
- Executes Firestore operations (from Phase 2)
- Returns structured response
- Handles errors gracefully

**ACTIVE Action Types:**
- Create/Update/Delete office
- Create/Update/Delete project
- Create/Update/Delete regulatory record
- Search/query offices, projects, regulations
- Link office ↔ project ↔ regulatory
- Get office/project/regulatory details

#### 3. Build the Orchestrator Service
- Create orchestrator.ts as the central app control system
- Implement command processing pipeline:
  - Receive user commands/requests
  - Add context about current app state and available data
  - Build prompt with available actions registry
  - Send to Claude API
  - Parse Claude's structured response
  - Route to appropriate action handler
  - Execute app control operations (create, search, analyze, report)
  - Return execution result
- Error handling and fallback logic
- Conversation history management for context
- **Note:** Orchestrator works with data created by Note System but operates independently

#### 4. General Engine Foundation (Phase 4 Implementation)

**Component Registry System:**
- Create `componentRegistry.ts` to track all active components
- Components register themselves on mount with:
  - Component type/category (e.g., "OfficeCard", "RegulatoryView")
  - Unique instance ID
  - Available capabilities
  - State update callbacks
- Components automatically inherit actions based on type
- Dynamic registry that extends as new components are added

**Basic Event Bus:**
- Create `eventBus.ts` for orchestrator-to-component communication
- Event types: ACTION_EXECUTED, DATA_UPDATED, ERROR_OCCURRED
- Components subscribe to relevant events
- Orchestrator publishes action results to event bus
- Loose coupling between orchestrator and UI components

**Context Provider Setup:**
- Create `OrchestratorContext` provider
- Wraps entire app to give all components access to:
  - Action registry
  - Event bus subscriptions
  - Component registration functions
- Provides hooks: `useOrchestrator()`, `useRegisterComponent()`

**Action Inheritance Pattern:**
- When component registers, check if its type already has actions
- Auto-assign actions to new instances of same type
- Example: Second "OfficeCard" automatically gets same CRUD actions as first
- Reduces manual configuration

**Implementation Notes:**
- Keep it simple - just the infrastructure
- No styling or complex behavior yet
- Focus on communication pathways
- This foundation enables Phase 6 automation

---

### Phase 6: UI Transformation - Cross UI + Main App Overhaul

**This phase has two distinct parts:**
1. **Cross UI** - Separate note system component (no General Engine)
2. **Main App UI Overhaul** - Elite design system with General Engine full implementation

---

#### Part A: Cross UI System (Separate Component - No General Engine)

**Cross UI as Independent System:**
- Build Cross note input system as standalone component
- Does NOT integrate with General Engine
- Self-contained UI with its own styling and behavior
- Operates independently from main app component system
- Direct connection to AI orchestrator without going through component registry

**Cross UI Features:**
- Note input interface
- AI categorization preview
- Entity extraction display
- Confirmation/validation UI
- Direct save to Firestore
- Simple, focused design (not elaborate like main app)

**Implementation Notes:**
- Separate from main app component architecture
- Own styling system (not connected to design registry)
- Direct orchestrator communication
- No component registration required
- Keep it lightweight and fast

---

#### Part B: Main App UI Overhaul - Elite Design System & General Engine Full Implementation

**This is the comprehensive UI transformation for main app components - from bare functional to mathematically precise, beautifully designed interface**

**General Engine becomes CRITICAL here - automatically applies design system to all main app components without manual updates**

#### B1. Design the Elaborate Electron UI Window System
- Define mathematical equations for:
  - Window dimensions and aspect ratios (golden ratio, fibonacci sequences)
  - Component spacing and proportions (modular scale systems)
  - Animation curves and timing functions (bezier curves, spring physics)
  - Layout grid system based on mathematical constants (phi, euler's number)
- Establish strict color code system:
  - Primary, secondary, accent palettes (exact hex codes)
  - Opacity values and gradients (mathematical progressions)
  - Dark/light mode specifications
  - Color theory implementation (complementary, triadic schemes)
- Create elaborate movement patterns:
  - Transition equations (ease-in-out functions)
  - Easing functions (custom cubic-bezier)
  - Interactive animations (hover, click, drag physics)
  - State change behaviors (morphing, fading, sliding)
  - Micro-interactions and feedback loops

#### B2. General Engine: Design System Auto-Application (Main App Components Only)

**Design System Registry:**
- Create `designSystem.ts` with all styling rules organized by component type
- Rules include: spacing, colors, animations, typography for each component category
- Main app components query registry based on their type to get styling automatically
- NO MANUAL STYLING - General Engine applies rules automatically
- **Note: Cross UI operates independently with its own styling**

**Automatic Style Propagation:**
- When a main app component registers (from Phase 4 foundation), it receives:
  - Design system rules for its type
  - Animation configurations
  - Color palette assignments
  - Spacing/layout specifications
- Component applies styles automatically on mount
- Updates automatically when design system changes

**Component Type Mapping:**
- Registry maps main app component types to design specifications:
  - "OfficeCard" → Card styling rules + office-specific colors
  - "RegulatoryView" → Data visualization styles
  - "ProjectView" → Project-specific styles
- New components of existing types inherit ALL styling automatically
- One design update propagates to all components of that type
- **Cross UI is excluded from this registry**

#### B3. General Engine: UX → UI Effect Propagation (Main App Only)

**Enhanced Event Bus (Built on Phase 4 foundation):**
- Expand event types: UI_THEME_CHANGE, ANIMATION_TRIGGER, STATE_SYNC, LAYOUT_UPDATE
- Cross-component effects automatically propagate for main app components:
  - User action in component A → Automatic visual feedback in component B
  - Data change → All displaying main app components update automatically
  - Theme toggle → Entire main app UI transitions smoothly without manual updates
- General Engine handles routing and coordination for main app
- **Cross UI handles its own events independently**

**Automatic UI Updates:**
- Orchestrator executes action → Event bus notifies relevant main app components → General Engine applies update effects
- No manual "update this specific component" code needed for main app components
- Main app components subscribe to relevant data changes automatically
- Visual feedback (loading, success, error) applied by engine based on component type
- **Cross UI receives direct feedback from orchestrator**

#### B4. Apply Transformed Design to ALL Main App Components

**Using General Engine automation:**
- Transform every bare minimum main app component from Phase 3
- Implement mathematical spacing (via design system registry)
- Apply color system consistently (via type mapping)
- Add animations and transitions (via auto-application)
- Refine typography with mathematical scales (via design rules)
- **Cross UI maintains its own separate styling**

**Redesigned category-specific interfaces (Main App - Active Categories Only):**
- Office views → Elegant office cards and detailed views
- Project tracking interfaces → Dynamic project cards and timelines
- Regulatory/Zoning views → Elegant data visualization

**Dormant category interfaces (Future):**
- Client relationship managers → Beautiful interaction flows
- Financial metrics displays → Animated charts and graphs
- City/Land data visualizations → Interactive maps/diagrams
- Division percentage calculators → Animated number displays
- External Forces dashboards → Real-time impact visualizations (macroeconomic, tech, supply chain, demographics, climate, policy, events)
- Political Context views → Governance and institutional data displays

**All main app components receive styling automatically from General Engine - no manual component updates needed**
**Cross UI styled independently**

#### B5. Context Provider Enhancement (Builds on Phase 4)
- Expand `OrchestratorContext` with design system access
- Every main app component gets:
  - Design system rules via `useDesignSystem()` hook
  - Theme/styling context
  - Animation configuration
- Global state management for UI consistency
- Main app components register capabilities AND receive styling in one registration
- **Cross UI does not use context provider - operates independently**

#### B6. Advanced UI Features (Main App)

**Orchestrator-Driven Features:**
- Keyboard shortcuts and command palette (orchestrator routes commands for main app)
- Gesture controls (event bus propagates gestures within main app)
- Window management (resize, minimize behaviors via General Engine)

**Visual Feedback System:**
- Results sent back to AI for confirmation/follow-up
- Visual feedback for all AI actions in main app (automated by General Engine based on action type)
- Loading states, success animations, error handling UI (applied automatically to main app components)
- Performance optimizations for smooth 60fps animations
- **Cross UI has its own direct feedback system**

**Accessibility & Polish:**
- Accessibility features (auto-applied via design system to main app)
- Consistent behavior across main app (enforced by General Engine)
- Scalable architecture for future main app components

#### B7. General Engine Validation (Main App)

**Test that the engine works for main app components:**
- Add a new main app component → Verify it automatically gets styling
- Update design system rule → Verify all main app components of that type update
- Trigger action → Verify visual feedback propagates correctly to main app components
- Theme change → Verify entire main app UI transitions smoothly
- **Verify Cross UI operates independently without engine interference**

**Benefits realized:**
- No micro-managing individual main app components
- Design changes apply universally to main app with single update
- Consistent UX across entire main application
- Easy to extend with new main app features - they inherit everything automatically
- **Cross UI remains lightweight and independent**

---

## Development Flow Summary

**Phase 1:** Plan Files & Setup APIs & Electron → **COMMIT TO GITHUB**  
**Phase 2:** Design Structure → Initialize DB → Implement Structure → Build Operations → **COMMIT TO GITHUB**  
**Phase 3:** Build Bare UI & Features (No General Engine needed yet) → **COMMIT TO GITHUB**  
**Phase 4:** Build Note System (Independent Data Ingestion) → **COMMIT TO GITHUB**  
**Phase 5:** Build AI Orchestrator Core + General Engine Foundation → **COMMIT TO GITHUB**  
**Phase 6A:** Build Cross UI (Separate System - No General Engine) → **COMMIT TO GITHUB**  
**Phase 6B:** Main App UI Overhaul + General Engine Full Implementation (Design System Auto-Application → UX/UI Propagation → Universal Access) → **COMMIT TO GITHUB**

---

## General Engine Concept

### The Problem This Solves
Without a general engine, development becomes micro-management: "When this happens, do that. When this component is added, apply these styles. When this event fires, update that component." This doesn't scale.

### The Solution: General Engine
A self-managing system that automatically handles:

**1. Automatic Component Registration**
- When a component is added, it automatically registers with the orchestrator
- If it's the same type as an existing component, it inherits all actions/behaviors
- No manual "tell Cursor to do X" needed

**2. UX → UI Effect Propagation**
- When something happens in UX that affects UI, the general engine handles propagation
- Events flow through the engine and automatically update relevant components
- No manual wiring of each interaction

**3. Design System Auto-Application**
- When Phase 5 design system is created, it automatically applies to all components
- No need to manually update each component
- Component types automatically get their styling rules

**4. Action Inheritance**
- If a component type already has actions attached (e.g., "NoteCard"), new instances automatically inherit them
- Registry automatically extends to new components of same type
- Reduces repetitive configuration

### Phased Implementation Approach

**Phase 3: Not Needed**
- Build simple UI components without General Engine
- Components are basic and independent
- No automation required yet

**Phase 4: Foundation**
- Build infrastructure: Component Registry, Event Bus, Context Provider
- Set up communication pathways
- Establish action inheritance patterns
- Keep it simple - just the skeleton

**Phase 6A: Cross UI (Not Applicable)**
- Cross UI is built as separate system
- Does NOT use General Engine
- Operates independently with own styling
- Direct orchestrator communication

**Phase 6B: Full Implementation (Main App Only)**
- Add Design System Registry with auto-application
- Implement UX → UI effect propagation
- Enable automatic styling for all main app components
- **This is where the General Engine proves its value** - automatically transforms entire main app UI without manual updates
- **Cross UI remains independent**

### Implementation Strategy
- Event bus handles all cross-component communication (main app only)
- Component registry tracks all active main app components and their types
- Convention over configuration: main app components follow patterns, engine applies rules
- Context providers give main app components access to engine capabilities
- Automatic effect application based on main app component type/category
- **Cross UI operates outside this system as independent component**

### Benefits
- No micro-managing individual main app components
- Scalable architecture for main application
- Consistent behavior across main app
- Easy to extend with new main app features
- Self-documenting through conventions
- Design changes propagate universally across main app with single update
- **Cross UI stays lightweight and decoupled**

---

## Notes

###  CRITICAL - Desktop Application Requirement
- **THIS IS A DOWNLOADABLE DESKTOP APPLICATION FOR macOS**
- Must build to .dmg installer that users can download and install
- Must appear in macOS Applications folder
- Must launch like any native Mac software
- Primary platform: macOS (M1/M2/Intel support)
- Secondary: Windows .exe, Linux AppImage

### Development Notes
- **Office ID System:** CCccNNN format (country-city-number) for unique, collision-resistant IDs
- **Office names NOT used for identification** - IDs are exclusive identifiers
- **4-Tier Database:** Primary Entities (3) + Connective Tissue (3) + Detailed Data (20) + Market Intelligence (5) = 31 collections
- **ALL 31 collections created upfront** - full structure from the start
- **Active vs. Dormant Collections:**
  - **ACTIVE (Initial Build):** offices, projects, regulations (only 3 collections fully exercised)
  - **DORMANT (Future):** All other 28 collections exist but remain unpopulated
- **Active-Only Development:** Only build UI, operations, and actions for offices, projects, and regulations
- **Tier 1 Philosophy:** Only distilled core entities (cities, offices, projects) - the "skeleton"
- **Tier 3 as Enrichment + External Forces:** Enrichment data (13 collections) + External Forces data (7 collections)
  - *Enrichment:* regulations, projectData, cityData, politicalContext, etc. enrich Tier 1 entities
  - *External Forces:* macroeconomic, technology, supply chain, demographics, climate, policy, events
- **Projects:** Tier 1 = basic shell; Tier 3 projectData = comprehensive execution details (vision, team, performance, legacy)
- **Regulations:** Moved to Tier 3 - they're data/constraints, not standalone entities
- **Connective Tissue Tier (Tier 2):** Dedicated tier for relationships, history, network - the links between entities
- **Intelligent Note System:** AI auto-categorizes unstructured input (offices, projects, regulations only) and saves to correct collection
- **Market Consolidation:** Database structure exists, but tracking/analysis is FUTURE functionality
- **Denormalized Data:** Connection counts on offices for fast queries
- **General Engine:** Singular system managing plural main app component parts (see GENERAL_ENGINE.md)
- **Cross UI:** Separate independent system, does NOT use General Engine
- UI stays bare minimum until Phase 5
- Database structure fully planned and specified (see FIRESTORE_DATABASE_PLAN.md)
- AI brain built in logical order: define → implement → integrate
- **GitHub commits after each phase completion**
- **Web app companion:** Separate web version for mobile/phone access (subset of features)

### Key Documentation Files
- **FIRESTORE_DATABASE_PLAN.md** - 4-tier database: Primary (3) + Connective (3) + Detailed (20) + Market (5) = 31 collections
- **NOTE_SYSTEM.md** - AI-powered categorization and data extraction
- **DATA_PLAN.md** - Data categories and specifications
- **MARKET_CONSOLIDATION_TRACKING.md** - 7 consolidation categories, 20+ metrics
- **FILE_STRUCTURE_PLAN.md** - Application file organization
- **GENERAL_ENGINE.md** - Singular engine + plural component parts
- **ACTION_REGISTRY_SPEC.md** - AI orchestrator action definitions
- **PROMPT_ENGINEERING_GUIDE.md** - Claude API prompt patterns

### Future Automation (Post-Base Build)
- **CURRENT STATE:** App works as manual process (user types commands, AI responds)
- **FUTURE STATE:** Automated 24/7 background processor
  - Background service ingests data from external sources (web scraping, RSS, APIs, emails)
  - AI automatically processes incoming data
  - Auto-categorizes and creates Firestore entries
  - Runs continuously in background (menu bar app on macOS)
  - User opens app to see automatically collected and organized intelligence
  - Like having a research assistant working 24/7

