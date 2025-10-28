import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { Office } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { UniversalSpreadsheet } from '../../components/UniversalSpreadsheet';

// Global cache that persists across component unmounts
let cachedOffices: Office[] = [];
let isCachedDataLoaded = false;
let lastLoadTimestamp: number | null = null;

export const OfficesPage: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>(cachedOffices);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const [isFullWidth, setIsFullWidth] = useState(true);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  
  console.log('🔧 OfficesPage - isElectron:', isElectron);
  console.log('🔧 OfficesPage - window.electronAPI:', typeof window !== 'undefined' ? window.electronAPI : 'window undefined');

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const handleRefresh = () => {
    // Reset timestamp to force full reload
    lastLoadTimestamp = null;
    fetchOffices();
  };

  const fetchOffices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (lastLoadTimestamp === null) {
        // First load - get all offices
        console.log('First load: fetching all offices');
        result = await firestoreOperations.queryOffices();
      } else {
        // Subsequent loads - only get new offices
        console.log('Subsequent load: fetching only new offices since', new Date(lastLoadTimestamp));
        result = await firestoreOperations.queryOffices({
          filters: [{
            field: 'createdAt',
            operator: '>',
            value: new Date(lastLoadTimestamp)
          }]
        });
      }
      
      if (result.success && result.data) {
        if (lastLoadTimestamp === null) {
          // First load - replace all data
          setOffices(result.data);
          cachedOffices = result.data;
        } else {
          // Subsequent load - merge new data with existing
          const newOffices = result.data;
          const existingIds = new Set(cachedOffices.map(office => office.id));
          const uniqueNewOffices = newOffices.filter(office => !existingIds.has(office.id));
          
          if (uniqueNewOffices.length > 0) {
            console.log(`Found ${uniqueNewOffices.length} new offices`);
            const mergedOffices = [...cachedOffices, ...uniqueNewOffices];
            setOffices(mergedOffices);
            cachedOffices = mergedOffices;
          } else {
            console.log('No new offices found');
          }
        }
        
        // Update timestamp
        lastLoadTimestamp = Date.now();
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
    // Always fetch data - either all (first time) or just new (subsequent times)
    fetchOffices();
  }, []);

  // Set to full width when page opens
  useEffect(() => {
    if (isElectron && isFullWidth) {
      resizeToMaxWidth();
    }
  }, [isElectron, isFullWidth, resizeToMaxWidth]);

  // Keyboard listener for Shift+W to toggle width
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'W' && e.shiftKey) {
        if (isFullWidth) {
          resizeToDefault();
          setIsFullWidth(false);
        } else {
          resizeToMaxWidth();
          setIsFullWidth(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isElectron, isFullWidth, resizeToMaxWidth, resizeToDefault]);

  return (
    <UniversalSpreadsheet
      data={offices}
      dataType="offices"
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
      onClose={handleClose}
      onResizeToMaxWidth={resizeToMaxWidth}
      onResizeToDefault={resizeToDefault}
      isElectron={isElectron}
    />
  );
};
