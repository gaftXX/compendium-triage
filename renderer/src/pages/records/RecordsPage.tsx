import React, { useState, useEffect } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { RecordData } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { Timestamp } from 'firebase/firestore';

// Global cache that persists across component unmounts
let cachedRecords: RecordData[] = [];
let isCachedDataLoaded = false;
let lastLoadTimestamp: number | null = null;

type ViewMode = 'records' | 'calendar';

export const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RecordData[]>(cachedRecords);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  
  console.log('RecordsPage - isElectron:', isElectron);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedDate) {
        setSelectedDate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDate]);

  // Get records for selected date or 4 most recent records
  const getRecordsForDate = (date: Date): RecordData[] => {
    if (!date) return records.slice(-4).reverse();
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return records.filter(record => {
      if (!record.createdAt) return false;
      
      let recordDate: Date;
      if (record.createdAt instanceof Timestamp) {
        recordDate = record.createdAt.toDate();
      } else if (record.createdAt.seconds) {
        recordDate = new Date(record.createdAt.seconds * 1000);
      } else {
        return false;
      }
      
      return recordDate >= startOfDay && recordDate <= endOfDay;
    }).slice(-4).reverse();
  };

  const displayRecords = selectedDate ? getRecordsForDate(selectedDate) : records.slice(-4).reverse();

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Get calendar data for current month
  const getCalendarData = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay() returns 0 (Sunday) to 6 (Saturday)
    // Convert to Monday (0) to Sunday (6)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, etc.
    const firstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days: Array<{ day: number; date: Date }> = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: new Date(year, month, 0) });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, date: new Date(year, month, day) });
    }
    
    return { days, month, year, daysInMonth };
  };

  const calendarData = getCalendarData();

  const blockStyle = {
    border: '1px solid #333333',
    padding: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    wordWrap: 'break-word' as const,
    fontSize: '10px',
    fontWeight: 'normal' as const,
    textTransform: 'uppercase' as const,
    lineHeight: '1.4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    boxSizing: 'border-box' as const,
    width: '250px',
    height: '250px'
  };

  const calendarBlockStyle = {
    border: '1px solid #333333',
    padding: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    wordWrap: 'break-word' as const,
    fontSize: '10px',
    fontWeight: 'normal' as const,
    textTransform: 'uppercase' as const,
    lineHeight: '1.4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    boxSizing: 'border-box' as const,
    width: '100px',
    height: '100px'
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {viewMode === 'calendar' && (
        <>
          {!selectedDate && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 100px)',
              gap: '8px',
              maxWidth: 'calc(7 * 100px + 6 * 8px)'
            }}>
              {calendarData.days.map((dayData, index) => {
                const today = new Date();
                const isToday = dayData.day > 0 && 
                  dayData.date.getDate() === today.getDate() &&
                  dayData.date.getMonth() === today.getMonth() &&
                  dayData.date.getFullYear() === today.getFullYear();
                
                return (
                  <div
                    key={`day-${index}`}
                    onClick={() => dayData.day > 0 && handleDayClick(dayData.date)}
                    style={{
                      ...calendarBlockStyle,
                      opacity: dayData.day === 0 ? 0.3 : 1,
                      backgroundColor: 'transparent',
                      borderColor: isToday ? '#888888' : '#333333',
                      cursor: dayData.day > 0 ? 'pointer' : 'default'
                    }}
                  >
                    {dayData.day > 0 ? dayData.day : ''}
                  </div>
                );
              })}
            </div>
          )}
          {selectedDate && (
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
                      style={blockStyle}
                    >
                      {record ? record.text : ''}
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

