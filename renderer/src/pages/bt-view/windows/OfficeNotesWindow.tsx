import React, { useState, useEffect, useCallback } from 'react';
import { Timestamp, deleteField } from 'firebase/firestore';
import { subscribeToCollectionUpdates, firestoreOperations } from '../../../services/firebase/firestoreOperations';
import { MeditationData } from '../../../types/firestore';

interface OfficeNotesWindowProps {
  officeId: string | null;
  width?: number;
  onClose: () => void;
}

export const OfficeNotesWindow: React.FC<OfficeNotesWindowProps> = ({ officeId, width = 1, onClose }) => {
  const [meditations, setMeditations] = useState<MeditationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeditationId, setSelectedMeditationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!officeId) {
      setMeditations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<MeditationData>(
      'meditations',
      (snapshot) => {
        try {
          const meditationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MeditationData[];

          // Filter by officeId
          const filteredMeditations = meditationsData.filter(r => r.officeId === officeId);
          
          // Sort by createdAt (descending)
          filteredMeditations.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
          });

          setMeditations(filteredMeditations);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        includeMetadataChanges: false,
        onError: (err) => {
          setError(err.message);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [officeId]);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedMeditationId || !editText.trim() || isSaving) return;

    setIsSaving(true);

    try {
      const updateData: any = {
        text: editText.trim(),
        updatedAt: Timestamp.now()
      };

      const trimmedTitle = editTitle.trim();
      if (trimmedTitle) {
        updateData.title = trimmedTitle;
      } else {
        updateData.title = deleteField();
      }

      const result = await firestoreOperations.update<MeditationData>('meditations', selectedMeditationId, updateData);

      if (!result.success) {
        alert('Error updating meditation: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving meditation:', error);
      alert('Error saving meditation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }, [selectedMeditationId, editTitle, editText, isSaving]);

  useEffect(() => {
    if (selectedMeditationId) {
      const meditation = meditations.find(r => r.id === selectedMeditationId);
      if (meditation) {
        setEditTitle(meditation.title || '');
        setEditText(meditation.text);
      }
    } else {
      setEditTitle('');
      setEditText('');
    }
  }, [selectedMeditationId, meditations]);


  if (!officeId) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO OFFICE SELECTED
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        LOADING...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        ERROR: {error}
      </div>
    );
  }

  const selectedMeditation = meditations.find(r => r.id === selectedMeditationId);

  if (meditations.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO NOTES FOUND
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100%',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      color: '#C8EDFC',
      overflow: 'hidden'
    }}>
      {/* Meditation List - Always 1 box wide (340px) */}
      <div style={{
        width: '340px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        overflow: 'auto',
        borderRight: '1px solid rgba(200, 237, 252, 0.25)',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '10px' }}>
          NOTES ({meditations.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {meditations.map((meditation) => (
            <div 
              key={meditation.id}
              onClick={() => setSelectedMeditationId(meditation.id)}
              style={{ 
                marginBottom: '0px',
                padding: '5px',
                border: selectedMeditationId === meditation.id 
                  ? '1px solid rgba(200, 237, 252, 0.75)' 
                  : '1px solid rgba(200, 237, 252, 0.25)',
                backgroundColor: selectedMeditationId === meditation.id 
                  ? 'rgba(200, 237, 252, 0.1)' 
                  : 'transparent',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '2px'
              }}>
                {meditation.title || meditation.text.substring(0, 50)}
              </div>
              {meditation.createdAt && (() => {
                let meditationDate: Date;
                if (meditation.createdAt instanceof Timestamp) {
                  meditationDate = meditation.createdAt.toDate();
                } else if (meditation.createdAt.seconds) {
                  meditationDate = new Date(meditation.createdAt.seconds * 1000);
                } else {
                  return null;
                }
                return (
                  <div style={{ fontSize: '9px', opacity: 0.6 }}>
                    {meditationDate.toLocaleDateString()}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {/* Detail View - Takes remaining space (only shown if window is 2+ boxes wide and meditation is selected) */}
      {width > 1 && selectedMeditation && (
        <div style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          overflow: 'auto'
        }}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#C8EDFC',
              border: 'none',
              borderBottom: editTitle ? '1px solid rgba(200, 237, 252, 0.3)' : 'none',
              padding: '0 0 4px 0',
              fontSize: '10px',
              fontWeight: 'bold',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              marginBottom: '10px',
              textTransform: 'uppercase',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
          />
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            style={{
              width: '100%',
              flex: 1,
              minHeight: '200px',
              backgroundColor: 'transparent',
              color: '#C8EDFC',
              border: 'none',
              padding: '0',
              fontSize: '10px',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
              textTransform: 'uppercase',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
          />
          {selectedMeditation.createdAt && (() => {
            let meditationDate: Date;
            if (selectedMeditation.createdAt instanceof Timestamp) {
              meditationDate = selectedMeditation.createdAt.toDate();
            } else if (selectedMeditation.createdAt.seconds) {
              meditationDate = new Date(selectedMeditation.createdAt.seconds * 1000);
            } else {
              return null;
            }
            return (
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '10px' }}>
                {meditationDate.toLocaleDateString()} {meditationDate.toLocaleTimeString()}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
