import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { RecordData } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';

// Global cache that persists across component unmounts
let cachedRecords: RecordData[] = [];
let isCachedDataLoaded = false;
let lastLoadTimestamp: number | null = null;

export const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RecordData[]>(cachedRecords);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  
  console.log('🔧 RecordsPage - isElectron:', isElectron);

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const handleRefresh = () => {
    // Reset timestamp to force full reload
    lastLoadTimestamp = null;
    fetchRecords();
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (lastLoadTimestamp === null) {
        // First load - get all records
        console.log('First load: fetching all records');
        result = await firestoreOperations.query<RecordData>('records');
      } else {
        // Subsequent loads - get all records to check for deletions
        console.log('Subsequent load: fetching all records to check for changes since', new Date(lastLoadTimestamp));
        result = await firestoreOperations.query<RecordData>('records');
      }
      
      if (result.success && result.data) {
        if (lastLoadTimestamp === null) {
          // First load - replace all data
          setRecords(result.data);
          cachedRecords = result.data;
        } else {
          // Subsequent load - compare with cached data to detect changes
          const currentRecords = result.data;
          const currentIds = new Set(currentRecords.map(record => record.id));
          const cachedIds = new Set(cachedRecords.map(record => record.id));
          
          // Find new records (in current but not in cached)
          const newRecords = currentRecords.filter(record => !cachedIds.has(record.id));
          
          // Find deleted records (in cached but not in current)
          const deletedRecords = cachedRecords.filter(record => !currentIds.has(record.id));
          
          if (newRecords.length > 0) {
            console.log(`Found ${newRecords.length} new records`);
          }
          
          if (deletedRecords.length > 0) {
            console.log(`Found ${deletedRecords.length} deleted records:`, deletedRecords.map(r => r.id));
          }
          
          // Update the records list with current data
          if (newRecords.length > 0 || deletedRecords.length > 0) {
            setRecords(currentRecords);
            cachedRecords = currentRecords;
          } else {
            console.log('No changes found');
          }
        }
        
        // Update timestamp
        lastLoadTimestamp = Date.now();
        isCachedDataLoaded = true;
      } else {
        setError(result.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch data - either all (first time) or just new (subsequent times)
    fetchRecords();
  }, []);

  // Get the 4 most recent records
  const displayRecords = records.slice(-4).reverse();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 250px',
        gridTemplateRows: '250px 250px',
        gap: '10px'
      }}>
        {[0, 1, 2, 3].map((index) => {
          const record = displayRecords[index];
          return (
            <div
              key={record?.id || `empty-${index}`}
              style={{
                border: '1px solid #333333',
                padding: '10px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-start',
                wordWrap: 'break-word',
                fontSize: '10px',
                fontWeight: 'normal',
                textTransform: 'uppercase',
                lineHeight: '1.4',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                boxSizing: 'border-box'
              }}
            >
              {record ? record.text : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

