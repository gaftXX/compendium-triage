/**
 * Event Bus System
 * 
 * Handles orchestrator-to-component communication.
 * Part of the General Engine foundation for Phase 5.
 */

export interface EventData {
  type: string;
  payload: any;
  timestamp: Date;
  source?: string;
  target?: string;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  callback: (data: EventData) => void;
  componentId?: string;
  componentType?: string;
}

export interface EventBusStats {
  totalEvents: number;
  activeSubscriptions: number;
  eventsByType: Record<string, number>;
  subscriptionsByType: Record<string, number>;
}

/**
 * Event Bus Manager
 */
export class EventBusManager {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: EventData[] = [];
  private maxHistorySize: number = 1000;

  /**
   * Subscribe to an event type
   */
  subscribe(
    eventType: string,
    callback: (data: EventData) => void,
    componentId?: string,
    componentType?: string
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      callback,
      componentId,
      componentType
    };

    this.subscriptions.set(subscriptionId, subscription);
    console.log(`Subscribed to event: ${eventType} (${subscriptionId})`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    this.subscriptions.delete(subscriptionId);
    console.log(`Unsubscribed from event: ${subscription.eventType} (${subscriptionId})`);
    return true;
  }

  /**
   * Unsubscribe all subscriptions for a component
   */
  unsubscribeComponent(componentId: string): number {
    let unsubscribedCount = 0;
    
    this.subscriptions.forEach((subscription, subscriptionId) => {
      if (subscription.componentId === componentId) {
        this.subscriptions.delete(subscriptionId);
        unsubscribedCount++;
      }
    });

    if (unsubscribedCount > 0) {
      console.log(`Unsubscribed ${unsubscribedCount} events for component: ${componentId}`);
    }
    
    return unsubscribedCount;
  }

  /**
   * Publish an event
   */
  publish(eventType: string, payload: any, source?: string, target?: string): void {
    const eventData: EventData = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
      target
    };

    // Add to event history
    this.addToHistory(eventData);

    // Notify all subscribers
    this.notifySubscribers(eventData);

    console.log(`Published event: ${eventType}`, payload);
  }

  /**
   * Publish event to specific component type
   */
  publishToComponentType(eventType: string, payload: any, componentType: string, source?: string): void {
    const eventData: EventData = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
      target: componentType
    };

    this.addToHistory(eventData);
    this.notifySubscribersByType(eventData, componentType);
    
    console.log(`Published event to component type: ${eventType} -> ${componentType}`, payload);
  }

  /**
   * Publish event to specific component
   */
  publishToComponent(eventType: string, payload: any, componentId: string, source?: string): void {
    const eventData: EventData = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
      target: componentId
    };

    this.addToHistory(eventData);
    this.notifySubscriberById(eventData, componentId);
    
    console.log(`Published event to component: ${eventType} -> ${componentId}`, payload);
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit?: number): EventData[] {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return [...history];
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
    console.log('Event history cleared');
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscriptions by event type
   */
  getSubscriptionsByEventType(eventType: string): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.eventType === eventType
    );
  }

  /**
   * Get subscriptions by component
   */
  getSubscriptionsByComponent(componentId: string): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.componentId === componentId
    );
  }

  /**
   * Get event bus statistics
   */
  getStats(): EventBusStats {
    const eventsByType: Record<string, number> = {};
    const subscriptionsByType: Record<string, number> = {};

    // Count events by type
    this.eventHistory.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    // Count subscriptions by type
    this.subscriptions.forEach(subscription => {
      subscriptionsByType[subscription.eventType] = (subscriptionsByType[subscription.eventType] || 0) + 1;
    });

    return {
      totalEvents: this.eventHistory.length,
      activeSubscriptions: this.subscriptions.size,
      eventsByType,
      subscriptionsByType
    };
  }

  /**
   * Notify all subscribers of an event
   */
  private notifySubscribers(eventData: EventData): void {
    this.subscriptions.forEach((subscription, subscriptionId) => {
      if (subscription.eventType === eventData.type) {
        try {
          subscription.callback(eventData);
        } catch (error) {
          console.error(`Error in event callback ${subscriptionId}:`, error);
        }
      }
    });
  }

  /**
   * Notify subscribers by component type
   */
  private notifySubscribersByType(eventData: EventData, componentType: string): void {
    this.subscriptions.forEach((subscription, subscriptionId) => {
      if (subscription.eventType === eventData.type && subscription.componentType === componentType) {
        try {
          subscription.callback(eventData);
        } catch (error) {
          console.error(`Error in event callback ${subscriptionId}:`, error);
        }
      }
    });
  }

  /**
   * Notify subscriber by component ID
   */
  private notifySubscriberById(eventData: EventData, componentId: string): void {
    this.subscriptions.forEach((subscription, subscriptionId) => {
      if (subscription.eventType === eventData.type && subscription.componentId === componentId) {
        try {
          subscription.callback(eventData);
        } catch (error) {
          console.error(`Error in event callback ${subscriptionId}:`, error);
        }
      }
    });
  }

  /**
   * Add event to history
   */
  private addToHistory(eventData: EventData): void {
    this.eventHistory.push(eventData);
    
    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const eventBus = new EventBusManager();

// Predefined event types for the application
export const EVENT_TYPES = {
  // Action execution events
  ACTION_EXECUTED: 'ACTION_EXECUTED',
  ACTION_FAILED: 'ACTION_FAILED',
  
  // Data update events
  DATA_UPDATED: 'DATA_UPDATED',
  DATA_CREATED: 'DATA_CREATED',
  DATA_DELETED: 'DATA_DELETED',
  
  // Component events
  COMPONENT_MOUNTED: 'COMPONENT_MOUNTED',
  COMPONENT_UNMOUNTED: 'COMPONENT_UNMOUNTED',
  COMPONENT_UPDATED: 'COMPONENT_UPDATED',
  
  // Error events
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // UI events
  UI_THEME_CHANGE: 'UI_THEME_CHANGE',
  ANIMATION_TRIGGER: 'ANIMATION_TRIGGER',
  STATE_SYNC: 'STATE_SYNC',
  LAYOUT_UPDATE: 'LAYOUT_UPDATE',
  
  // Search events
  SEARCH_PERFORMED: 'SEARCH_PERFORMED',
  SEARCH_RESULTS_UPDATED: 'SEARCH_RESULTS_UPDATED',
  
  // Relationship events
  RELATIONSHIP_CREATED: 'RELATIONSHIP_CREATED',
  RELATIONSHIP_DELETED: 'RELATIONSHIP_DELETED'
} as const;
