
/**
 * PageEngine
 * Central manager for page-wide lifecycle and rules.
 * Handles state management with key combination activation/deactivation.
 * 
 * ENFORCED RULE: Only Shift combinations are supported (e.g., "Shift+S", "Shift+A")
 * No Ctrl, Alt, or Meta combinations allowed.
 */

export interface StateDefinition {
  id: string;
  name: string;
  keyCombination: string; // ONLY SHIFT COMBINATIONS: e.g., "Shift+S", "Shift+A"
  description: string;
  isActive: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export class PageEngine {
  private static instance: PageEngine | null = null;
  private initialized: boolean = false;
  private states: Map<string, StateDefinition> = new Map();
  private keyListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private lastToggleTime: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PageEngine {
    if (!this.instance) {
      this.instance = new PageEngine();
    }
    return this.instance;
  }

  /** Initialize subsystems if needed */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.setupGlobalKeyListener();
  }

  /**
   * STATE MANAGEMENT RULE: Register a state with key combination
   * Same key combination toggles state on/off
   */
  registerState(state: Omit<StateDefinition, 'isActive'>): void {
    const stateDefinition: StateDefinition = {
      ...state,
      isActive: false
    };
    
    this.states.set(state.id, stateDefinition);
    this.setupKeyListener(stateDefinition);
  }

  /**
   * STATE MANAGEMENT RULE: Get state by ID
   */
  getState(stateId: string): StateDefinition | undefined {
    return this.states.get(stateId);
  }

  /**
   * STATE MANAGEMENT RULE: Check if state is active
   */
  isStateActive(stateId: string): boolean {
    const state = this.states.get(stateId);
    return state ? state.isActive : false;
  }

  /**
   * STATE MANAGEMENT RULE: Toggle state by ID
   */
  toggleState(stateId: string): boolean {
    const state = this.states.get(stateId);
    if (!state) {
      console.warn(`State '${stateId}' not found`);
      return false;
    }

    state.isActive = !state.isActive;
    
    console.log(`State '${state.name}' ${state.isActive ? 'ACTIVATED' : 'DEACTIVATED'}`);
    
    // Call appropriate callback
    if (state.isActive && state.onActivate) {
      state.onActivate();
    } else if (!state.isActive && state.onDeactivate) {
      state.onDeactivate();
    }
    
    return state.isActive;
  }

  /**
   * STATE MANAGEMENT RULE: Get all active states
   */
  getActiveStates(): StateDefinition[] {
    return Array.from(this.states.values()).filter(state => state.isActive);
  }

  /**
   * STATE MANAGEMENT RULE: Get all registered states
   */
  getAllStates(): StateDefinition[] {
    return Array.from(this.states.values());
  }

  /**
   * STATE MANAGEMENT RULE: Setup key listener for a state
   */
  private setupKeyListener(state: StateDefinition): void {
    const keyListener = (event: KeyboardEvent) => {
      if (this.matchesKeyCombination(event, state.keyCombination)) {
        event.preventDefault();
        
        // Debounce: prevent rapid toggling (100ms cooldown)
        const now = Date.now();
        const lastToggle = this.lastToggleTime.get(state.id) || 0;
        if (now - lastToggle < 100) {
          console.log(`Debounced key combination for state: ${state.id}`);
          return;
        }
        
        this.lastToggleTime.set(state.id, now);
        console.log(`Key combination matched for state: ${state.id}`);
        this.toggleState(state.id);
      }
    };

    this.keyListeners.set(state.id, keyListener);
  }

  /**
   * STATE MANAGEMENT RULE: Setup global key listener
   */
  private setupGlobalKeyListener(): void {
    const globalKeyHandler = (event: KeyboardEvent) => {
      // Check all registered states for matching key combinations
      for (const [, listener] of this.keyListeners) {
        listener(event);
      }
    };

    window.addEventListener('keydown', globalKeyHandler);
  }

  /**
   * STATE MANAGEMENT RULE: Parse key combination and match against event
   * ONLY SUPPORTS SHIFT COMBINATIONS - No Ctrl, Alt, or Meta allowed
   */
  private matchesKeyCombination(event: KeyboardEvent, combination: string): boolean {
    // Simple check for Shift+S
    if (combination.toLowerCase() === 'shift+s') {
      return event.shiftKey && event.key.toLowerCase() === 's' && 
             !event.ctrlKey && !event.altKey && !event.metaKey;
    }
    
    // For other Shift combinations
    const parts = combination.split('+').map(part => part.trim().toLowerCase());
    
    // ENFORCED: Only Shift combinations allowed
    const hasShift = parts.includes('shift') === event.shiftKey;
    const hasNoOtherModifiers = !event.ctrlKey && !event.altKey && !event.metaKey;
    
    // Get the main key (last part)
    const mainKey = parts[parts.length - 1];
    const keyMatches = event.key.toLowerCase() === mainKey;
    
    return hasShift && hasNoOtherModifiers && keyMatches;
  }

  /**
   * STATE MANAGEMENT RULE: Cleanup - remove all listeners
   */
  destroy(): void {
    this.keyListeners.clear();
    this.states.clear();
    this.initialized = false;
  }
}

export default PageEngine;

