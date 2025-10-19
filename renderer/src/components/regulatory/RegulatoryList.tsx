import React from 'react';
import { Regulation } from '../../types/firestore';
import { useRegulations } from '../../hooks/useFirestore';

interface RegulatoryListProps {
  onRegulationSelect: (regulation: Regulation) => void;
  onCreateRegulation: () => void;
}

export const RegulatoryList: React.FC<RegulatoryListProps> = ({
  onRegulationSelect,
  onCreateRegulation
}) => {
  const { regulations, loading, error, loadRegulations } = useRegulations();

  // Load regulations when component mounts
  React.useEffect(() => {
    loadRegulations();
  }, [loadRegulations]);

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
        <div>Loading regulations...</div>
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
          onClick={loadRegulations}
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
          Regulatory Records
        </div>
        <button 
          onClick={onCreateRegulation}
          style={{
            backgroundColor: '#B3E5FC',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create Regulation
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {regulations.map((regulation) => (
          <div
            key={regulation.id}
            onClick={() => onRegulationSelect(regulation)}
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
                  {regulation.name}
                </div>
                <div style={{ fontSize: '12px', color: '#B3E5FC', marginBottom: '2px' }}>
                  ID: {regulation.id} | Type: {regulation.regulationType}
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
                  {regulation.jurisdiction?.level} Jurisdiction
                </div>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
                  Effective: {formatDate(regulation.effectiveDate)} | Version: {regulation.version}
                </div>
                <div style={{ fontSize: '12px', color: '#888888' }}>
                  {regulation.description}
                </div>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888888', minWidth: '120px' }}>
                <div><strong>Compliance:</strong></div>
                <div>Rate: {regulation.enforcement?.complianceRate || 0}%</div>
                <div>Violations: {regulation.enforcement?.violationCount || 0}</div>
                <div style={{ marginTop: '5px' }}>
                  <strong>Cost:</strong> {regulation.compliance?.complianceCost?.currency || 'USD'} {regulation.compliance?.complianceCost?.estimated?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            
            {regulation.requirements?.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #333333' }}>
                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '5px' }}>
                  <strong>Key Requirements:</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#888888' }}>
                  {regulation.requirements?.slice(0, 2).map((req, index) => (
                    <div key={index} style={{ marginBottom: '2px' }}>
                      • {req.requirement}
                    </div>
                  ))}
                  {regulation.requirements?.length > 2 && (
                    <div style={{ color: '#888888', fontStyle: 'italic' }}>
                      +{regulation.requirements?.length - 2} more requirements
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {regulations.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#888888'
        }}>
          <div>No regulations found.</div>
          <button 
            onClick={onCreateRegulation}
            style={{
              backgroundColor: '#B3E5FC',
              color: '#000000',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Create First Regulation
          </button>
        </div>
      )}
    </div>
  );
};