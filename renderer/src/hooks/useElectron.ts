import { useEffect, useState } from 'react';

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Check if we're running in Electron
    const electronAvailable = typeof window !== 'undefined' && window.electronAPI;
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

  const maximizeWindow = async () => {
    if (isElectron) {
      await window.electronAPI.window.maximize();
    }
  };

  const closeWindow = async () => {
    if (isElectron) {
      await window.electronAPI.window.close();
    }
  };

  return {
    isElectron,
    appVersion,
    platform,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  };
}
