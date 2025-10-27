import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { Office } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { UniversalSpreadsheet } from '../../components/UniversalSpreadsheet';

// Global cache that persists across component unmounts
let cachedOffices: Office[] = [];
let isCachedDataLoaded = false;

export const OfficesPage: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>(cachedOffices);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  
  console.log('🔧 OfficesPage - isElectron:', isElectron);
  console.log('🔧 OfficesPage - window.electronAPI:', typeof window !== 'undefined' ? window.electronAPI : 'window undefined');

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const fetchOffices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await firestoreOperations.queryOffices();
      
      if (result.success && result.data) {
        // Update both local state and global cache
        setOffices(result.data);
        cachedOffices = result.data;
        isCachedDataLoaded = true;
      } else {
        setError(result.error || 'Failed to fetch offices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't loaded data before (check global cache)
    if (!isCachedDataLoaded) {
      fetchOffices();
    }
  }, []);

  return (
    <UniversalSpreadsheet
      data={offices}
      dataType="offices"
      loading={loading}
      error={error}
      onRefresh={fetchOffices}
      onClose={handleClose}
      onResizeToMaxWidth={resizeToMaxWidth}
      onResizeToDefault={resizeToDefault}
      isElectron={isElectron}
    />
  );
};
