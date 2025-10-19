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
        <div>Loading offices...</div>
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
          onClick={loadOffices}
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
          Architecture Offices
        </div>
        <button 
          onClick={onCreateOffice}
          style={{
            backgroundColor: '#B3E5FC',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create Office
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {offices.map((office) => (
          <div
            key={office.id}
            onClick={() => onOfficeSelect(office)}
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
                  {office.name}
                </div>
                <div style={{ fontSize: '12px', color: '#B3E5FC', marginBottom: '2px' }}>
                  ID: {office.id} | Founded: {office.founded}
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
                  {office.location.headquarters.city}, {office.location.headquarters.country}
                </div>
                <div style={{ fontSize: '12px', color: '#888888' }}>
                  {office.size.employeeCount} employees | {office.size.sizeCategory}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888888' }}>
                <div>Projects: {office.connectionCounts.totalProjects}</div>
                <div>Active: {office.connectionCounts.activeProjects}</div>
                <div>Clients: {office.connectionCounts.clients}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {offices.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#888888'
        }}>
          <div>No offices found.</div>
          <button 
            onClick={onCreateOffice}
            style={{
              backgroundColor: '#B3E5FC',
              color: '#000000',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Create First Office
          </button>
        </div>
      )}
    </div>
  );
};
