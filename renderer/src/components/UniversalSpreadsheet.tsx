import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [selectedOffices, setSelectedOffices] = useState<Array<{office: Office; position: 'left' | 'right'}>>([]);
  const [stickySelectedIds, setStickySelectedIds] = useState<string[]>([]);

  // Ref to the scrollable grid container inside the spreadsheet
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fixed row height used by the grid
  const rowHeight = 12; // px

  const selectedIdsInOrder = useMemo(() => selectedOffices.map(s => s.office.id), [selectedOffices]);

  // Determine which selected rows are out of view and should be shown in the sticky header
  useEffect(() => {
    if (dataType !== 'offices') {
      setStickySelectedIds([]);
      return;
    }

    const container = scrollRef.current;
    if (!container) return;

    const computeSticky = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const viewportBottom = scrollTop + viewportHeight;

      const outOfView: string[] = [];

      for (const officeId of selectedIdsInOrder) {
        const idx = (data as Office[]).findIndex(o => o.id === officeId);
        if (idx === -1) continue;
        const top = idx * rowHeight;
        const bottom = top + rowHeight;
        const fullyVisible = top >= scrollTop && bottom <= viewportBottom;
        if (!fullyVisible) {
          outOfView.push(officeId);
        }
      }
      setStickySelectedIds(outOfView);
    };

    // Initial compute and on scroll
    computeSticky();
    container.addEventListener('scroll', computeSticky, { passive: true });
    return () => container.removeEventListener('scroll', computeSticky as any);
  }, [data, dataType, selectedIdsInOrder]);

  const handleOfficeClick = (office: Office, event: React.MouseEvent) => {
    if (dataType !== 'offices') return;
    
    event.stopPropagation();
    
    // Check if office is already selected - if so, deselect it
    const existingIndex = selectedOffices.findIndex(so => so.office.id === office.id);
    if (existingIndex !== -1) {
      setSelectedOffices(prev => prev.filter((_, i) => i !== existingIndex));
      return;
    }
    
    // Limit to 6 offices maximum - if already 6 selected, do nothing
    if (selectedOffices.length >= 6) {
      return;
    }
    
    // Add new office - determine position based on selection count
    const position = selectedOffices.length % 2 === 0 ? 'left' : 'right';
    setSelectedOffices(prev => [...prev, { office, position }]);
  };

  const handleResizeToggle = () => {
    if (isExpanded) {
      onResizeToDefault?.();
      setIsExpanded(false);
    } else {
      onResizeToMaxWidth?.();
      setIsExpanded(true);
    }
  };

  const formatOfficeData = (office: Office): string => {
    const lines: string[] = [];
    
    // Size Category (size.sizeCategory)
    if (office.size?.sizeCategory) {
      lines.push(`SIZE CATEGORY: ${office.size.sizeCategory.toUpperCase()}`);
    } else {
      lines.push(`SIZE CATEGORY: N/A`);
    }
    
    // Annual Revenue (size.annualRevenue)
    if (office.size?.annualRevenue) {
      lines.push(`ANNUAL REVENUE: ${office.size.annualRevenue.toLocaleString()}`);
    } else {
      lines.push(`ANNUAL REVENUE: N/A`);
    }
    
    // Employee Count (size.employeeCount)
    if (office.size?.employeeCount) {
      lines.push(`EMPLOYEE COUNT: ${office.size.employeeCount}`);
    } else {
      lines.push(`EMPLOYEE COUNT: N/A`);
    }
    
    // Status (status: active/acquired/dissolved)
    lines.push(`STATUS: ${office.status || 'N/A'}`);
    
    // Founded Year (founded)
    lines.push(`FOUNDED YEAR: ${office.founded || 'N/A'}`);
    
    // Project Counts (connectionCounts.totalProjects, connectionCounts.activeProjects)
    if (office.connectionCounts) {
      lines.push(`TOTAL PROJECTS: ${office.connectionCounts.totalProjects || 0}`);
      lines.push(`ACTIVE PROJECTS: ${office.connectionCounts.activeProjects || 0}`);
    } else {
      lines.push(`TOTAL PROJECTS: 0`);
      lines.push(`ACTIVE PROJECTS: 0`);
    }
    
    // Project Budgets/Fees - Note: Would need to aggregate from projects collection
    // This field is not directly available in office object
    lines.push(`PROJECT BUDGETS/FEES: N/A`);
    
    // Client Count (connectionCounts.clients)
    if (office.connectionCounts) {
      lines.push(`CLIENT COUNT: ${office.connectionCounts.clients || 0}`);
    } else {
      lines.push(`CLIENT COUNT: 0`);
    }
    
    // Geographic Location (location.headquarters.city, location.headquarters.country)
    if (office.location?.headquarters) {
      const hq = office.location.headquarters;
      lines.push(`LOCATION: ${hq.city || 'N/A'}, ${hq.country || 'N/A'}`);
    } else {
      lines.push(`LOCATION: N/A`);
    }
    
    // Website (website)
    if (office.website) {
      lines.push(`WEBSITE: ${office.website}`);
    } else {
      lines.push(`WEBSITE: N/A`);
    }
    
    return lines.join('\n');
  };
  // Define column configurations for each data type
  const getColumns = (): ColumnConfig[] => {
    switch (dataType) {
      case 'offices':
        return [
          { key: 'rowNumber', label: '#', width: 20, render: (_value, _item, index) => (index ?? 0) + 1 },
          { key: 'id', label: 'ID', width: 50 },
          { key: 'name', label: 'OFFICE NAME', width: 220 },
          { key: 'location', label: 'LOCATION', width: 100, render: (value) => 
            value?.headquarters ? `${value.headquarters.city?.replace(/^\d+\s*/, '')}, ${value.headquarters.country?.substring(0, 2).toUpperCase()}` : 'N/A'
          },
          { key: 'category', label: 'CATEGORY', width: 60, render: (_value, item) => {
            const office = item as Office & { __isRowSelected?: boolean };
            const sizeCategory = office.size?.sizeCategory;
            if (!sizeCategory) return '';
            
            const categoryMap: Record<string, number> = {
              'boutique': 1,
              'medium': 2,
              'large': 3,
              'global': 4
            };
            const filled = categoryMap[sizeCategory] || 0;
            const isRowSelected = office.__isRowSelected || false;
            
            return (
              <div style={{ 
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  width: `${(filled / 4) * 100}%`,
                  height: '6px',
                  backgroundColor: isRowSelected ? '#000000' : '#C8EDFC',
                  flexShrink: 0
                }} />
              </div>
            );
          }}
        ];
      
      case 'projects':
        return [
          { key: 'rowNumber', label: '#', width: 20, render: (_value, _item, index) => (index ?? 0) + 1 },
          { key: 'projectName', label: 'PROJECT NAME', width: 300 },
          { key: 'location', label: 'LOCATION', width: 180, render: (value) => 
            value?.country ? `${value.country.toUpperCase()}` : 'N/A'
          },
          { key: 'details', label: 'TYPE', width: 150, render: (value) => 
            value?.projectType || 'N/A'
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 'calc(100vh - 40px)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Left side panels for selected offices - absolutely positioned */}
          {dataType === 'offices' && selectedOffices.filter(so => so.position === 'left').length > 0 && (
            <div style={{
              position: 'absolute',
              // Place panel to the LEFT of the spreadsheet's left vertical line with a 5px gap
              // Spreadsheet container total width: 450px + 12px padding = 462px → half = 231px
              // Panel width: 280px → position = 50% - 231px - 5px - 280px
              left: dataType === 'offices' ? 'calc(50% - 231px - 5px - 280px)' : 'auto',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              maxWidth: '280px',
              height: '528px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 10
            }}>
              {selectedOffices
                .filter(so => so.position === 'left')
                .map((selectedOffice) => {
                  const isSticky = stickySelectedIds.includes(selectedOffice.office.id);
                  return (
                    <div
                      key={selectedOffice.office.id}
                      style={{
                        position: 'relative',
                        backgroundColor: '#C8EDFC',
                        color: '#000000',
                        padding: '2px',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textTransform: 'uppercase',
                        whiteSpace: isSticky ? 'nowrap' : 'pre-wrap',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                        lineHeight: '1.4',
                        width: '280px',
                        height: isSticky ? '11px' : '174px',
                        overflow: isSticky ? 'hidden' : 'hidden',
                        wordBreak: 'break-word',
                        display: isSticky ? 'flex' : 'block',
                        alignItems: isSticky ? 'center' : 'flex-start'
                      }}
                    >
                      {isSticky ? (
                        selectedOffice.office.id
                      ) : (
                        <>
                          <div style={{
                            height: 'calc(174px - 14px)',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                          }}>
                            {formatOfficeData(selectedOffice.office)}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '2px',
                            right: '2px',
                            fontSize: '10px',
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                            backgroundColor: '#C8EDFC'
                          }}>
                            {selectedOffice.office.id || 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
          
          {/* Centered spreadsheet */}
          {data.length === 0 ? (
            <div style={{ fontSize: '10px', fontWeight: 'normal', textTransform: 'uppercase', color: '#C8EDFC' }}>No {dataType} found</div>
          ) : (
            <div className="spreadsheet-container" style={{ 
              width: dataType === 'offices' ? '450px' : (dataType === 'projects' ? '450px' : 'auto'),
              height: dataType === 'offices' ? '528px' : 'auto',
              margin: '0 auto'
            }}>
              <div
                className="spreadsheet-scroll"
                ref={scrollRef}
                style={{ 
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
              }}
              >
              {/* Data rows only - no header row */}
              {data.map((item, index) => {
                const isRowHovered = hoveredRowIndex === index;
                const isRowSelected = dataType === 'offices' && selectedOffices.some(so => so.office.id === item.id);
                const isClickable = dataType === 'offices';
                
                return (
                  <React.Fragment key={item.id || index}>
                    {columns.map((column, colIndex) => {
                      const value = (item as any)[column.key];
                      const isIdColumn = column.key === 'id';
                      const isHoveredIdCell = isRowHovered && isIdColumn && dataType === 'offices';
                      const isCategoryColumn = column.key === 'category';
                      
                      // For category column, pass isRowSelected as part of the item context
                      const displayValue = column.render 
                        ? column.render(value, { ...item, __isRowSelected: isRowSelected }, index)
                        : value || 'N/A';
                      
                      return (
                        <div
                          key={`${item.id || index}-${column.key}`}
                          onMouseEnter={() => setHoveredRowIndex(index)}
                          onMouseLeave={() => setHoveredRowIndex(null)}
                          onClick={isClickable ? (e) => handleOfficeClick(item as Office, e) : undefined}
                          style={{
                            backgroundColor: isRowSelected ? '#C8EDFC' : (isHoveredIdCell ? '#C8EDFC' : '#000000'),
                            color: isRowSelected ? '#000000' : (isHoveredIdCell ? '#000000' : '#C8EDFC'),
                            cursor: isClickable ? 'pointer' : 'default',
                            padding: '0',
                            height: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isCategoryColumn ? 'normal' : 'nowrap'
                          }}
                        >
                          {displayValue}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              </div>
              {/* Sticky selected rows overlay - does not change layout */}
              {dataType === 'offices' && stickySelectedIds.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '6px', // match spreadsheet-container padding-left to align with scroll content
                    width: dataType === 'offices' ? '450px' : 'auto', // match spreadsheet-scroll width exactly
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    background: 'transparent',
                    zIndex: 5,
                    pointerEvents: 'none',
                    overflowX: 'hidden', // match spreadsheet-scroll overflow behavior
                    overflowY: 'hidden'
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: columns.map(col => `${col.width || 150}px`).join(' '),
                      gap: '0px',
                      width: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    {stickySelectedIds.map((officeId) => {
                      const office = (data as Office[]).find(o => o.id === officeId);
                      if (!office) return null;
                      const officeIndex = (data as Office[]).findIndex(o => o.id === officeId);
                      const values: Record<string, any> = {
                        rowNumber: officeIndex + 1,
                        id: office.id,
                        name: office.name,
                        location: office.location
                      };
                      return (
                        <React.Fragment key={`sticky-${officeId}`}>
                          {columns.map((column) => {
                            const value = values[column.key];
                            // Pass the actual index to the render function so rowNumber shows correctly
                            const displayValue = column.render 
                              ? column.render(value, office, officeIndex)
                              : (value ?? 'N/A');
                            return (
                              <div
                                key={`sticky-${officeId}-${column.key}`}
                                style={{
                                  backgroundColor: '#C8EDFC',
                                  color: '#000000',
                                  padding: '1px 0px',
                                  height: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'normal',
                                  textTransform: 'uppercase',
                                  textAlign: 'left',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  pointerEvents: 'auto'
                                }}
                              >
                                {displayValue}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Right side panels for selected offices - absolutely positioned */}
          {dataType === 'offices' && selectedOffices.filter(so => so.position === 'right').length > 0 && (
            <div style={{
              position: 'absolute',
              left: dataType === 'offices' ? 'calc(50% + 231px + 5px)' : 'auto', // Center (50%) + half spreadsheet container width (231px) + 5px gap after right vertical line
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              maxWidth: '280px',
              height: '528px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 10
            }}>
              {selectedOffices
                .filter(so => so.position === 'right')
                .map((selectedOffice) => {
                  const isSticky = stickySelectedIds.includes(selectedOffice.office.id);
                  return (
                    <div
                      key={selectedOffice.office.id}
                      style={{
                        position: 'relative',
                        backgroundColor: '#C8EDFC',
                        color: '#000000',
                        padding: '2px',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textTransform: 'uppercase',
                        whiteSpace: isSticky ? 'nowrap' : 'pre-wrap',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                        lineHeight: '1.4',
                        width: '280px',
                        height: isSticky ? '11px' : '174px',
                        overflow: isSticky ? 'hidden' : 'hidden',
                        wordBreak: 'break-word',
                        display: isSticky ? 'flex' : 'block',
                        alignItems: isSticky ? 'center' : 'flex-start'
                      }}
                    >
                      {isSticky ? (
                        selectedOffice.office.id
                      ) : (
                        <>
                          <div style={{
                            height: 'calc(174px - 14px)',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                          }}>
                            {formatOfficeData(selectedOffice.office)}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '2px',
                            right: '2px',
                            fontSize: '10px',
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
                            backgroundColor: '#C8EDFC'
                          }}>
                            {selectedOffice.office.id || 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default UniversalSpreadsheet;
