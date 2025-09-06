import type { ComponentType } from 'react';

// Import from the correct package path since this is in config package
interface ChartBirthData {
  birth_date: string;
  birth_time: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  city?: string;
}

type ChartType = 'natal' | 'transit' | 'synastry' | 'composite' | 'return';

// Base interface for component modules with proper generic constraints
export interface LazyLoadedModule<TProps = Record<string, unknown>> {
  default: ComponentType<TProps>;
  [key: string]: unknown;
}

// Specific prop interfaces for each component type
export interface AstrologyChartProps {
  birthData: ChartBirthData;
  chartType: ChartType;
  showAspects?: boolean;
  showHouses?: boolean;
  theme?: 'light' | 'dark' | 'cosmic';
}

export interface FrequencyVisualizerProps {
  frequencies: Array<{ hz: number; amplitude: number; label?: string }>;
  visualMode: 'wave' | 'spectrum' | 'circle';
  isPlaying: boolean;
  color?: string;
}

export interface TransitChartProps {
  natalChart: ChartBirthData;
  transitDate: Date;
  showRetrogrades?: boolean;
  aspectOrbs?: Record<string, number>;
}

export interface SynastryChartProps {
  person1Data: ChartBirthData;
  person2Data: ChartBirthData;
  showCompositeAspects?: boolean;
  relationshipType?: 'romantic' | 'friendship' | 'business';
}

export interface BiofeedbackChartProps {
  sessionData: {
    heartRate: number[];
    brainwaves: Record<string, number[]>;
    timestamp: Date[];
  };
  displayMode: 'realtime' | 'historical';
}

export interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ChartBirthData;
  modalType: 'view' | 'edit' | 'share';
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Record<string, unknown>;
  onSave: (settings: Record<string, unknown>) => void;
}

export interface FrequencyPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset?: string;
  frequencies: number[];
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: 'view' | 'edit';
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    type: 'chart' | 'interpretation' | 'frequency';
    id: string;
    title: string;
  };
}

export interface AdvancedFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  schema: Record<string, { type: string; required?: boolean }>;
}

export interface FrequencyFormProps {
  onSubmit: (frequencies: number[]) => void;
  initialFrequencies?: number[];
  presets?: Array<{ name: string; frequencies: number[] }>;
}

export interface BirthDataFormProps {
  onSubmit: (birthData: ChartBirthData) => void;
  initialData?: Partial<ChartBirthData>;
  showValidation?: boolean;
}

export interface AnalyticsPanelProps {
  dateRange: { start: Date; end: Date };
  metrics: string[];
  chartTypes: string[];
}

export interface ReportGeneratorProps {
  chartData: ChartBirthData;
  reportType: 'natal' | 'transit' | 'synastry' | 'psychological';
  options: Record<string, boolean>;
}

export interface ExportToolsProps {
  data: unknown;
  formats: Array<'pdf' | 'csv' | 'json' | 'image'>;
  filename?: string;
}

export interface EphemerisCalculatorProps {
  startDate: Date;
  endDate: Date;
  planets: string[];
  coordinates?: { latitude: number; longitude: number };
}

export interface GeneKeysCalculatorProps {
  birthData: ChartBirthData;
  showDetailed?: boolean;
  includeLines?: boolean;
}

export interface FrequencyCalculatorProps {
  baseFrequency: number;
  ratios: number[];
  temperament?: 'equal' | 'just' | 'pythagorean';
}

// Enhanced props map with specific interfaces
export interface LazyComponentPropsMap {
  'astrology-chart': AstrologyChartProps;
  'frequency-visualizer': FrequencyVisualizerProps;
  'transit-chart': TransitChartProps;
  'synastry-chart': SynastryChartProps;
  'biofeedback-chart': BiofeedbackChartProps;
  'chart-modal': ChartModalProps;
  'settings-modal': SettingsModalProps;
  'frequency-player-modal': FrequencyPlayerModalProps;
  'profile-modal': ProfileModalProps;
  'share-modal': ShareModalProps;
  'advanced-form': AdvancedFormProps;
  'frequency-form': FrequencyFormProps;
  'birth-data-form': BirthDataFormProps;
  'analytics-panel': AnalyticsPanelProps;
  'report-generator': ReportGeneratorProps;
  'export-tools': ExportToolsProps;
  'ephemeris-calculator': EphemerisCalculatorProps;
  'gene-keys-calculator': GeneKeysCalculatorProps;
  'frequency-calculator': FrequencyCalculatorProps;
}

// Component registry keys type
export type ComponentRegistryKeys = keyof LazyComponentPropsMap;
