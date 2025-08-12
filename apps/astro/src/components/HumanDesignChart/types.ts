export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

export interface Gate {
  number: number;
  line: number;
  name: string;
  center: string;
  planet: string;
  planet_symbol: string;
  type: 'personality' | 'design';
  position: number;
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

export interface Profile {
  number: string;
  personality_line: number;
  design_line: number;
  description: string;
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
  profile: Profile;
  defined_centers: string[];
  undefined_centers: string[];
  channels: (string | Channel)[];
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
  birthData?: BirthData;
  onCalculate?: (data: BirthData) => void;
  onHumanDesignCalculated?: (data: HumanDesignData) => void;
}

export interface TabProps {
  humanDesignData: HumanDesignData;
}
