import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { Regulation } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { UniversalSpreadsheet } from '../../components/UniversalSpreadsheet';

// Global cache that persists across component unmounts
let cachedRegulations: Regulation[] = [];
let isCachedDataLoaded = false;

export const RegulationsPage: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>(cachedRegulations);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await firestoreOperations.queryRegulations();
      
      if (result.success && result.data) {
        // Update both local state and global cache
        setRegulations(result.data);
        cachedRegulations = result.data;
        isCachedDataLoaded = true;
      } else {
        setError(result.error || 'Failed to fetch regulations');
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
      fetchRegulations();
    }
  }, []);

  return (
    <UniversalSpreadsheet
      data={regulations}
      dataType="regulations"
      loading={loading}
      error={error}
      onRefresh={fetchRegulations}
      onClose={handleClose}
      onResizeToMaxWidth={resizeToMaxWidth}
      onResizeToDefault={resizeToDefault}
      isElectron={isElectron}
    />
  );
};
