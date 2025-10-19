# File Structure Plan - AI Orchestrator Architecture App

## Proposed Directory Structure

```
/compendium-triage/
│
│    PRIMARY: DESKTOP APPLICATION (ELECTRON - DOWNLOADABLE FOR macOS)
│    SECONDARY: WEB APPLICATION (PHONE ACCESS - SUBSET OF FEATURES)
│
├── /main/                          # Electron main process (DESKTOP APP)
│   ├── main.ts                     # Main Electron entry point
│   ├── preload.ts                  # Preload script for IPC
│   └── /ipc/                       # IPC handlers
│       ├── index.ts
│       └── windowHandlers.ts
│
├── /orchestrator/                  #  AI ORCHESTRATOR (SEPARATE SYSTEM)
│   ├── orchestrator.ts             # Main orchestrator brain
│   ├── claudeClient.ts             # Claude API wrapper
│   ├── promptBuilder.ts            # Builds prompts for Claude
│   │
│   ├── /actions/                   # AI action handlers
│   │   ├── registry.ts             # Action registry mapping
│   │   ├── officeActions.ts        # Office CRUD actions
│   │   ├── regulatoryActions.ts    # Regulatory CRUD actions
│   │   ├── searchActions.ts        # Search/query actions
│   │   ├── relationshipActions.ts  # Relationship linking
│   │   └── analyticsActions.ts     # Division percentages, metrics
│   │
│   └── /types/                     # Orchestrator-specific types
│       ├── action.types.ts
│       └── orchestrator.types.ts
│
├── /cross/                         #  CROSS UI (SEPARATE SYSTEM)
│   ├── Cross.tsx                   # Main Cross UI component
│   │
│   ├── /positionCalculator/        # Grid positioning system
│   │   ├── PositionCalculator.ts   # Grid position calculations
│   │   └── index.ts                # Exports
│   │
│   ├── /colorEngine/               # Rectangle coloring system
│   │   ├── ColorEngine.ts          # Color rules and management
│   │   └── index.ts                # Exports
│   │
│   ├── /multiRectangleComponents/  # Multi-rectangle components
│   │   ├── MultiRectangleComponent.tsx
│   │   └── index.ts                # Exports
│   │
│   ├── /firebaseConnections/       # Firestore integration
│   │   ├── FirestoreGridData.ts    # Firestore data mapping
│   │   ├── GridDataSync.ts         # Real-time sync
│   │   ├── GridDataMapper.ts       # Data transformation
│   │   └── index.ts                # Exports
│   │
│   └── /animations/                # Animation system
│       ├── /onLoad/                # OnLoad animation bundle
│       │   ├── Animation.ts        # Animation logic + functions
│       │   └── index.ts            # Exports
│       │
│       ├── /dataFlow/              # Data flow animation bundle (future)
│       │   ├── Animation.ts        # Animation logic + functions
│       │   └── index.ts            # Exports
│       │
│       ├── /pulse/                 # Pulse animation bundle (future)
│       │   ├── Animation.ts        # Animation logic + functions
│       │   └── index.ts            # Exports
│       │
│       └── index.ts                # Main animation exports
│
├── /ui/                            #  SHARED COMPONENT LIBRARY (APP-WIDE)
│   ├── /Button/                    # Each component = separate folder
│   │   ├── Button.tsx              # Component implementation
│   │   ├── Button.types.ts         # Component types
│   │   ├── useButton.ts            # Component hook with actions
│   │   └── index.ts                # Export
│   │
│   ├── /Input/
│   │   ├── Input.tsx
│   │   ├── Input.types.ts
│   │   ├── useInput.ts
│   │   └── index.ts
│   │
│   ├── /Card/
│   │   ├── Card.tsx
│   │   ├── Card.types.ts
│   │   ├── useCard.ts
│   │   └── index.ts
│   │
│   ├── /Modal/
│   │   ├── Modal.tsx
│   │   ├── Modal.types.ts
│   │   ├── useModal.ts
│   │   └── index.ts
│   │
│   ├── /Dropdown/
│   │   ├── Dropdown.tsx
│   │   ├── Dropdown.types.ts
│   │   ├── useDropdown.ts
│   │   └── index.ts
│   │
│   ├── /Table/
│   │   ├── Table.tsx
│   │   ├── Table.types.ts
│   │   ├── useTable.ts
│   │   └── index.ts
│   │
│   ├── /Form/
│   │   ├── Form.tsx
│   │   ├── Form.types.ts
│   │   ├── useForm.ts
│   │   └── index.ts
│   │
│   ├── /Toast/
│   │   ├── Toast.tsx
│   │   ├── Toast.types.ts
│   │   ├── useToast.ts
│   │   └── index.ts
│   │
│   └── /LoadingSpinner/
│       ├── LoadingSpinner.tsx
│       ├── LoadingSpinner.types.ts
│       └── index.ts
│
├── /renderer/                      # React application (UI)
│   │
│   ├── /public/                    # Static assets
│   │   └── index.html
│   │
│   ├── /src/
│   │   │
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # React entry point
│   │   │
│   │   ├── /components/            # React components
│   │   │   ├── /offices/
│   │   │   │   ├── OfficeCard.tsx
│   │   │   │   ├── OfficesList.tsx
│   │   │   │   ├── OfficeDetail.tsx
│   │   │   │   └── OfficeForm.tsx
│   │   │   │
│   │   │   ├── /regulatory/
│   │   │   │   ├── RegulatoryCard.tsx
│   │   │   │   ├── RegulatoryList.tsx
│   │   │   │   ├── RegulatoryDetail.tsx
│   │   │   │   └── RegulatoryForm.tsx
│   │   │   │
│   │   │   ├── /common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   └── /layout/
│   │   │       ├── MainLayout.tsx
│   │   │       └── Sidebar.tsx
│   │   │
│   │   ├── /services/              # Core services
│   │   │   ├── /firebase/
│   │   │   │   ├── config.ts                # Firebase configuration
│   │   │   │   ├── firestore.ts             # Firestore initialization
│   │   │   │   └── /operations/             # Firestore CRUD operations
│   │   │   │       ├── officeOperations.ts
│   │   │   │       ├── regulatoryOperations.ts
│   │   │   │       ├── queryOperations.ts
│   │   │   │       ├── relationshipOperations.ts
│   │   │   │       └── batchOperations.ts
│   │   │   │
│   │   │   ├── /eventBus/
│   │   │   │   └── eventBus.ts              # Global event system
│   │   │   │
│   │   │   └── /engine/                     # General Engine (auto-management)
│   │   │       ├── componentRegistry.ts     # Tracks all components and types
│   │   │       ├── effectEngine.ts          # Auto-applies effects/behaviors
│   │   │       ├── styleEngine.ts           # Auto-applies design system
│   │   │       └── actionInheritance.ts     # Auto-extends actions to similar components
│   │   │
│   │   ├── /context/               # React context providers
│   │   │   ├── OrchestratorContext.tsx      # Global orchestrator access
│   │   │   ├── FirebaseContext.tsx          # Firebase access
│   │   │   └── UIContext.tsx                # UI state management
│   │   │
│   │   ├── /hooks/                 # Custom React hooks
│   │   │   ├── useOrchestrator.ts
│   │   │   ├── useFirestore.ts
│   │   │   ├── useCross.ts
│   │   │   └── useGeneralEngine.ts
│   │   │
│   │   ├── /types/                 # TypeScript type definitions
│   │   │   ├── office.types.ts
│   │   │   ├── regulatory.types.ts
│   │   │   └── firestore.types.ts
│   │   │
│   │   ├── /design/                # Design system (Phase 5)
│   │   │   ├── /constants/
│   │   │   │   ├── colors.ts               # Color palette definitions
│   │   │   │   ├── spacing.ts              # Mathematical spacing system
│   │   │   │   ├── typography.ts           # Typography scale
│   │   │   │   └── animations.ts           # Animation constants
│   │   │   │
│   │   │   ├── /math/
│   │   │   │   ├── ratios.ts               # Golden ratio, fibonacci
│   │   │   │   ├── easing.ts               # Easing functions
│   │   │   │   └── grid.ts                 # Grid system calculations
│   │   │   │
│   │   │   └── /animations/
│   │   │       ├── transitions.ts
│   │   │       ├── interactions.ts
│   │   │       └── springs.ts
│   │   │
│   │   └── /utils/                 # Utility functions
│   │       ├── validators.ts
│   │       ├── formatters.ts
│   │       └── helpers.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── /web/                           #  WEB APPLICATION (PHONE ACCESS)
│   │
│   ├── /public/                    # Static assets
│   │   └── index.html
│   │
│   ├── /src/
│   │   │
│   │   ├── App.tsx                 # Web app entry
│   │   ├── main.tsx                # React entry point
│   │   │
│   │   ├── /components/            # Web-specific components
│   │   │   ├── /mobile/
│   │   │   │   ├── MobileHeader.tsx
│   │   │   │   ├── MobileNav.tsx
│   │   │   │   └── TouchOptimized.tsx
│   │   │   │
│   │   │   ├── /offices/           # Uses shared /ui/ components
│   │   │   │   ├── OfficeCardMobile.tsx
│   │   │   │   └── OfficesListMobile.tsx
│   │   │   │
│   │   │   └── /regulatory/
│   │   │       ├── RegulatoryCardMobile.tsx
│   │   │       └── RegulatoryListMobile.tsx
│   │   │
│   │   ├── /services/              # Web-specific services
│   │   │   └── /firebase/          # Shared Firebase (same as desktop)
│   │   │       ├── config.ts       # Same config as renderer
│   │   │       └── /operations/    # Same operations
│   │   │
│   │   └── /hooks/                 # Web-specific hooks
│   │       ├── useMobileGestures.ts
│   │       └── useResponsive.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── /shared/                        # Shared between ALL apps (desktop, web)
│   ├── /types/
│   │   ├── ipc.types.ts
│   │   ├── office.types.ts         # Shared types
│   │   └── regulatory.types.ts     # Shared types
│   └── /constants/
│       └── channels.ts
│
├── /docs/                          # Documentation
│   ├── DEVELOPMENT_PLAN.md
│   ├── DESIGN_SYSTEM.md
│   ├── /defining features/
│   │   ├── GENERAL_ENGINE.md
│   │   ├── CROSS.md
│   │   └── ARCH_DATA.md
│   ├── /file structure/
│   │   ├── FILE_STRUCTURE_PLAN.md
│   │   └── FIRESTORE_DATABASE_PLAN.md
│   ├── /ai orchestration/
│   │   ├── ACTION_REGISTRY_SPEC.md
│   │   └── PROMPT_ENGINEERING_GUIDE.md
│   └── /api and configuration/
│       ├── API_DOCUMENTATION.md
│       └── ELECTRON_CONFIGURATION.md
│
├── /scripts/                       # Build and utility scripts
│   ├── build.js
│   └── dev.js
│
├── package.json                    # Root package.json
├── tsconfig.json                   # Root TypeScript config
├── .gitignore
├── .env.example                    # Example environment variables
└── README.md
```

