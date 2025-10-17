import React from 'react';
import { Project } from '../../types/firestore';
import { Button } from '../../../../ui';

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
        <Button onClick={onBack} variant="ghost">
          ← Back to List
        </Button>
        <div>
          <Button onClick={() => onEdit(project)} variant="secondary" style={{ marginRight: '10px' }}>
            Edit
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Delete
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Basic Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>
              {project.projectName}
            </h2>
            <span
              style={{
                backgroundColor: getStatusColor(project.status),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                textTransform: 'capitalize',
                fontWeight: '500'
              }}
            >
              {project.status}
            </span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Project Information
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Project ID:</strong> {project.id}</p>
              <p><strong>Office ID:</strong> {project.officeId}</p>
              <p><strong>City ID:</strong> {project.cityId}</p>
              <p><strong>Client ID:</strong> {project.clientId}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Location
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Address:</strong> {project.location.address || 'No address provided'}</p>
              <p><strong>City:</strong> {project.location.city}</p>
              <p><strong>Country:</strong> {project.location.country}</p>
              {project.location.neighborhood && (
                <p><strong>Neighborhood:</strong> {project.location.neighborhood}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Project Details
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Type:</strong> {project.details.projectType}</p>
              <p><strong>Size:</strong> {project.details.size.toLocaleString()} sqm</p>
              <p><strong>Description:</strong></p>
              <p style={{ marginTop: '5px', fontStyle: 'italic' }}>
                {project.details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline and Financial */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Timeline
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Start Date:</strong> {formatDate(project.timeline.startDate)}</p>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Expected Completion:</strong> {formatDate(project.timeline.expectedCompletion)}</p>
              </div>
              {project.timeline.actualCompletion && (
                <div style={{ marginBottom: '10px' }}>
                  <p><strong>Actual Completion:</strong> {formatDate(project.timeline.actualCompletion)}</p>
                </div>
              )}
              
              {/* Timeline visualization */}
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Project Progress</div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e0e0e0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: project.status === 'completed' ? '100%' : 
                          project.status === 'construction' ? '75%' :
                          project.status === 'planning' ? '50%' : '25%',
                    height: '100%',
                    backgroundColor: getStatusColor(project.status),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  {project.status === 'completed' ? '100% Complete' :
                   project.status === 'construction' ? '75% Complete' :
                   project.status === 'planning' ? '50% Complete' : '25% Complete'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Financial Information
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Budget:</strong> {formatCurrency(project.financial.budget, project.financial.currency)}</p>
              </div>
              {project.financial.actualCost && (
                <div style={{ marginBottom: '10px' }}>
                  <p><strong>Actual Cost:</strong> {formatCurrency(project.financial.actualCost, project.financial.currency)}</p>
                </div>
              )}
              
              {project.financial.actualCost && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Budget Performance</div>
                  {project.financial.actualCost <= project.financial.budget ? (
                    <div style={{ color: '#28a745', fontSize: '14px' }}>
                      ✓ Under budget by {formatCurrency(project.financial.budget - project.financial.actualCost, project.financial.currency)}
                    </div>
                  ) : (
                    <div style={{ color: '#dc3545', fontSize: '14px' }}>
                      ⚠ Over budget by {formatCurrency(project.financial.actualCost - project.financial.budget, project.financial.currency)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Metrics */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Project Metrics
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px' 
            }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>
                  {project.details.size.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Sq Meters</div>
              </div>
              <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#388e3c' }}>
                  {project.financial.currency}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Currency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Created: {project.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
        <p>Last Updated: {project.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
      </div>
    </div>
  );
};
