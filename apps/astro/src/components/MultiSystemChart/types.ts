import type { 
  TCMConstitutionType, 
  WuXingElement, 
  MeridianFlowData, 
  MBTIResult, 
  EnneagramResult,
  MultiSystemAspectData,
  HouseData as BaseHouseData,
  AngleData as BaseAngleData
} from '@cosmichub/types';

// ============================================================================
// CHART DATA STATE TYPES - Using discriminated unions for better type safety
// ============================================================================

export interface LoadingChartState {
  status: 'loading';
  progress: number;
  currentStep: string;
  birth_info: BirthInfo;
}

export interface LoadedChartState {
  status: 'loaded';
  birth_info: BirthInfo;
  western_tropical: WesternChartData;
  vedic_sidereal?: VedicChartData;
  chinese?: ChineseChartData;
  mayan?: MayanChartData;
  uranian?: UranianChartData;
  synthesis?: SynthesisChartData;
  spiritual_systems?: SpiritualSystemsData;
  tcm?: TCMChartData;
  psychology?: PsychologyChartData;
  lastUpdated: Date;
}

export interface ErrorChartState {
  status: 'error';
  birth_info: BirthInfo;
  error: ChartError;
  retryAttempts: number;
  lastAttempt: Date;
}

export interface InitialChartState {
  status: 'initial';
}

export type MultiSystemChartData = 
  | InitialChartState 
  | LoadingChartState 
  | LoadedChartState 
  | ErrorChartState;

// ============================================================================
// CORE DATA INTERFACES
// ============================================================================

export interface BirthInfo {
  date: string;
  time: string;
  location: LocationData;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
  country?: string;
}

export interface ChartError {
  type: 'calculation' | 'network' | 'validation' | 'timeout';
  message: string;
  details?: ChartErrorDetails;
  recoverable: boolean;
}

export interface ChartErrorDetails {
  statusCode?: number;
  endpoint?: string;
  requestId?: string;
  validationErrors?: string[];
  retryAfter?: number;
  context?: {
    action: string;
    timestamp: Date;
    userInput?: BirthInfo;
  };
}

// ============================================================================
// PLANETARY POSITION INTERFACES
// ============================================================================

export interface PlanetaryPosition {
  position: number;
  retrograde: boolean;
  sign?: string;
  house?: number;
  degree: number;
}

export type AspectData = MultiSystemAspectData;

export type AspectType = 
  | 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
  | 'quincunx' | 'semi-sextile' | 'semi-square' | 'sesquiquadrate';

// ============================================================================
// SYSTEM-SPECIFIC DATA INTERFACES
// ============================================================================

export interface WesternChartData {
  planets: Record<string, PlanetaryPosition>;
  aspects: AspectData[];
  houses: HouseData[];
  angles: AngleData[];
  calculation_metadata: CalculationMetadata;
}

export interface HouseData extends BaseHouseData {
  ruler: string;
}

export interface AngleData extends BaseAngleData {
  name: 'AC' | 'MC' | 'DC' | 'IC';
}

export interface CalculationMetadata {
  house_system: 'placidus' | 'koch' | 'equal' | 'whole';
  coordinate_system: 'geocentric' | 'topocentric';
  ephemeris_version: string;
  calculated_at: Date;
}

export interface VedicChartData {
  description: string;
  ayanamsa: number;
  analysis: VedicAnalysis;
  planets: Record<string, VedicPlanetData>;
  divisional_charts?: VedicDivisionalCharts;
}

export interface VedicDivisionalCharts {
  navamsa?: VedicDivisionalChart;
  dashamsa?: VedicDivisionalChart;
  dwadashamsa?: VedicDivisionalChart;
  shodashamsa?: VedicDivisionalChart;
  vimshamsa?: VedicDivisionalChart;
  chaturvimshamsa?: VedicDivisionalChart;
  bhamsa?: VedicDivisionalChart;
  khavedamsa?: VedicDivisionalChart;
  akshavedamsa?: VedicDivisionalChart;
  shashtyamsa?: VedicDivisionalChart;
}

export interface VedicDivisionalChart {
  name: string;
  description: string;
  planets: Record<string, VedicDivisionalPlanetData>;
  houses: VedicHouseData[];
  analysis: string;
}

export interface VedicDivisionalPlanetData {
  sign: string;
  house: number;
  degrees: number;
  dignity: 'exalted' | 'own' | 'neutral' | 'debilitated';
  aspectsReceived: string[];
  aspectsGiven: string[];
}

export interface VedicHouseData {
  number: number;
  sign: string;
  lord: string;
  planets: string[];
  strength: number;
}

export interface VedicAnalysis {
  moon_sign: string;
  analysis: string;
  strength_analysis?: string;
}

