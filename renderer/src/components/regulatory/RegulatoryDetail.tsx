import React from 'react';
import { Regulation } from '../../types/firestore';

interface RegulatoryDetailProps {
  regulation: Regulation;
  onEdit: (regulation: Regulation) => void;
  onDelete: (regulationId: string) => void;
  onBack: () => void;
}

export const RegulatoryDetail: React.FC<RegulatoryDetailProps> = ({
  regulation,
  onEdit,
  onDelete,
  onBack
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${regulation.name}?`)) {
      onDelete(regulation.id);
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
          onClick={() => onEdit(regulation)}
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
            {regulation.name}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Regulation ID</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{regulation.id}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Type</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{regulation.regulationType}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Jurisdiction</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {regulation.jurisdiction.level} - {regulation.jurisdiction.countryName}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Effective Date</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {formatDate(regulation.effectiveDate)}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Version</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{regulation.version}</div>
          </div>
        </div>

        {/* Compliance and Enforcement */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Compliance Rate</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {regulation.enforcement?.complianceRate || 0}%
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Violations</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {regulation.enforcement?.violationCount || 0}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Enforcing Authority</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {regulation.enforcement?.enforcingAuthority || 'N/A'}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Compliance Cost</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {regulation.compliance?.complianceCost?.currency || 'USD'} {regulation.compliance?.complianceCost?.estimated?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
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
          {regulation.description}
        </div>
      </div>

      {/* Requirements */}
      {regulation.requirements && regulation.requirements.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {regulation.requirements.map((req, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  padding: '8px',
                  border: '1px solid #333333',
                  fontSize: '14px'
                }}
              >
                • {req.requirement}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impact */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Impact</div>
        <div style={{ 
          backgroundColor: '#111111',
          color: '#ffffff',
          padding: '15px',
          border: '1px solid #333333',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Level:</strong> {regulation.impact?.level || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Economic Impact:</strong> {regulation.impact?.economicImpact || 'N/A'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Timeline Impact:</strong> {regulation.impact?.timelineImpact || 'N/A'}
          </div>
          <div>
            <strong>Design Impact:</strong> {regulation.impact?.designImpact || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};