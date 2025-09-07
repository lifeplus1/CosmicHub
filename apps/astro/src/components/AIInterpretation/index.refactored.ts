/**
 * @fileoverview AIInterpretation Components Index
 * 
 * Exports all AI interpretation form components and utilities.
 * Includes the refactored modular components following Type Bridge patterns.
 */

// Original components
export { default as InterpretationForm } from './InterpretationForm';
export { default as InterpretationCard } from './InterpretationCard';
export { default as InterpretationModal } from './InterpretationModal';
export { default as InterpretationDisplay } from './InterpretationDisplay';

// Refactored modular components
export { default as InterpretationFormRefactored } from './InterpretationFormRefactored';
export { default as InterpretationFormContainer } from './InterpretationFormContainer';
export { default as BirthDataInput } from './BirthDataInput';
export { default as FocusAreaSelector } from './FocusAreaSelector';
export { default as ChartModeForm } from './ChartModeForm';
export { default as DirectModeForm } from './DirectModeForm';
export { default as GenerateButton } from './GenerateButton';
export { default as InterpretationResultDisplay } from './InterpretationResultDisplay';

// Hooks and utilities
export { useAIInterpretation } from './useAIInterpretation';
export { buildChartInterpretationRequest } from './interpretationRequestBuilder';
export * from './utils';

// Types
export * from './types';

// Schemas (select exports to avoid conflicts)
export {
  // Core schemas
  InterpretationFormPropsSchema,
  ChartFormStateSchema,
  DirectFormStateSchema,
  
  // Component schemas
  InterpretationFormContainerPropsSchema,
  ChartModeFormPropsSchema,
  DirectModeFormPropsSchema,
  GenerateButtonPropsSchema,
  InterpretationDisplayPropsSchema,
  FocusAreaSelectorPropsSchema,
  BirthDataInputPropsSchema,
  
  // Validation functions
  validateChartFormState,
  validateDirectFormState,
  validateInterpretationFormProps,
  validateDate,
  validateTime,
  
  // Type exports
  type InterpretationFormProps,
  type ChartFormState,
  type DirectFormState,
  type InterpretationMode,
  type InterpretationType,
  type DirectInterpretationType,
  type InterpretationFocusArea,
} from '../../schemas/interpretationForm';
