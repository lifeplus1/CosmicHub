// ===== CORE TYPE DEFINITIONS =====

/**
 * Zodiac signs with precise typing
 */
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

/**
 * Planet names including traditional and modern planets
 */
export type PlanetName =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'chiron'
  | 'north_node'
  | 'south_node';

/**
 * Aspect types for astrological calculations
 */
export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semi-sextile'
  | 'semi-square'
  | 'sesquiquadrate';

// ===== CORE ASTROLOGY ENTITIES =====

/**
 * Enhanced Planet interface with complete type safety
 */
// Backward compatible enhanced Planet interface 
export interface Planet {
  name: PlanetName;
  position: number; // Degree in zodiac (0-360)
  degree?: number; // Alias for position (optional, defaults to position)
  sign: ZodiacSign;
  house: number; // House number (1-12)
  retrograde?: boolean; // Optional with default false
  speed?: number; // Degrees per day - optional
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
  essential_dignity?: number; // Score from -5 to +5
  aspects?: Aspect[]; // Optional aspects array for planet-specific aspects
  // Enhanced fields for comprehensive data (optional for backward compatibility)
  element?: 'fire' | 'earth' | 'air' | 'water';
  modality?: 'cardinal' | 'fixed' | 'mutable';
  house_position?: 'early' | 'middle' | 'late'; // Position within house
}

/**
 * Enhanced House interface with precise type constraints
 */
// Enhanced House interface with comprehensive astrological data (backward compatible)
export interface House {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  cusp: number; // Degree position (0-360)
  sign: ZodiacSign;
  // Enhanced fields for comprehensive house data (optional for backward compatibility)
  ruler?: PlanetName; // Traditional ruler of the house sign
  modern_ruler?: PlanetName; // Modern ruler (for Aquarius, Scorpio, Pisces)
  degree?: number; // Alias for cusp for compatibility
  size?: number; // House size in degrees (optional)
  contains_planets?: PlanetName[]; // Planets contained in this house
}

/**
 * Enhanced Aspect interface with comprehensive aspect data (backward compatible)
 */
export interface Aspect {
  aspect_type: AspectType;
  planet1: PlanetName;
  planet2: PlanetName;
  orb: number;
  applying: boolean;
  exact?: boolean; // Optional with computed default
  power?: number; // Strength of the aspect (0-1) - optional with computed default
  // Enhanced fields for comprehensive aspect analysis (optional for backward compatibility)
  aspect_angle?: number; // Exact angle of the aspect (e.g., 120 for trine)
  separating?: boolean; // Whether aspect is separating
  mutual_reception?: boolean; // If planets are in mutual reception
  dignity_interaction?: 'enhancement' | 'conflict' | 'neutral';
  timing?: {
    peak_exact?: string; // ISO date when aspect becomes exact
    duration_days?: number; // How long aspect remains in orb
  };
}

/**
 * Enhanced Chart angles with comprehensive metadata
 */
export interface ChartAngles {
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumcoeli: number;
  vertex?: number;
  antivertex?: number;
  part_of_fortune?: number;
  // Enhanced fields for comprehensive angle analysis
  north_node?: number;
  south_node?: number;
  lilith_mean?: number; // Mean Lilith (Black Moon)
  lilith_true?: number; // True/Oscillating Lilith
  chiron?: number;
  // Metadata for angles
  house_system?: 'placidus' | 'koch' | 'equal' | 'whole_sign' | 'regiomontanus' | 'campanus' | 'porphyry';
  angles_calculated_at?: string; // ISO timestamp
}

/**
 * Legacy interfaces for backward compatibility
 * @deprecated Use Planet interface instead
 */
