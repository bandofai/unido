/**
 * Universal Table component - shadcn/ui wrapper
 * Displays tabular data with optional sorting and actions
 */

import type React from 'react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table.js';
import { cn } from './lib/utils.js';

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
      <div className={cn('p-8 text-center text-muted-foreground italic border rounded-lg', className)}>
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
    <ShadcnTable className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn(column.align === 'center' && 'text-center', column.align === 'right' && 'text-right')}
              style={{ width: column.width }}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={row.id}
            className={cn(
              striped && rowIndex % 2 === 1 && 'bg-muted/50',
              !hoverable && 'hover:bg-transparent'
            )}
          >
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {getCellValue(row, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </ShadcnTable>
  );
}
