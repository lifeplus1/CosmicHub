import React, { useMemo, useState, useCallback } from 'react';
import { VirtualizedList } from '../ChartDisplay/VirtualizedList';
import { ErrorBoundary } from 'react-error-boundary';
import styles from './VirtualizedDataTable.module.css';

// Utility function to generate width classes
const getColumnWidthClasses = (width?: number) => {
  const columnWidth = width ?? 120;
  return {
    width: `w-[${columnWidth}px]`,
    minWidth: `min-w-[${columnWidth}px]`,
    maxWidth: `max-w-[${columnWidth}px]`
  };
};

// Generic type for table row data
interface TableRowData extends Record<string, unknown> {}

// Type for column render function with proper generic constraints
// Restrict keys to string | number for React key compatibility
interface TableColumn<T extends TableRowData = TableRowData> {
  key: Extract<keyof T, string | number>;
  label: string;
  width?: number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface VirtualizedDataTableProps<T extends TableRowData = TableRowData> {
  data: T[];
  columns: Array<TableColumn<T>>;
  height?: number;
  itemHeight?: number;
  searchable?: boolean;
  sortable?: boolean;
}

const VirtualizedDataTableError: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="cosmic-glass bg-gradient-to-br from-cosmic-red/20 to-orange-900/20 border border-cosmic-red/30 p-6 rounded-lg">
    <div className="text-center">
      <h3 className="font-bold text-cosmic-red mb-2">Data Table Error</h3>
      <p className="text-cosmic-silver/70 text-sm mb-4">
        Unable to display data table: {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-cosmic-red/20 border border-cosmic-red/50 rounded-lg text-cosmic-silver 
                   hover:bg-cosmic-red/30 transition-colors cosmic-button cosmic-focus"
      >
        Retry Loading
      </button>
    </div>
  </div>
);

// TableRow data structure for virtualized rendering - removed custom TableRow component
// Now using VirtualizedList's built-in render approach

const VirtualizedDataTable = <T extends TableRowData>({
  data = [],
  columns = [],
  height = 400,
  itemHeight = 40,
  searchable = true,
  sortable = true
}: VirtualizedDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Safe comparison function for unknown values
  const compareValues = (a: unknown, b: unknown): number => {
    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    // Convert to strings for consistent comparison
    const aStr = String(a);
    const bStr = String(b);

    // Try numeric comparison if both look like numbers
    const aNum = Number(aStr);
    const bNum = Number(bStr);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum < bNum ? -1 : aNum > bNum ? 1 : 0;
    }

    // String comparison as fallback
    return aStr.localeCompare(bStr);
  };

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filteredData = data;

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = data.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return String(value ?? '').toLowerCase().includes(lowerSearchTerm);
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        const comparison = compareValues(aValue, bValue);
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filteredData;
  }, [data, searchTerm, sortConfig, columns]);

  const handleSort = useCallback((key: string | number) => {
    if (!sortable) return;
    
    const keyStr = String(key);
    setSortConfig(current => {
      if (current?.key === keyStr) {
        return current.direction === 'asc' 
          ? { key: keyStr, direction: 'desc' }
          : null;
      }
      return { key: keyStr, direction: 'asc' };
    });
  }, [sortable]);

  const getSortIcon = (columnKey: string | number) => {
    const keyStr = String(columnKey);
    if (!sortConfig || sortConfig.key !== keyStr) {
      return <span className="ml-1 text-cosmic-silver/50">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="ml-1 text-cosmic-gold">↑</span>
      : <span className="ml-1 text-cosmic-gold">↓</span>;
  };

  if (!data.length) {
    return (
      <div className="cosmic-glass bg-gradient-to-br from-cosmic-dark/50 to-cosmic-blue/30 border border-cosmic-silver/20 p-6 text-center rounded-lg">
        <p className="text-cosmic-silver/70">No data available</p>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={VirtualizedDataTableError}>
      <div className="cosmic-glass bg-gradient-to-br from-cosmic-dark/40 to-cosmic-blue/20 border border-cosmic-silver/20 rounded-lg">
        {/* Search Input */}
        {searchable && (
          <div className="p-4 border-b border-cosmic-dark/30">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg 
                         text-cosmic-silver placeholder-cosmic-silver/50 
                         focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:border-cosmic-purple/50
                         cosmic-focus transition-colors backdrop-blur-sm"
            />
          </div>
        )}

        {/* Table Header */}
        <div className="flex items-center bg-cosmic-dark/50 border-b border-cosmic-dark/30 font-medium text-sm text-cosmic-silver backdrop-blur-sm">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`px-3 py-3 overflow-hidden text-ellipsis whitespace-nowrap ${getColumnWidthClasses(column.width).width} ${getColumnWidthClasses(column.width).minWidth} ${getColumnWidthClasses(column.width).maxWidth} ${
                sortable ? 'cursor-pointer hover:bg-cosmic-purple/20 transition-colors cosmic-button' : ''
              }`}
              onClick={() => handleSort(column.key)}
              onKeyDown={(e) => e.key === 'Enter' && handleSort(column.key)}
              tabIndex={sortable ? 0 : -1}
              role={sortable ? 'button' : undefined}
              aria-label={sortable ? `Sort by ${column.label}` : undefined}
            >
              <span className="flex items-center">
                {column.label}
                {sortable && getSortIcon(column.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Virtualized Table Body */}
        <div className="relative">
          <VirtualizedList
            items={processedData}
            itemHeight={itemHeight}
            height={height}
            width="100%"
            render={(row, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  className={`${styles.virtualizedRow} ${
                    isEven ? styles.virtualizedRowEven : styles.virtualizedRowOdd
                  }`}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const rendered = column.render ? column.render(value, row) : String(value);
                    
                    return (
                      <div
                        key={`${index}-${column.key}`}
                        className={`px-3 py-2 text-sm text-cosmic-silver overflow-hidden text-ellipsis whitespace-nowrap ${getColumnWidthClasses(column.width).width} ${getColumnWidthClasses(column.width).minWidth} ${getColumnWidthClasses(column.width).maxWidth}`}
                        title={String(value)}
                      >
                        {rendered}
                      </div>
                    );
                  })}
                </div>
              );
            }}
            ariaLabel="Data table rows"
            className="cosmic-data-table"
          />
        </div>

        {/* Footer with row count */}
        <div className="px-4 py-2 bg-cosmic-dark/30 border-t border-cosmic-dark/20 text-xs text-cosmic-silver/70 flex justify-between items-center backdrop-blur-sm">
          <span>
            Showing {processedData.length} of {data.length} rows
            {searchTerm && ` (filtered)`}
          </span>
          {processedData.length > 1000 && (
            <span className="text-cosmic-gold">
              ⚡ Virtualized for performance
            </span>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VirtualizedDataTable;
