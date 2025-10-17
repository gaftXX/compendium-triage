import React from 'react';
import { Project } from '../../types/firestore';
import { Button } from '../../../../ui';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'construction': return '#ffc107';
      case 'planning': return '#17a2b8';
      case 'concept': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <Button onClick={loadProjects}>Retry</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px'
      }}>
        <h2>
          {officeId ? 'Office Projects' : 'All Projects'}
        </h2>
        <Button onClick={onCreateProject} variant="primary">
          Create Project
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '15px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9f9f9';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>
                    {project.projectName}
                  </h3>
                  <span
                    style={{
                      backgroundColor: getStatusColor(project.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  ID: {project.id}
                </p>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  {project.location.city}, {project.location.country}
                </p>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  {project.details.projectType} • {project.details.size.toLocaleString()} sqm
                </p>
                
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Budget: {project.financial.currency} {project.financial.budget.toLocaleString()}
                </p>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888', minWidth: '120px' }}>
                <div><strong>Timeline:</strong></div>
                <div>Start: {formatDate(project.timeline.startDate)}</div>
                <div>Expected: {formatDate(project.timeline.expectedCompletion)}</div>
                {project.timeline.actualCompletion && (
                  <div>Actual: {formatDate(project.timeline.actualCompletion)}</div>
                )}
              </div>
            </div>
            
            {project.details.description && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                  {project.details.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No projects found.</p>
          <Button onClick={onCreateProject} variant="primary">
            Create First Project
          </Button>
        </div>
      )}
    </div>
  );
};
