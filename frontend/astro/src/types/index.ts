export interface BirthData {
  date: string;
  time: string;
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  datetime: string;
}

export interface AspectInterpretation {
  name: string;
  description?: string;
  keywords?: string[];
  influence?: string;
  advice?: string;
  type?: 'harmonious' | 'challenging' | 'neutral' | 'powerful';
  strength?: number;
  planets?: string[];
  icon?: string;
}

export interface AIInterpretation {
  core_identity?: AspectInterpretation[];
  life_purpose?: AspectInterpretation[];
  relationships?: AspectInterpretation[];
  career?: AspectInterpretation[];
  growth?: AspectInterpretation[];
  spiritual?: AspectInterpretation[];
  integration?: AspectInterpretation[];
  summary?: string;
  action_items?: string[];
}

export interface ChartData {
  planets: Record<string, {
    position: number;
    house: number;
    retrograde?: boolean;
    speed?: number;
  }>;
  houses: Array<{
    house: number;
    cusp: number;
    sign: string;
  }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
  interpretation?: AIInterpretation;
}

export interface TransitData {
  birth_data: BirthData;
  start_date: string;
  end_date: string;
  orb?: number;
  include_retrogrades?: boolean;
}