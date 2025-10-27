import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerAllHandlers } from './ipc';

const PHI = 1.618033988749;

function createMainWindow(): BrowserWindow {
  // Calculate dimensions for 1/6 ratio rectangles
  // Target: 4px × 24px rectangles (1:6 ratio)
  // Need dimensions that divide evenly by 4px and 24px
  
  // For 4px height rectangles, use 700px height to avoid cut rectangles
  // 700px ÷ 4px = 175 rows with no remainder
  // 1240px width ÷ 40px = 31 columns with no remainder
  
  const mainWindow = new BrowserWindow({
    // Window dimensions
    width: 1240,
    height: 700,
    
    // Minimum size
    minWidth: 1240,
    minHeight: 700,
    
    // Window appearance
    backgroundColor: 'transparent', // Transparent background
    transparent: true, // Enable transparency
    
    // Frame options
    frame: false, // No window frame at all
    
    // Window behavior
    center: true,
    resizable: false, // Disable manual resizing
    maximizable: false,
    minimizable: true,
    fullscreenable: false,
    
    // Security
    webPreferences: {
      nodeIntegration: false,          // Security: disable node in renderer
      contextIsolation: true,           // Security: isolate context
      sandbox: false,                   // Disable sandbox for development
      preload: path.join(__dirname, 'preload.js'), // Enable preload script
      
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
  
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development' || 
                process.env.NODE_ENV === 'dev' || 
                !process.env.NODE_ENV; // Default to dev if not set
  
  if (isDev) {
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

  // Force quit on SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received, forcing app quit...');
    app.quit();
    process.exit(0);
  });

  // Force quit on SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, forcing app quit...');
    app.quit();
    process.exit(0);
  });

  // Force quit on uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    app.quit();
    process.exit(1);
  });

  // Force quit on unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    app.quit();
    process.exit(1);
  });
}