export interface VedicPlanetData {
  vedic_sign: string;
  nakshatra: NakshatraData;
  dignity: 'exalted' | 'own' | 'neutral' | 'debilitated';
}

export interface NakshatraData {
  name: string;
  pada: string;
  ruler: string;
  deity?: string;
}

export interface ChineseChartData {
  description: string;
  year: ChineseAnimalData;
  month: ChineseAnimalData;
  day: ChineseAnimalData;
  hour: ChineseAnimalData;
  four_pillars: string;
  elements_analysis: ElementsAnalysis;
  personality_summary: string;
}

export interface ChineseAnimalData {
  animal: string;
  element: string;
  traits: string;
  compatibility?: string[];
}

export interface ElementsAnalysis {
  dominant_element: string;
  element_balance: Record<string, number>;
  analysis: string;
}

export interface MayanChartData {
  description: string;
  day_sign: MayanDaySign;
  sacred_number: SacredNumber;
  galactic_signature: string;
  wavespell: WavespellData;
  long_count: LongCountData;
  life_purpose: string;
  spiritual_guidance: string;
}

export interface MayanDaySign {
  symbol: string;
  name: string;
  meaning: string;
  color: string;
  direction?: string;
}

export interface SacredNumber {
  number: number;
  meaning: string;
  energy: string;
}

export interface WavespellData {
  tone: ToneData;
  position: number;
  description: string;
}

export interface ToneData {
  name: string;
  number: number;
  purpose: string;
}

export interface LongCountData {
  date: string;
  baktun: number;
  katun: number;
  tun: number;
  uinal: number;
  kin: number;
}

export interface UranianChartData {
  description: string;
  uranian_planets: Record<string, UranianPlanetData>;
  dial_aspects: DialAspectData[];
  midpoint_structures?: MidpointStructure[];
}

export interface UranianPlanetData {
  symbol: string;
  position: number;
  meaning: string;
  keywords: string[];
}

export interface DialAspectData {
  body1: string;
  body2: string;
  angle: number;
  orb: number;
  meaning: string;
  strength: number;
}

export interface MidpointStructure {
  midpoint: string;
  planet: string;
  orb: number;
  interpretation: string;
}

export interface SynthesisChartData {
  primary_themes: ThemeData[];
  life_purpose: string[];
  personality_integration: Record<string, IntegrationData>;
  spiritual_path: PathData[];
  timing_indicators: TimingData[];
}

export interface ThemeData {
  theme: string;
  strength: number;
  systems: string[];
  description: string;
}

export interface IntegrationData {
  areas: string[];
  challenges: string[];
  recommendations: string[];
}

export interface PathData {
  path: string;
  stage: 'initiation' | 'development' | 'mastery';
  indicators: string[];
  practices: string[];
}

export interface TimingData {
  period: string;
  themes: string[];
  opportunities: string[];
  challenges: string[];
}

// ============================================================================
// SPIRITUAL SYSTEMS INTERFACES
// ============================================================================

export interface SpiritualSystemsData {
  description: string;
  tarot: TarotSystemData;
  kabbalah: KabbalahSystemData;
  correspondences: CorrespondenceSystemData;
  synthesis: SpiritualSynthesisData;
  ai_interpretation?: SpiritualAIInterpretation;
}

export interface TarotSystemData {
  daily_card: TarotCardData;
  life_path: LifePathCardData;
  suits: SuitStrengthData[];
  elemental_balance: Record<string, number>;
}

export interface TarotCardData {
  name: string;
  suit: string;
  number?: number;
  meaning: string;
  reversed: boolean;
  arcana: 'major' | 'minor';
  upright_meaning: string;
  reversed_meaning: string;
  astrological_correlation: string;
  keywords: string[];
  // Extended properties for spiritual correspondences
  hebrew_letter?: string;
  astrology?: string;
  tree_path?: number;
  connects?: string;
  secondary_influence?: TarotCardData;
  sephirah?: string;
}

export interface LifePathCardData {
  card: string;
  meaning: string;
  guidance: string;
  shadow_work: string;
}

export interface SuitStrengthData {
  name: string;
  element: string;
  themes: string[];
  strength: number;
}

export interface KabbalahSystemData {
  primary_sephirah: SephirahData;
  secondary_sephirah: SephirahData;
  relevant_paths: KabbalahPathData[];
  spiritual_focus: string;
  tree_guidance: string;
}

export interface SephirahData {
  name: string;
  hebrew_name: string;
  planetary_association: string;
  meaning: string;
  path_guidance: string;
  sphere_number: number;
  // Extended properties for spiritual chart component
  english?: string;
  position?: number | string;
  activation_level?: number | string;
  meditation_focus?: string;
  hebrew?: string;
  astrology?: string;
  element?: string;
  gematria?: number;
  keywords?: string[];
}

