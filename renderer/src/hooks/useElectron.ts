import { useEffect, useState } from 'react';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Check if we're running in Electron
    const electronAvailable = typeof window !== 'undefined' && window.electronAPI;
    console.log('Electron available:', electronAvailable);
    console.log('window.electronAPI:', window.electronAPI);
    console.log('window object:', typeof window !== 'undefined' ? Object.keys(window) : 'window undefined');
    console.log('window.electronAPI type:', typeof window.electronAPI);
    setIsElectron(electronAvailable);

    if (electronAvailable) {
      // Get app info
      window.electronAPI.app.getVersion().then(setAppVersion);
      setPlatform(window.electronAPI.app.getPlatform());
    }
  }, []);

  const minimizeWindow = async () => {
    if (isElectron) {
      await window.electronAPI.window.minimize();
    }
  };

  // Maximize functionality removed - fullscreen disabled

  const closeWindow = async () => {
    if (isElectron) {
      await window.electronAPI.window.close();
    }
  };

  const resizeToMaxWidth = async () => {
    if (isElectron) {
      await window.electronAPI.window.resizeToMaxWidth();
    }
  };

  const resizeToDefault = async () => {
    if (isElectron) {
      await window.electronAPI.window.resizeToDefault();
    }
  };

  return {
    isElectron,
    appVersion,
    platform,
    minimizeWindow,
    closeWindow,
    resizeToMaxWidth,
    resizeToDefault,
  };
}
