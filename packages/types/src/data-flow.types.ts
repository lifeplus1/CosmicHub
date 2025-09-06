/**
 * Data Flow Types for CosmicHub
 * Provides descriptive types for data transformations and component interactions
 */

// ============================================================================
// CORE DATA FLOW PATTERNS
// ============================================================================

export interface DataTransformationStep<TInput, TOutput> {
  stepName: string;
  transform: (input: TInput) => TOutput | Promise<TOutput>;
  validate?: (output: TOutput) => boolean;
  onError?: (error: Error, input: TInput) => void;
}

export interface DataFlowPipeline<TInput, TOutput> {
  pipelineName: string;
  steps: Array<
    | DataTransformationStep<TInput, TOutput>
    | DataTransformationStep<TInput, unknown>
    | DataTransformationStep<unknown, TOutput>
    | DataTransformationStep<unknown, unknown>
  >;
  execute: (input: TInput) => Promise<TOutput>;
  rollback?: (partialOutput: Partial<TOutput>) => Promise<void>;
}

// Specific pipeline step types for common transformations
export interface BirthDataValidationStep extends DataTransformationStep<BirthDataInput, BirthDataInput> {
  stepName: 'birth-data-validation';
}

export interface AstrologyCalculationStep extends DataTransformationStep<AstrologyCalculationInput, AstrologyCalculationResult> {
  stepName: 'astrology-calculation';
}

export interface ChartRenderingStep extends DataTransformationStep<ChartRenderingInput, ChartRenderingResult> {
  stepName: 'chart-rendering';
}

// ============================================================================
// CHART DATA FLOW
// ============================================================================

export interface BirthDataInput {
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  city?: string;
}

export interface AstrologyCalculationInput extends BirthDataInput {
  chartType: 'natal' | 'transit' | 'synastry' | 'composite';
  includeAspects: boolean;
  includeHouses: boolean;
  aspectOrbs?: Record<string, number>;
}

export interface AstrologyCalculationResult {
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: AspectFlowData[];
  angles: AngleFlowData[];
  metadata: CalculationMetadata;
}

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  sign: ZodiacSign;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  cusp: number;
  sign: ZodiacSign;
  ruler: string;
  planets: string[];
}

export interface AspectFlowData {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
  exact: boolean;
  applying: boolean;
  energy: 'harmonious' | 'challenging' | 'neutral';
}

export interface AngleFlowData {
  name: 'AC' | 'MC' | 'DC' | 'IC';
  longitude: number;
  sign: ZodiacSign;
}

export interface CalculationMetadata {
  calculatedAt: Date;
  ephemerisVersion: string;
  coordinateSystem: 'geocentric' | 'topocentric';
  houseSystem: 'placidus' | 'koch' | 'equal' | 'whole';
}

// ============================================================================
// CHART RENDERING DATA FLOW
// ============================================================================

export interface ChartRenderingInput {
  calculationResult: AstrologyCalculationResult;
  renderOptions: ChartRenderOptions;
  theme: ChartTheme;
}

export interface ChartRenderOptions {
  showPlanets: boolean;
  showHouses: boolean;
  showAspects: boolean;
  showAspectLines: boolean;
  showDegreeMarkers: boolean;
  showZodiacSigns: boolean;
  planetSymbols: 'traditional' | 'modern' | 'text';
  aspectLineStyle: 'solid' | 'dashed' | 'dotted';
}

export interface ChartTheme {
  name: string;
  backgroundColor: string;
  zodiacColors: Record<ZodiacSign, string>;
  planetColors: Record<string, string>;
  aspectColors: Record<AspectType, string>;
  textColor: string;
  gridColor: string;
}

export interface ChartRenderingResult {
  svgContent: string;
  boundingBox: { width: number; height: number };
  interactiveElements: InteractiveElement[];
  renderMetadata: RenderMetadata;
}

export interface InteractiveElement {
  id: string;
  type: 'planet' | 'house' | 'aspect' | 'sign';
  coordinates: { x: number; y: number };
  boundingBox: { x: number; y: number; width: number; height: number };
  data: PlanetElementData | HouseElementData | AspectElementData | SignElementData;
  clickHandler?: (element: InteractiveElement) => void;
  hoverHandler?: (element: InteractiveElement) => void;
}

// Specific data types for different interactive elements
export interface PlanetElementData {
  planetName: string;
  longitude: number;
  sign: ZodiacSign;
  house: number;
  retrograde: boolean;
}

export interface HouseElementData {
  houseNumber: number;
  cusp: number;
  sign: ZodiacSign;
  planets: string[];
}

export interface AspectElementData {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
  exact: boolean;
}

