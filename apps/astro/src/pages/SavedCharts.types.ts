/**
 * Type definitions for SavedCharts component
 * Provides specific, descriptive types for table data and rendering
 */

import type { JSX } from 'react';
import type { SavedChart as ApiSavedChart } from '../services/api';

// Core saved chart data structure
export interface SavedChart {
  id: string;
  name: string;
  chart_type: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  notes?: string;
  tags?: string[];
  is_public?: boolean;
}

// Enhanced table row for virtualized display
export interface SavedChartTableRow {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chart_type: string;
  created_at: string;
  _originalChart: ApiSavedChart;
  // Index signature for compatibility with table component
  [key: string]: string | ApiSavedChart;
}

// Table column render function signature
export type TableCellRenderer<TKey extends keyof SavedChartTableRow> = (
  value: SavedChartTableRow[TKey],
  row: SavedChartTableRow
) => JSX.Element;

// Individual column definition
export interface TableColumnDefinition<TKey extends keyof SavedChartTableRow> {
  key: TKey;
  label: string;
  width: number;
  render: TableCellRenderer<TKey>;
}

// Complete table configuration
export type ChartTableColumns = Array<
  TableColumnDefinition<keyof SavedChartTableRow>
>;

// Action button props
export interface ChartActionButtonProps {
  chart: SavedChart;
  onView: (chart: SavedChart) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

// Chart operations
export interface ChartOperations {
  handleViewChart: (chart: SavedChart) => void;
  handleDeleteChart: (id: string, name: string) => void;
  handleEditChart?: (chart: SavedChart) => void;
  handleDuplicateChart?: (chart: SavedChart) => void;
  handleExportChart?: (chart: SavedChart) => void;
}

// Filter and search state
export interface ChartFilters {
  searchTerm: string;
  chartType: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  tags: string[];
}

// Sort configuration
export interface ChartSortConfig {
  field: keyof SavedChart;
  direction: 'asc' | 'desc';
}

// Bulk operations
export interface BulkOperations {
  selectedCharts: Set<string>;
  onSelectChart: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkExport?: (ids: string[]) => void;
  onBulkTag?: (ids: string[], tags: string[]) => void;
}

// Error states
export interface ChartError {
  type: 'load' | 'delete' | 'view' | 'network';
  message: string;
  chartId?: string;
  timestamp: Date;
}

// Loading states
export interface LoadingStates {
  isLoadingCharts: boolean;
  isDeletingChart: boolean;
  isExportingChart: boolean;
  processingChartId?: string;
}

// Chart metadata for enhanced display
export interface ChartMetadata {
  totalCharts: number;
  chartTypes: Record<string, number>;
  dateRange: {
    earliest: string;
    latest: string;
  };
  recentlyViewed: string[];
  favoriteCharts: string[];
}

// Component state interface
export interface SavedChartsState {
  charts: SavedChart[];
  filteredCharts: SavedChart[];
  filters: ChartFilters;
  sortConfig: ChartSortConfig;
  loading: LoadingStates;
  error: ChartError | null;
  metadata: ChartMetadata;
  bulkOperations?: BulkOperations;
}

// Props for the main SavedCharts component
export interface SavedChartsProps {
  initialFilters?: Partial<ChartFilters>;
  enableBulkOperations?: boolean;
  showMetadata?: boolean;
  onChartSelect?: (chart: SavedChart) => void;
  onChartView?: (chart: SavedChart) => void;
  maxDisplayCharts?: number;
}

// Utility type for chart transformations
export type ChartTransformer<TInput, TOutput> = (input: TInput) => TOutput;

// Chart validation result
export interface ChartValidationResult {
  isValid: boolean;
  errors: Array<{
    field: keyof SavedChart;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: string[];
}

// Export utilities
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeMetadata: boolean;
  includeNotes: boolean;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  downloadUrl?: string;
  error?: string;
}
