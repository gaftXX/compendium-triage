import React, { useState, useEffect } from 'react';
import { subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { Workforce } from '../../../types/firestore';

interface EmployeesListWindowProps {
  officeId: string | null;
  onClose: () => void;
}

export const EmployeesListWindow: React.FC<EmployeesListWindowProps> = ({ officeId, onClose }) => {
  const [workforce, setWorkforce] = useState<Workforce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) {
      setWorkforce(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<Workforce>(
      'workforce',
      (snapshot) => {
        try {
          const workforceData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Workforce[];

          // Filter by officeId and get first match
          const filtered = workforceData.find(w => w.officeId === officeId);
          setWorkforce(filtered || null);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
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

  if (!workforce || !workforce.employees || workforce.employees.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO EMPLOYEES FOUND
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
        EMPLOYEES ({workforce.employees.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {workforce.employees.map((employee, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '5px' }}>
              {employee.name}
            </div>
            {employee.role && (
              <div>ROLE: {employee.role}</div>
            )}
            {employee.location && (employee.location.city || employee.location.country) && (
              <div>LOCATION: {[employee.location.city, employee.location.country].filter(Boolean).join(', ')}</div>
            )}
            {employee.expertise && employee.expertise.length > 0 && (
              <div>EXPERTISE: {employee.expertise.join(', ')}</div>
            )}
            {employee.description && (
              <div style={{ marginTop: '5px' }}>
                {employee.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
