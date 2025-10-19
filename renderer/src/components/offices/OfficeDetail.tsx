import React from 'react';
import { Office } from '../../types/firestore';

interface OfficeDetailProps {
  office: Office;
  onEdit: (office: Office) => void;
  onDelete: (officeId: string) => void;
  onBack: () => void;
}

export const OfficeDetail: React.FC<OfficeDetailProps> = ({
  office,
  onEdit,
  onDelete,
  onBack
}) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${office.name}?`)) {
      onDelete(office.id);
    }
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
          onClick={() => onEdit(office)}
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
            {office.name}
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Official Name</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{office.officialName}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Founded</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{office.founded}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Status</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>{office.status}</div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Location</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {office.location.headquarters.city}, {office.location.headquarters.country}
            </div>
          </div>
        </div>

        {/* Size and Stats */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Size</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              {office.size.employeeCount} employees | {office.size.sizeCategory}
            </div>
            {office.size.annualRevenue && (
              <div style={{ color: '#888888', fontSize: '14px', marginTop: '5px' }}>
                Annual Revenue: {office.size.annualRevenue.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Projects</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              Total: {office.connectionCounts.totalProjects} | Active: {office.connectionCounts.activeProjects}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#B3E5FC', fontSize: '14px', marginBottom: '5px' }}>Connections</div>
            <div style={{ color: '#ffffff', fontSize: '16px' }}>
              Clients: {office.connectionCounts.clients} | Competitors: {office.connectionCounts.competitors} | Suppliers: {office.connectionCounts.suppliers}
            </div>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {office.specializations && office.specializations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Specializations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {office.specializations.map((spec, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  padding: '4px 8px',
                  border: '1px solid #333333',
                  fontSize: '12px'
                }}
              >
                {spec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable Works */}
      {office.notableWorks && office.notableWorks.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Notable Works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {office.notableWorks.map((work, index) => (
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
                {work}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Offices */}
      {office.location.otherOffices && office.location.otherOffices.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ color: '#B3E5FC', fontSize: '18px', marginBottom: '10px' }}>Other Offices</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {office.location.otherOffices.map((office, index) => (
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
                {office.city}, {office.country}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};