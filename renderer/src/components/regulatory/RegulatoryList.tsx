import React from 'react';
import { Regulation } from '../../types/firestore';
import { Button } from '../../../../ui';
import { useRegulations } from '../../hooks/useFirestore';

interface RegulatoryListProps {
  onRegulationSelect: (regulation: Regulation) => void;
  onCreateRegulation: () => void;
  jurisdiction?: string; // Filter by jurisdiction
}

export const RegulatoryList: React.FC<RegulatoryListProps> = ({
  onRegulationSelect,
  onCreateRegulation,
  jurisdiction
}) => {
  const { regulations, loading, error, loadRegulations } = useRegulations();

  // Load regulations when component mounts or jurisdiction changes
  React.useEffect(() => {
    loadRegulations(jurisdiction);
  }, [loadRegulations, jurisdiction]);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'international': return '#dc3545';
      case 'national': return '#ffc107';
      case 'state': return '#17a2b8';
      case 'city': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'zoning': return '#007bff';
      case 'building-code': return '#28a745';
      case 'fire-safety': return '#dc3545';
      case 'environmental': return '#20c997';
      case 'accessibility': return '#6f42c1';
      case 'energy': return '#fd7e14';
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
        <p>Loading regulations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <Button onClick={loadRegulations}>Retry</Button>
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
          {jurisdiction ? `Regulations - ${jurisdiction}` : 'All Regulations'}
        </h2>
        <Button onClick={onCreateRegulation} variant="primary">
          Create Regulation
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {regulations.map((regulation) => (
          <div
            key={regulation.id}
            onClick={() => onRegulationSelect(regulation)}
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
                    {regulation.name}
                  </h3>
                  <span
                    style={{
                      backgroundColor: getTypeColor(regulation.regulationType),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {regulation.regulationType.replace('-', ' ')}
                  </span>
                  <span
                    style={{
                      backgroundColor: getImpactColor(regulation.jurisdiction.level),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {regulation.jurisdiction.level} Jurisdiction
                  </span>
                </div>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  ID: {regulation.id}
                </p>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  {regulation.jurisdiction.cityName}, {regulation.jurisdiction.countryName}
                </p>
                
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  Effective: {formatDate(regulation.effectiveDate)} • Version: {regulation.version}
                </p>
                
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  {regulation.description}
                </p>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#888', minWidth: '120px' }}>
                <div><strong>Compliance:</strong></div>
                <div>Rate: {regulation.enforcement?.complianceRate || 0}%</div>
                <div>Violations: {regulation.enforcement?.violationCount || 0}</div>
                <div style={{ marginTop: '5px' }}>
                  <strong>Cost:</strong> {regulation.compliance?.complianceCost?.currency || 'USD'} {regulation.compliance?.complianceCost?.estimated?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            
            {regulation.requirements?.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  <strong>Key Requirements:</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {regulation.requirements?.slice(0, 2).map((req, index) => (
                    <div key={index} style={{ marginBottom: '2px' }}>
                      • {req.requirement}
                    </div>
                  ))}
                  {regulation.requirements?.length > 2 && (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>
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
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No regulations found.</p>
          <Button onClick={onCreateRegulation} variant="primary">
            Create First Regulation
          </Button>
        </div>
      )}
    </div>
  );
};
