import { ipcMain } from 'electron';
import { registerWindowHandlers } from './windowHandlers';
import { registerOfficeScrapingHandlers } from './officeScrapingHandlers';

// App info handlers
const appHandlers = {
  getVersion: () => {
    const { app } = require('electron');
    return app.getVersion();
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
};

// Export handlers for individual use if needed
export { windowHandlers } from './windowHandlers';
export { appHandlers };