export interface SignElementData {
  sign: ZodiacSign;
  startDegree: number;
  endDegree: number;
  planets: string[];
}

export interface RenderMetadata {
  renderTime: number;
  elementsRendered: number;
  chartSize: { width: number; height: number };
  scaleFactor: number;
}

// ============================================================================
// USER INTERACTION DATA FLOW
// ============================================================================

export interface ChartInteractionEvent {
  type: 'planet-click' | 'house-hover' | 'aspect-select' | 'chart-zoom';
  target: InteractionTarget;
  coordinates: { x: number; y: number };
  timestamp: Date;
  modifiers: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
  };
}

export interface InteractionTarget {
  elementType: 'planet' | 'house' | 'aspect' | 'sign' | 'background';
  elementId: string;
  elementData: PlanetElementData | HouseElementData | AspectElementData | SignElementData | BackgroundElementData;
  relatedElements?: string[];
}

export interface BackgroundElementData {
  chartRegion: 'inner' | 'outer' | 'houses' | 'aspects';
  coordinates: { x: number; y: number };
}

export interface ChartInteractionResult {
  highlightElements: string[];
  showTooltip?: TooltipData;
  updateChart?: Partial<ChartRenderOptions>;
  triggerAction?: ChartAction;
}

export interface TooltipData {
  title: string;
  content: string;
  position: { x: number; y: number };
  anchorTo: 'cursor' | 'element';
  autoHide: boolean;
}

export interface ChartAction {
  type: 'navigate' | 'modal' | 'update' | 'export';
  payload: NavigatePayload | ModalPayload | UpdatePayload | ExportPayload;
  callback?: (result: ActionResult) => void;
}

// Specific payload types for different actions
export interface NavigatePayload {
  route: string;
  params?: Record<string, string | number>;
  newTab?: boolean;
}

export interface ModalPayload {
  modalType: 'planet-details' | 'aspect-info' | 'chart-settings' | 'save-chart';
  data: PlanetElementData | AspectElementData | ChartRenderOptions | SaveChartData;
}

export interface UpdatePayload {
  updateType: 'chart-options' | 'theme' | 'zoom' | 'highlight';
  changes: Partial<ChartRenderOptions> | Partial<ChartTheme> | ZoomSettings | HighlightSettings;
}

export interface ExportPayload {
  format: 'svg' | 'png' | 'pdf' | 'json';
  options: ExportOptions;
}

export interface SaveChartData {
  name: string;
  description?: string;
  tags?: string[];
}

export interface ZoomSettings {
  level: number;
  centerX: number;
  centerY: number;
}

export interface HighlightSettings {
  elementIds: string[];
  style: 'outline' | 'background' | 'pulse';
  color: string;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  quality?: number;
  background?: boolean;
}

export type ActionResult = NavigateResult | ModalResult | UpdateResult | ExportResult;

export interface NavigateResult {
  success: boolean;
  url?: string;
}

export interface ModalResult {
  action: 'opened' | 'closed' | 'submitted';
  data?: unknown;
}

export interface UpdateResult {
  success: boolean;
  updatedProperties: string[];
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
}

// ============================================================================
// API DATA FLOW
// ============================================================================

export interface ApiRequest<TPayload = Record<string, unknown>> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: TPayload;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<TData = Record<string, unknown>> {
  success: boolean;
  data?: TData;
  error?: ApiError;
  metadata: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationErrors | NetworkError | ServerError | AuthError;
  stack?: string;
}

export interface ValidationErrors {
  type: 'validation';
  fieldErrors: FormFieldError[];
  generalErrors: string[];
}

export interface NetworkError {
  type: 'network';
  statusCode: number;
  timeout: boolean;
  retryable: boolean;
}

export interface ServerError {
  type: 'server';
  statusCode: number;
  serverMessage: string;
  requestId: string;
}

export interface AuthError {
  type: 'auth';
  reason: 'expired' | 'invalid' | 'insufficient-permissions';
  redirectUrl?: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: Date;
  processingTime: number;
  cached: boolean;
  remainingQuota?: number;
}

// ============================================================================
// STATE MANAGEMENT DATA FLOW
// ============================================================================

export interface StateAction<TType extends string = string, TPayload = Record<string, unknown>> {
  type: TType;
  payload: TPayload;
  meta?: {
    timestamp: Date;
    source: string;
    undoable: boolean;
  };
}

// Specific state action types for the application
export type ChartStateAction = 
  | ChartLoadAction
  | ChartUpdateAction
  | ChartInteractionAction
  | ChartErrorAction;