export interface Asteroid {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

/**
 * @deprecated Use ChartAngles interface instead
 */
export interface Angle {
  name: string;
  sign: string;
  degree: number;
  position: number;
}

// Enhanced Type Bridge System: AstrologyChart aligned with comprehensive ChartSchema
export interface AstrologyChart {
  planets: Record<string, {
    name: string;
    position: number;
    degree: number;
    sign: string;
    house: number;
    retrograde: boolean;
    speed: number;
    dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
    essential_dignity?: number;
    aspects?: Array<{
      aspect_type: string;
      planet1: string;
      planet2: string;
      orb: number;
      applying: boolean;
      exact: boolean;
      power: number;
      aspect_angle: number;
      separating?: boolean;
      mutual_reception?: boolean;
      dignity_interaction?: 'enhancement' | 'conflict' | 'neutral';
      timing?: {
        peak_exact?: string;
        duration_days?: number;
      };
    }>;
    element?: 'fire' | 'earth' | 'air' | 'water';
    modality?: 'cardinal' | 'fixed' | 'mutable';
    house_position?: 'early' | 'middle' | 'late';
  }>;
  houses: Array<{
    number: number;
    cusp: number;
    sign: string;
    ruler: string;
    modern_ruler?: string;
    degree: number;
    size: number;
    contains_planets?: string[];
  }>;
  aspects: Array<{
    aspect_type: string;
    planet1: string;
    planet2: string;
    orb: number;
    applying: boolean;
    exact: boolean;
    power: number;
    aspect_angle: number;
    separating?: boolean;
    mutual_reception?: boolean;
    dignity_interaction?: 'enhancement' | 'conflict' | 'neutral';
    timing?: {
      peak_exact?: string;
      duration_days?: number;
    };
  }>;
  asteroids?: Record<string, {
    name: string;
    position: number;
    degree: number;
    sign: string;
    house: number;
    retrograde: boolean;
    speed: number;
  }>;
  points?: Record<string, {
    name: string;
    position: number;
    degree: number;
    sign: string;
    house: number;
    retrograde: boolean;
    speed: number;
  }>;
  angles: {
    ascendant: number;
    midheaven: number;
    descendant: number;
    imumcoeli: number;
    vertex?: number;
    antivertex?: number;
    part_of_fortune?: number;
    north_node?: number;
    south_node?: number;
    lilith_mean?: number;
    lilith_true?: number;
    chiron?: number;
    house_system?: 'placidus' | 'koch' | 'equal' | 'whole_sign' | 'regiomontanus' | 'campanus' | 'porphyry';
    angles_calculated_at?: string;
  };
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  house_system: 'placidus' | 'koch' | 'equal' | 'whole_sign' | 'regiomontanus' | 'campanus' | 'porphyry';
  sidereal?: {
    ayanamsa: 'lahiri' | 'raman' | 'krishnamurti' | 'fagan_bradley';
    offset: number;
  };
  chart_metadata?: {
    calculation_timestamp: string;
    ephemeris_source: 'swiss' | 'jpl' | 'moshier';
    coordinate_system: 'tropical' | 'sidereal';
    house_system_details?: {
      obliquity?: number;
      mean_node?: boolean;
    };
    location_metadata?: {
      place_name?: string;
      country?: string;
      altitude?: number;
      dst_offset?: number;
    };
  };
  chart_patterns?: {
    grand_trines?: Array<{
      element: 'fire' | 'earth' | 'air' | 'water';
      planets: [string, string, string];
      strength: number;
    }>;
    t_squares?: Array<{
      focal_planet: string;
      opposition_planets: [string, string];
      strength: number;
    }>;
    stelliums?: Array<{
      sign?: string;
      house?: number;
      planets: string[];
      concentration_strength: number;
    }>;
  };
}

// ===== APP-SPECIFIC DATA VARIANTS =====
// These provide alternative structures for different use cases

export interface PlanetData {
  name: string;
  sign: string;
  house: number; // number instead of string
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface AsteroidData {
  name: string;
  sign: string;
  house: number; // number instead of string
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface AngleData {
  name: string;
  sign: string;
  degree: number;
}

export interface HouseData {
  number: number;
  sign: string;
  cusp: number;
  planets: string[];
}

/**
 * Unified AspectData interface - consolidates all AspectData definitions across the application
 * This serves as the authoritative AspectData definition for the entire application
 */
export interface UnifiedAspectData {
  // Core aspect information
  planet1?: PlanetName;
  planet2?: PlanetName;
  point1?: string; // For multi-system charts
  point2?: string; // For multi-system charts
  type?: AspectType;
  aspect_type?: AspectType;
  aspect?: AspectType;
  orb: number;
  applying?: boolean;
  exact?: boolean;
  strength?: 'weak' | 'moderate' | 'strong' | 'very_strong';

  // Optional enhanced fields
  exactness?: number;
  separating?: boolean;
  mutual_reception?: boolean;
  dignity_interaction?: 'enhancement' | 'conflict' | 'neutral';
  point1_sign?: ZodiacSign;
  point2_sign?: ZodiacSign;
  point1_house?: number;
  point2_house?: number;

  // Legacy string fields for backward compatibility
  planet1_str?: string;
  planet2_str?: string;
  type_str?: string;
  aspect_type_str?: string;
  aspect_str?: string;
  point1_sign_str?: string;
  point2_sign_str?: string;

  // Timing information
  timing?: {
    peak_exact?: string;
    duration_days?: number;
  };
}

/**
 * Legacy AspectData interface for backward compatibility
 * @deprecated Use UnifiedAspectData interface instead
 */
export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean; // boolean instead of string
}

/**
 * Simple AspectData for basic frontend operations
 */
export type SimpleAspectData = Pick<UnifiedAspectData, 'planet1' | 'planet2' | 'type' | 'orb' | 'applying'>;

/**
 * Rich AspectData for detailed astrological analysis
 */
export type RichAspectData = Omit<UnifiedAspectData, 'point1' | 'point2' | 'point1_sign' | 'point2_sign' | 'point1_house' | 'point2_house' | 'planet1_str' | 'planet2_str' | 'type_str' | 'aspect_type_str' | 'aspect_str' | 'point1_sign_str' | 'point2_sign_str'>;

/**
 * Multi-system AspectData for complex chart analysis
 */
export type MultiSystemAspectData = Pick<UnifiedAspectData, 'point1' | 'point2' | 'aspect' | 'orb' | 'exact' | 'point1_sign' | 'point2_sign' | 'point1_house' | 'point2_house' | 'strength'>;

/**
 * Storage AspectData for serialization
 */
export type StorageAspectData = Pick<UnifiedAspectData, 'point1' | 'point2' | 'aspect' | 'orb'>;

/**
 * Unified ChartData interface - consolidates all ChartData definitions across the application
 * This serves as the authoritative ChartData definition for the entire application
 */
export interface UnifiedChartData {
  // Core required fields
  planets: Record<PlanetName, Planet>;
  houses: House[];
  aspects: Aspect[];
  angles: ChartAngles;

