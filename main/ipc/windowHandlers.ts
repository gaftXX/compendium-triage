import { ipcMain, BrowserWindow } from 'electron';

// Window control handlers
export const windowHandlers = {
  // Basic window controls
  minimize: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  },

  maximize: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  },

  close: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  },

  restore: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.restore();
  },

  isMaximized: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isMaximized() || false;
  },

  // Note system window management
  maximizeWindow: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.maximize();
  },

  restoreWindow: (event: Electron.IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.unmaximize();
  }
};

// Register all window handlers
export const registerWindowHandlers = () => {
  ipcMain.handle('window:minimize', windowHandlers.minimize);
  ipcMain.handle('window:maximize', windowHandlers.maximize);
  ipcMain.handle('window:close', windowHandlers.close);
  ipcMain.handle('window:restore', windowHandlers.restore);
  ipcMain.handle('window:isMaximized', windowHandlers.isMaximized);
  ipcMain.handle('window:maximizeWindow', windowHandlers.maximizeWindow);
  ipcMain.handle('window:restoreWindow', windowHandlers.restoreWindow);
};
