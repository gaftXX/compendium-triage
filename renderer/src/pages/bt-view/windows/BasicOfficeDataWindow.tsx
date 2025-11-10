import React, { useState, useEffect } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { subscribeToDocumentUpdates, subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { Office, Project, Relationship, Workforce } from '../../../types/firestore';

interface BasicOfficeDataWindowProps {
  officeId: string | null;
  onClose: () => void;
}

export const BasicOfficeDataWindow: React.FC<BasicOfficeDataWindowProps> = ({ officeId }) => {
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectCounts, setProjectCounts] = useState({ total: 0, active: 0 });
  const [employeeCount, setEmployeeCount] = useState<number>(0);

  useEffect(() => {
    if (!officeId) {
      setOffice(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToDocumentUpdates(
      'offices',
      officeId,
      (doc: DocumentSnapshot) => {
        try {
          if (doc.exists()) {
            setOffice({
              id: doc.id,
              ...doc.data()
            } as Office);
            setError(null);
          } else {
            setOffice(null);
            setError('Office not found');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
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

  // Calculate project counts from both projects collection and relationships
  useEffect(() => {
    if (!officeId) {
      setProjectCounts({ total: 0, active: 0 });
      return;
    }

    let projectsUnsubscribe: (() => void) | null = null;
    let relationshipsUnsubscribe: (() => void) | null = null;
    
    let currentProjects: Project[] = [];
    let currentRelationships: Relationship[] = [];

    const updateCounts = () => {
      // Get projects directly linked via officeId
      const directProjects = currentProjects.filter(p => p.officeId === officeId);
      
      // Find all project IDs linked via relationships
      const relatedProjectIds = new Set<string>();
      
      // Office as source -> project as target
      currentRelationships.forEach(rel => {
        if (
          rel.sourceEntity.type === 'office' &&
          rel.sourceEntity.id === officeId &&
          rel.targetEntity.type === 'project'
        ) {
          relatedProjectIds.add(rel.targetEntity.id);
        }
        // Office as target -> project as source (less common but possible)
        if (
          rel.targetEntity.type === 'office' &&
          rel.targetEntity.id === officeId &&
          rel.sourceEntity.type === 'project'
        ) {
          relatedProjectIds.add(rel.sourceEntity.id);
        }
      });

      // Combine direct projects and relationship-linked projects
      const allProjectIds = new Set<string>();
      directProjects.forEach(p => allProjectIds.add(p.id));
      relatedProjectIds.forEach(id => allProjectIds.add(id));

      // Count active projects from the direct projects list
      const activeCount = directProjects.filter(
        p => p.status === 'concept' || 
             p.status === 'planning' || 
             p.status === 'construction'
      ).length;

      setProjectCounts({
        total: allProjectIds.size,
        active: activeCount
      });
    };

    // Subscribe to projects
    projectsUnsubscribe = subscribeToCollectionUpdates(
      'projects',
      (snapshot) => {
        currentProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        updateCounts();
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        includeMetadataChanges: false,
        onError: (err) => {
          console.error('Error subscribing to projects:', err);
        }
      }
    );

    // Subscribe to relationships (both directions)
    relationshipsUnsubscribe = subscribeToCollectionUpdates(
      'relationships',
      (snapshot) => {
        currentRelationships = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Relationship[];
        updateCounts();
      },
      {
        includeMetadataChanges: false,
        onError: (err) => {
          console.error('Error subscribing to relationships:', err);
        }
      }
    );

    return () => {
      if (projectsUnsubscribe) projectsUnsubscribe();
      if (relationshipsUnsubscribe) relationshipsUnsubscribe();
    };
  }, [officeId]);

  // Calculate employee count from workforce collection
  useEffect(() => {
    if (!officeId) {
      setEmployeeCount(0);
      return;
    }

    const unsubscribe = subscribeToCollectionUpdates(
      'workforce',
      (snapshot) => {
        try {
          const workforceData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Workforce[];

          // Filter by officeId and get first match
          const workforce = workforceData.find(w => w.officeId === officeId);
          
          if (workforce && workforce.employees) {
            setEmployeeCount(workforce.employees.length);
          } else {
            setEmployeeCount(0);
          }
        } catch (err) {
          console.error('Error calculating employee count:', err);
          setEmployeeCount(0);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        includeMetadataChanges: false,
        onError: (err) => {
          console.error('Error subscribing to workforce:', err);
          setEmployeeCount(0);
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

  if (!office) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#C8EDFC', 
        fontSize: '10px',
        fontWeight: 'normal',
        textTransform: 'uppercase'
      }}>
        OFFICE NOT FOUND
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      padding: '10px',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      color: '#C8EDFC',
      justifyContent: 'flex-end'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'flex-end',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        flex: 1,
        paddingBottom: '20px'
      }}>
        {office.founded && <div style={{ marginBottom: '4px' }}>FOUNDED: {office.founded}</div>}
        {office.founder && <div style={{ marginBottom: '4px' }}>FOUNDER: {office.founder}</div>}
        <div style={{ marginBottom: '4px' }}>STATUS: {office.status}</div>
        {office.website && (
          <div 
            style={{ 
              marginBottom: '4px',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.8
            }}
            onClick={async (e) => {
              e.stopPropagation();
              const url = office.website?.startsWith('http') ? office.website : `https://${office.website}`;
              try {
                if ((window as any).electronAPI && (window as any).electronAPI.app && (window as any).electronAPI.app.openExternal) {
                  await (window as any).electronAPI.app.openExternal(url);
                } else {
                  window.open(url, '_blank');
                }
              } catch (error) {
                console.error('Error opening URL:', error);
                window.open(url, '_blank');
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
          >
            WEBSITE: {office.website}
          </div>
        )}
        <div style={{ marginBottom: '4px' }}>HQ: {office.location.headquarters.city}, {office.location.headquarters.country}</div>
        {office.size?.sizeCategory && <div style={{ marginBottom: '4px' }}>SIZE: {office.size.sizeCategory}</div>}
        <div style={{ marginBottom: '4px' }}>EMPLOYEES: {employeeCount.toLocaleString()}</div>
        {office.size?.annualRevenue && <div style={{ marginBottom: '4px' }}>REVENUE: ${office.size.annualRevenue.toLocaleString()}</div>}
        {office.specializations.length > 0 && <div style={{ marginBottom: '4px' }}>SPECIALIZATIONS: {office.specializations.join(', ')}</div>}
        {office.notableWorks.length > 0 && <div style={{ marginBottom: '4px' }}>NOTABLE: {office.notableWorks.join(', ')}</div>}
        <div style={{ marginBottom: '4px' }}>PROJECTS: {projectCounts.total}</div>
        <div style={{ marginBottom: '4px' }}>ACTIVE: {projectCounts.active}</div>
        <div style={{ marginBottom: '4px' }}>CLIENTS: {office.connectionCounts.clients}</div>
        {office.location.otherOffices && office.location.otherOffices.length > 0 && (
          <div style={{ marginBottom: '4px' }}>OTHER OFFICES: {office.location.otherOffices.map(l => l.address).join(', ')}</div>
        )}
      </div>
    </div>
  );
};