  // Optional extended fields
  asteroids?: Record<string, Planet>;
  points?: Record<string, Planet>;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
  house_system?: 
    | 'placidus'
    | 'koch'
    | 'equal'
    | 'whole_sign'
    | 'regiomontanus'
    | 'campanus'
    | 'porphyry';
  sidereal?: {
    ayanamsa: 'lahiri' | 'raman' | 'krishnamurti' | 'fagan_bradley';
    offset: number;
  };

  // Enhanced metadata for comprehensive chart analysis
  chart_metadata?: {
    calculation_timestamp: string;
    ephemeris_source: 'swiss' | 'jpl' | 'moshier';
    coordinate_system: 'tropical' | 'sidereal';
    house_system_details?: {
      obliquity?: number;
      mean_node?: boolean;
    };
    location_metadata?: {
      place_name?: string;
      country?: string;
      altitude?: number;
      dst_offset?: number;
    };
  };

  // Pattern analysis enhancements
  chart_patterns?: {
    grand_trines?: Array<{
      element: 'fire' | 'earth' | 'air' | 'water';
      planets: [PlanetName, PlanetName, PlanetName];
      strength: number;
    }>;
    t_squares?: Array<{
      focal_planet: PlanetName;
      opposition_planets: [PlanetName, PlanetName];
      strength: number;
    }>;
    stelliums?: Array<{
      sign?: ZodiacSign;
      house?: number;
      planets: PlanetName[];
      concentration_strength: number;
    }>;
  };

