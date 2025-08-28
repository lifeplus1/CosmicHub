import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  generateAIInterpretation,
  updateInterpretation,
} from '../../services/api';
// Use shared ApiResult type from config (migration away from local services/apiResult)
import type { ApiResult } from '@cosmichub/config';
import { isSuccess } from '../../services/apiResult';
import type {
  InterpretationRequest,
  InterpretationResponse,
  ChartId,
  UserId,
  InterpretationType,
  InterpretationFocusArea,
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
// Use shared chart interpretation request type alias
// Internal form state type (chart mode)
interface ChartFormState {
  type: InterpretationType;
  focus: InterpretationFocusArea[]; // canonical focus values
  question: string;
}

// Direct AI mode form state
interface DirectFormState {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  interpretationType: 'general' | 'personality' | 'career' | 'relationships';
}

interface InterpretationResult {
  data?: unknown;
  content?: string;
}

interface InterpretationFormProps {
  onInterpretationGenerated?: (interpretation: InterpretationResult) => void;
  chartId?: ChartId | string;
  mode?: 'chart' | 'direct';
  defaultFocus?: InterpretationFocusArea[];
  defaultType?: InterpretationType;
  existingInterpretationId?: InterpretationId;
  /** Persist (PATCH) interpretation summary/content after generation if id provided */
  persistUpdates?: boolean;
}

const InterpretationForm: React.FC<InterpretationFormProps> = ({
  onInterpretationGenerated,
  chartId,
  mode = 'direct', // Default to new AI service
  existingInterpretationId,
  persistUpdates = false,
}) => {
  // Mock user for development - remove auth dependency for now
  const user = { uid: 'mock-user' };
  const { toast } = useToast();
  const showToast = useCallback(
    (opts: {
      title: string;
      description: string;
      status: 'success' | 'error';
      duration?: number;
    }) => {
      toast({
        ...opts,
        duration: opts.duration ?? (opts.status === 'success' ? 3000 : 5000),
        isClosable: true,
      });
    },
    [toast]
  );
  const [isGenerating, setIsGenerating] = useState(false); // local spinner state (chart mode only)
  const { generateInterpretation, interpretation, loading, error } =
    useAIInterpretation();

  const [chartForm, setChartForm] = useState<ChartFormState>({
    type: chartId ? (typeof chartId === 'string' ? 'natal' : 'natal') : 'natal',

    focus: Array.isArray(
      typeof window !== 'undefined' &&
        '__defaultFocus' in window &&
        Array.isArray(
          (window as unknown as { __defaultFocus?: InterpretationFocusArea[] })
            .__defaultFocus
        )
    )
      ? (window as unknown as { __defaultFocus: InterpretationFocusArea[] })
          .__defaultFocus
      : [],
    question: '',
  });
  const [directForm, setDirectForm] = useState<DirectFormState>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    interpretationType: 'general',
  });

  const interpretationTypes = [
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
  ];

  const aiInterpretationTypes = [
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
  ];

  // Focus areas centralized in services/interpretationFocus
  const uiFocusToCanonical = useCallback(
    (label: string): InterpretationFocusArea => {
      if ((FOCUS_AREA_LABELS as readonly string[]).includes(label)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        return focusLabelToCanonical(label as any);
      }
      return 'personality';
    },
    []
  );

  const handleFocusToggle = (focusLabel: string): void => {
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
  };

  // Synastry partner fields (optional extension)
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerBirthTime, setPartnerBirthTime] = useState('');
  const [partnerBirthLocation, setPartnerBirthLocation] = useState('');

  const isSynastry = chartForm.type === 'synastry';

  // Accessible live region text
  const [statusMessage, setStatusMessage] = useState('');
  const statusClearTimeoutRef = useRef<number | null>(null);

  const setStatus = (msg: string): void => {
    setStatusMessage(msg);
    if (statusClearTimeoutRef.current !== null) {
      clearTimeout(statusClearTimeoutRef.current);
    }
    statusClearTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('');
      statusClearTimeoutRef.current = null;
    }, 4000);
  };

  // Cleanup on unmount (prevents dangling timers in tests keeping process alive)
  useEffect(() => {
    return () => {
      if (statusClearTimeoutRef.current !== null) {
        clearTimeout(statusClearTimeoutRef.current);
      }
    };
  }, []);

  // Validation helpers
  const isValidDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parts = value.split('-');
    if (parts.length !== 3) return false;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d))
      return false;
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  };
  const isValidTime = (value: string): boolean => /^\d{2}:\d{2}$/.test(value);

  const handleChartGenerate = async (): Promise<void> => {
    // TODO: Replace with real authentication check when auth is implemented
    if (user?.uid === undefined || user?.uid === null || user?.uid === '') {
      showToast({
        title: 'Authentication Required',
        description: 'Please log in to generate interpretations',
        status: 'error',
      });
      return;
    }

    if (
      mode === 'chart' &&
      (chartId === undefined || chartId === null || chartId === '')
    ) {
      showToast({
        title: 'Chart Required',
        description:
          'A valid chart must be selected to generate an interpretation',
        status: 'error',
      });
      return;
    }

    if (isSynastry) {
      const synastryMissing =
        !partnerBirthDate || !partnerBirthTime || !partnerBirthLocation;
      if (synastryMissing) {
        showToast({
          title: 'Partner Data Required',
          description:
            'Provide partner birth date, time, and location for synastry interpretation',
          status: 'error',
          duration: 6000,
        });
        return;
      }
    }

    setIsGenerating(true);
    const start = performance.now();

    try {
      const requestData: InterpretationRequest =
        buildChartInterpretationRequest({
          chartId: (chartId as ChartId) ?? ('default' as ChartId),
          userId: user.uid as UserId,
          type: chartForm.type,
          focus: chartForm.focus, // legacy param name consumed by builder -> focus_areas
          question: chartForm.question.trim() || undefined,
          partnerBirthDate: isSynastry ? partnerBirthDate : undefined,
          partnerBirthTime: isSynastry ? partnerBirthTime : undefined,
          partnerBirthLocation: isSynastry ? partnerBirthLocation : undefined,
        });

      const result: ApiResult<InterpretationResponse> =
        await generateAIInterpretation(requestData);

      if (isSuccess(result)) {
        showToast({
          title: 'Interpretation Generated',
          description: 'Your personalized astrological interpretation is ready',
          status: 'success',
        });
        setStatus('Interpretation generated successfully.');

        if (typeof onInterpretationGenerated === 'function') {
          onInterpretationGenerated({ data: result.data });
        }
        // Optional persistence if consumer requests
        if (persistUpdates && existingInterpretationId) {
          try {
            // Type-safe extraction of interpretation data
            const interpretationData = result.data as {
              summary?: string;
              content?: string;
              sections?: Array<{ title: string; content: string }>;
              focus_areas?: string[];
            };

            await updateInterpretation(existingInterpretationId, {
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
        try {
          const end = performance.now();
          trackCosmicHubAIInteraction({
            feature: 'ai_questions',
            input_type: 'text',
            response_time_ms: Math.round(end - start),
            model_version: 'v1',
          });
        } catch {
          /* swallow analytics errors */
        }
      } else {
        throw new Error(result.error ?? 'Unknown error');
      }
    } catch (error) {
      // Log error for debugging (replace with proper logging service in production)
      if (error instanceof Error) {
        // TODO: Replace with structured logging service
        // logger.warn('Interpretation generation failed:', error.message);
      } else {
        // TODO: Replace with structured logging service
        // logger.warn('Interpretation generation failed with unknown error');
      }
      setStatus('Failed to generate interpretation.');
      showToast({
        title: 'Generation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to generate interpretation',
        status: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectGenerate = async (): Promise<void> => {
    if (
      directForm.birthDate === '' ||
      directForm.birthTime === '' ||
      directForm.birthLocation === ''
    ) {
      showToast({
        title: 'Missing Information',
        description: 'Please provide your birth date, time, and location',
        status: 'error',
      });
      return;
    }

    // Basic format validation
    if (
      !isValidDate(directForm.birthDate) ||
      !isValidTime(directForm.birthTime)
    ) {
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
      try {
        trackCosmicHubAIInteraction({
          feature: 'ai_direct_interpretation',
          input_type: 'text',
          response_time_ms: Math.round(end - start),
          model_version: 'v1',
        });
      } catch {
        /* ignore */
      }

      if (onInterpretationGenerated !== undefined) {
        onInterpretationGenerated({ content: interpretation ?? undefined });
      }
    } catch (error) {
      // Log error for debugging (replace with proper logging service in production)
      if (error instanceof Error) {
        // TODO: Replace with structured logging service
        // logger.warn('Interpretation generation failed:', error.message);
      } else {
        // TODO: Replace with structured logging service
        // logger.warn('Interpretation generation failed with unknown error');
      }
      setStatus('Failed to generate direct AI interpretation.');
      showToast({
        title: 'Generation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to generate interpretation',
        status: 'error',
      });
    }
  };

  const handleGenerate = (): Promise<void> =>
    mode === 'chart' ? handleChartGenerate() : handleDirectGenerate();

  return (
    <div className='max-w-2xl mx-auto p-6 bg-cosmic-dark/60 backdrop-blur-xl border border-cosmic-silver/20 rounded-xl'>
      <h1 className='text-2xl font-bold text-cosmic-gold mb-6 font-playfair'>
        Generate AI Interpretation
      </h1>

      <div className='space-y-6'>
        {mode === 'direct' && (
          <>
            {/* Birth Information for Direct AI */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label
                  htmlFor='birth-date'
                  className='block text-cosmic-gold font-medium mb-2'
                >
                  Birth Date
                </label>
                {(() => {
                  const invalid =
                    directForm.birthDate !== '' &&
                    !isValidDate(directForm.birthDate);
                  return (
                    <input
                      id='birth-date'
                      type='text'
                      inputMode='numeric'
                      placeholder='YYYY-MM-DD'
                      value={directForm.birthDate}
                      onChange={(e): void =>
                        setDirectForm(prev => ({
                          ...prev,
                          birthDate: e.target.value,
                        }))
                      }
                      aria-describedby={`birth-date-format${invalid ? ' birth-date-error' : ''}`}
                      {...(invalid ? { 'aria-invalid': 'true' } : {})}
                      className='w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none'
                      title='Enter birth date in YYYY-MM-DD format'
                      aria-label='Birth date'
                    />
                  );
                })()}
                <p id='birth-date-format' className='sr-only'>
                  Format: YYYY-MM-DD
                </p>
                {directForm.birthDate !== '' &&
                  !isValidDate(directForm.birthDate) && (
                    <p
                      id='birth-date-error'
                      className='mt-1 text-xs text-red-400'
                    >
                      Invalid date format. Use YYYY-MM-DD.
                    </p>
                  )}
              </div>
              <div>
                <label
                  htmlFor='birth-time'
                  className='block text-cosmic-gold font-medium mb-2'
                >
                  Birth Time
                </label>
                {(() => {
                  const invalid =
                    directForm.birthTime !== '' &&
                    !isValidTime(directForm.birthTime);
                  return (
                    <input
                      id='birth-time'
                      type='text'
                      inputMode='numeric'
                      placeholder='HH:MM'
                      value={directForm.birthTime}
                      onChange={(e): void =>
                        setDirectForm(prev => ({
                          ...prev,
                          birthTime: e.target.value,
                        }))
                      }
                      aria-describedby={`birth-time-format${invalid ? ' birth-time-error' : ''}`}
                      {...(invalid ? { 'aria-invalid': 'true' } : {})}
                      className='w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none'
                      title='Enter birth time in 24h HH:MM format'
                      aria-label='Birth time'
                    />
                  );
                })()}
                <p id='birth-time-format' className='sr-only'>
                  Format: 24-hour HH:MM
                </p>
                {directForm.birthTime !== '' &&
                  !isValidTime(directForm.birthTime) && (
                    <p
                      id='birth-time-error'
                      className='mt-1 text-xs text-red-400'
                    >
                      Invalid time format. Use 24h HH:MM.
                    </p>
                  )}
              </div>
              <div>
                <label
                  htmlFor='birth-location'
                  className='block text-cosmic-gold font-medium mb-2'
                >
                  Birth Location
                </label>
                <input
                  id='birth-location'
                  type='text'
                  value={directForm.birthLocation}
                  onChange={(e): void =>
                    setDirectForm(prev => ({
                      ...prev,
                      birthLocation: e.target.value,
                    }))
                  }
                  placeholder='City, Country'
                  className='w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none'
                />
              </div>
            </div>

            {/* Interpretation Focus */}
            <div>
              <div className='block text-cosmic-gold font-medium mb-3'>
                Interpretation Focus
              </div>
              <fieldset
                className='grid grid-cols-1 md:grid-cols-2 gap-3'
                aria-labelledby='direct-interpretation-type-legend'
              >
                <legend
                  id='direct-interpretation-type-legend'
                  className='sr-only'
                >
                  Select AI interpretation focus
                </legend>
                {aiInterpretationTypes.map(type => (
                  <label
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      directForm.interpretationType === type.value
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
                    }`}
                  >
                    <input
                      type='radio'
                      name='interpretationType'
                      value={type.value}
                      checked={directForm.interpretationType === type.value}
                      onChange={(e): void =>
                        setDirectForm(prev => ({
                          ...prev,
                          interpretationType: e.target
                            .value as DirectFormState['interpretationType'],
                        }))
                      }
                      className='sr-only'
                      aria-labelledby={`interpretation-type-${type.value}`}
                      aria-label={`${type.label}: ${type.description}`}
                    />
                    <div className='text-cosmic-silver'>
                      <div
                        className='font-semibold'
                        id={`interpretation-type-${type.value}`}
                      >
                        {type.label}
                      </div>
                      <div className='text-sm text-cosmic-silver/70 mt-1'>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </fieldset>
            </div>
          </>
        )}

        {mode === 'chart' && (
          <>
            {/* Interpretation Type */}
            <div>
              <div className='block text-cosmic-gold font-medium mb-3'>
                Interpretation Type
              </div>
              <fieldset
                className='grid grid-cols-1 md:grid-cols-2 gap-3'
                aria-labelledby='chart-interpretation-type-legend'
              >
                <legend
                  id='chart-interpretation-type-legend'
                  className='sr-only'
                >
                  Options for selecting chart mode
                </legend>
                {interpretationTypes.map(type => (
                  <label
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      chartForm.type === type.value
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
                    }`}
                  >
                    <input
                      type='radio'
                      name='type'
                      value={type.value}
                      checked={chartForm.type === type.value}
                      onChange={e =>
                        setChartForm(prev => ({
                          ...prev,
                          type: e.target.value as InterpretationType,
                        }))
                      }
                      className='sr-only'
                      aria-labelledby={`chart-type-${type.value}`}
                      aria-label={`${type.label}: ${type.description}`}
                    />
                    <div className='text-cosmic-silver'>
                      <div
                        className='font-semibold'
                        id={`chart-type-${type.value}`}
                      >
                        {type.label}
                      </div>
                      <div className='text-sm text-cosmic-silver/70 mt-1'>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </fieldset>
            </div>

            {/* Focus Areas */}
            <div>
              <div className='block text-cosmic-gold font-medium mb-3'>
                Focus Areas (Optional)
              </div>
              <fieldset
                className='flex flex-wrap gap-2'
                aria-labelledby='focus-area-legend'
              >
                <legend id='focus-area-legend' className='sr-only'>
                  Focus area toggle buttons
                </legend>
                {FOCUS_AREA_LABELS.map(focus => {
                  const canonical = uiFocusToCanonical(focus);
                  const active = chartForm.focus.includes(canonical);
                  return active ? (
                    <button
                      key={focus}
                      type='button'
                      data-active='true'
                      onClick={() => handleFocusToggle(focus)}
                      className='px-3 py-2 text-sm rounded-full border transition-all bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/50'
                      aria-pressed='true'
                    >
                      {focus}
                    </button>
                  ) : (
                    <button
                      key={focus}
                      type='button'
                      data-active='false'
                      onClick={() => handleFocusToggle(focus)}
                      className='px-3 py-2 text-sm rounded-full border transition-all bg-cosmic-dark/40 text-cosmic-silver/70 border-cosmic-silver/30 hover:border-cosmic-silver/50'
                      aria-pressed='false'
                    >
                      {focus}
                    </button>
                  );
                })}
              </fieldset>
            </div>

            {/* Specific Question */}
            <div>
              <label
                htmlFor='specific-question'
                className='block text-cosmic-gold font-medium mb-3'
              >
                Specific Question (Optional)
              </label>
              <textarea
                id='specific-question'
                value={chartForm.question}
                onChange={e =>
                  setChartForm(prev => ({ ...prev, question: e.target.value }))
                }
                placeholder='Ask a specific question about your chart...'
                className='w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none resize-none'
                rows={3}
              />
            </div>

            {isSynastry && (
              <div className='space-y-4'>
                <div className='text-cosmic-gold font-medium'>
                  Partner Birth Data (Synastry)
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label
                      htmlFor='partner-birth-date'
                      className='block text-cosmic-gold text-sm mb-1'
                    >
                      Partner Birth Date
                    </label>
                    <input
                      id='partner-birth-date'
                      type='date'
                      value={partnerBirthDate}
                      onChange={e => setPartnerBirthDate(e.target.value)}
                      className='w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='partner-birth-time'
                      className='block text-cosmic-gold text-sm mb-1'
                    >
                      Partner Birth Time
                    </label>
                    <input
                      id='partner-birth-time'
                      type='time'
                      value={partnerBirthTime}
                      onChange={e => setPartnerBirthTime(e.target.value)}
                      className='w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='partner-birth-location'
                      className='block text-cosmic-gold text-sm mb-1'
                    >
                      Partner Birth Location
                    </label>
                    <input
                      id='partner-birth-location'
                      type='text'
                      value={partnerBirthLocation}
                      onChange={e => setPartnerBirthLocation(e.target.value)}
                      placeholder='City, Country'
                      className='w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none'
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Generate Button */}
        <button
          onClick={() => {
            const result = handleGenerate();
            if (result instanceof Promise) {
              void result.catch(() => {
                // Error handling is done within handleGenerate
              });
            }
          }}
          disabled={
            isGenerating ||
            loading ||
            (mode === 'chart' && user?.uid === undefined)
          }
          className='w-full py-3 px-6 bg-cosmic-gold text-cosmic-dark font-semibold rounded-lg hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
        >
          {isGenerating || loading ? (
            <>
              <div className='w-5 h-5 border-2 border-cosmic-dark border-t-transparent rounded-full animate-spin' />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔮</span>
              <span>Generate Interpretation</span>
            </>
          )}
        </button>

        {mode === 'chart' && user?.uid === undefined && (
          <p className='text-cosmic-silver/70 text-center text-sm'>
            Please log in to generate personalized interpretations
          </p>
        )}

        {typeof error === 'string' && error !== '' && (
          <div className='p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400'>
            {error}
          </div>
        )}

        {interpretation && (
          <div
            className='p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg'
            aria-live='polite'
          >
            <h3 className='text-cosmic-gold font-semibold mb-2'>
              Your Interpretation:
            </h3>
            <p className='text-cosmic-silver whitespace-pre-wrap'>
              {interpretation}
            </p>
          </div>
        )}
        <div className='sr-only' role='status' aria-live='polite'>
          {statusMessage}
        </div>
      </div>
    </div>
  );
};

export default InterpretationForm;
