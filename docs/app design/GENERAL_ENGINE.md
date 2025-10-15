# General Engine - Unified UI Management System

**Purpose:** A singular central engine that manages all repeatable UI component parts automatically.

---

## System Architecture

### The Engine (Singular)
**Location:** `/renderer/src/services/engine/` - One centralized system file  
**Purpose:** Auto-manages all component behaviors, styling, events, and consistency

### The Parts (Plural)
**Location:** `/ui/` - Repeatable component library  
**Purpose:** Standardized UI elements (Button, Input, Card, etc.) managed by the engine

### How They Work Together
```
┌─────────────────────────────────────────┐
│     GENERAL ENGINE (The Brain)          │
│  /renderer/src/services/engine/         │
│  - Component Registry                   │
│  - Action Inheritance                   │
│  - Effect Engine                        │
│  - Style Engine                         │
└─────────────┬───────────────────────────┘
              │ manages
              ↓
┌─────────────────────────────────────────┐
│     COMPONENTS (The Parts)              │
│  /ui/                                   │
│  - Button (repeatable)                  │
│  - Input (repeatable)                   │
│  - Card (repeatable)                    │
│  - Modal (repeatable)                   │
│  - ... all UI elements                  │
└─────────────────────────────────────────┘
```

---

# PART 1: THE GENERAL ENGINE (The System)

## The Problem

Without a general engine, development becomes tedious:
- "Cursor, when this button is clicked, update that component"
- "When this component is added, apply these 10 styles"
- "When this event fires, propagate to these 5 other components"
- Every new component = manual configuration
- Every interaction = manual wiring

**This doesn't scale.**

---

## The Solution: General Engine

A centralized auto-management system that:
1. **Registers components automatically** when they mount
2. **Inherits behaviors** from similar component types
3. **Propagates effects** through the app without manual wiring
4. **Applies design systems** automatically based on component type
5. **Maintains consistency** across the entire application

---

## Engine Components

### 1. Component Registry (`componentRegistry.ts`)

**Purpose:** Track all mounted components and their types

**Functionality:**
```typescript
interface RegisteredComponent {
  id: string;
  type: string;  // e.g., "Button", "Card", "Input"
  category?: string;  // e.g., "regulatory", "financial"
  instance: React.ComponentType;
  actions: string[];  // Associated action IDs
  metadata: Record<string, any>;
}

class ComponentRegistry {
  private components: Map<string, RegisteredComponent>;
  
  register(component: RegisteredComponent): void;
  unregister(id: string): void;
  getByType(type: string): RegisteredComponent[];
  getByCategory(category: string): RegisteredComponent[];
  hasType(type: string): boolean;
  getActions(type: string): string[];
}
```

**When a component mounts:**
1. Calls `registry.register()` with its type and metadata
2. Engine checks if this type already exists
3. If yes, inherits actions and behaviors
4. Stores component reference for future updates

---

### 2. Action Inheritance Engine (`actionInheritance.ts`)

**Purpose:** Automatically extend AI actions to new components of the same type

**Functionality:**
```typescript
class ActionInheritanceEngine {
  private actionMap: Map<string, string[]>; // componentType -> actionIds
  
  // When first component of a type gets actions
  defineActionsForType(type: string, actions: string[]): void;
  
  // When new component of same type mounts
  inheritActions(type: string): string[];
  
  // Check if type has actions defined
  hasActions(type: string): boolean;
  
  // Extend existing actions for a type
  extendActions(type: string, newActions: string[]): void;
}
```

---

### 3. Effect Engine (`effectEngine.ts`)

**Purpose:** Auto-propagate UX events to affected UI components

**Functionality:**
```typescript
interface EffectRule {
  trigger: string;  // Event name
  affects: string[]; // Component types affected
  transform: (data: any) => any;  // Transform event data
  propagate: boolean;  // Should it propagate to children?
}

class EffectEngine {
  private rules: Map<string, EffectRule>;
  
  // Define a rule: "when X happens, affect Y components"
  defineRule(rule: EffectRule): void;
  
  // Event occurred, propagate effects
  propagate(event: string, data: any): void;
  
  // Get all components affected by an event
  getAffectedComponents(event: string): RegisteredComponent[];
}
```

**Example:**
```typescript
// Define rule: when note is created, update all relevant lists
effectEngine.defineRule({
  trigger: 'NOTE_CREATED',
  affects: ['NotesList', 'CategoryView', 'SearchResults'],
  transform: (note) => ({ note, action: 'add' }),
  propagate: true
});

// When event fires:
eventBus.emit('NOTE_CREATED', newNote);
// Effect engine automatically:
// 1. Finds all NotesList, CategoryView, SearchResults components
// 2. Transforms the data
// 3. Updates each component
// 4. No manual wiring needed
```