export interface KabbalahPathData {
  from: string;
  to: string;
  hebrew_letter: string;
  meaning: string;
  tarot_card: string;
  guidance: string;
  path_number: number;
}

export interface CorrespondenceSystemData {
  daily_focus: DailyFocusData;
  life_purpose: LifePurposeData;
  spiritual_center: SpiritualCenterData;
}

export interface DailyFocusData {
  element: string;
  planet: string;
  theme: string;
  tarot?: string;
  hebrew_letter?: string;
  tree_path?: number;
  astrology?: string;
}

export interface LifePurposeData {
  primary_energy: string;
  spiritual_goal: string;
  manifestation_style: string;
  karmic_lessons: string[];
}

export interface SpiritualCenterData {
  chakra: string;
  color: string;
  focus_area: string;
  sephirah?: string;
  astrology?: string;
  tarot_association?: string;
  element?: string;
}

// ============================================================================
// HERMETIC CORRESPONDENCE INTERFACES
// ============================================================================

export interface HermeticElementData {
  name: string;
  hebrew_letter: string;
  tarot_card: string;
  quality: string;
  direction?: string;
  meaning: string;
  keywords: string[];
}

export interface HermeticPlanetData {
  name: string;
  hebrew_letter?: string;
  tarot_card: string;
  day_of_week?: string;
  metal?: string;
  incense?: string;
  color?: string;
  meaning: string;
  keywords: string[];
}

export interface HermeticZodiacData {
  sign: string;
  hebrew_letter: string;
  tarot_card: string;
  element: string;
  modality: string;
  decan_rulers?: string[];
  meaning: string;
  keywords: string[];
}

export interface SpiritualSynthesisData {
  primary_themes: string[];
  spiritual_guidance: string;
  integration_focus: string;
  daily_practice: string;
  growth_areas: string[];
  tree_visualization?: {
    sephirot?: SephirahData[];
    paths?: TarotCardData[];
    tree_layout?: {
      path_connections?: Array<{ from: string; to: string }>;
      sephirot_positions?: Record<string, { x: number; y: number }>;
    };
    active_correspondences?: {
      daily?: { card: string; path: string };
      life_path?: { card: string; path: string };
      primary_sephirah?: { sephirah: string };
    };
  };
  path_working?: {
    primary_path?: {
      tarot_card: string;
      hebrew_letter: string;
      path_number: number;
      meditation_focus: string;
      spiritual_work: string;
      practical_exercises?: string[];
    };
    phases?: Array<{
      phase: number;
      name: string;
      description: string;
      duration: string;
      focus: string;
      practices: string[];
    }>;
  };
  hermetic_correspondences?: {
    elements?: Record<string, HermeticElementData>;
    planets?: Record<string, HermeticPlanetData>;
    zodiac?: Record<string, HermeticZodiacData>;
    daily_hermetic?: {
      tarot: string;
      hebrew_letter: string;
      elemental: string;
      golden_dawn_title: string;
    };
    sephirah_hermetic?: {
      sephirah: string;
      divine_name: string;
      archangel: string;
      gematria: number;
      magical_image: string;
    };
  };
}

export interface SpiritualAIInterpretation {
  spiritual_interpretation: BasicSpiritualInterpretation;
  timestamp: Date;
  confidence_level: number;
  sources: string[];
}

export interface BasicSpiritualInterpretation {
  content: string;
  themes: string[];
  guidance: string;
  timestamp: Date;
}

// ============================================================================
// TCM SYSTEM INTERFACES
// ============================================================================

export interface TCMChartData {
  description: string;
  constitutional_analysis: ConstitutionalAnalysisData;
  five_elements: FiveElementsData;
  meridian_system: MeridianSystemData;
  health_correlations: HealthCorrelationsData;
  synthesis: TCMSynthesisData;
}

export interface ConstitutionalAnalysisData {
  primary_type: TCMConstitutionType;
  secondary_type: TCMConstitutionType;
  constitution_summary: string;
  constitution_percentage: Record<string, number>;
}

export interface FiveElementsData {
  elements: WuXingElement[];
  balance_overview: string;
  seasonal_guidance: string;
  element_interactions: ElementInteractionData[];
}

export interface ElementInteractionData {
  generating_cycle: string[];
  controlling_cycle: string[];
  imbalances: string[];
  recommendations: string[];
}

export interface MeridianSystemData {
  meridians: MeridianFlowData[];
  energy_flow_assessment: string;
  blockage_areas: string[];
  flow_patterns: FlowPatternData[];
}

