import React from 'react';
import { Project } from '../../types/firestore';
import { useProjects } from '../../hooks/useFirestore';

interface ProjectsListProps {
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
  officeId?: string; // Filter projects by office
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  onProjectSelect,
  onCreateProject,
  officeId
}) => {
  const { projects, loading, error, loadProjects } = useProjects();

  // Load projects when component mounts or officeId changes
  React.useEffect(() => {
    loadProjects(officeId);
  }, [loadProjects, officeId]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#000000',
        color: '#ffffff',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#000000',
        color: '#ffffff',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>Error: {error}</div>
        <button 
          onClick={() => loadProjects(officeId)}
          style={{
            backgroundColor: '#B3E5FC',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000000',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          color: '#B3E5FC', 
          fontSize: '18px', 
          marginBottom: '10px' 
        }}>
          {officeId ? 'Office Projects' : 'All Projects'}
        </div>
        <button 
          onClick={onCreateProject}
          style={{
            backgroundColor: '#B3E5FC',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create Project
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project)}
            style={{
              padding: '15px',
              cursor: 'pointer',
              backgroundColor: '#111111',
              border: '1px solid #333333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '16px', marginBottom: '5px', color: '#ffffff' }}>
                  {project.projectName}
                </div>
                <div style={{ fontSize: '12px', color: '#B3E5FC', marginBottom: '2px' }}>
                  ID: {project.id} | Status: {project.status}
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
                  {project.location?.city || 'Unknown'}, {project.location?.country || 'Unknown'}
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
                  {project.details?.projectType || 'Unknown'} • {project.details?.size?.toLocaleString() || '0'} sqm
                </div>
                <div style={{ fontSize: '12px', color: '#888888' }}>
                  Budget: {project.financial?.currency || 'USD'} {project.financial?.budget?.toLocaleString() || '0'}
                </div>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888888', minWidth: '120px' }}>
                <div><strong>Timeline:</strong></div>
                <div>Start: {formatDate(project.timeline?.startDate)}</div>
                <div>Expected: {formatDate(project.timeline?.expectedCompletion)}</div>
                {project.timeline?.actualCompletion && (
                  <div>Actual: {formatDate(project.timeline.actualCompletion)}</div>
                )}
              </div>
            </div>
            
            {project.details?.description && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333333' }}>
                <div style={{ fontSize: '12px', color: '#888888', fontStyle: 'italic' }}>
                  {project.details.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#888888'
        }}>
          <div>No projects found.</div>
          <button 
            onClick={onCreateProject}
            style={{
              backgroundColor: '#B3E5FC',
              color: '#000000',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Create First Project
          </button>
        </div>
      )}
    </div>
  );
};