# Electron Configuration

**Purpose:** Complete Electron setup and configuration for cross-platform desktop app

---

## Main Process Configuration

### Window Configuration
```typescript
// main/main.ts
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
```

### App Lifecycle
```typescript
// main/main.ts

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
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
```

---

## Preload Script

### IPC Bridge (Security Best Practice)
```typescript
// main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
  
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => process.platform,
  },
  
  // File system (if needed)
  fs: {
    selectFile: () => ipcRenderer.invoke('fs:selectFile'),
    saveFile: (data: any) => ipcRenderer.invoke('fs:saveFile', data),
  },
  
  // Event listeners
  on: (channel: string, callback: Function) => {
    const validChannels = ['window:maximized', 'window:unmaximized'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  
  off: (channel: string, callback: Function) => {
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
      };
      app: {
        getVersion: () => Promise<string>;
        getPlatform: () => string;
      };
      fs: {
        selectFile: () => Promise<string | null>;
        saveFile: (data: any) => Promise<boolean>;
      };
      on: (channel: string, callback: Function) => void;
      off: (channel: string, callback: Function) => void;
    };
  }
}
```

---

## IPC Handlers

### Window Management
```typescript
// main/ipc/windowHandlers.ts
import { BrowserWindow, ipcMain } from 'electron';

export function setupWindowHandlers() {
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
  
  ipcMain.handle('window:isMaximized', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isMaximized() ?? false;
  });
}
```

### App Handlers
```typescript
// main/ipc/appHandlers.ts
import { app, ipcMain } from 'electron';

export function setupAppHandlers() {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
}
```

---

## Build Configuration

### Package.json Scripts
```json
{
  "name": "compendium-triage",
  "version": "0.1.0",
  "description": "AI Orchestrator Architecture App",
  "main": "dist/main/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc -p tsconfig.main.json && electron .",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.compendium.triage",
    "productName": "Compendium Triage",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Office",
      "icon": "build/icon.png"
    }
  }
}
```

### Electron Builder Config
```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.compendium.triage',
  productName: 'Compendium Triage',
  directories: {
    output: 'release',
    buildResources: 'build',
  },
  files: [
    'dist/**/*',
    'package.json',
  ],
  mac: {
    category: 'public.app-category.productivity',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
    icon: 'build/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
    icon: 'build/icon.ico',
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      {
        target: 'deb',
        arch: ['x64'],
      },
    ],
    category: 'Office',
    icon: 'build/icon.png',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
```

---

## TypeScript Configuration

### Main Process tsconfig
```json
// tsconfig.main.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist/main",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": [
    "main/**/*",
    "shared/**/*"
  ],
  "exclude": [
    "node_modules",
    "renderer"
  ]
}
```

### Renderer Process tsconfig
```json
// tsconfig.json (renderer)
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "renderer/src"
  ],
  "references": [
    { "path": "./tsconfig.main.json" }
  ]
}
```

---

## Vite Configuration

### Vite Config for Electron
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  root: path.join(__dirname, 'renderer'),
  
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  
  server: {
    port: 5173,
  },
  
  resolve: {
    alias: {
      '@': path.join(__dirname, 'renderer/src'),
      '@components': path.join(__dirname, 'renderer/src/components'),
      '@services': path.join(__dirname, 'renderer/src/services'),
      '@actions': path.join(__dirname, 'renderer/src/actions'),
      '@types': path.join(__dirname, 'renderer/src/types'),
      '@design': path.join(__dirname, 'renderer/src/design'),
    },
  },
});
```

---

## Security Configuration

### Content Security Policy
```typescript
// main/main.ts - Add to window creation
const mainWindow = new BrowserWindow({
  // ... other config
  webPreferences: {
    // ... other preferences
    
    // CSP
    additionalArguments: [
      `--content-security-policy=default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://api.anthropic.com;`
    ],
  },
});
```

### Permissions
```typescript
// main/main.ts
import { session } from 'electron';

app.whenReady().then(() => {
  // Set permissions
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      // Only allow specific permissions
      const allowedPermissions = ['clipboard-read', 'clipboard-write'];
      
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );
});
```

---

## Platform-Specific Configuration

### macOS
```typescript
// main/main.ts - macOS specific
if (process.platform === 'darwin') {
  // Menu bar icon
  app.dock.setIcon(path.join(__dirname, '../build/icon.png'));
  
  // Custom menu
  const { Menu } = require('electron');
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    // ... other menu items
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

### Windows
```typescript
// main/main.ts - Windows specific
if (process.platform === 'win32') {
  // Set app user model id for notifications
  app.setAppUserModelId('com.compendium.triage');
  
  // Custom window controls
  const mainWindow = new BrowserWindow({
    frame: false, // Frameless on Windows
    // ... other config
  });
}
```

### Linux
```typescript
// main/main.ts - Linux specific
if (process.platform === 'linux') {
  // Set icon
  mainWindow.setIcon(path.join(__dirname, '../build/icon.png'));
}
```

---

## Auto-Update Configuration

### Update Handler
```typescript
// main/updater.ts
import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // Check for updates on startup
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update:available');
  });
  
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update:downloaded');
  });
  
  autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
  });
}
```

---

## Development Tools

### DevTools Extensions
```typescript
// main/main.ts - Development only
if (process.env.NODE_ENV === 'development') {
  const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
  
  app.whenReady().then(() => {
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name: string) => console.log(`Added Extension: ${name}`))
      .catch((err: any) => console.log('An error occurred: ', err));
  });
}
```

### Hot Reload
```typescript
// main/main.ts - Development hot reload
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}
```

---

## Environment Variables

### .env Configuration
```bash
# .env.development
NODE_ENV=development
VITE_DEV_SERVER_URL=http://localhost:5173

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Claude API
VITE_CLAUDE_API_KEY=your_claude_api_key
```

```bash
# .env.production
NODE_ENV=production

# Same Firebase/Claude config (use production keys)
```

### Loading Environment Variables
```typescript
// main/main.ts
import dotenv from 'dotenv';
import path from 'path';

const envPath = process.env.NODE_ENV === 'development' 
  ? path.join(__dirname, '../.env.development')
  : path.join(__dirname, '../.env.production');

dotenv.config({ path: envPath });
```

---

## Error Handling

### Crash Reporter
```typescript
// main/main.ts
import { crashReporter } from 'electron';

crashReporter.start({
  productName: 'Compendium Triage',
  companyName: 'Your Company',
  submitURL: 'https://your-crash-report-server.com/submit',
  uploadToServer: true,
});
```

### Uncaught Exceptions
```typescript
// main/main.ts
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to file or remote service
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

---

## Testing Configuration

### E2E Testing with Spectron
```typescript
// test/e2e.spec.ts
import { Application } from 'spectron';
import path from 'path';

describe('Application launch', () => {
  let app: Application;
  
  beforeEach(async () => {
    app = new Application({
      path: path.join(__dirname, '../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../dist/main/main.js')],
    });
    
    await app.start();
  });
  
  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });
  
  it('shows main window', async () => {
    const count = await app.client.getWindowCount();
    expect(count).toBe(1);
  });
});
```

---

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "electron": "^27.0.0"
  },
  "devDependencies": {
    "electron-builder": "^24.6.4",
    "electron-devtools-installer": "^3.2.0",
    "electron-reload": "^2.0.0-alpha.1",
    "electron-updater": "^6.1.4",
    "concurrently": "^8.2.1",
    "typescript": "^5.2.2"
  }
}
```

---

*This configuration ensures a secure, performant, and cross-platform Electron application ready for development and distribution.*