export interface FlowPatternData {
  pattern_name: string;
  affected_meridians: string[];
  symptoms: string[];
  recommendations: string[];
}

export interface HealthCorrelationsData {
  astrological_health_risks: string[];
  preventive_recommendations: string[];
  optimal_timing: Record<string, string>;
  constitutional_strengths: string[];
}

export interface TCMSynthesisData {
  tcm_astrology_integration: string;
  personalized_wellness_plan: string[];
  seasonal_adjustments: Record<string, string[]>;
  lifestyle_recommendations: LifestyleRecommendationData[];
}

export interface LifestyleRecommendationData {
  category: 'diet' | 'exercise' | 'meditation' | 'sleep' | 'environment';
  recommendations: string[];
  timing: string;
  priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// PSYCHOLOGY SYSTEM INTERFACES
// ============================================================================

export interface PsychologyChartData {
  description: string;
  mbti: MBTIAnalysisData;
  enneagram: EnneagramAnalysisData;
  synthesis: PsychologySynthesisData;
}

export interface MBTIAnalysisData {
  profile: MBTIResult;
  birth_correlation: BirthCorrelationData;
  astrology_synthesis: AstrologySynthesisData;
  cognitive_functions: CognitiveFunctionData[];
}

export interface BirthCorrelationData {
  seasonal_pattern: string;
  elemental_dominance: string;
  planetary_influences: string;
  birth_chart_alignment: number;
}

export interface AstrologySynthesisData {
  chart_confirmation: string[];
  contradictions: string[];
  integration_notes: string;
  type_confidence: number;
}

export interface CognitiveFunctionData {
  function: string;
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
  development_level: number;
  astrological_correlation: string;
}

export interface EnneagramAnalysisData {
  profile: EnneagramResult;
  astrological_correlations: EnneagramAstroCorrelationData;
  spiritual_development: SpiritualDevelopmentData;
  wing_analysis: WingAnalysisData;
}

export interface EnneagramAstroCorrelationData {
  house_themes: string;
  planetary_alignment: string;
  aspect_patterns: string;
  type_indicators: string[];
}

export interface SpiritualDevelopmentData {
  current_level: string;
  growth_path: string[];
  meditation_focus: string;
  integration_work: string[];
}

export interface WingAnalysisData {
  primary_wing: number;
  secondary_wing?: number;
  wing_influence: string;
  development_recommendations: string[];
}

export interface PsychologySynthesisData {
  personality_integration: PersonalityIntegrationData;
  astrological_confirmation: AstrologyConfirmationData;
  tarot_correspondences: TarotCorrespondenceData;
  development_path: DevelopmentPathData;
}

export interface PersonalityIntegrationData {
  mbti_enneagram_bridge: string;
  spiritual_path_alignment: string;
  growth_recommendations: string[];
  shadow_work_areas: string[];
}

export interface AstrologyConfirmationData {
  chart_personality_match: number;
  supporting_aspects: string[];
  developmental_timing: Record<string, string>;
  planetary_persona_correlation: Record<string, string>;
}

export interface TarotCorrespondenceData {
  mbti_cards: Record<string, string>;
  enneagram_cards: Record<number, string>;
  personality_spread: string[];
  developmental_cards: string[];
}

export interface DevelopmentPathData {
  current_stage: string;
  next_challenges: string[];
  growth_opportunities: string[];
  integration_practices: string[];
}

// ============================================================================
// COMPONENT STATE AND INTERACTION TYPES
// ============================================================================

export interface MultiSystemChartState {
  data: MultiSystemChartData;
  activeSystem: SystemType | null;
  visibleSystems: Set<SystemType>;
  filters: SystemFilters;
  displayMode: 'overview' | 'detailed' | 'comparative';
  loading: LoadingState;
  error: ChartError | null;
}

export type SystemType = 
  | 'western' | 'vedic' | 'chinese' | 'mayan' | 'uranian' 
  | 'spiritual' | 'tcm' | 'psychology' | 'synthesis';

export interface SystemFilters {
  showOnlySignificant: boolean;
  minimumStrength: number;
  includeSecondary: boolean;
  timeRange?: DateRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface LoadingState {
  isLoading: boolean;
  loadingSystem?: SystemType;
  progress: number;
  estimatedTime?: number;
}

export interface SystemTabProps {
  data: LoadedChartState;
  systemType: SystemType;
  isActive: boolean;
  onActivate: (system: SystemType) => void;
  filters: SystemFilters;
  onFiltersChange: (filters: SystemFilters) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ChartDataValidator = (data: unknown) => data is MultiSystemChartData;
export type SystemDataExtractor<T> = (data: LoadedChartState) => T | undefined;
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput;
