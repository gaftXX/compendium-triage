// Global type definitions for the renderer process

export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>;
    close: () => Promise<void>;
    resizeToMaxWidth: () => Promise<void>;
    resizeToDefault: () => Promise<void>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => string;
  };
  on: (channel: string, callback: Function) => void;
  off: (channel: string, callback: Function) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// ============================================================================
// FIRESTORE TYPES
// ============================================================================

// Export all Firestore types
export * from './firestore';

// Export validation types
export * from './validation';

// Export operation types
export * from './operations';

// Export utility types
export * from './utils';
