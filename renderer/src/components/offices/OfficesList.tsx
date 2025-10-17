import React from 'react';
import { Office } from '../../types/firestore';
import { Button } from '../../../../ui';
import { useOffices } from '../../hooks/useFirestore';

interface OfficesListProps {
  onOfficeSelect: (office: Office) => void;
  onCreateOffice: () => void;
}

export const OfficesList: React.FC<OfficesListProps> = ({
  onOfficeSelect,
  onCreateOffice
}) => {
  const { offices, loading, error, loadOffices } = useOffices();

  // Load offices when component mounts
  React.useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading offices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <Button onClick={loadOffices}>Retry</Button>
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
        <h2>Architecture Offices</h2>
        <Button onClick={onCreateOffice} variant="primary">
          Create Office
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {offices.map((office) => (
          <div
            key={office.id}
            onClick={() => onOfficeSelect(office)}
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
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                  {office.name}
                </h3>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  ID: {office.id} | Founded: {office.founded}
                </p>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  {office.location.headquarters.city}, {office.location.headquarters.country}
                </p>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {office.size.employeeCount} employees | {office.size.sizeCategory}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888' }}>
                <div>Projects: {office.connectionCounts.totalProjects}</div>
                <div>Active: {office.connectionCounts.activeProjects}</div>
                <div>Clients: {office.connectionCounts.clients}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {offices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No offices found.</p>
          <Button onClick={onCreateOffice} variant="primary">
            Create First Office
          </Button>
        </div>
      )}
    </div>
  );
};
