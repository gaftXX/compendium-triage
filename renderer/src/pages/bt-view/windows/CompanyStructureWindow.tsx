import React, { useState, useEffect } from 'react';
import { subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { CompanyStructure } from '../../../types/firestore';

interface CompanyStructureWindowProps {
  officeId: string | null;
  onClose: () => void;
}

export const CompanyStructureWindow: React.FC<CompanyStructureWindowProps> = ({ officeId, onClose }) => {
  const [companyStructure, setCompanyStructure] = useState<CompanyStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) {
      setCompanyStructure(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<CompanyStructure>(
      'companyStructure',
      (snapshot) => {
        try {
          const companyStructureData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CompanyStructure[];

          // Filter by officeId and get first match
          const filtered = companyStructureData.find(cs => cs.officeId === officeId);
          setCompanyStructure(filtered || null);
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

  if (!companyStructure) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        NO COMPANY STRUCTURE DATA FOUND
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
      {companyStructure.structure && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}>ORGANIZATION TYPE: {companyStructure.structure.organizationType}</div>
          {companyStructure.structure.hierarchy && (
            <div style={{ marginBottom: '4px' }}>HIERARCHY LEVELS: {companyStructure.structure.hierarchy.levels}</div>
          )}
          {companyStructure.structure.hierarchy?.reportingStructure && (
            <div style={{ marginBottom: '4px' }}>REPORTING: {companyStructure.structure.hierarchy.reportingStructure}</div>
          )}
        </div>
      )}

      {companyStructure.structure?.departments && companyStructure.structure.departments.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}>DEPARTMENTS ({companyStructure.structure.departments.length})</div>
          {companyStructure.structure.departments.map((dept, idx) => (
            <div key={idx} style={{ marginBottom: '6px', marginLeft: '10px' }}>
              <div style={{ marginBottom: '2px' }}>{dept.name} ({dept.headCount})</div>
              {dept.responsibilities && dept.responsibilities.length > 0 && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginLeft: '10px' }}>
                  {dept.responsibilities.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {companyStructure.leadership && companyStructure.leadership.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}>LEADERSHIP ({companyStructure.leadership.length})</div>
          {companyStructure.leadership.map((leader, idx) => (
            <div key={idx} style={{ marginBottom: '4px', marginLeft: '10px' }}>
              {leader.name} - {leader.role}
              {leader.tenure && <span> ({leader.tenure} YEARS)</span>}
            </div>
          ))}
        </div>
      )}

      {companyStructure.divisions && companyStructure.divisions.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}>DIVISIONS ({companyStructure.divisions.length})</div>
          {companyStructure.divisions.map((division, idx) => (
            <div key={idx} style={{ marginBottom: '6px', marginLeft: '10px' }}>
              <div style={{ marginBottom: '2px' }}>{division.name} ({division.headCount})</div>
              {division.focus && (
                <div style={{ fontSize: '9px', opacity: 0.7, marginLeft: '10px' }}>
                  {division.focus}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {companyStructure.governance && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}>GOVERNANCE</div>
          {companyStructure.governance.ownership && (
            <div style={{ marginBottom: '4px', marginLeft: '10px' }}>
              OWNERSHIP: {companyStructure.governance.ownership}
            </div>
          )}
          {companyStructure.governance.boardMembers && companyStructure.governance.boardMembers.length > 0 && (
            <div style={{ marginTop: '6px' }}>
              <div style={{ marginBottom: '4px', marginLeft: '10px' }}>BOARD MEMBERS ({companyStructure.governance.boardMembers.length})</div>
              {companyStructure.governance.boardMembers.map((member, idx) => (
                <div key={idx} style={{ marginBottom: '2px', marginLeft: '20px', fontSize: '9px', opacity: 0.7 }}>
                  {member.name} - {member.role}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
