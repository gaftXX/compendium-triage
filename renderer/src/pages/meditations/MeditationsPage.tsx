import React, { useState, useEffect, useCallback } from 'react';
import { navigationService } from '../../services/navigation/navigationService';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { MeditationData } from '../../types/firestore';
import { useElectron } from '../../hooks/useElectron';
import { Timestamp } from 'firebase/firestore';
import { ContextProvider } from '../../../../aiOrchestra/gen2/contextProvider';

// Global cache that persists across component unmounts
let cachedMeditations: MeditationData[] = [];
let isCachedDataLoaded = false;
let lastLoadTimestamp: number | null = null;

type ViewMode = 'meditations' | 'calendar';

interface MeditationsPageProps {
  params?: any;
}

export const MeditationsPage: React.FC<MeditationsPageProps> = ({ params }) => {
  const [meditations, setMeditations] = useState<MeditationData[]>(cachedMeditations);
  const [loading, setLoading] = useState(!isCachedDataLoaded);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingMeditationId, setEditingMeditationId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [officeId, setOfficeId] = useState<string | null>(params?.officeId || null);
  const [isEnteringNote, setIsEnteringNote] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { isElectron, resizeToMaxWidth, resizeToDefault } = useElectron();
  const contextProvider = ContextProvider.getInstance();
  
  console.log('MeditationsPage - isElectron:', isElectron);
  console.log('MeditationsPage - params:', params);
  console.log('MeditationsPage - officeId:', officeId);

  // Update context provider when page loads
  useEffect(() => {
    contextProvider.setCurrentPage('meditations-list');
    
    return () => {
      contextProvider.updateContext({
        currentPage: 'unknown'
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  const handleMeditationClick = useCallback((meditationId: string, meditationText: string) => {
    setEditingMeditationId(meditationId);
    setEditText(meditationText);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMeditationId(null);
    setEditText('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMeditationId) return;

    try {
      // If text is empty, delete the meditation
      if (!editText.trim()) {
        const deleteResult = await firestoreOperations.delete('meditations', editingMeditationId);
        
        if (deleteResult.success) {
          const updatedMeditations = meditations.filter(meditation => meditation.id !== editingMeditationId);
          setMeditations(updatedMeditations);
          cachedMeditations = updatedMeditations;
          
          setEditingMeditationId(null);
          setEditText('');
        } else {
          console.error('Failed to delete meditation:', deleteResult.error);
        }
        return;
      }

      // Otherwise update the meditation
      const result = await firestoreOperations.update<MeditationData>('meditations', editingMeditationId, {
        text: editText,
        updatedAt: Timestamp.now()
      });

      if (result.success) {
        // Update local cache
        const updatedMeditations = meditations.map(meditation => 
          meditation.id === editingMeditationId 
            ? { ...meditation, text: editText, updatedAt: Timestamp.now() } 
            : meditation
        );
        setMeditations(updatedMeditations);
        cachedMeditations = updatedMeditations;
        
        setEditingMeditationId(null);
        setEditText('');
      } else {
        console.error('Failed to update meditation:', result.error);
      }
    } catch (error) {
      console.error('Error saving meditation:', error);
    }
  }, [editingMeditationId, editText, meditations]);

  const handleSaveOfficeNote = useCallback(async () => {
    if (!noteText.trim() || !officeId) return;

    try {
      const meditationData: Omit<MeditationData, 'id' | 'createdAt' | 'updatedAt'> = {
        text: noteText,
        officeId: officeId
      };

      const result = await firestoreOperations.create<MeditationData>('meditations', meditationData);

      if (result.success && result.data) {
        // Add new meditation to local cache
        const updatedMeditations = [...meditations, result.data];
        setMeditations(updatedMeditations);
        cachedMeditations = updatedMeditations;
        
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
  }, [noteText, officeId, meditations]);

  const handleRefresh = () => {
    // Reset timestamp to force full reload
    lastLoadTimestamp = null;
    fetchMeditations();
  };

  const fetchMeditations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryOptions = {
        orderBy: [{ field: 'createdAt', direction: 'asc' as const }]
      };

      let result;
      if (lastLoadTimestamp === null) {
        console.log('First load: fetching all meditations');
        result = await firestoreOperations.query<MeditationData>('meditations', queryOptions);
      } else {
        console.log('Subsequent load: fetching all meditations to check for changes since', new Date(lastLoadTimestamp));
        result = await firestoreOperations.query<MeditationData>('meditations', queryOptions);
      }
      
      if (result.success && result.data) {
        if (lastLoadTimestamp === null) {
          // First load - replace all data
          setMeditations(result.data);
          cachedMeditations = result.data;
        } else {
          // Subsequent load - compare with cached data to detect changes
          const currentMeditations = result.data;
          const currentIds = new Set(currentMeditations.map(meditation => meditation.id));
          const cachedIds = new Set(cachedMeditations.map(meditation => meditation.id));
          
          // Find new meditations (in current but not in cached)
          const newMeditations = currentMeditations.filter(meditation => !cachedIds.has(meditation.id));
          
          // Find deleted meditations (in cached but not in current)
          const deletedMeditations = cachedMeditations.filter(meditation => !currentIds.has(meditation.id));
          
          if (newMeditations.length > 0) {
            console.log(`Found ${newMeditations.length} new meditations`);
          }
          
          if (deletedMeditations.length > 0) {
            console.log(`Found ${deletedMeditations.length} deleted meditations:`, deletedMeditations.map(r => r.id));
          }
          
          // Update the meditations list with current data
          if (newMeditations.length > 0 || deletedMeditations.length > 0) {
            setMeditations(currentMeditations);
            cachedMeditations = currentMeditations;
          } else {
            console.log('No changes found');
          }
        }
        
        // Update timestamp
        lastLoadTimestamp = Date.now();
        isCachedDataLoaded = true;
      } else {
        setError(result.error || 'Failed to fetch meditations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch data - either all (first time) or just new (subsequent times)
    fetchMeditations();
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
        if (editingMeditationId) {
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
  }, [selectedDate, editingMeditationId, handleCancelEdit]);

  // Get all meditations for selected date (functions defined first)
  const resolveMeditationDate = (createdAt: any): Date | null => {
    if (!createdAt) return null;

    if (createdAt instanceof Timestamp) {
      return createdAt.toDate();
    }

    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000);
    }

    if (typeof createdAt === 'string') {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  };

  const getAllMeditationsForDate = (date: Date): MeditationData[] => {
    if (!date) return meditations.slice(0, 4);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return meditations.filter(meditation => {
      const meditationDate = resolveMeditationDate(meditation.createdAt);
      if (!meditationDate) return false;
      return meditationDate >= startOfDay && meditationDate <= endOfDay;
    });
  };

  // Get count of meditations for a specific date
  const getMeditationCountForDate = (date: Date): number => {
    if (!date) return 0;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return meditations.filter(meditation => {
      const meditationDate = resolveMeditationDate(meditation.createdAt);
      if (!meditationDate) return false;
      return meditationDate >= startOfDay && meditationDate <= endOfDay;
    }).length;
  };

  const allMeditationsForDate = selectedDate ? getAllMeditationsForDate(selectedDate) : meditations.slice(0, 4);
  const startIndex = currentPage * 4;
  const displayMeditations = allMeditationsForDate.slice(startIndex, startIndex + 4);
  const hasMoreMeditations = allMeditationsForDate.length > (currentPage + 1) * 4;

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setEditingMeditationId(null);
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
                
                const meditationCount = dayData.day > 0 ? getMeditationCountForDate(dayData.date) : 0;
                
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
                    {meditationCount > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold' as const,
                        color: '#C8EDFC'
                      }}>
                        {meditationCount}
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
                    const meditation = displayMeditations[index];
                    const isEditing = meditation && editingMeditationId === meditation.id;
                    
                    return (
                      <div
                        key={meditation?.id || `empty-${index}`}
                        onClick={() => meditation && handleMeditationClick(meditation.id, meditation.text)}
                        style={{
                          ...blockStyle,
                          borderColor: isEditing ? 'rgba(200, 237, 252, 0.5)' : 'rgba(200, 237, 252, 0.25)',
                          cursor: meditation ? 'pointer' : 'default',
                          position: 'relative' as const
                        }}
                      >
                        {meditation ? (
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
                              {meditation.title || meditation.text}
                              {meditation.officeId && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  fontSize: '8px',
                                  color: '#C8EDFC',
                                  opacity: 0.5
                                }}>
                                  {meditation.officeId}
                                </div>
                              )}
                            </>
                          )
                        ) : ''}
                      </div>
                    );
                  })}
              </div>
              {allMeditationsForDate.length > 4 && (
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
                  {hasMoreMeditations && (
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

