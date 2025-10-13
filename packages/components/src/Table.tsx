/**
 * Universal Table component
 * Displays tabular data with optional sorting and actions
 */

import type React from 'react';

export interface TableColumn {
  id: string;
  header: string;
  accessor: string | ((row: TableRow) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  id: string | number;
  [key: string]: unknown;
}

export interface TableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
}

export function Table({
  columns,
  data,
  className = '',
  striped = false,
  hoverable = true,
  emptyMessage = 'No data available',
}: TableProps) {
  if (data.length === 0) {
    return (
      <div
        className={`unido-table-empty ${className}`}
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  const getCellValue = (row: TableRow, column: TableColumn): React.ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  return (
    <div className={`unido-table-container ${className}`} style={{ overflowX: 'auto' }}>
      <table
        className="unido-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f9fafb',
              borderBottom: '2px solid #e5e7eb',
            }}
          >
            {columns.map((column) => (
              <th
                key={column.id}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: column.align || 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: column.width,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id}
              className="unido-table-row"
              style={{
                backgroundColor: striped && rowIndex % 2 === 1 ? '#f9fafb' : 'white',
                borderBottom: rowIndex < data.length - 1 ? '1px solid #e5e7eb' : 'none',
                transition: hoverable ? 'background-color 0.2s' : 'none',
              }}
              onMouseEnter={(e) => {
                if (hoverable) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (hoverable) {
                  e.currentTarget.style.backgroundColor =
                    striped && rowIndex % 2 === 1 ? '#f9fafb' : 'white';
                }
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: column.align || 'left',
                    color: '#111827',
                  }}
                >
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