---

### 4. Style Engine (`styleEngine.ts`)

**Purpose:** Auto-apply design system based on component type (Phase 5)

**Functionality:**
```typescript
interface StyleRule {
  componentType: string;
  styles: {
    spacing?: object;
    colors?: object;
    animations?: object;
    transitions?: object;
  };
  variants?: Map<string, object>;  // Different visual variants
}

class StyleEngine {
  private designSystem: Map<string, StyleRule>;
  private isActive: boolean;  // false until Phase 5
  
  // Load design system (Phase 5)
  loadDesignSystem(system: Map<string, StyleRule>): void;
  
  // Get styles for a component type
  getStyles(type: string, variant?: string): object;
  
  // Apply styles to component automatically
  applyStyles(component: RegisteredComponent): void;
  
  // Activate design system (Phase 5)
  activate(): void;
}
```

**Phase 3-4:** Style engine is inactive, components have bare minimum styling  
**Phase 5:** Style engine activates, automatically applies design system to all registered components

---

## Event Bus Integration

### Event Bus (`eventBus.ts`)
```typescript
class EventBus {
  private listeners: Map<string, Function[]>;
  
  // Emit event
  emit(event: string, data: any): void {
    // 1. Notify direct listeners
    this.notifyListeners(event, data);
    
    // 2. Pass to effect engine for auto-propagation
    effectEngine.propagate(event, data);
  }
  
  // Subscribe to event
  on(event: string, callback: Function): void;
  
  // Unsubscribe
  off(event: string, callback: Function): void;
}
```

**Flow:**
```
UX Event Occurs (e.g., button click)
    ↓
Event Bus Emits Event
    ↓
    ├── Direct Listeners (manual subscriptions)
    └── Effect Engine (auto-propagation)
        ↓
        Finds Affected Components (via registry)
        ↓
        Updates Components (via rules)
```

---

## React Integration Hook

### Custom Hook: `useGeneralEngine`
```typescript
function useGeneralEngine(
  componentType: string, 
  category?: string,
  metadata?: Record<string, any>
) {
  const componentId = useId();
  
  useEffect(() => {
    // Register on mount
    componentRegistry.register({
      id: componentId,
      type: componentType,
      category,
      instance: currentComponent,
      actions: actionInheritance.inheritActions(`${componentType}:${category}`),
      metadata
    });
    
    // Apply styles if Phase 5
    if (styleEngine.isActive) {
      styleEngine.applyStyles(componentRegistry.get(componentId));
    }
    
    // Unregister on unmount
    return () => {
      componentRegistry.unregister(componentId);
    };
  }, [componentId, componentType, category]);
  
  return {
    actions: componentRegistry.getActions(componentId),
    styles: styleEngine.getStyles(componentType),
    emit: (event: string, data: any) => eventBus.emit(event, data)
  };
}
```

---

# PART 2: THE COMPONENTS (The Repeatable Parts)

## Component Library Structure

```
/ui/                            # Component Parts Library
├── /Button/                    ← Repeatable Button part
│   ├── Button.tsx              
│   ├── Button.types.ts         
│   ├── useButton.ts            
│   └── index.ts                
│
├── /Input/                     ← Repeatable Input part
│   ├── Input.tsx
│   ├── Input.types.ts
│   ├── useInput.ts
│   └── index.ts
│
├── /Card/                      ← Repeatable Card part
│   ├── Card.tsx
│   ├── Card.types.ts
│   ├── useCard.ts
│   └── index.ts
│
├── /Modal/                     ← Repeatable Modal part
│   ├── Modal.tsx
│   ├── Modal.types.ts
│   ├── useModal.ts
│   └── index.ts
│
├── /Dropdown/
├── /Table/
├── /Form/
├── /Toast/
└── /LoadingSpinner/
```

---

## Component Pattern (Each Part)

### Each Component Has 4 Files:

#### 1. Component File (`Button.tsx`)
The React component implementation

```typescript
// /ui/Button/Button.tsx
import { ButtonProps } from './Button.types';
import { useButton } from './useButton';
import { useGeneralEngine } from '@/renderer/hooks/useGeneralEngine';

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick,
  disabled 
}: ButtonProps) => {
  // Standardized button behaviors (from useButton hook)
  const { handleClick, isLoading } = useButton({ onClick });
  
  // General Engine auto-registers and applies design system
  const { componentStyles } = useGeneralEngine('Button', { variant });
  
  return (
    <button 
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={componentStyles}
      className={`button button-${variant}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

