import { contextBridge, ipcRenderer } from 'electron';

console.log('🔧 Preload script loaded!');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    restore: () => ipcRenderer.invoke('window:restore'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximizeWindow'),
    restoreWindow: () => ipcRenderer.invoke('window:restoreWindow'),
    resizeToMaxWidth: () => ipcRenderer.invoke('window:resizeToMaxWidth'),
    resizeToDefault: () => ipcRenderer.invoke('window:resizeToDefault'),
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => process.platform,
  },
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['window:maximized', 'window:unmaximized'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        restore: () => Promise<void>;
        maximizeWindow: () => Promise<void>;
        restoreWindow: () => Promise<void>;
        resizeToMaxWidth: () => Promise<void>;
        resizeToDefault: () => Promise<void>;
      };
      app: {
        getVersion: () => Promise<string>;
        getPlatform: () => string;
      };
      on: (channel: string, callback: (...args: any[]) => void) => void;
      off: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
