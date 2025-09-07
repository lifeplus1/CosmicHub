/**
 * @fileoverview InterpretationFormRefactored Component
 * 
 * Main AI interpretation form component split into modular, focused components
 * following Type Bridge validation patterns. Supports both chart-based and 
 * direct AI interpretation modes with comprehensive validation and accessibility.
 * 
 * @component InterpretationFormRefactored
 * @example
 * ```tsx
 * <InterpretationFormRefactored
 *   mode="chart"
 *   chartId="chart-123"
 *   onInterpretationGenerated={(result) => handleResult(result)}
 * />
 * ```
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  generateAIInterpretation,
  updateInterpretation,
} from '../../services/api';
import { isSuccess } from '../../services/apiResult';
import type {
  InterpretationRequest,
  ChartId,
  UserId,
  InterpretationId,
  Interpretation,
} from '../../services/api.types';
import { buildChartInterpretationRequest } from './interpretationRequestBuilder';
import { trackCosmicHubAIInteraction } from '../../services/analytics';
import {
  FOCUS_AREA_LABELS,
  focusLabelToCanonical,
} from '../../services/interpretationFocus';
import { useToast } from '../ToastProvider';
import { useAIInterpretation } from './useAIInterpretation';

// Type Bridge validation imports
import {
  InterpretationFormPropsSchema,
  validateDate,
  validateTime,
  type InterpretationFormProps,
  type ChartFormState,
  type DirectFormState,
  type PartnerBirthData,
  type InterpretationFocusArea,
  type InterpretationTypeOption,
  type AIInterpretationTypeOption,
} from '../../schemas/interpretationForm';

// Component imports
import InterpretationFormContainer from './InterpretationFormContainer';
import ChartModeForm from './ChartModeForm';
import DirectModeForm from './DirectModeForm';
import GenerateButton from './GenerateButton';
import InterpretationResultDisplay from './InterpretationResultDisplay';

/**
 * Refactored AI interpretation form with modular components
 * 
 * Comprehensive form for generating AI astrological interpretations
 * in both chart-based and direct modes. Uses Type Bridge validation
 * and modular component architecture for maintainability.
 * 
 * @param props - Interpretation form props
 * @param props.onInterpretationGenerated - Callback for successful generation
 * @param props.chartId - Chart ID for chart mode
 * @param props.mode - Form mode ('chart' or 'direct')
 * @param props.defaultFocus - Default focus areas
 * @param props.defaultType - Default interpretation type
 * @param props.existingInterpretationId - ID for updating existing interpretation
 * @param props.persistUpdates - Whether to persist updates to existing interpretation
 */