#### 2. Types File (`Button.types.ts`)
TypeScript interfaces and types

```typescript
// /ui/Button/Button.types.ts
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
```

#### 3. Hook File (`useButton.ts`)
Component logic and actions

```typescript
// /ui/Button/useButton.ts
import { useState } from 'react';
import { eventBus } from '@/renderer/services/eventBus/eventBus';

export function useButton({ onClick }: { onClick?: () => void | Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async (e: React.MouseEvent) => {
    if (!onClick) return;
    
    try {
      setIsLoading(true);
      
      // Emit event (General Engine tracks all button clicks)
      eventBus.emit('UI:BUTTON_CLICKED', { timestamp: Date.now() });
      
      await onClick();
      
      // Success event
      eventBus.emit('UI:BUTTON_ACTION_SUCCESS', {});
      
    } catch (error) {
      console.error('Button action failed:', error);
      
      // Error event (could trigger toast notification)
      eventBus.emit('UI:BUTTON_ACTION_ERROR', { error });
      
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    handleClick,
    isLoading,
  };
}
```

#### 4. Index File (`index.ts`)
Clean export

```typescript
// /ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
export { useButton } from './useButton';
```

---

## Complete Component Library (All Parts)

### Basic Components
- **Button** - All button interactions
- **Input** - Text input with validation
- **Card** - Data display containers
- **Modal** - Dialogs and overlays
- **LoadingSpinner** - Loading states

### Form Components
- **Form** - Form wrapper with validation
- **Checkbox** - Boolean inputs
- **Radio** - Single selection
- **Toggle** - On/off switches
- **Select/Dropdown** - Option selection

### Data Display
- **Table** - Sortable, filterable tables
- **List** - Simple lists
- **Grid** - Grid layouts
- **Badge** - Status indicators
- **Tag** - Tag chips

### Feedback
- **Toast** - Notifications
- **Alert** - Important messages
- **Tooltip** - Hover information
- **ProgressBar** - Loading progress

### Layout
- **Container** - Page containers
- **Stack** - Vertical/horizontal stacking
- **Divider** - Visual separators

---

## How Engine Manages Parts

### Flow: Component Lifecycle

```
1. Component Part Mounts
   (e.g., Button from /ui/Button/)
        ↓
2. Calls useGeneralEngine('Button')
        ↓
3. GENERAL ENGINE (The Brain):
   - Registers Button in Component Registry
   - Checks if Button type has actions defined
   - Inherits those actions if they exist
   - Applies design system styles (Phase 5)
   - Subscribes to relevant events
        ↓
4. Component Ready with Auto-Applied Behaviors
   - Loading states
   - Error handling
   - Event emission
   - Styling (Phase 5)
        ↓
5. When Component Updates/Unmounts:
   - Engine tracks changes
   - Cleans up on unmount
```

---

## Usage Pattern

### Import Components (The Parts)
```typescript
// Any file in the app
import { Button, Input, Card, Modal } from '@/ui';

// Use components - Engine manages them automatically
<Button onClick={handleSave}>Save</Button>
<Input placeholder="Office name" />
<Card>Content here</Card>
```

### Engine Works Invisibly
```typescript
// You write:
<Button onClick={handleClick}>Click Me</Button>

// Engine automatically:
// ✓ Registers the Button
// ✓ Applies loading state handling
// ✓ Applies error handling
// ✓ Emits events for analytics
// ✓ Applies design system (Phase 5)
// ✓ Manages consistency with all other Buttons
```

---

## Example: Complete Flow

### Scenario: User creates a new office via AI

**1. User types in Cross UI:**
```
"Create office Zaha Hadid in London"
```

**2. AI Orchestrator parses and executes**

**3. Event emitted:**
```typescript
eventBus.emit('OFFICE_CREATED', newOffice);
```

**4. General Engine (Effect Engine) propagates:**
```typescript
// Rule defined in Effect Engine:
effectEngine.defineRule({
  trigger: 'OFFICE_CREATED',
  affects: ['OfficesList', 'OfficeCard', 'SearchResults'],
  transform: (office) => ({ office, action: 'add' }),
  propagate: true
});

// Engine automatically:
// 1. Finds all OfficesList components (via Component Registry)
// 2. Finds all OfficeCard components showing this office
// 3. Finds SearchResults if query matches
// 4. Updates each with new office data
```

**5. All UI Parts Update Automatically:**
- Offices list shows new office
- Search results refresh
- Related cards update
- **No manual wiring needed**

**6. Toast notification (also a component part):**
```typescript
// Toast component listens for success events
// Engine propagates: 'UI:ACTION_SUCCESS' → Toast shows notification
```

