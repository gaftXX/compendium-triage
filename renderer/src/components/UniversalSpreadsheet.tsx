import React from 'react';
import { Office, Project, Regulation } from '../types/firestore';

// Define column configurations for each data type
interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  render?: (value: any, item: any) => React.ReactNode;
}

interface UniversalSpreadsheetProps {
  data: Office[] | Project[] | Regulation[];
  dataType: 'offices' | 'projects' | 'regulations';
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClose?: () => void;
  onResizeToMaxWidth?: () => void;
  onResizeToDefault?: () => void;
  isElectron?: boolean;
}

export const UniversalSpreadsheet: React.FC<UniversalSpreadsheetProps> = ({
  data,
  dataType,
  loading = false,
  error = null,
  onRefresh,
  onClose,
  onResizeToMaxWidth,
  onResizeToDefault,
  isElectron = false
}) => {
  // Define column configurations for each data type
  const getColumns = (): ColumnConfig[] => {
    switch (dataType) {
      case 'offices':
        return [
          { key: 'name', label: 'NAME', width: 200 },
          { key: 'officialName', label: 'OFFICIAL NAME', width: 200 },
          { key: 'id', label: 'ID', width: 100 },
          { key: 'founded', label: 'FOUNDED', width: 80 },
          { key: 'location', label: 'LOCATION', width: 150, render: (value) => 
            value?.headquarters ? `${value.headquarters.city}, ${value.headquarters.country}` : 'N/A'
          },
          { key: 'specializations', label: 'SPECIALIZATIONS', width: 200, render: (value) => 
            value ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : 'N/A'
          },
          { key: 'status', label: 'STATUS', width: 100 }
        ];
      
      case 'projects':
        return [
          { key: 'projectName', label: 'PROJECT NAME', width: 200 },
          { key: 'id', label: 'ID', width: 100 },
          { key: 'location', label: 'LOCATION', width: 150, render: (value) => 
            value ? `${value.city}, ${value.country}` : 'N/A'
          },
          { key: 'details', label: 'TYPE', width: 120, render: (value) => 
            value?.projectType || 'N/A'
          },
          { key: 'status', label: 'STATUS', width: 100 },
          { key: 'financial', label: 'BUDGET', width: 120, render: (value) => 
            value?.budget ? `${value.budget.toLocaleString()} ${value.currency}` : 'N/A'
          }
        ];
      
      case 'regulations':
        return [
          { key: 'name', label: 'NAME', width: 200 },
          { key: 'id', label: 'ID', width: 100 },
          { key: 'regulationType', label: 'TYPE', width: 120 },
          { key: 'jurisdiction', label: 'JURISDICTION', width: 150, render: (value) => 
            value ? `${value.cityName || value.state || value.countryName}, ${value.countryName}` : 'N/A'
          },
          { key: 'version', label: 'VERSION', width: 80 },
          { key: 'effectiveDate', label: 'EFFECTIVE', width: 100, render: (value) => 
            value ? new Date(value.seconds * 1000).toLocaleDateString() : 'N/A'
          }
        ];
      
      default:
        return [];
    }
  };

  const columns = getColumns();
  const title = dataType === 'offices' ? 'ARCHITECTURE OFFICES' : 
                dataType === 'projects' ? 'ARCHITECTURE PROJECTS' : 
                'BUILDING REGULATIONS';

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000000', 
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      overflow: 'hidden',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header with title and buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', margin: 0 }}>
          {title}
          {!loading && data.length > 0 && (
            <span> ({data.length} {dataType})</span>
          )}
        </h1>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              disabled={loading}
              style={{
                fontSize: '10px',
                fontWeight: 'normal',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          )}
          
          {isElectron && onResizeToMaxWidth && onResizeToDefault && (
            <>
              <button
                onClick={onResizeToMaxWidth}
                style={{
                  fontSize: '10px',
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Expand Width
              </button>
              <button
                onClick={onResizeToDefault}
                style={{
                  fontSize: '10px',
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Default Size
              </button>
            </>
          )}
          
          {onClose && (
            <button 
              onClick={onClose}
              style={{
                fontSize: '10px',
                fontWeight: 'normal',
                textTransform: 'uppercase',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      {/* Loading and error states */}
      {loading && <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', marginTop: '20px' }}>Loading {dataType}...</div>}
      {error && <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', marginTop: '20px' }}>Error: {error}</div>}
      
      {/* Spreadsheet content */}
      {!loading && !error && (
        <div style={{ marginTop: '20px' }}>
          {data.length === 0 ? (
            <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase' }}>No {dataType} found</div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: columns.map(col => `${col.width || 150}px`).join(' '),
              gap: '1px',
              backgroundColor: '#333333'
            }}>
              {/* Header row */}
              {columns.map((column) => (
                <div
                  key={column.key}
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '8px',
                    fontSize: '10px',
                    fontWeight: 'normal',
                    textTransform: 'uppercase',
                    border: '1px solid #333333',
                    textAlign: 'left'
                  }}
                >
                  {column.label}
                </div>
              ))}
              
              {/* Data rows */}
              {data.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  {columns.map((column) => {
                    const value = (item as any)[column.key];
                    const displayValue = column.render ? column.render(value, item) : value || 'N/A';
                    
                    return (
                      <div
                        key={`${item.id || index}-${column.key}`}
                        style={{
                          backgroundColor: index % 2 === 0 ? '#000000' : '#0a0a0a',
                          padding: '8px',
                          fontSize: '10px',
                          fontWeight: 'normal',
                          textTransform: 'uppercase',
                          border: '1px solid #333333',
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {displayValue}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSpreadsheet;