const InterpretationFormRefactored: React.FC<InterpretationFormProps> = ({
  onInterpretationGenerated,
  chartId,
  mode = 'direct',
  defaultFocus,
  defaultType,
  existingInterpretationId,
  persistUpdates = false,
}) => {
  // Validate props using Type Bridge schema
  const validation = InterpretationFormPropsSchema.safeParse({
    onInterpretationGenerated,
    chartId,
    mode,
    defaultFocus,
    defaultType,
    existingInterpretationId,
    persistUpdates,
  });

  if (!validation.success) {
    console.warn('InterpretationFormRefactored: Invalid props', validation.error);
  }

  // Mock user for development
  const user = { uid: 'mock-user' };
  
  // Toast notifications
  const { toast } = useToast();
  const showToast = useCallback((opts: {
    title: string;
    description: string;
    status: 'success' | 'error';
    duration?: number;
  }) => {
    toast({
      ...opts,
      duration: opts.duration ?? (opts.status === 'success' ? 3000 : 5000),
    });
  }, [toast]);

  // AI interpretation hook
  const {
    interpretation,
    loading,
    error,
    generateInterpretation,
  } = useAIInterpretation();

  // Form state management
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Chart form state
  const [chartForm, setChartForm] = useState<ChartFormState>({
    type: defaultType ?? 'natal',
    focus: defaultFocus ?? [],
    question: '',
  });

  // Direct form state
  const [directForm, setDirectForm] = useState<DirectFormState>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    interpretationType: 'general',
  });

  // Partner data for synastry
  const [partnerData, setPartnerData] = useState<PartnerBirthData>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });

  // Status message for screen readers
  const [statusMessage, setStatusMessage] = useState('');
  const statusClearTimeoutRef = useRef<number | null>(null);

  const setStatus = useCallback((msg: string): void => {
    setStatusMessage(msg);
    if (statusClearTimeoutRef.current !== null) {
      clearTimeout(statusClearTimeoutRef.current);
    }
    statusClearTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('');
      statusClearTimeoutRef.current = null;
    }, 4000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusClearTimeoutRef.current !== null) {
        clearTimeout(statusClearTimeoutRef.current);
      }
    };
  }, []);

  // Interpretation type options
  const interpretationTypes = useMemo((): InterpretationTypeOption[] => [
    {
      value: 'natal',
      label: 'Natal Chart',
      description: 'Core personality and life path analysis',
    },
    {
      value: 'transit',
      label: 'Current Transits',
      description: 'Current planetary influences',
    },
    {
      value: 'synastry',
      label: 'Relationship Compatibility',
      description: 'Compare two charts for compatibility',
    },
    {
      value: 'composite',
      label: 'Composite Chart',
      description: 'Relationship dynamics and purpose',
    },
  ], []);

  const aiInterpretationTypes = useMemo((): AIInterpretationTypeOption[] => [
    {
      value: 'general',
      label: 'General Reading',
      description: 'Overall cosmic blueprint and life theme',
    },
    {
      value: 'personality',
      label: 'Personality Analysis',
      description: 'Deep dive into character traits and strengths',
    },
    {
      value: 'career',
      label: 'Career Guidance',
      description: 'Professional path and natural talents',
    },
    {
      value: 'relationships',
      label: 'Relationship Insights',
      description: 'Love compatibility and relationship patterns',
    },
  ], []);

  // Focus area handling
  const uiFocusToCanonical = useCallback(
    (label: string): InterpretationFocusArea => {
      if ((FOCUS_AREA_LABELS as readonly string[]).includes(label)) {
        return focusLabelToCanonical(label);
      }
      return 'personality';
    },
    []
  );

  const handleFocusToggle = useCallback((focusLabel: string): void => {
    const canonical = uiFocusToCanonical(focusLabel);
    setChartForm(prev => {
      const exists = prev.focus.includes(canonical);
      return {
        ...prev,
        focus: exists
          ? prev.focus.filter(f => f !== canonical)
          : [...prev.focus, canonical],
      };
    });
  }, [uiFocusToCanonical]);

  // Synastry detection
  const isSynastry = useMemo(() => chartForm.type === 'synastry', [chartForm.type]);

  // Validation functions
  const isValidDate = useCallback((value: string): boolean => {
    if (value === '') return true;
    return validateDate(value).success;
  }, []);

  const isValidTime = useCallback((value: string): boolean => {
    if (value === '') return true;
    return validateTime(value).success;
  }, []);

  // Chart mode generation handler
  const handleChartGenerate = async (): Promise<void> => {
    if (!user?.uid) {
      showToast({
        title: 'Authentication Required',
        description: 'Please log in to generate interpretations',
        status: 'error',
      });
      return;
    }

    if (mode === 'chart' && !chartId) {
      showToast({
        title: 'Chart Required',
        description: 'A valid chart must be selected to generate an interpretation',
        status: 'error',
      });
      return;
    }

    if (isSynastry) {
      const synastryMissing = !partnerData.birthDate || !partnerData.birthTime || !partnerData.birthLocation;
      if (synastryMissing) {
        showToast({
          title: 'Partner Data Required',
          description: 'Provide partner birth date, time, and location for synastry interpretation',
          status: 'error',
          duration: 6000,
        });
        return;
      }
    }

    if (isSynastry) {
      const invalidDate = partnerData.birthDate !== '' && !isValidDate(partnerData.birthDate);
      const invalidTime = partnerData.birthTime !== '' && !isValidTime(partnerData.birthTime);
      if (invalidDate || invalidTime) {
        showToast({
          title: 'Invalid Partner Data',
          description: 'Ensure partner date/time formats are valid before generating',
          status: 'error',
          duration: 6000,
        });
        return;
      }
    }

    setIsGenerating(true);
    const start = performance.now();

    try {
      const requestData: InterpretationRequest = buildChartInterpretationRequest({
        chartId: (chartId as ChartId) ?? ('default' as ChartId),
        userId: user.uid as UserId,
        type: chartForm.type,
        focus: chartForm.focus,
        question: chartForm.question.trim() || undefined,
        partnerBirthDate: isSynastry ? partnerData.birthDate : undefined,
        partnerBirthTime: isSynastry ? partnerData.birthTime : undefined,
        partnerBirthLocation: isSynastry ? partnerData.birthLocation : undefined,
      });

      const result = await generateAIInterpretation(requestData);

      if (isSuccess(result)) {
        showToast({
          title: 'Interpretation Generated',
          description: 'Your personalized astrological interpretation is ready',
          status: 'success',
        });
        setStatus('Interpretation generated successfully.');

        if (onInterpretationGenerated) {
          onInterpretationGenerated({ data: result.data });
        }

        // Optional persistence
        if (persistUpdates && existingInterpretationId) {
          try {
            const interpretationData = result.data as {
              summary?: string;
              content?: string;
              sections?: Array<{ title: string; content: string }>;
              focus_areas?: string[];
            };

            await updateInterpretation(existingInterpretationId as InterpretationId, {
              summary: interpretationData.summary,
              content: interpretationData.content,
              sections: interpretationData.sections,
              focus_areas: interpretationData.focus_areas,
              updatedAt: new Date().toISOString(),
            } as Partial<Interpretation>);
          } catch {
            setStatus('Failed to save interpretation changes.');
            showToast({
              title: 'Save Failed',
              description: 'Could not save interpretation update',
              status: 'error',
            });
          }
        }

        // Analytics tracking
        try {
          const end = performance.now();
          trackCosmicHubAIInteraction({
            feature: 'ai_questions',
            input_type: 'text',
            response_time_ms: Math.round(end - start),
            model_version: 'v1',
          });
        } catch {
          // Swallow analytics errors
        }
      } else {
        throw new Error(result.error ?? 'Unknown error');
      }
    } catch (error) {
      setStatus('Failed to generate interpretation.');
      showToast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate interpretation',
        status: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct mode generation handler
  const handleDirectGenerate = async (): Promise<void> => {
    if (!directForm.birthDate || !directForm.birthTime || !directForm.birthLocation) {
      showToast({
        title: 'Missing Information',
        description: 'Please provide your birth date, time, and location',
        status: 'error',
      });
      return;
    }

    if (!isValidDate(directForm.birthDate) || !isValidTime(directForm.birthTime)) {
      showToast({
        title: 'Invalid Format',
        description: 'Ensure date is YYYY-MM-DD and time is HH:MM (24h)',
        status: 'error',
        duration: 6000,
      });
      return;
    }

    try {
      const start = performance.now();
      const requestData = {
        birthDate: directForm.birthDate,
        birthTime: directForm.birthTime,
        birthLocation: directForm.birthLocation,
        interpretationType: directForm.interpretationType,
      };

      await generateInterpretation(requestData);
      const end = performance.now();

      showToast({
        title: 'Interpretation Generated',
        description: 'Your personalized AI interpretation is ready',
        status: 'success',
      });
      setStatus('AI direct interpretation generated successfully.');

      // Analytics tracking
      try {
        trackCosmicHubAIInteraction({
          feature: 'ai_direct_interpretation',
          input_type: 'text',
          response_time_ms: Math.round(end - start),
          model_version: 'v1',
        });
      } catch {
        // Ignore analytics errors
      }

      if (onInterpretationGenerated) {
        onInterpretationGenerated({ content: interpretation ?? undefined });
      }
    } catch (error) {
      setStatus('Failed to generate direct AI interpretation.');
      showToast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate interpretation',
        status: 'error',
      });
    }
  };

  // Main generate handler
  const handleGenerate = useCallback((): Promise<void> => {
    return mode === 'chart' ? handleChartGenerate() : handleDirectGenerate();
  }, [mode, chartForm, directForm, partnerData, isSynastry, user, chartId, persistUpdates, existingInterpretationId, onInterpretationGenerated, showToast, setStatus, generateInterpretation, interpretation, isValidDate, isValidTime]);

  return (
    <InterpretationFormContainer aria-labelledby="interpretation-form-heading">
      {/* Chart Mode Form */}
      {mode === 'chart' && (
        <ChartModeForm
          chartForm={chartForm}
          onChartFormChange={setChartForm}
          interpretationTypes={interpretationTypes}
          focusAreaLabels={FOCUS_AREA_LABELS as unknown as string[]}
          onFocusToggle={handleFocusToggle}
          partnerData={isSynastry ? partnerData : undefined}
          onPartnerDataChange={isSynastry ? setPartnerData : undefined}
          isSynastry={isSynastry}
        />
      )}

      {/* Direct Mode Form */}
      {mode === 'direct' && (
        <DirectModeForm
          directForm={directForm}
          onDirectFormChange={setDirectForm}
          aiInterpretationTypes={aiInterpretationTypes}
        />
      )}

      {/* Generate Button */}
      <GenerateButton
        isGenerating={isGenerating}
        isLoading={loading}
        isDisabled={mode === 'chart' && !user?.uid}
        onGenerate={handleGenerate}
        mode={mode}
      />

      {/* Interpretation Display */}
      <InterpretationResultDisplay
        interpretation={interpretation}
        error={error}
        isLoading={loading}
        statusMessage={statusMessage}
      />
    </InterpretationFormContainer>
  );
};

// Display name for debugging
InterpretationFormRefactored.displayName = 'InterpretationFormRefactored';

export default InterpretationFormRefactored;
