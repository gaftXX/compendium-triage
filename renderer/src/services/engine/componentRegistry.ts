/**
 * Component Registry System
 * 
 * Tracks all active components and manages their capabilities.
 * Part of the General Engine foundation for Phase 5.
 */

export interface ComponentCapabilities {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSearch?: boolean;
  canView?: boolean;
  canLink?: boolean;
  customActions?: string[];
}

export interface ComponentInstance {
  id: string;
  type: string;
  capabilities: ComponentCapabilities;
  stateUpdateCallback?: (data: any) => void;
  metadata?: any;
  createdAt: Date;
}

export interface ComponentType {
  type: string;
  defaultCapabilities: ComponentCapabilities;
  instances: ComponentInstance[];
  inheritedActions: string[];
}

export interface ComponentRegistry {
  [componentType: string]: ComponentType;
}

/**
 * Component Registry Manager
 */
export class ComponentRegistryManager {
  private registry: ComponentRegistry = {};
  private actionInheritanceMap: Map<string, string[]> = new Map();

  /**
   * Register a new component instance
   */
  registerComponent(
    componentId: string,
    componentType: string,
    capabilities: ComponentCapabilities,
    stateUpdateCallback?: (data: any) => void,
    metadata?: any
  ): ComponentInstance {
    const instance: ComponentInstance = {
      id: componentId,
      type: componentType,
      capabilities,
      stateUpdateCallback,
      metadata,
      createdAt: new Date()
    };

    // Initialize component type if it doesn't exist
    if (!this.registry[componentType]) {
      this.registry[componentType] = {
        type: componentType,
        defaultCapabilities: capabilities,
        instances: [],
        inheritedActions: []
      };
    }

    // Add instance to registry
    this.registry[componentType].instances.push(instance);

    // Apply action inheritance if this type already has actions
    if (this.registry[componentType].inheritedActions.length > 0) {
      this.applyInheritedActions(instance);
    }

    console.log(`Registered component: ${componentType} (${componentId})`);
    return instance;
  }

  /**
   * Unregister a component instance
   */
  unregisterComponent(componentId: string, componentType: string): boolean {
    if (!this.registry[componentType]) {
      return false;
    }

    const instanceIndex = this.registry[componentType].instances.findIndex(
      instance => instance.id === componentId
    );

    if (instanceIndex === -1) {
      return false;
    }

    this.registry[componentType].instances.splice(instanceIndex, 1);
    console.log(`Unregistered component: ${componentType} (${componentId})`);
    return true;
  }

  /**
   * Get all instances of a component type
   */
  getComponentInstances(componentType: string): ComponentInstance[] {
    return this.registry[componentType]?.instances || [];
  }

  /**
   * Get a specific component instance
   */
  getComponentInstance(componentId: string, componentType: string): ComponentInstance | undefined {
    return this.registry[componentType]?.instances.find(
      instance => instance.id === componentId
    );
  }

  /**
   * Get all registered component types
   */
  getComponentTypes(): string[] {
    return Object.keys(this.registry);
  }

  /**
   * Get component type information
   */
  getComponentType(componentType: string): ComponentType | undefined {
    return this.registry[componentType];
  }

  /**
   * Update component capabilities
   */
  updateComponentCapabilities(
    componentId: string,
    componentType: string,
    newCapabilities: ComponentCapabilities
  ): boolean {
    const instance = this.getComponentInstance(componentId, componentType);
    if (!instance) {
      return false;
    }

    instance.capabilities = { ...instance.capabilities, ...newCapabilities };
    console.log(`Updated capabilities for component: ${componentType} (${componentId})`);
    return true;
  }

  /**
   * Add actions to a component type (for inheritance)
   */
  addActionsToComponentType(componentType: string, actions: string[]): void {
    if (!this.registry[componentType]) {
      this.registry[componentType] = {
        type: componentType,
        defaultCapabilities: {},
        instances: [],
        inheritedActions: []
      };
    }

    // Add new actions to the type
    this.registry[componentType].inheritedActions.push(...actions);
    
    // Apply to all existing instances
    this.registry[componentType].instances.forEach(instance => {
      this.applyInheritedActions(instance);
    });

    console.log(`Added actions to component type: ${componentType}`, actions);
  }

  /**
   * Apply inherited actions to a component instance
   */
  private applyInheritedActions(instance: ComponentInstance): void {
    const componentType = this.registry[instance.type];
    if (!componentType) return;

    // Add inherited actions to custom actions
    if (!instance.capabilities.customActions) {
      instance.capabilities.customActions = [];
    }

    // Add actions that aren't already present
    componentType.inheritedActions.forEach(action => {
      if (!instance.capabilities.customActions!.includes(action)) {
        instance.capabilities.customActions!.push(action);
      }
    });

    console.log(`Applied inherited actions to component: ${instance.type} (${instance.id})`);
  }

  /**
   * Notify all components of a specific type about an update
   */
  notifyComponentsOfType(componentType: string, data: any): void {
    const instances = this.getComponentInstances(componentType);
    instances.forEach(instance => {
      if (instance.stateUpdateCallback) {
        try {
          instance.stateUpdateCallback(data);
        } catch (error) {
          console.error(`Error notifying component ${instance.id}:`, error);
        }
      }
    });
  }

  /**
   * Notify a specific component about an update
   */
  notifyComponent(componentId: string, componentType: string, data: any): boolean {
    const instance = this.getComponentInstance(componentId, componentType);
    if (!instance || !instance.stateUpdateCallback) {
      return false;
    }

    try {
      instance.stateUpdateCallback(data);
      return true;
    } catch (error) {
      console.error(`Error notifying component ${componentId}:`, error);
      return false;
    }
  }

  /**
   * Get components that can perform a specific action
   */
  getComponentsByCapability(capability: keyof ComponentCapabilities): ComponentInstance[] {
    const allInstances: ComponentInstance[] = [];
    
    Object.values(this.registry).forEach(componentType => {
      componentType.instances.forEach(instance => {
        if (instance.capabilities[capability]) {
          allInstances.push(instance);
        }
      });
    });

    return allInstances;
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalTypes: number;
    totalInstances: number;
    instancesByType: Record<string, number>;
  } {
    const totalTypes = Object.keys(this.registry).length;
    let totalInstances = 0;
    const instancesByType: Record<string, number> = {};

    Object.entries(this.registry).forEach(([type, componentType]) => {
      const instanceCount = componentType.instances.length;
      instancesByType[type] = instanceCount;
      totalInstances += instanceCount;
    });

    return {
      totalTypes,
      totalInstances,
      instancesByType
    };
  }

  /**
   * Clear all registrations (for testing)
   */
  clearRegistry(): void {
    this.registry = {};
    console.log('Component registry cleared');
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistryManager();