---

## Key Architecture Decisions

### 0.  DESKTOP APPLICATION - Primary Platform 

**CRITICAL REQUIREMENT:** This app MUST be downloadable and installable on macOS like any native application.

**Build Target:**
- macOS .dmg installer (M1/M2 + Intel support)
- Installs to `/Applications` folder
- Launches from Dock like any Mac software
- Code-signed for macOS distribution
- Notarized for Gatekeeper

**Electron Configuration:**
- electron-builder for packaging
- Platform-specific builds (macOS primary, Windows/Linux secondary)
- Auto-updater for seamless updates
- Native menu bar integration

**User Experience:**
1. User downloads `Compendium-Triage-1.0.0.dmg`
2. Opens DMG, drags to Applications folder
3. Launches from Applications or Spotlight
4. App runs as native desktop software

---

### 0.1.  WEB APPLICATION - Phone Access (Secondary)

**Location:** `/web/` at project root

**Purpose:** 
- Mobile/phone access to subset of features
- View offices and regulatory data
- Quick searches on the go
- **Not full AI orchestrator** (desktop only)
- **Limited features:** Read-only or basic CRUD

**Why Separate:**
- Different UX for touch devices
- Mobile-optimized components
- Lighter bundle (no Electron, no heavy animations)
- Progressive Web App (PWA) installable on phones
- Shares `/ui/` components, Firebase operations, and types with desktop

