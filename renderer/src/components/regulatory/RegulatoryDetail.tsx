import React from 'react';
import { Regulation } from '../../types/firestore';
import { Button } from '../../../../ui';

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

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
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
          <Button onClick={() => onEdit(regulation)} variant="secondary" style={{ marginRight: '10px' }}>
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
              {regulation.name}
            </h2>
            <span
              style={{
                backgroundColor: getTypeColor(regulation.regulationType),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                textTransform: 'capitalize',
                fontWeight: '500'
              }}
            >
              {regulation.regulationType.replace('-', ' ')}
            </span>
            <span
              style={{
                backgroundColor: getImpactColor(regulation.impact.level),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                textTransform: 'capitalize',
                fontWeight: '500'
              }}
            >
              {regulation.impact.level} Impact
            </span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Regulation Information
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Regulation ID:</strong> {regulation.id}</p>
              <p><strong>Version:</strong> {regulation.version}</p>
              <p><strong>Effective Date:</strong> {formatDate(regulation.effectiveDate)}</p>
              {regulation.expirationDate && (
                <p><strong>Expiration Date:</strong> {formatDate(regulation.expirationDate)}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Jurisdiction
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Level:</strong> {regulation.jurisdiction.level}</p>
              <p><strong>Country:</strong> {regulation.jurisdiction.countryName} ({regulation.jurisdiction.country})</p>
              {regulation.jurisdiction.state && (
                <p><strong>State:</strong> {regulation.jurisdiction.state}</p>
              )}
              {regulation.jurisdiction.cityName && (
                <p><strong>City:</strong> {regulation.jurisdiction.cityName}</p>
              )}
              
              <div style={{ marginTop: '10px' }}>
                <p><strong>Scope:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Applies to Country: {regulation.jurisdiction.scope.appliesToCountry ? 'Yes' : 'No'}</li>
                  <li>Applies to State: {regulation.jurisdiction.scope.appliesToState ? 'Yes' : 'No'}</li>
                  <li>Applies to Cities: {regulation.jurisdiction.scope.appliesToCities.join(', ') || 'None'}</li>
                  <li>Project Types: {regulation.jurisdiction.scope.appliesToProjectTypes.join(', ')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Description
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                {regulation.description}
              </p>
            </div>
          </div>
        </div>

        {/* Requirements and Compliance */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Requirements
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              {regulation.requirements.map((req, index) => (
                <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < regulation.requirements.length - 1 ? '1px solid #eee' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span
                      style={{
                        backgroundColor: req.mandatory ? '#dc3545' : '#6c757d',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      {req.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
                    {req.requirement}
                  </p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                    <strong>Applicable to:</strong> {req.applicableTo.join(', ')}
                  </p>
                  {req.exceptions.length > 0 && (
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Exceptions:</strong> {req.exceptions.join(', ')}
                    </p>
                  )}
                  {req.technicalSpec && (
                    <p style={{ margin: '0', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                      <strong>Technical Spec:</strong> {req.technicalSpec}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Compliance Information
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Mandatory:</strong> {regulation.compliance.mandatory ? 'Yes' : 'No'}</p>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Penalties:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Fines: {regulation.compliance.penalties.fines}</li>
                  <li>Criminal: {regulation.compliance.penalties.criminal ? 'Yes' : 'No'}</li>
                  <li>Project Stoppage: {regulation.compliance.penalties.projectStoppage ? 'Yes' : 'No'}</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Required Certifications:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {regulation.compliance.requiredCertifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Inspection Required:</strong> {regulation.compliance.inspectionRequired ? 'Yes' : 'No'}</p>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <p><strong>Estimated Compliance Cost:</strong> {formatCurrency(regulation.compliance.complianceCost.estimated, regulation.compliance.complianceCost.currency)}</p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
              Enforcement
            </h3>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
              <p><strong>Enforcing Authority:</strong> {regulation.enforcement.enforcingAuthority}</p>
              <p><strong>Inspection Frequency:</strong> {regulation.enforcement.inspectionFrequency}</p>
              <p><strong>Compliance Rate:</strong> {regulation.enforcement.complianceRate}%</p>
              <p><strong>Violation Count:</strong> {regulation.enforcement.violationCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Analysis */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
          Impact Analysis
        </h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Economic Impact</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{regulation.impact.economicImpact}</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Timeline Impact</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{regulation.impact.timelineImpact}</p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Design Impact</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{regulation.impact.designImpact}</p>
            </div>
          </div>
          
          {regulation.impact.affectedProjects.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Affected Projects</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {regulation.impact.affectedProjects.map((projectId, index) => (
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
                    {projectId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy Information */}
      {(regulation.hierarchy.parentRegulation || regulation.hierarchy.relatedRegulations.length > 0) && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>
            Regulation Hierarchy
          </h3>
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
            {regulation.hierarchy.parentRegulation && (
              <p><strong>Parent Regulation:</strong> {regulation.hierarchy.parentRegulation}</p>
            )}
            {regulation.hierarchy.supersededBy && (
              <p><strong>Superseded By:</strong> {regulation.hierarchy.supersededBy}</p>
            )}
            {regulation.hierarchy.derivedFrom && (
              <p><strong>Derived From:</strong> {regulation.hierarchy.derivedFrom}</p>
            )}
            {regulation.hierarchy.relatedRegulations.length > 0 && (
              <div>
                <p><strong>Related Regulations:</strong></p>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {regulation.hierarchy.relatedRegulations.map((related, index) => (
                    <li key={index}>{related}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Created: {regulation.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
        <p>Last Updated: {regulation.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
      </div>
    </div>
  );
};
