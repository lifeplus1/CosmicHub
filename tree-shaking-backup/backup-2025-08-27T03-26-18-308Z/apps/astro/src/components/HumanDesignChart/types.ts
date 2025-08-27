// Use shared unified birth data type (alias) from types package
import type { ChartBirthData } from '@cosmichub/types';

export interface Gate {
  number: number;
  name: string;
  description?: string;
  line?: number;
  center?: string;
  type?: 'personality' | 'design';
  planet?: string;
  planet_symbol?: string;
}

export interface Channel {
  gate1: number;
  gate2: number;
  name: string;
  description?: string;
}

export interface Variables {
  description: string;
  digestion: string;
  environment: string;
  awareness: string;
  perspective: string;
}

export interface HumanDesignData {
  birth_info?: {
    conscious_time: string;
    unconscious_time: string;
    location: {
      latitude: number;
      longitude: number;
      timezone: string;
    };
  };
  type: string;
  strategy: string;
  authority: string;
  profile: {
    line1: number;
    line2: number;
    description: string;
    personality_line?: number;
    design_line?: number;
  };
  defined_centers: string[];
  undefined_centers: string[];
  channels: Channel[];
  gates: Gate[];
  incarnation_cross: {
    name: string;
    description: string;
    gates: Record<string, number>;
  };
  variables: Variables;
  not_self_theme: string;
  signature: string;
}

export interface HumanDesignChartProps {
  birthData?: ChartBirthData;
  onCalculate?: (data: ChartBirthData) => void;
  onHumanDesignCalculated?: (data: HumanDesignData) => void;
}

export interface TabProps {
  humanDesignData: HumanDesignData;
}
