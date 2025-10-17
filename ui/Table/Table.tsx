import React from 'react';
import { TableProps } from './Table.types';
import { useTable } from './useTable';

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  onSort,
  className = ''
}) => {
  const { sortColumn, sortDirection, handleSort } = useTable({ onSort });

  return (
    <div className={className}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #ddd'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                {column.label}
                {column.sortable && sortColumn === column.key && (
                  <span style={{ marginLeft: '8px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={{ 
              borderBottom: '1px solid #dee2e6',
              '&:hover': { backgroundColor: '#f8f9fa' }
            }}>
              {columns.map((column) => (
                <td key={column.key} style={{ padding: '12px' }}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