**Contains:**
- Mobile-optimized React app
- Touch-friendly components
- Simplified navigation
- Shared Firebase operations
- Responsive design

**Shared Resources:**
- Uses `/ui/` component library
- Uses `/orchestrator/` (optional - could add limited AI)
- Uses same Firestore database
- Uses `/shared/` types and constants

---

### 1. AI Orchestrator = Separate Top-Level System 

**Location:** `/orchestrator/` at project root

**Why Separate:**
- Self-contained AI system
- Can be tested independently
- Clear boundary between AI logic and UI
- Easy to swap out or upgrade AI without touching other code
- **Shared by desktop AND web** (if web needs AI features)
- Import path: `import { orchestrator } from '@/orchestrator'`

**Contains:**
- Core orchestrator brain
- Claude API client
- Prompt building
- Action registry
- Action handlers
- Orchestrator-specific types

---

### 2. Cross UI = Separate Top-Level System 

**Location:** `/cross/` at project root

**Why Separate:**
- Unique, complex UI element with its own physics
- Independent animation engine (60 FPS loop)
- Mathematical equations and particle systems
- Not a typical React component
- Import path: `import { Cross } from '@/cross'`

**Contains:**
- Cross UI component (main whiteboard)
- Grid positioning system (enforced 25×88 grid)
- Color engine (rectangle coloring rules)
- Multi-rectangle components (spanning multiple grid cells)
- Firebase connections (Firestore data integration)
- Animation system (bundled animations)

