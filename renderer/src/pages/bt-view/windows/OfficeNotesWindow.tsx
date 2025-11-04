import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { RecordData } from '../../../types/firestore';

interface OfficeNotesWindowProps {
  officeId: string | null;
  width?: number;
  onClose: () => void;
}

export const OfficeNotesWindow: React.FC<OfficeNotesWindowProps> = ({ officeId, width = 1, onClose }) => {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<RecordData>(
      'records',
      (snapshot) => {
        try {
          const recordsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RecordData[];

          // Filter by officeId
          const filteredRecords = recordsData.filter(r => r.officeId === officeId);
          
          // Sort by createdAt (descending)
          filteredRecords.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
          });

          setRecords(filteredRecords);
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

  if (records.length === 0) {
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
      flexDirection: 'column', 
      height: '100%',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      color: '#C8EDFC',
      padding: '10px',
      overflow: 'auto'
    }}>
      <div style={{ marginBottom: '10px' }}>
        NOTES ({records.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {records.map((record) => (
          <div 
            key={record.id} 
            style={{ 
              marginBottom: '8px',
              padding: '5px',
              border: '1px solid rgba(200, 237, 252, 0.25)'
            }}
          >
            <div style={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '4px'
            }}>
              {record.text}
            </div>
            {record.createdAt && (() => {
              let recordDate: Date;
              if (record.createdAt instanceof Timestamp) {
                recordDate = record.createdAt.toDate();
              } else if (record.createdAt.seconds) {
                recordDate = new Date(record.createdAt.seconds * 1000);
              } else {
                return null;
              }
              return (
                <div style={{ fontSize: '9px', opacity: 0.6 }}>
                  {recordDate.toLocaleDateString()}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
};