  // AI interpretation (for frontend display)
  interpretation?: {
    summary?: string;
    action_items?: string[];
  };
}

/**
 * Legacy ChartData interface for backward compatibility
 * @deprecated Use UnifiedChartData interface instead
 */
export type ChartData = UnifiedChartData;

/**
 * Simplified ChartData for basic frontend operations
 */
export type SimpleChartData = Pick<UnifiedChartData, 'planets' | 'houses' | 'aspects' | 'angles' | 'interpretation'>;

/**
 * Minimal ChartData for validation purposes
 */
export type ValidationChartData = Pick<UnifiedChartData, 'planets' | 'houses' | 'aspects'>;

/**
 * ChartData for storage operations
 */
export type StorageChartData = Omit<UnifiedChartData, 'interpretation'>;

// ===== CHART TYPES =====

export type ChartType = 'natal' | 'transit' | 'synastry';

// ===== USER AND PROFILE DATA =====

export interface UserProfile {
  userId: string;
  birthData: {
    date: string;
    time: string;
    location: string;
  };
  // Enhanced fields for comprehensive user profiles (optional for backward compatibility)
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Healwave-specific
  avatar?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'friends' | 'private';
    showBirthTime?: boolean;
    showLocation?: boolean;
    allowDataSharing?: boolean;
  };
  preferences?: {
    units?: 'metric' | 'imperial';
    dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat?: '12h' | '24h';
    zodiacSystem?: 'tropical' | 'sidereal';
    houseSystem?: 'placidus' | 'koch' | 'equal' | 'whole_sign';
    aspectOrbs?: Record<string, number>;
  };
  wellness?: {
    goals?: string[];
    practices?: string[];
    meditationMinutes?: number;
    sleepHours?: number;
    stressLevel?: 1 | 2 | 3 | 4 | 5;
    mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  };
  subscription?: {
    tier?: 'free' | 'premium' | 'elite';
    status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
    renewalDate?: string;
    features?: string[];
  };
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    lastActiveAt?: string;
    signupSource?: string;
    referralCode?: string;
  };
  social?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  // Healwave-specific fields
  dateOfBirth?: string | null;
  occupation?: string | null;
  experienceLevel?: string | null;
  primaryGoals?: string | null;
  healthConditions?: string | null;
  meditationExperience?: string | null;
  preferredSessionLength?: string | null;
  notificationPreferences?: {
    sessionReminders?: boolean;
    weeklyProgress?: boolean;
    newFrequencies?: boolean;
    healthTips?: boolean;
  };
  profileCompleted?: boolean;
  privacyConsentGiven?: boolean;
  privacyConsentDate?: string;
  healthDisclaimerAccepted?: boolean;
  healthDisclaimerDate?: string;
  hasCompletedOnboarding?: boolean;
  totalSessionsCompleted?: number;
  totalListeningMinutes?: number;
  favoriteFrequencies?: string[];
  moodTrackingEnabled?: boolean;
  progressTrackingEnabled?: boolean;
  reminderSettings?: {
    enabled?: boolean;
    frequency?: string;
    preferredTime?: string;
  };
}

export interface NumerologyData {
  lifePath: number;
  destiny: number;
  personalYear: number;
}

/**
 * Unified TransitData interface - consolidates all TransitData definitions across the application
 * This serves as the authoritative TransitData definition for the entire application
 */
export interface UnifiedTransitData {
  // Core transit information
  planet: PlanetName;
  sign: ZodiacSign;
  house: number;
  degree: number;

  // Optional transit-specific fields
  aspect?: AspectType | {
    type: AspectType;
    targetPlanet: PlanetName;
    orb: number;
  };
  isSignificant?: boolean;
  element?: 'fire' | 'earth' | 'air' | 'water';
  dignity?: 'domicile' | 'exaltation' | 'detriment' | 'fall';
  modality?: 'cardinal' | 'fixed' | 'mutable';
  strength?: number;
  applying?: boolean;
  exact?: boolean;
  orb?: number;
  natalPlanet?: PlanetName;
  type?: 'major' | 'minor';

  // Date range for transit calculations (simple transit data)
  birth_data?: import('./birth').UnifiedBirthData;
  start_date?: string;
  end_date?: string;
  include_retrogrades?: boolean;

  // Mobile-specific fields
  transitDate?: string;
  currentTransits?: UnifiedTransitData[];
  significantTransits?: UnifiedTransitData[];
  nextMajorTransits?: UnifiedTransitData[];
  lastCalculated?: string;
}

/**
 * Legacy TransitData interface for backward compatibility
 * @deprecated Use UnifiedTransitData interface instead
 */
export type TransitData = UnifiedTransitData;

/**
 * Simple TransitData for basic frontend operations
 */
export type SimpleTransitData = Pick<UnifiedTransitData, 'planet' | 'sign' | 'house' | 'degree' | 'aspect' | 'isSignificant'>;

/**
 * Rich TransitData for detailed astrological analysis
 */
export type RichTransitData = Omit<UnifiedTransitData, 'birth_data' | 'start_date' | 'end_date' | 'include_retrogrades' | 'transitDate' | 'currentTransits' | 'significantTransits' | 'nextMajorTransits' | 'lastCalculated'>;

/**
 * Mobile TransitData for mobile app operations
 */
export type MobileTransitData = Pick<UnifiedTransitData, 'transitDate' | 'currentTransits' | 'significantTransits' | 'nextMajorTransits' | 'lastCalculated'>;