**Animation Bundle Pattern:**
Each animation type gets its own folder with:
```
/cross/animations/[animationType]/
├── Animation.ts        # Animation logic + functions (single file)
└── index.ts           # Clean exports
```

**Examples:**
- `/onLoad/` - OnLoad animation bundle
- `/dataFlow/` - Data flow animation bundle (future)
- `/pulse/` - Pulse animation bundle (future)
- `/sparkle/` - Sparkle animation bundle (future)

---

### 3. Shared Component Library = App-Wide Reusable UI 

**Location:** `/ui/` at project root

**Why Separate:**
- Every component has **consistent actions and behaviors** everywhere
- Import once, use everywhere with same functionality
- Each component is self-contained (component + types + hook + behaviors)
- General Engine auto-applies standardized behaviors
- Import path: `import { Button } from '@/ui'`

**The Pattern:**
Each UI component lives in its own folder with:
```
/ui/Button/
  ├── Button.tsx         # Component implementation
  ├── Button.types.ts    # TypeScript types/interfaces
  ├── useButton.ts       # Hook with component actions/behaviors
  └── index.ts           # Clean export
```

**How It Works:**
```typescript
// In /ui/Button/Button.tsx
import { useButton } from './useButton';
import { useGeneralEngine } from '@/renderer/hooks/useGeneralEngine';

export const Button = ({ children, variant, onClick }: ButtonProps) => {
  // Component gets standardized behaviors via hook
  const { handleClick, isLoading, styles } = useButton({ variant, onClick });
  
  // General Engine auto-registers and applies design system
  const { componentStyles } = useGeneralEngine('Button', { variant });
  
  return (
    <button 
      onClick={handleClick} 
      style={{ ...styles, ...componentStyles }}
      disabled={isLoading}
    >
      {children}
    </button>
  );
};
```

**Usage Anywhere in App:**
```typescript
// In /renderer/src/components/offices/OfficeCard.tsx
import { Button } from '@/ui';

// Button has SAME actions and behaviors everywhere
<Button variant="primary" onClick={handleSave}>
  Save Office
</Button>
```

**Benefits:**
- **Consistency:** Every Button behaves identically across the entire app
- **Reusability:** Import once, works everywhere
- **Maintainability:** Change Button once, updates everywhere
- **Type Safety:** Full TypeScript support with `.types.ts`
- **Extensibility:** Add new components, General Engine auto-manages them

**Available Components:**
- Button (primary, secondary, ghost, danger variants)
- Input (text, number, search, with validation)
- Card (for displaying office/regulatory data)
- Modal (confirmation, forms, details)
- Dropdown (select, multi-select)
- Table (sortable, filterable, paginated)
- Form (validation, submission)
- Toast (success, error, info notifications)
- LoadingSpinner (for async operations)

---

### 4. General Engine = Part of Renderer Services

**Location:** `/renderer/src/services/engine/`

**Why In Services:**
- Manages React components (component registry)
- Part of the UI infrastructure
- Works with React context and hooks
- Auto-applies design system to UI components
- **Works with `/ui/` components to ensure consistent behaviors**

