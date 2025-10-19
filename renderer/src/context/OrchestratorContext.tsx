/**
 * Orchestrator Context Provider
 * 
 * Provides orchestrator access to all components in the application.
 * Part of the General Engine foundation for Phase 5.
 */

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { simpleOrchestrator, SimpleOrchestratorRequest, SimpleOrchestratorResponse } from '../../../orchestrator/simpleOrchestrator';
import { componentRegistry } from '../services/engine/componentRegistry';
import { eventBus, EVENT_TYPES } from '../services/engine/eventBus';

export interface OrchestratorContextValue {
  // Orchestrator methods
  processCommand: (command: string, context?: any) => Promise<SimpleOrchestratorResponse>;
  getAvailableActions: () => any[];
  getConversationHistory: () => Array<{ role: string; content: string }>;
  clearConversationHistory: () => void;
  addContext: (context: any) => void;
  
  // Component registration methods
  registerComponent: (
    componentId: string,
    componentType: string,
    capabilities: any,
    stateUpdateCallback?: (data: any) => void,
    metadata?: any
  ) => void;
  unregisterComponent: (componentId: string, componentType: string) => boolean;
  
  // Event bus methods
  subscribe: (eventType: string, callback: (data: any) => void, componentId?: string, componentType?: string) => string;
  unsubscribe: (subscriptionId: string) => boolean;
  publish: (eventType: string, payload: any, source?: string, target?: string) => void;
  
  // Utility methods
  notifyComponentsOfType: (componentType: string, data: any) => void;
  notifyComponent: (componentId: string, componentType: string, data: any) => boolean;
}

const OrchestratorContext = createContext<OrchestratorContextValue | undefined>(undefined);

export interface OrchestratorProviderProps {
  children: React.ReactNode;
}

/**
 * Orchestrator Context Provider Component
 */
export function OrchestratorProvider({ children }: OrchestratorProviderProps) {
  const subscriptionsRef = useRef<Map<string, string>>(new Map());

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscriptionId) => {
        eventBus.unsubscribe(subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  // Process command through orchestrator
  const processCommand = useCallback(async (
    command: string, 
    context?: any
  ): Promise<SimpleOrchestratorResponse> => {
    const request: SimpleOrchestratorRequest = {
      command,
      context
    };

    const response = await simpleOrchestrator.processCommand(request);
    
    // Publish action execution event
    if (response.success && response.actionExecuted) {
      eventBus.publish(EVENT_TYPES.ACTION_EXECUTED, {
        action: response.actionExecuted,
        result: response.result,
        data: response.data
      });
    } else if (!response.success) {
      eventBus.publish(EVENT_TYPES.ACTION_FAILED, {
        error: response.error,
        command
      });
    }

    return response;
  }, []);

  // Get available actions
  const getAvailableActions = useCallback(() => {
    return orchestrator.getAvailableActions();
  }, []);

  // Get conversation history
  const getConversationHistory = useCallback(() => {
    return orchestrator.getConversationHistory();
  }, []);

  // Clear conversation history
  const clearConversationHistory = useCallback(() => {
    orchestrator.clearConversationHistory();
  }, []);

  // Add context to conversation
  const addContext = useCallback((context: any) => {
    orchestrator.addContext(context);
  }, []);

  // Register component
  const registerComponent = useCallback((
    componentId: string,
    componentType: string,
    capabilities: any,
    stateUpdateCallback?: (data: any) => void,
    metadata?: any
  ) => {
    componentRegistry.registerComponent(
      componentId,
      componentType,
      capabilities,
      stateUpdateCallback,
      metadata
    );

    // Publish component mounted event
    eventBus.publish(EVENT_TYPES.COMPONENT_MOUNTED, {
      componentId,
      componentType,
      capabilities,
      metadata
    });
  }, []);

  // Unregister component
  const unregisterComponent = useCallback((
    componentId: string,
    componentType: string
  ): boolean => {
    const success = componentRegistry.unregisterComponent(componentId, componentType);
    
    if (success) {
      // Unsubscribe from all events for this component
      const subscriptions = componentRegistry.getComponentInstances(componentType)
        .find(instance => instance.id === componentId);
      
      if (subscriptions) {
        eventBus.unsubscribeComponent(componentId);
      }

      // Publish component unmounted event
      eventBus.publish(EVENT_TYPES.COMPONENT_UNMOUNTED, {
        componentId,
        componentType
      });
    }

    return success;
  }, []);

  // Subscribe to event
  const subscribe = useCallback((
    eventType: string,
    callback: (data: any) => void,
    componentId?: string,
    componentType?: string
  ): string => {
    const subscriptionId = eventBus.subscribe(eventType, callback, componentId, componentType);
    subscriptionsRef.current.set(subscriptionId, subscriptionId);
    return subscriptionId;
  }, []);

  // Unsubscribe from event
  const unsubscribe = useCallback((subscriptionId: string): boolean => {
    const success = eventBus.unsubscribe(subscriptionId);
    if (success) {
      subscriptionsRef.current.delete(subscriptionId);
    }
    return success;
  }, []);

  // Publish event
  const publish = useCallback((
    eventType: string,
    payload: any,
    source?: string,
    target?: string
  ) => {
    eventBus.publish(eventType, payload, source, target);
  }, []);

  // Notify components of type
  const notifyComponentsOfType = useCallback((componentType: string, data: any) => {
    componentRegistry.notifyComponentsOfType(componentType, data);
  }, []);

  // Notify specific component
  const notifyComponent = useCallback((
    componentId: string,
    componentType: string,
    data: any
  ): boolean => {
    return componentRegistry.notifyComponent(componentId, componentType, data);
  }, []);

  const contextValue: OrchestratorContextValue = {
    processCommand,
    getAvailableActions,
    getConversationHistory,
    clearConversationHistory,
    addContext,
    registerComponent,
    unregisterComponent,
    subscribe,
    unsubscribe,
    publish,
    notifyComponentsOfType,
    notifyComponent
  };

  return (
    <OrchestratorContext.Provider value={contextValue}>
      {children}
    </OrchestratorContext.Provider>
  );
}

/**
 * Hook to use orchestrator context
 */
export function useOrchestrator(): OrchestratorContextValue {
  const context = useContext(OrchestratorContext);
  if (context === undefined) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return context;
}

/**
 * Hook to register a component
 */
export function useRegisterComponent(
  componentId: string,
  componentType: string,
  capabilities: any,
  stateUpdateCallback?: (data: any) => void,
  metadata?: any
) {
  const { registerComponent, unregisterComponent } = useOrchestrator();

  useEffect(() => {
    registerComponent(componentId, componentType, capabilities, stateUpdateCallback, metadata);
    
    return () => {
      unregisterComponent(componentId, componentType);
    };
  }, [componentId, componentType, capabilities, stateUpdateCallback, metadata, registerComponent, unregisterComponent]);
}

/**
 * Hook to subscribe to events
 */
export function useEventSubscription(
  eventType: string,
  callback: (data: any) => void,
  componentId?: string,
  componentType?: string
) {
  const { subscribe, unsubscribe } = useOrchestrator();

  useEffect(() => {
    const subscriptionId = subscribe(eventType, callback, componentId, componentType);
    
    return () => {
      unsubscribe(subscriptionId);
    };
  }, [eventType, callback, componentId, componentType, subscribe, unsubscribe]);
}
