import { ipcMain, BrowserWindow } from 'electron';

// Window control handlers
export const windowHandlers = {
  // Basic window controls
  minimize: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  },

  // Maximize functionality removed - fullscreen disabled

  close: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  },

  restore: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.restore();
  },

  // Window resizing handlers
  resizeToMaxWidth: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      // Temporarily enable resizing for programmatic resize
      window.setResizable(true);
      
      const { screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.workAreaSize;
      
      // Set to maximum width but keep current height
      const currentHeight = window.getBounds().height;
      window.setSize(screenWidth, currentHeight);
      window.center();
      
      // Disable resizing again after resize
      window.setResizable(false);
    }
  },

  resizeToDefault: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      // Temporarily enable resizing for programmatic resize
      window.setResizable(true);
      
      // Reset to default size (1240x700)
      window.setSize(1240, 700);
      window.center();
      
      // Disable resizing again after resize
      window.setResizable(false);
    }
  },

  // Maximize/restore functionality removed - fullscreen disabled
};

// Register all window handlers
export const registerWindowHandlers = () => {
  ipcMain.handle('window:minimize', windowHandlers.minimize);
  ipcMain.handle('window:close', windowHandlers.close);
  ipcMain.handle('window:restore', windowHandlers.restore);
  ipcMain.handle('window:resizeToMaxWidth', windowHandlers.resizeToMaxWidth);
  ipcMain.handle('window:resizeToDefault', windowHandlers.resizeToDefault);
  // Maximize handlers removed - fullscreen disabled
};
