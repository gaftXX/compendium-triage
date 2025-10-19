import React from 'react';
import { Project } from '../../types/firestore';

interface ProjectDetailProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onEdit,
  onDelete,
  onBack
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${project.projectName}?`)) {
      onDelete(project.id);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#000000',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#B3E5FC',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          ← Back to List
        </button>
        <button 
          onClick={() => onEdit(project)}
          style={{
            backgroundColor: '#333333',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Edit
        </button>
        <button 
          onClick={handleDelete}
          style={{
            backgroundColor: '#dc3545',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Basic Information */}
        <div>
          <div style={{ 
            color: '#B3E5FC', 
            fontSize: '24px', 
            marginBottom: '20px' 
          }}>
            {project.projectName}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Project ID</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{project.id}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Status</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{project.status}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Location</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {project.location?.city || 'Unknown'}, {project.location?.country || 'Unknown'}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Project Type</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {project.details?.projectType || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Financial and Timeline */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Budget</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {project.financial?.currency || 'USD'} {project.financial?.budget?.toLocaleString() || '0'}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Size</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {project.details?.size?.toLocaleString() || '0'} sqm
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Timeline</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              Start: {formatDate(project.timeline?.startDate)}
            </div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              Expected: {formatDate(project.timeline?.expectedCompletion)}
            </div>
            {project.timeline?.actualCompletion && (
              <div style={{ color: '#ffffff', fontSize: '16px' }}>
                Actual: {formatDate(project.timeline.actualCompletion)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.details?.description && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Description</div>
          <div style={{ 
            backgroundColor: '#111111',
            color: '#ffffff',
            padding: '15px',
            border: '1px solid #333333',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {project.details.description}
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Additional Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Office ID</div>
            <div style={{ color: '#ffffff', fontSize: '14px' }}>{project.officeId}</div>
          </div>
          <div>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>City ID</div>
            <div style={{ color: '#ffffff', fontSize: '14px' }}>{project.cityId}</div>
          </div>
          <div>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Client ID</div>
            <div style={{ color: '#ffffff', fontSize: '14px' }}>{project.clientId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};