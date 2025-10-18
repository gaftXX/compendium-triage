import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerAllHandlers } from './ipc';

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
    backgroundColor: 'transparent', // Transparent background
    transparent: true, // Enable transparency
    
    // Frame options
    frame: false, // No window frame at all
    
    // Window behavior
    center: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    
    // Security
    webPreferences: {
      nodeIntegration: false,          // Security: disable node in renderer
      contextIsolation: true,           // Security: isolate context
      sandbox: false,                   // Disable sandbox for development
      // preload: path.join(__dirname, 'preload.ts'), // Disabled for development
      
      // Development
      devTools: true, // Always enable dev tools for debugging
      
      // Allow external API calls
      webSecurity: false, // Disable web security for API calls
    },
    
    // Show behavior
    show: true, // Show immediately for debugging
  });
  
  // Load app
  console.log('NODE_ENV:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    const devUrl = 'http://localhost:3000';
    console.log('Loading development URL:', devUrl);
    mainWindow.loadURL(devUrl); // Vite dev server
  } else {
    const filePath = path.join(__dirname, '../renderer/index.html');
    console.log('Loading file:', filePath);
    mainWindow.loadFile(filePath);
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
    // Disable web security for API calls
    app.commandLine.appendSwitch('--disable-web-security');
    app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
    
    // Register IPC handlers
    registerAllHandlers();
    
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