export interface ChartLoadAction extends StateAction<'CHART_LOAD'> {
  payload: {
    chartData: AstrologyCalculationResult;
    renderOptions: ChartRenderOptions;
    theme: ChartTheme;
  };
}

export interface ChartUpdateAction extends StateAction<'CHART_UPDATE'> {
  payload: {
    updates: Partial<ChartRenderOptions>;
    reason: 'user-interaction' | 'theme-change' | 'data-refresh';
  };
}

export interface ChartInteractionAction extends StateAction<'CHART_INTERACTION'> {
  payload: {
    event: ChartInteractionEvent;
    result: ChartInteractionResult;
  };
}

export interface ChartErrorAction extends StateAction<'CHART_ERROR'> {
  payload: {
    error: Error;
    context: 'calculation' | 'rendering' | 'interaction';
    recoverable: boolean;
  };
}

export interface StateTransition<TState, TAction extends StateAction> {
  from: Partial<TState>;
  action: TAction;
  to: Partial<TState>;
  sideEffects?: SideEffect<TState>[];
}

export interface SideEffect<TState> {
  name: string;
  execute: (state: TState, action: StateAction) => Promise<void> | void;
  cleanup?: (state: TState) => Promise<void> | void;
}

export interface StateManager<TState, TAction extends StateAction> {
  currentState: TState;
  dispatch: (action: TAction) => void;
  subscribe: (listener: (state: TState) => void) => () => void;
  getState: () => TState;
  history: StateTransition<TState, TAction>[];
}

// ============================================================================
// FORM DATA FLOW
// ============================================================================

export interface FormFieldDefinition<TValue = unknown> {
  name: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation: ValidationRule<TValue>[];
  defaultValue?: TValue;
  options?: SelectOption[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule<TValue> {
  name: string;
  validate: (value: TValue) => boolean | Promise<boolean>;
  message: string;
  severity: 'error' | 'warning';
}

export interface FormData {
  [fieldName: string]: FormFieldValue;
}

export type FormFieldValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | number[];

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
  warnings: FormFieldError[];
}

export interface FormFieldError {
  fieldName: string;
  message: string;
  severity: 'error' | 'warning';
  rule: string;
}

export interface FormSubmissionResult<TResponse = Record<string, unknown>> {
  success: boolean;
  data?: TResponse;
  errors?: FormFieldError[];
  redirectTo?: string;
}

// ============================================================================
// COMPONENT COMMUNICATION DATA FLOW
// ============================================================================

export interface ComponentMessage<TType extends string = string, TData = Record<string, unknown>> {
  type: TType;
  data: TData;
  source: string;
  target?: string;
  timestamp: Date;
  id: string;
}

// Specific message types for component communication
export type AppMessage = 
  | ChartDataMessage
  | UserInteractionMessage
  | ThemeChangeMessage
  | ErrorMessage
  | StatusMessage;

export interface ChartDataMessage extends ComponentMessage<'CHART_DATA'> {
  data: {
    chartId: string;
    calculationResult: AstrologyCalculationResult;
    renderingResult?: ChartRenderingResult;
  };
}

export interface UserInteractionMessage extends ComponentMessage<'USER_INTERACTION'> {
  data: {
    interactionType: 'click' | 'hover' | 'drag' | 'zoom';
    target: InteractionTarget;
    event: ChartInteractionEvent;
  };
}

export interface ThemeChangeMessage extends ComponentMessage<'THEME_CHANGE'> {
  data: {
    oldTheme: string;
    newTheme: string;
    themeData: ChartTheme;
  };
}

export interface ErrorMessage extends ComponentMessage<'ERROR'> {
  data: {
    error: Error;
    severity: ErrorSeverity;
    context: string;
    userMessage: string;
  };
}

export interface StatusMessage extends ComponentMessage<'STATUS'> {
  data: {
    status: 'loading' | 'ready' | 'error' | 'updating';
    progress?: number;
    message?: string;
  };
}

export interface MessageBus {
  send<TType extends string, TData>(
    type: TType,
    data: TData,
    target?: string
  ): void;
  subscribe<TType extends string, TData>(
    type: TType,
    handler: (message: ComponentMessage<TType, TData>) => void
  ): () => void;
  unsubscribe<TType extends string, TData>(
    type: TType,
    handler: (message: ComponentMessage<TType, TData>) => void
  ): void;
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

import type { ZodiacSign, AspectType } from './astrology.types';

export type DataFlowStage = 
  | 'input' | 'validation' | 'transformation' | 'calculation' 
  | 'rendering' | 'interaction' | 'output';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface DataFlowPerformance {
  stage: DataFlowStage;
  metrics: PerformanceMetric[];
  bottlenecks: string[];
  optimizationSuggestions: string[];
}
