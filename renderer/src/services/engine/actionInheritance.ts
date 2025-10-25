/**
 * Action Inheritance System
 * 
 * Automatically extends actions to similar components.
 * Part of the General Engine foundation for Phase 5.
 */

import { componentRegistry } from './componentRegistry';
import { eventBus, EVENT_TYPES } from './eventBus';

export interface ActionInheritanceRule {
  componentType: string;
  actions: string[];
  conditions?: {
    requiredCapabilities?: string[];
    metadata?: Record<string, any>;
  };
}

export interface ActionInheritanceConfig {
  rules: ActionInheritanceRule[];
  autoInherit: boolean;
  inheritanceMap: Map<string, string[]>;
}

/**
 * Action Inheritance Manager
 */
export class ActionInheritanceManager {
  private config: ActionInheritanceConfig = {
    rules: [],
    autoInherit: true,
    inheritanceMap: new Map()
  };

  /**
   * Initialize action inheritance with predefined rules
   */
  initialize(): void {
    this.setupPredefinedRules();
    this.setupEventListeners();
    console.log('Action inheritance system initialized');
  }

  /**
   * Setup predefined inheritance rules
   */
  private setupPredefinedRules(): void {
    const activeActions: any[] = []; // Removed orchestrator dependency
    
    // Office-related components inherit office actions
    this.addInheritanceRule({
      componentType: 'OfficeCard',
      actions: [
        'CREATE_OFFICE',
        'UPDATE_OFFICE',
        'DELETE_OFFICE',
        'GET_OFFICE',
        'SEARCH_OFFICES'
      ],
      conditions: {
        requiredCapabilities: ['canView']
      }
    });

    this.addInheritanceRule({
      componentType: 'OfficeDetail',
      actions: [
        'UPDATE_OFFICE',
        'DELETE_OFFICE',
        'GET_OFFICE',
        'LINK_OFFICE_TO_PROJECT',
        'LINK_OFFICE_TO_REGULATORY'
      ],
      conditions: {
        requiredCapabilities: ['canView', 'canUpdate']
      }
    });

    this.addInheritanceRule({
      componentType: 'OfficesList',
      actions: [
        'SEARCH_OFFICES',
        'CREATE_OFFICE',
        'GET_OFFICE'
      ],
      conditions: {
        requiredCapabilities: ['canSearch', 'canView']
      }
    });

    // Project-related components inherit project actions
    this.addInheritanceRule({
      componentType: 'ProjectCard',
      actions: [
        'CREATE_PROJECT',
        'UPDATE_PROJECT',
        'DELETE_PROJECT',
        'GET_PROJECT',
        'SEARCH_PROJECTS'
      ],
      conditions: {
        requiredCapabilities: ['canView']
      }
    });

    this.addInheritanceRule({
      componentType: 'ProjectDetail',
      actions: [
        'UPDATE_PROJECT',
        'DELETE_PROJECT',
        'GET_PROJECT',
        'LINK_PROJECT_TO_REGULATORY'
      ],
      conditions: {
        requiredCapabilities: ['canView', 'canUpdate']
      }
    });

    this.addInheritanceRule({
      componentType: 'ProjectsList',
      actions: [
        'SEARCH_PROJECTS',
        'CREATE_PROJECT',
        'GET_PROJECT'
      ],
      conditions: {
        requiredCapabilities: ['canSearch', 'canView']
      }
    });

    // Regulatory-related components inherit regulatory actions
    this.addInheritanceRule({
      componentType: 'RegulatoryCard',
      actions: [
        'CREATE_REGULATORY_RECORD',
        'UPDATE_REGULATORY_RECORD',
        'DELETE_REGULATORY_RECORD',
        'GET_REGULATORY',
        'SEARCH_REGULATORY'
      ],
      conditions: {
        requiredCapabilities: ['canView']
      }
    });

    this.addInheritanceRule({
      componentType: 'RegulatoryDetail',
      actions: [
        'UPDATE_REGULATORY_RECORD',
        'DELETE_REGULATORY_RECORD',
        'GET_REGULATORY',
        'LINK_OFFICE_TO_REGULATORY',
        'LINK_PROJECT_TO_REGULATORY'
      ],
      conditions: {
        requiredCapabilities: ['canView', 'canUpdate']
      }
    });

    this.addInheritanceRule({
      componentType: 'RegulatoryList',
      actions: [
        'SEARCH_REGULATORY',
        'CREATE_REGULATORY_RECORD',
        'GET_REGULATORY'
      ],
      conditions: {
        requiredCapabilities: ['canSearch', 'canView']
      }
    });

    console.log('Predefined inheritance rules setup complete');
  }

