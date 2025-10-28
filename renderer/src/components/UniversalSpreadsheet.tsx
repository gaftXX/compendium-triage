import React, { useState } from 'react';
import { Office, Project, Regulation } from '../types/firestore';

// Define column configurations for each data type
interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  render?: (value: any, item: any, index?: number) => React.ReactNode;
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleResizeToggle = () => {
    if (isExpanded) {
      onResizeToDefault?.();
      setIsExpanded(false);
    } else {
      onResizeToMaxWidth?.();
      setIsExpanded(true);
    }
  };
  // Define column configurations for each data type
  const getColumns = (): ColumnConfig[] => {
    switch (dataType) {
      case 'offices':
        return [
          { key: 'rowNumber', label: '#', width: 20, render: (_value, _item, index) => (index ?? 0) + 1 },
          { key: 'id', label: 'ID', width: 50 },
          { key: 'name', label: 'OFFICE NAME', width: 240 },
          { key: 'location', label: 'LOCATION', width: 250, render: (value) => 
            value?.headquarters ? `${value.headquarters.city?.replace(/^\d+\s*/, '')}, ${value.headquarters.country?.substring(0, 2).toUpperCase()}` : 'N/A'
          }
        ];
      
      case 'projects':
        return [
          { key: 'rowNumber', label: '#', width: 25, render: (_value, _item, index) => (index ?? 0) + 1 },
          { key: 'projectName', label: 'PROJECT NAME', width: 200 },
          { key: 'id', label: 'ID', width: 80 },
          { key: 'location', label: 'LOCATION', width: 180, render: (value) => 
            value ? `${value.city?.replace(/^\d+\s*/, '')}, ${value.country?.substring(0, 2).toUpperCase()}` : 'N/A'
          },
          { key: 'details', label: 'TYPE', width: 150, render: (value) => 
            value?.projectType || 'N/A'
          },
          { key: 'financial', label: 'BUDGET', width: 150, render: (value) => 
            value?.budget ? `${value.budget.toLocaleString()} ${value.currency}` : 'N/A'
          }
        ];
      
      case 'regulations':
        return [
          { key: 'rowNumber', label: '#', width: 25, render: (_value, _item, index) => (index ?? 0) + 1 },
          { key: 'name', label: 'REGULATION NAME', width: 200 },
          { key: 'id', label: 'ID', width: 80 },
          { key: 'regulationType', label: 'TYPE', width: 150 },
          { key: 'jurisdiction', label: 'JURISDICTION', width: 200, render: (value) => 
            value ? `${(value.cityName || value.state || value.countryName)?.replace(/^\d+\s*/, '')}, ${value.countryName?.substring(0, 2).toUpperCase()}` : 'N/A'
          },
          { key: 'version', label: 'VERSION', width: 100 },
          { key: 'effectiveDate', label: 'EFFECTIVE', width: 120, render: (value) => 
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
    <>
      <style>{`
        .spreadsheet-scroll::-webkit-scrollbar {
          display: none;
        }
        .spreadsheet-container {
          position: relative;
          padding-left: 6px;
          padding-right: 6px;
        }
        .spreadsheet-container::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 1px;
          height: 100%;
          background-color: #C8EDFC;
          pointer-events: none;
          z-index: 1;
        }
        .spreadsheet-container::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
          height: 100%;
          background-color: #C8EDFC;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000000', 
      color: '#C8EDFC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      fontSize: '10px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      overflow: 'hidden',
      padding: '20px',
      boxSizing: 'border-box',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {/* Loading and error states */}
      {loading && <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', marginTop: '20px', color: '#C8EDFC' }}>Loading {dataType}...</div>}
      {error && <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', marginTop: '20px', color: '#C8EDFC' }}>Error: {error}</div>}
      
      {/* Spreadsheet content */}
      {!loading && !error && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          {data.length === 0 ? (
            <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', color: '#C8EDFC' }}>No {dataType} found</div>
          ) : (
            <div className="spreadsheet-container" style={{ 
              width: dataType === 'offices' ? '450px' : 'auto',
              height: dataType === 'offices' ? '528px' : 'auto',
            }}>
              <div className="spreadsheet-scroll" style={{ 
                display: 'grid',
                gridTemplateColumns: columns.map(col => `${col.width || 150}px`).join(' '),
                gridAutoRows: '12px',
                gap: '0px',
                backgroundColor: '#000000',
                width: '100%',
                height: '100%',
                overflowX: 'hidden',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
              {/* Data rows only - no header row */}
              {data.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  {columns.map((column, colIndex) => {
                    const value = (item as any)[column.key];
                    const displayValue = column.render ? column.render(value, item, index) : value || 'N/A';
                    
                    return (
                      <div
                        key={`${item.id || index}-${column.key}`}
                        style={{
                          backgroundColor: '#000000',
                          padding: '1px 0px',
                          height: '12px',
                          fontSize: '10px',
                          fontWeight: 'normal',
                          textTransform: 'uppercase',
                          borderRight: '1px solid #333333',
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
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default UniversalSpreadsheet;