---

## Complete Example: Button Component

### The Component Part: `/ui/Button/`

**Button.tsx:**
```typescript
import { ButtonProps } from './Button.types';
import { useButton } from './useButton';
import { useGeneralEngine } from '@/renderer/hooks/useGeneralEngine';

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button'
}: ButtonProps) => {
  const { handleClick, isLoading } = useButton({ onClick });
  const { componentStyles } = useGeneralEngine('Button', { variant, size });
  
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={componentStyles}
      className={`button button-${variant} button-${size}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

**Button.types.ts:**
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
```

**useButton.ts:**
```typescript
import { useState } from 'react';
import { eventBus } from '@/renderer/services/eventBus/eventBus';

export function useButton({ onClick }: { onClick?: () => void | Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async (e: React.MouseEvent) => {
    if (!onClick) return;
    
    try {
      setIsLoading(true);
      eventBus.emit('UI:BUTTON_CLICKED', { timestamp: Date.now() });
      await onClick();
      eventBus.emit('UI:BUTTON_ACTION_SUCCESS', {});
    } catch (error) {
      console.error('Button action failed:', error);
      eventBus.emit('UI:BUTTON_ACTION_ERROR', { error });
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleClick, isLoading };
}
```

**index.ts:**
```typescript
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
export { useButton } from './useButton';
```

---

## Benefits of This System

### 1. The Engine is Singular
- One central system file (`/renderer/src/services/engine/`)
- Manages ALL components from one place
- Change engine rules → affects all component parts

### 2. The Parts are Repeatable
- Button is defined once in `/ui/Button/`
- Import it 500 times across the app
- All 500 instances managed by the same engine
- Same behaviors everywhere

### 3. No Micro-Management
```typescript
// You DON'T need to:
"Cursor, when Button is clicked, show loading state"
"Cursor, when action fails, handle error"
"Cursor, apply hover animation to this Button"

// You JUST DO:
<Button onClick={handleSave}>Save</Button>

// Engine handles everything automatically
```

### 4. Consistency Guaranteed
```typescript
// In OfficeCard
<Button onClick={save}>Save</Button>

// In RegulatoryForm  
<Button onClick={submit}>Submit</Button>

// In ProjectList
<Button onClick={refresh}>Refresh</Button>

// ALL have:
// - Same loading behavior
// - Same error handling
// - Same event emission
// - Same styling (Phase 5)
// Managed by ONE engine
```

---

## Implementation Phases

### Phase 1-2: Foundation
- Create General Engine infrastructure
- Create component parts in `/ui/`
- Set up hooks (engine inactive)

### Phase 3: Basic Engine Activation
- Activate component registration
- Implement action inheritance
- Basic effect propagation
- Components are bare minimum (no styling)

### Phase 4: Full Engine Online
- Complete effect engine with all rules
- Action inheritance fully automatic
- Event propagation complete
- Orchestrator integrates with engine

### Phase 5: Style Engine Activation
- Load complete design system
- Activate style engine
- Auto-apply to all component parts
- Mathematical styling takes effect everywhere

---

## File Structure

```
Project Root
│
├── /renderer/src/services/engine/    ← THE ENGINE (Singular)
│   ├── componentRegistry.ts          
│   ├── actionInheritance.ts          
│   ├── effectEngine.ts               
│   └── styleEngine.ts                
│
├── /ui/                               ← THE PARTS (Plural, Repeatable)
│   ├── /Button/
│   │   ├── Button.tsx                ← Managed by engine
│   │   ├── Button.types.ts
│   │   ├── useButton.ts
│   │   └── index.ts
│   │
│   ├── /Input/                       ← Managed by engine
│   ├── /Card/                        ← Managed by engine
│   ├── /Modal/                       ← Managed by engine
│   └── ... (all component parts)
│
└── /renderer/src/components/         ← Uses component parts
    └── /offices/
        └── OfficeCard.tsx            ← Imports from /ui/, managed by engine
```

---

## Key Principle

### Engine (Singular) → Parts (Plural)

**The Engine:**
- Lives in `/renderer/src/services/engine/`
- ONE centralized system
- Manages ALL component instances
- Auto-applies behaviors, styles, events

**The Parts:**
- Live in `/ui/`
- MANY repeatable components
- Each defined once
- Imported and used everywhere
- All managed by the engine

**Relationship:**
```
One Engine orchestrates many Parts
Engine = The conductor
Parts = The instruments
Together = One harmonious UI system
```

---

*The General Engine is a single orchestrator managing multiple repeatable component parts for automatic consistency and zero micro-management.*