---

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `OfficeCard.tsx`)
- **Services/Utils**: camelCase (e.g., `orchestrator.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `office.types.ts`)

### Directories
- **Lowercase with hyphens** for multi-word names
- **camelCase** for single-word descriptive folders

### Code
- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Enums**: PascalCase

---

## Component Hierarchy

```
App
├── OrchestratorProvider (from /orchestrator)
│   ├── FirebaseProvider
│   │   ├── UIProvider
│   │   │   ├── MainLayout
│   │   │   │   ├── Cross (from /cross) - Central input
│   │   │   │   ├── OfficesList
│   │   │   │   │   └── OfficeCard (multiple instances)
│   │   │   │   └── RegulatoryList
│   │   │   │       └── RegulatoryCard (multiple instances)
```

---

## Service Layer Architecture

### Orchestrator Flow
```
User types in Cross UI (/cross)
    ↓
Orchestrator Service (/orchestrator/orchestrator.ts)
    ↓
Claude API (/orchestrator/claudeClient.ts)
    ↓
Parse Response
    ↓
Registry Lookup (/orchestrator/actions/registry.ts)
    ↓
Action Handler (/orchestrator/actions/officeActions.ts)
    ↓
Firestore Operations (/renderer/src/services/firebase/operations/)
    ↓
Firebase/Firestore
    ↓
Event Bus (broadcasts change)
    ↓
General Engine (auto-propagates effects)
    ↓
UI Updates (all relevant components)
```

### General Engine Flow
```
Component Mounts
    ↓
Component Registry (/renderer/src/services/engine/componentRegistry.ts)
    ↓
Action Inheritance (checks if type has existing actions)
    ↓
Style Engine (applies design system if Phase 5)
    ↓
Component Ready (with auto-applied behaviors)

─────────────────────

UX Event Occurs
    ↓
Event Bus (broadcasts event)
    ↓
Effect Engine (determines affected components)
    ↓
Auto-propagates to relevant components
    ↓
UI Updates (no manual wiring needed)
```

### Cross UI Flow
```
Cross Component Mounts (/cross/Cross.tsx)
    ↓
Animation Engine Starts (/cross/CrossAnimationEngine.ts)
    ↓
60 FPS Loop:
    - Update Lissajous idle float
    - Update particle system (Brownian motion)
    - Update physics state
    - Render frame
    ↓
User Interaction (hover, focus, type, submit)
    ↓
State Change Triggers Animation:
    - Hover → Magnetic attraction
    - Focus → Spring expansion
    - Type → Ripple effect
    - Submit → Vortex spiral
    ↓
Input sent to Orchestrator
```

---

## File Relationships & Dependencies

### Core Dependencies
- `/orchestrator/orchestrator.ts` → depends on: `claudeClient.ts`, `actions/registry.ts`
- `/orchestrator/actions/registry.ts` → depends on: all action handlers in `/orchestrator/actions/`
- Action handlers → depend on: `/renderer/src/services/firebase/operations/`
- `/cross/Cross.tsx` → depends on: `/cross/CrossAnimationEngine.ts`, `/cross/animations/`

### UI Dependencies
- All components → can access orchestrator via `useOrchestrator()` hook
- All components → auto-managed by General Engine (`/renderer/src/services/engine/`)
- Cross UI → imported directly from `/cross/`

---

## Import Path Aliases

### Desktop App (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/orchestrator/*": ["orchestrator/*"],
      "@/cross/*": ["cross/*"],
      "@/ui/*": ["ui/*"],
      "@/renderer/*": ["renderer/src/*"],
      "@/shared/*": ["shared/*"]
    }
  }
}
```

### Web App (`/web/tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/orchestrator/*": ["../orchestrator/*"],
      "@/ui/*": ["../ui/*"],
      "@/web/*": ["src/*"],
      "@/shared/*": ["../shared/*"]
    }
  }
}
```

**Desktop App Usage:**
```typescript
// AI Orchestrator
import { orchestrator } from '@/orchestrator';
import { officeActions } from '@/orchestrator/actions/officeActions';

// Cross UI (desktop only)
import { Cross } from '@/cross';

// Shared UI Components (always have same behaviors)
import { Button, Input, Card, Modal } from '@/ui';

// Desktop utilities
import { useFirestore } from '@/renderer/hooks/useFirestore';
import { useGeneralEngine } from '@/renderer/hooks/useGeneralEngine';
```

**Web App Usage:**
```typescript
// Shared UI Components (same as desktop)
import { Button, Input, Card, Modal } from '@/ui';

// Shared orchestrator (if needed)
import { orchestrator } from '@/orchestrator';

// Web-specific hooks
import { useMobileGestures } from '@/web/hooks/useMobileGestures';

