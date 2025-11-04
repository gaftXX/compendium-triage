import React, { useState, useEffect } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { firestoreOperations, subscribeToCollectionUpdates } from '../../../services/firebase/firestoreOperations';
import { Project } from '../../../types/firestore';

interface ProjectsListWindowProps {
  officeId: string | null;
  onClose: () => void;
}

export const ProjectsListWindow: React.FC<ProjectsListWindowProps> = ({ officeId, onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollectionUpdates<Project>(
      'projects',
      (snapshot) => {
        try {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          // Filter by officeId
          const filteredProjects = projectsData.filter(p => p.officeId === officeId);
          
          // Sort by projectName
          filteredProjects.sort((a, b) => 
            (a.projectName || '').localeCompare(b.projectName || '')
          );

          setProjects(filteredProjects);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      {
        filters: [{ field: 'officeId', operator: '==', value: officeId }],
        orderBy: [{ field: 'projectName', direction: 'asc' }],
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
        PROJECTS ({projects.length})
      </div>

      {projects.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          NO PROJECTS FOUND
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.map(project => (
            <div key={project.id} style={{ marginBottom: '8px' }}>
              <div style={{ marginBottom: '5px' }}>
                {project.projectName}
              </div>
              <div style={{ fontSize: '10px' }}>
                STATUS: {project.status}
              </div>
              {project.details?.projectType && (
                <div>TYPE: {project.details.projectType}</div>
              )}
              {project.details?.size && (
                <div>SIZE: {project.details.size.toLocaleString()} SQ M</div>
              )}
              {project.financial?.budget && (
                <div>BUDGET: ${project.financial.budget.toLocaleString()} {project.financial.currency || ''}</div>
              )}
              {project.location && (
                <div>LOCATION: {project.location.city}, {project.location.country}</div>
              )}
              {project.details?.description && (
                <div style={{ marginTop: '5px' }}>
                  {project.details.description}
                </div>
              )}
              <div style={{ marginTop: '5px', fontSize: '10px' }}>
                ID: {project.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

