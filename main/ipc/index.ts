import { ipcMain, shell } from 'electron';
import { registerWindowHandlers } from './windowHandlers';
import { registerOfficeScrapingHandlers } from './officeScrapingHandlers';

// App info handlers
const appHandlers = {
  getVersion: () => {
    const { app } = require('electron');
    return app.getVersion();
  },
  openExternal: async (url: string) => {
    try {
      console.log('Opening external URL:', url);
      await shell.openExternal(url);
      console.log('Successfully opened URL');
    } catch (error) {
      console.error('Error opening external URL:', error);
      throw error;
    }
  }
};

// Register all IPC handlers
export const registerAllHandlers = () => {
  // Register window handlers
  registerWindowHandlers();
  
  // Register office scraping handlers
  registerOfficeScrapingHandlers();
  
  // Register app handlers
  ipcMain.handle('app:getVersion', appHandlers.getVersion);
  ipcMain.handle('app:openExternal', (_event, url: string) => appHandlers.openExternal(url));
};

// Export handlers for individual use if needed
export { windowHandlers } from './windowHandlers';
export { appHandlers };
