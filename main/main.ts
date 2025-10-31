import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { registerAllHandlers } from './ipc';

// Read app version from package.json
function getAppVersion(): string {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || '0.1.0';
  } catch (error) {
    // Fallback to dist package.json in production
    try {
      const packagePath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version || '0.1.0';
    } catch {
      return '0.1.0';
    }
  }
}

const PHI = 1.618033988749;

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let isAppQuitting = false;

function createTray(): void {
  // Create tray icon - use dedicated tray-icon.png file
  const iconPathDev = path.join(process.cwd(), 'build/tray-icon.png');
  const iconPathProd = path.join(__dirname, '../build/tray-icon.png');
  const iconPath = fs.existsSync(iconPathDev) ? iconPathDev : iconPathProd;
  
  // Fallback to regular icon if tray icon doesn't exist
  const fallbackPathDev = path.join(process.cwd(), 'build/icon.png');
  const fallbackPathProd = path.join(__dirname, '../build/icon.png');
  const fallbackPath = fs.existsSync(fallbackPathDev) ? fallbackPathDev : fallbackPathProd;
  
  const finalIconPath = fs.existsSync(iconPath) ? iconPath : fallbackPath;
  
  if (!fs.existsSync(finalIconPath)) {
    console.error('Tray icon file not found:', finalIconPath);
    return;
  }
  
  let trayIcon = nativeImage.createFromPath(finalIconPath);
  
  // Check if icon loaded correctly
  if (trayIcon.isEmpty()) {
    console.error('Failed to load tray icon from:', finalIconPath);
    return;
  }
  
  // Resize icon to appropriate size for macOS (22x22 for standard, 44x44 for retina)
  if (process.platform === 'darwin') {
    const size = trayIcon.getSize();
    if (size.width !== 26 && size.height !== 26) {
      // Resize to 26x26 (will be 52x52 on retina displays automatically)
      trayIcon = trayIcon.resize({ width: 26, height: 26 });
    }
    // Set as template image for macOS (allows system to adjust for dark mode)
    trayIcon.setTemplateImage(true);
  }
  
  // Create tray
  try {
    tray = new Tray(trayIcon);
    tray.setToolTip('Compendium Triage');
    console.log('Tray icon created successfully from:', finalIconPath);
  } catch (error) {
    console.error('Failed to create tray icon:', error);
    return;
  }
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Compendium',
      enabled: false
    },
    {
      label: 'Check for updates',
      click: () => {
        // TODO: Implement check for updates functionality
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  // Single click handler (toggle window)
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // Right-click handler (show context menu)
  tray.on('right-click', () => {
    tray?.popUpContextMenu(contextMenu);
  });
}

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
    
    // Icon
    icon: path.join(process.cwd(), 'build/icon.png'),
    
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
                process.env.NODE_ENV === 'dev';
  
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
  
  // Handle window close (on macOS, keep app running)
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      // On macOS, hide window instead of closing
      if (!isAppQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    }
  });
  
  return mainWindow;
}

function setupMacMenu(): void {
  if (process.platform !== 'darwin') {
    return;
  }

  const appVersion = getAppVersion();
  
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Compendium',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Version',
      submenu: [
        {
          label: appVersion,
          enabled: false
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
    
    // Setup macOS application menu
    setupMacMenu();
    
    // Register IPC handlers
    registerAllHandlers();
    
    mainWindow = createMainWindow();
    
    // Create tray icon
    createTray();
    
    // Handle quit from menu
    app.on('before-quit', () => {
      isAppQuitting = true;
    });
    
    // macOS: Re-create window when dock icon clicked
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow();
      } else if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
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

