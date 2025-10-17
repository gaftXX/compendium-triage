import React from 'react';
import { Office } from '../../types/firestore';
import { Button } from '../../../../ui';

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
          <Button onClick={() => onEdit(office)} variant="secondary" style={{ marginRight: '10px' }}>
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
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>
            {office.name}
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Basic Information
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Office ID:</strong> {office.id}</p>
              <p><strong>Official Name:</strong> {office.officialName}</p>
              <p><strong>Founded:</strong> {office.founded}</p>
              <p><strong>Status:</strong> {office.status}</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Location
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Headquarters:</strong></p>
              <p>{office.location.headquarters.address || 'No address'}</p>
              <p>{office.location.headquarters.city}, {office.location.headquarters.country}</p>
              {office.location.headquarters.neighborhood && (
                <p><em>{office.location.headquarters.neighborhood}</em></p>
              )}
              
              {office.location.otherOffices.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>Other Offices:</strong></p>
                  {office.location.otherOffices.map((office, index) => (
                    <p key={index}>
                      {office.address || 'No address'}, {office.city}, {office.country}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Size and Specializations */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Company Size
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Employees:</strong> {office.size.employeeCount}</p>
              <p><strong>Size Category:</strong> {office.size.sizeCategory}</p>
              {office.size.annualRevenue && (
                <p><strong>Annual Revenue:</strong> ${office.size.annualRevenue.toLocaleString()}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Specializations
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              {office.specializations.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {office.specializations.map((spec, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No specializations listed</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Notable Works
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              {office.notableWorks.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {office.notableWorks.map((work, index) => (
                    <li key={index}>{work}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No notable works listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Counts */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
          Connection Statistics
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '10px' 
        }}>
          <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {office.connectionCounts.totalProjects}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Projects</div>
          </div>
          <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {office.connectionCounts.activeProjects}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Active Projects</div>
          </div>
          <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {office.connectionCounts.clients}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Clients</div>
          </div>
          <div style={{ backgroundColor: '#fce4ec', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
              {office.connectionCounts.competitors}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Competitors</div>
          </div>
          <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>
              {office.connectionCounts.suppliers}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Suppliers</div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Created: {office.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
        <p>Last Updated: {office.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
      </div>
    </div>
  );
};
