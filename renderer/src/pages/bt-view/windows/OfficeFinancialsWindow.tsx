import React, { useState, useEffect } from 'react';
import { Timestamp, Unsubscribe } from 'firebase/firestore';
import { subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { Financial } from '../../../types/firestore';

interface OfficeFinancialsWindowProps {
  officeId: string | null;
  onClose: () => void;
}

export const OfficeFinancialsWindow: React.FC<OfficeFinancialsWindowProps> = ({ officeId, onClose }) => {
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) {
      setFinancials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<Financial>(
      'financials',
      (snapshot) => {
        try {
          const financialsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Financial[];

          // Filter by officeId
          const filteredFinancials = financialsData.filter(f => f.officeId === officeId);
          
          // Sort by date (descending)
          filteredFinancials.sort((a, b) => {
            const dateA = a.date?.toMillis?.() || 0;
            const dateB = b.date?.toMillis?.() || 0;
            return dateB - dateA;
          });

          setFinancials(filteredFinancials);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        orderBy: [{ field: 'date', direction: 'desc' }],
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

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return 'N/A';
    }
    return date.toLocaleDateString();
  };

  const formatAmount = (amount: number, currency: string): string => {
    return `${currency} ${amount.toLocaleString()}`;
  };

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

  if (financials.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO FINANCIAL DATA FOUND
      </div>
    );
  }

  const groupedByType = financials.reduce((acc, financial) => {
    const type = financial.recordType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(financial);
    return acc;
  }, {} as Record<string, Financial[]>);

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
        FINANCIALS ({financials.length})
      </div>

      {Object.entries(groupedByType).map(([type, records]) => (
        <div key={type} style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px', fontSize: '11px', opacity: 0.9 }}>
            {type} ({records.length})
          </div>
          {records.map((financial, idx) => (
            <div key={idx} style={{ 
              marginBottom: '6px', 
              marginLeft: '10px',
              padding: '5px',
              border: '1px solid rgba(200, 237, 252, 0.15)'
            }}>
              <div style={{ marginBottom: '3px' }}>
                {formatAmount(financial.amount, financial.currency)} - {financial.category}
              </div>
              <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
                DATE: {formatDate(financial.date)}
              </div>
              {financial.period && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
                  PERIOD: {financial.period.type.toUpperCase()} {financial.period.year}
                  {financial.period.quarter && ` Q${financial.period.quarter}`}
                </div>
              )}
              {financial.source && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
                  FROM: {financial.source}
                </div>
              )}
              {financial.destination && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
                  TO: {financial.destination}
                </div>
              )}
              {financial.projectId && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
                  PROJECT: {financial.projectId}
                </div>
              )}
              {financial.details && (
                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '3px', whiteSpace: 'pre-wrap' }}>
                  {financial.details}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