// Shared types
import type { Office, Regulatory } from '@/shared/types';
```

---

## Notes

###  CRITICAL - Downloadable macOS Application
- **THIS MUST BUILD TO A .dmg INSTALLER FOR macOS**
- App installs to `/Applications` folder like any Mac software
- Launches from Dock, Spotlight, Launchpad
- Code-signed and notarized for macOS
- electron-builder handles packaging
- Primary platform: macOS (M1/M2 + Intel)
- Secondary platforms: Windows .exe, Linux AppImage

### BASE BUILD (Phase 2-3):
- **Desktop App:** Start with `/offices/` and `/regulatory/` components only
- **Web App:** Basic viewing of offices and regulatory (no AI initially)
- Orchestrator has office + regulatory actions only
- Cross UI is bare minimum (just input, desktop only)

### FUTURE EXPANSION:
- Add 14 more category components to desktop
- Add more features to web app as needed
- Orchestrator actions extend automatically via General Engine
- Cross UI gets Phase 5 polish with full animations

### Separation Benefits:
- **Orchestrator:** Can upgrade Claude → GPT-4 → Gemini without touching UI
- **Cross UI:** Desktop only, can redesign without affecting orchestrator
- **UI Components:** Change Button once, updates in desktop AND web apps
- **General Engine:** Manages all components automatically
- **Web App:** Shares code with desktop, lighter bundle for phones
- Clear boundaries = easier testing, maintenance, and scaling

---

## The Four Systems Working Together

```
┌─────────────────────────────────────────────────────────────┐
│                    USER TYPES IN CROSS UI                    │
│                        (/cross/)                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI ORCHESTRATOR                            │
│                  (/orchestrator/)                            │
│  • Interprets natural language                              │
│  • Maps to actions                                          │
│  • Executes database operations                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   GENERAL ENGINE                             │
│            (/renderer/src/services/engine/)                  │
│  • Auto-registers all components                            │
│  • Propagates effects across app                            │
│  • Applies design system                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              SHARED UI COMPONENTS UPDATE                     │
│                        (/ui/)                                │
│  • Buttons, Cards, Modals all update                        │
│  • Same behaviors everywhere                                │
│  • Consistent actions across app                            │
└─────────────────────────────────────────────────────────────┘
```

**Example Flow:**
1. User types: "Create office Zaha Hadid in London"
2. **Cross** (`/cross/`) → Sends to orchestrator
3. **Orchestrator** (`/orchestrator/`) → Parses intent, calls `officeActions.create()`
4. **General Engine** → Broadcasts "OFFICE_CREATED" event
5. **UI Components** (`/ui/`) → Cards auto-update everywhere, Toast shows success

**Key Point:** Import `Button` from `/ui/` anywhere in the app → **always has same actions, behaviors, and styling**. No need to recreate behaviors for each use.

---

*Four independent systems, two platforms: Orchestrator understands language, Cross handles input, UI library provides consistent components, General Engine manages everything. Desktop (Electron) is the full experience, Web (mobile) is a lightweight companion.*

---

## Desktop vs Web Application

### Desktop App (PRIMARY - Electron) 
**Location:** `/main/` + `/renderer/`  
**Platform:** macOS (downloadable .dmg), Windows, Linux  
**Features:** Full AI orchestrator, Cross UI, all 16 categories, complete functionality

**What It Has:**
-  Full AI orchestration via Claude
-  Cross UI with advanced animations
-  General Engine with auto-management
-  All data categories (offices, regulatory, projects, financials, etc.)
-  Offline support via Electron
-  Native system integration
-  Complete CRUD operations

**Installation:**
- Download `Compendium-Triage.dmg`
- Install to `/Applications` folder
- Launch like any Mac app

---

### Web App (SECONDARY - Mobile/Phone) 
**Location:** `/web/`  
**Platform:** Mobile browsers, phone (iOS/Android)  
**Features:** View offices, regulatory data, quick search - **subset only**

**What It Has:**
-  Office browsing and viewing
-  Regulatory data viewing
-  Basic search functionality
-  Touch-optimized UI
-  PWA installation on phone
-  Shares same Firebase database
-  Limited or no AI orchestrator (desktop feature)
-  No Cross UI (desktop only)
-  Simplified features (read-mostly)

**Access:**
- Visit web URL on phone
- Install as PWA (Add to Home Screen)
- Quick access to data on the go

---

### Shared Between Both
**Location:** `/ui/`, `/orchestrator/`, `/shared/`

Both desktop and web apps use:
-  Same `/ui/` component library (Button, Card, Input, etc.)
-  Same Firestore database
-  Same types in `/shared/`
-  Same Firebase operations
-  Can optionally use same `/orchestrator/` (if web needs AI)

**Benefits:**
- Build components once, use on desktop AND web
- Data syncs (both use same Firestore)
- Consistent experience across platforms
- Type safety shared between apps

---

*Primary focus: Downloadable macOS desktop application. Web app is a lightweight companion for mobile access.*