  /**
   * Setup event listeners for automatic inheritance
   */
  private setupEventListeners(): void {
    // Listen for component mount events
    eventBus.subscribe(EVENT_TYPES.COMPONENT_MOUNTED, (data) => {
      if (this.config.autoInherit) {
        this.applyInheritanceToComponent(data.componentType, data.componentId);
      }
    });

    // Listen for new action additions
    eventBus.subscribe('ACTION_ADDED', (data) => {
      this.updateInheritanceForAction(data.action, data.componentTypes);
    });
  }

  /**
   * Add an inheritance rule
   */
  addInheritanceRule(rule: ActionInheritanceRule): void {
    this.config.rules.push(rule);
    
    // Update inheritance map
    if (!this.config.inheritanceMap.has(rule.componentType)) {
      this.config.inheritanceMap.set(rule.componentType, []);
    }
    
    const existingActions = this.config.inheritanceMap.get(rule.componentType) || [];
    const newActions = rule.actions.filter(action => !existingActions.includes(action));
    this.config.inheritanceMap.set(rule.componentType, [...existingActions, ...newActions]);
    
    console.log(`Added inheritance rule for ${rule.componentType}:`, rule.actions);
  }

  /**
   * Remove an inheritance rule
   */
  removeInheritanceRule(componentType: string): boolean {
    const ruleIndex = this.config.rules.findIndex(rule => rule.componentType === componentType);
    if (ruleIndex === -1) {
      return false;
    }

    this.config.rules.splice(ruleIndex, 1);
    this.config.inheritanceMap.delete(componentType);
    
    console.log(`Removed inheritance rule for ${componentType}`);
    return true;
  }

  /**
   * Apply inheritance to a specific component
   */
  applyInheritanceToComponent(componentType: string, componentId: string): boolean {
    const rule = this.config.rules.find(r => r.componentType === componentType);
    if (!rule) {
      return false;
    }

    // Check if component meets conditions
    if (!this.checkInheritanceConditions(rule, componentId, componentType)) {
      return false;
    }

    // Apply actions to component type
    componentRegistry.addActionsToComponentType(componentType, rule.actions);
    
    console.log(`Applied inheritance to ${componentType} (${componentId}):`, rule.actions);
    return true;
  }

  /**
   * Check if component meets inheritance conditions
   */
  private checkInheritanceConditions(
    rule: ActionInheritanceRule,
    componentId: string,
    componentType: string
  ): boolean {
    if (!rule.conditions) {
      return true;
    }

    const component = componentRegistry.getComponentInstance(componentId, componentType);
    if (!component) {
      return false;
    }

    // Check required capabilities
    if (rule.conditions.requiredCapabilities) {
      const hasAllCapabilities = rule.conditions.requiredCapabilities.every(
        capability => component.capabilities[capability as keyof typeof component.capabilities]
      );
      
      if (!hasAllCapabilities) {
        return false;
      }
    }

    // Check metadata conditions
    if (rule.conditions.metadata) {
      const hasMatchingMetadata = Object.entries(rule.conditions.metadata).every(
        ([key, value]) => component.metadata?.[key] === value
      );
      
      if (!hasMatchingMetadata) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update inheritance for a new action
   */
  updateInheritanceForAction(actionId: string, componentTypes: string[]): void {
    componentTypes.forEach(componentType => {
      const rule = this.config.rules.find(r => r.componentType === componentType);
      if (rule && !rule.actions.includes(actionId)) {
        rule.actions.push(actionId);
        componentRegistry.addActionsToComponentType(componentType, [actionId]);
        console.log(`Added action ${actionId} to ${componentType} inheritance`);
      }
    });
  }

  /**
   * Get inherited actions for a component type
   */
  getInheritedActions(componentType: string): string[] {
    return this.config.inheritanceMap.get(componentType) || [];
  }

  /**
   * Get all inheritance rules
   */
  getInheritanceRules(): ActionInheritanceRule[] {
    return [...this.config.rules];
  }

  /**
   * Get inheritance statistics
   */
  getInheritanceStats(): {
    totalRules: number;
    totalInheritedActions: number;
    actionsByType: Record<string, number>;
  } {
    const totalRules = this.config.rules.length;
    let totalInheritedActions = 0;
    const actionsByType: Record<string, number> = {};

    this.config.inheritanceMap.forEach((actions, componentType) => {
      actionsByType[componentType] = actions.length;
      totalInheritedActions += actions.length;
    });

    return {
      totalRules,
      totalInheritedActions,
      actionsByType
    };
  }

  /**
   * Enable/disable automatic inheritance
   */
  setAutoInherit(enabled: boolean): void {
    this.config.autoInherit = enabled;
    console.log(`Auto inheritance ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear all inheritance rules
   */
  clearInheritanceRules(): void {
    this.config.rules = [];
    this.config.inheritanceMap.clear();
    console.log('All inheritance rules cleared');
  }
}

// Export singleton instance
export const actionInheritance = new ActionInheritanceManager();

// Initialize the system
actionInheritance.initialize();
