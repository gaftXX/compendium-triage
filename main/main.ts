import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const PHI = 1.618033988749;

function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    // Window dimensions (Golden Rectangle)
    width: 1280,
    height: Math.round(1280 / PHI), // ~791px
    
    // Minimum size
    minWidth: 800,
    minHeight: Math.round(800 / PHI), // ~494px
    
    // Window appearance
    backgroundColor: '#0A0E27', // Dark background
    
    // Frame options
    frame: true,
    titleBarStyle: 'hiddenInset', // macOS: hidden title bar with traffic lights
    
    // Window behavior
    center: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    
    // Security
    webPreferences: {
      nodeIntegration: false,          // Security: disable node in renderer
      contextIsolation: true,           // Security: isolate context
      sandbox: true,                    // Security: enable sandbox
      preload: path.join(__dirname, 'preload.js'),
      
      // Development
      devTools: process.env.NODE_ENV === 'development',
    },
    
    // Show behavior
    show: false, // Don't show until ready
  });
  
  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  return mainWindow;
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, focus our window
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  
  // App ready
  app.whenReady().then(() => {
    createMainWindow();
    
    // macOS: Re-create window when dock icon clicked
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
  
  // Quit when all windows closed (except macOS)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// IPC Handlers for API communication
ipcMain.handle('window:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

ipcMain.handle('window:maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window?.isMaximized()) {
    window.unmaximize();
  } else {
    window?.maximize();
  }
});

ipcMain.handle('window:close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});
