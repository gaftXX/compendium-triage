import React, { useState, useEffect, useCallback } from 'react';
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

interface RecordsPageProps {
  params?: any;
}

export const RecordsPage: React.FC<RecordsPageProps> = ({ params }) => {
  const [records, setRecords] = useState<RecordData[]>(cachedRecords);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [officeId, setOfficeId] = useState<string | null>(params?.officeId || null);
  const [isEnteringNote, setIsEnteringNote] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  
  console.log('RecordsPage - isElectron:', isElectron);
  console.log('RecordsPage - params:', params);
  console.log('RecordsPage - officeId:', officeId);

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const handleRecordClick = useCallback((recordId: string, recordText: string) => {
    setEditingRecordId(recordId);
    setEditText(recordText);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRecordId(null);
    setEditText('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingRecordId) return;

    try {
      // If text is empty, delete the record
      if (!editText.trim()) {
        const deleteResult = await firestoreOperations.delete('records', editingRecordId);
        
        if (deleteResult.success) {
          const updatedRecords = records.filter(record => record.id !== editingRecordId);
          setRecords(updatedRecords);
          cachedRecords = updatedRecords;
          
          setEditingRecordId(null);
          setEditText('');
        } else {
          console.error('Failed to delete record:', deleteResult.error);
        }
        return;
      }

      // Otherwise update the record
      const result = await firestoreOperations.update<RecordData>('records', editingRecordId, {
        text: editText,
        updatedAt: Timestamp.now()
      });

      if (result.success) {
        // Update local cache
        const updatedRecords = records.map(record => 
          record.id === editingRecordId 
            ? { ...record, text: editText, updatedAt: Timestamp.now() } 
            : record
        );
        setRecords(updatedRecords);
        cachedRecords = updatedRecords;
        
        setEditingRecordId(null);
        setEditText('');
      } else {
        console.error('Failed to update record:', result.error);
      }
    } catch (error) {
      console.error('Error saving record:', error);
    }
  }, [editingRecordId, editText, records]);

  const handleSaveOfficeNote = useCallback(async () => {
    if (!noteText.trim() || !officeId) return;

    try {
      const recordData: Omit<RecordData, 'id' | 'createdAt' | 'updatedAt'> = {
        text: noteText,
        officeId: officeId
      };

      const result = await firestoreOperations.create<RecordData>('records', recordData);

      if (result.success && result.data) {
        // Add new record to local cache
        const updatedRecords = [...records, result.data];
        setRecords(updatedRecords);
        cachedRecords = updatedRecords;
        
        setIsEnteringNote(false);
        setNoteText('');
        setOfficeId(null);
        
        // Navigate to today's date in the 4-box view
        setSelectedDate(new Date());
      } else {
        console.error('Failed to create office note:', result.error);
      }
    } catch (error) {
      console.error('Error creating office note:', error);
    }
  }, [noteText, officeId, records]);

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
        // First load - get all records sorted by createdAt ascending (oldest first)
        console.log('First load: fetching all records');
        result = await firestoreOperations.query<RecordData>('records', {
          orderBy: [{ field: 'createdAt', direction: 'asc' as const }]
        });
      } else {
        // Subsequent loads - get all records to check for deletions
        console.log('Subsequent load: fetching all records to check for changes since', new Date(lastLoadTimestamp));
        result = await firestoreOperations.query<RecordData>('records', {
          orderBy: [{ field: 'createdAt', direction: 'asc' as const }]
        });
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
    // Update officeId when params change
    if (params?.officeId !== undefined) {
      setOfficeId(params.officeId);
    }
  }, [params]);

  useEffect(() => {
    // Initialize office note entry mode when officeId is provided
    if (officeId) {
      setIsEnteringNote(true);
    }
  }, [officeId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingRecordId) {
          event.preventDefault();
          event.stopPropagation();
          handleCancelEdit();
        } else if (selectedDate) {
          event.preventDefault();
          event.stopPropagation();
          setSelectedDate(null);
        }
        // If neither editing nor date selected, let global handler navigate to Cross
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [selectedDate, editingRecordId, handleCancelEdit]);

  // Get all records for selected date (functions defined first)
  const getAllRecordsForDate = (date: Date): RecordData[] => {
    if (!date) return records.slice(0, 4);
    
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
    });
  };

  // Get count of records for a specific date
  const getRecordCountForDate = (date: Date): number => {
    if (!date) return 0;
    
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
    }).length;
  };

  const allRecordsForDate = selectedDate ? getAllRecordsForDate(selectedDate) : records.slice(0, 4);
  const startIndex = currentPage * 4;
  const displayRecords = allRecordsForDate.slice(startIndex, startIndex + 4);
  const hasMoreRecords = allRecordsForDate.length > (currentPage + 1) * 4;

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setEditingRecordId(null);
      setCurrentPage(0); // Reset to first page when selecting a new date
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
    border: '1px solid rgba(200, 237, 252, 0.25)',
    padding: '4px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
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
    border: '1px solid rgba(200, 237, 252, 0.25)',
    padding: '4px',
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
    height: '100px',
    position: 'relative' as const
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
      color: '#C8EDFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {isEnteringNote && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div
            style={{
              ...blockStyle,
              borderColor: 'rgba(200, 237, 252, 0.5)',
              cursor: 'default',
              position: 'relative' as const
            }}
          >
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#C8EDFC',
                fontSize: '10px',
                fontWeight: 'normal' as const,
                textTransform: 'uppercase' as const,
                lineHeight: '1.4',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                resize: 'none' as const
              }}
              autoFocus
              placeholder="Enter note for office..."
            />
            <div
              onClick={handleSaveOfficeNote}
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '4px',
                fontSize: '8px',
                color: '#C8EDFC',
                opacity: 0.7,
                cursor: 'pointer'
              }}
            >
              ENTER
            </div>
          </div>
        </div>
      )}
      {!isEnteringNote && viewMode === 'calendar' && (
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
                
                const recordCount = dayData.day > 0 ? getRecordCountForDate(dayData.date) : 0;
                
                return (
                  <div
                    key={`day-${index}`}
                    onClick={() => dayData.day > 0 && handleDayClick(dayData.date)}
                    style={{
                      ...calendarBlockStyle,
                      opacity: dayData.day === 0 ? 0.3 : 1,
                      backgroundColor: 'transparent',
                      borderColor: isToday ? 'rgba(200, 237, 252, 0.5)' : 'rgba(200, 237, 252, 0.25)',
                      cursor: dayData.day > 0 ? 'pointer' : 'default'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px'
                    }}>
                      {dayData.day > 0 ? dayData.day : ''}
                    </div>
                    {recordCount > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold' as const,
                        color: '#C8EDFC'
                      }}>
                        {recordCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {selectedDate && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '250px 250px',
                gridTemplateRows: '250px 250px',
                gap: '10px'
              }}>
                  {[0, 1, 2, 3].map((index) => {
                    const record = displayRecords[index];
                    const isEditing = record && editingRecordId === record.id;
                    
                    return (
                      <div
                        key={record?.id || `empty-${index}`}
                        onClick={() => record && handleRecordClick(record.id, record.text)}
                        style={{
                          ...blockStyle,
                          borderColor: isEditing ? 'rgba(200, 237, 252, 0.5)' : 'rgba(200, 237, 252, 0.25)',
                          cursor: record ? 'pointer' : 'default',
                          position: 'relative' as const
                        }}
                      >
                        {record ? (
                          isEditing ? (
                            <>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: '#C8EDFC',
                                  fontSize: '10px',
                                  fontWeight: 'normal' as const,
                                  textTransform: 'uppercase' as const,
                                  lineHeight: '1.4',
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                                  resize: 'none' as const
                                }}
                                autoFocus
                              />
                              <div
                                onClick={handleSaveEdit}
                                style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  fontSize: '8px',
                                  color: '#C8EDFC',
                                  opacity: 0.7,
                                  cursor: 'pointer'
                                }}
                              >
                                ENTER
                              </div>
                            </>
                          ) : (
                            <>
                              {record.text}
                              {record.officeId && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  fontSize: '8px',
                                  color: '#C8EDFC',
                                  opacity: 0.5
                                }}>
                                  {record.officeId}
                                </div>
                              )}
                            </>
                          )
                        ) : ''}
                      </div>
                    );
                  })}
              </div>
              {allRecordsForDate.length > 4 && (
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  marginTop: '20px'
                }}>
                  {currentPage > 0 && (
                    <div
                      onClick={() => setCurrentPage(currentPage - 1)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 'normal' as const,
                        textTransform: 'uppercase' as const,
                        color: '#C8EDFC',
                        cursor: 'pointer',
                        opacity: 0.7
                      }}
                    >
                      BACK
                    </div>
                  )}
                  {hasMoreRecords && (
                    <div
                      onClick={() => setCurrentPage(currentPage + 1)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 'normal' as const,
                        textTransform: 'uppercase' as const,
                        color: '#C8EDFC',
                        cursor: 'pointer',
                        opacity: 0.7
                      }}
                    >
                      NEXT
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

