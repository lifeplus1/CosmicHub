export interface MultiSystemChartData {
  birth_info?: {
    date?: string;
    time?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
  };
  western_tropical?: {
    planets: Record<string, { position: number; retrograde?: boolean }>;
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
  };
  vedic_sidereal?: {
    description?: string;
    ayanamsa?: number;
    analysis?: { moon_sign?: string; analysis?: string };
    planets?: Record<
      string,
      { vedic_sign?: string; nakshatra?: { name?: string; pada?: string } }
    >;
  };
  chinese?: {
    description?: string;
    year?: { animal?: string; element?: string; traits?: string };
    month?: { animal?: string };
    day?: { animal?: string };
    hour?: { animal?: string };
    four_pillars?: string;
    elements_analysis?: { analysis?: string };
    personality_summary?: string;
  };
  mayan?: {
    description?: string;
    day_sign?: {
      symbol?: string;
      name?: string;
      meaning?: string;
      color?: string;
    };
    sacred_number?: { number?: number; meaning?: string };
    galactic_signature?: string;
    wavespell?: {
      tone?: { name?: string };
      position?: number;
      description?: string;
    };
    long_count?: { date?: string };
    life_purpose?: string;
    spiritual_guidance?: string;
  };
  uranian?: {
    description?: string;
    uranian_planets?: Record<
      string,
      { symbol?: string; position?: number; meaning?: string }
    >;
    dial_aspects?: Array<{
      body1?: string;
      body2?: string;
      angle?: number;
      orb?: number;
      meaning?: string;
    }>;
  };
  synthesis?: {
    primary_themes?: string[];
    life_purpose?: string[];
    personality_integration?: Record<string, string[]>;
    spiritual_path?: string[];
  };
}

export interface WesternChartData {
  planets: Record<string, { position: number; retrograde?: boolean }>;
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
}

export interface VedicChartData {
  description?: string;
  ayanamsa?: number;
  analysis?: { moon_sign?: string; analysis?: string };
  planets?: Record<
    string,
    { vedic_sign?: string; nakshatra?: { name?: string; pada?: string } }
  >;
}

export interface ChineseChartData {
  description?: string;
  year?: { animal?: string; element?: string; traits?: string };
  month?: { animal?: string };
  day?: { animal?: string };
  hour?: { animal?: string };
  four_pillars?: string;
  elements_analysis?: { analysis?: string };
  personality_summary?: string;
}

export interface MayanChartData {
  description?: string;
  day_sign?: {
    symbol?: string;
    name?: string;
    meaning?: string;
    color?: string;
  };
  sacred_number?: { number?: number; meaning?: string };
  galactic_signature?: string;
  wavespell?: {
    tone?: { name?: string };
    position?: number;
    description?: string;
  };
  long_count?: { date?: string };
  life_purpose?: string;
  spiritual_guidance?: string;
}

export interface UranianChartData {
  description?: string;
  uranian_planets?: Record<
    string,
    { symbol?: string; position?: number; meaning?: string }
  >;
  dial_aspects?: Array<{
    body1?: string;
    body2?: string;
    angle?: number;
    orb?: number;
    meaning?: string;
  }>;
}

export interface SynthesisChartData {
  primary_themes?: string[];
  life_purpose?: string[];
  personality_integration?: Record<string, string[]>;
  spiritual_path?: string[];
}
