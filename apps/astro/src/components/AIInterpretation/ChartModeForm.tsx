/**
 * @fileoverview ChartModeForm Component
 * 
 * Form component for chart-based interpretation mode.
 * Handles interpretation type selection, focus areas, questions,
 * and synastry partner data.
 * 
 * @component ChartModeForm
 * @example
 * ```tsx
 * <ChartModeForm
 *   chartForm={chartForm}
 *   onChartFormChange={setChartForm}
 *   interpretationTypes={interpretationTypes}
 *   focusAreaLabels={FOCUS_AREA_LABELS}
 *   onFocusToggle={handleFocusToggle}
 *   isSynastry={isSynastry}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { 
  ChartModeFormPropsSchema,
  type ChartModeFormProps, 
  type InterpretationType 
} from '../../schemas/interpretationForm';
import FocusAreaSelector from './FocusAreaSelector';

/**
 * Chart mode form for interpretation generation
 * 
 * Provides form controls for chart-based interpretation including
 * type selection, focus areas, questions, and partner data for synastry.
 * 
 * @param props - Chart mode form props
 * @param props.chartForm - Current chart form state
 * @param props.onChartFormChange - Callback for form state changes
 * @param props.interpretationTypes - Available interpretation types
 * @param props.focusAreaLabels - Available focus area labels
 * @param props.onFocusToggle - Callback for focus area toggle
 * @param props.partnerData - Partner birth data for synastry
 * @param props.onPartnerDataChange - Callback for partner data changes
 * @param props.isSynastry - Whether synastry mode is active
 */
const ChartModeForm: React.FC<ChartModeFormProps> = ({
  chartForm,
  onChartFormChange,
  interpretationTypes,
  focusAreaLabels,
  onFocusToggle,
  partnerData,
  onPartnerDataChange,
  isSynastry,
}) => {
  // Validate props using Type Bridge schema
  const validation = ChartModeFormPropsSchema.safeParse({
    chartForm,
    onChartFormChange,
    interpretationTypes,
    focusAreaLabels,
    onFocusToggle,
    partnerData,
    onPartnerDataChange,
    isSynastry,
  });

  if (!validation.success) {
    console.warn('ChartModeForm: Invalid props', validation.error);
  }

  // Handle interpretation type change
  const handleTypeChange = useCallback((type: InterpretationType) => {
    onChartFormChange({
      ...chartForm,
      type,
    });
  }, [chartForm, onChartFormChange]);

  // Handle question change
  const handleQuestionChange = useCallback((question: string) => {
    onChartFormChange({
      ...chartForm,
      question,
    });
  }, [chartForm, onChartFormChange]);

  // Handle partner data change
  const handlePartnerDataChange = useCallback((field: string, value: string) => {
    if (partnerData && onPartnerDataChange) {
      onPartnerDataChange({
        ...partnerData,
        [field]: value,
      });
    }
  }, [partnerData, onPartnerDataChange]);

  return (
    <>
      {/* Interpretation Type */}
      <div>
        <div className="block text-cosmic-gold font-medium mb-3">
          Interpretation Type
        </div>
        <fieldset
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          aria-labelledby="chart-interpretation-type-legend"
        >
          <legend
            id="chart-interpretation-type-legend"
            className="sr-only"
          >
            Options for selecting chart mode
          </legend>
          
          {interpretationTypes.map((type) => (
            <label
              key={type.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                chartForm.type === type.value
                  ? 'border-cosmic-gold bg-cosmic-gold/10'
                  : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={type.value}
                checked={chartForm.type === type.value}
                onChange={(e) =>
                  handleTypeChange(e.target.value as InterpretationType)
                }
                className="sr-only"
                aria-labelledby={`chart-type-${type.value}`}
                aria-label={`${type.label}: ${type.description}`}
              />
              <div className="text-cosmic-silver">
                <div
                  className="font-semibold"
                  id={`chart-type-${type.value}`}
                >
                  {type.label}
                </div>
                <div className="text-sm text-cosmic-silver/70 mt-1">
                  {type.description}
                </div>
              </div>
            </label>
          ))}
        </fieldset>
      </div>

      {/* Focus Areas */}
      <FocusAreaSelector
        selectedFocus={chartForm.focus}
        focusAreaLabels={focusAreaLabels}
        onFocusToggle={onFocusToggle}
        disabled={false}
      />

      {/* Specific Question */}
      <div>
        <label
          htmlFor="specific-question"
          className="block text-cosmic-gold font-medium mb-3"
        >
          Specific Question (Optional)
        </label>
        <textarea
          id="specific-question"
          value={chartForm.question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Ask a specific question about your chart..."
          className="w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none resize-none"
          rows={3}
        />
      </div>

      {/* Synastry Partner Data */}
      {isSynastry && partnerData && onPartnerDataChange && (
        <div className="space-y-4">
          <div className="text-cosmic-gold font-medium">
            Partner Birth Data (Synastry)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="partner-birth-date"
                className="block text-cosmic-gold text-sm mb-1"
              >
                Partner Birth Date
              </label>
              <input
                id="partner-birth-date"
                type="date"
                value={partnerData.birthDate}
                onChange={(e) =>
                  handlePartnerDataChange('birthDate', e.target.value)
                }
                className="w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="partner-birth-time"
                className="block text-cosmic-gold text-sm mb-1"
              >
                Partner Birth Time
              </label>
              <input
                id="partner-birth-time"
                type="time"
                value={partnerData.birthTime}
                onChange={(e) =>
                  handlePartnerDataChange('birthTime', e.target.value)
                }
                className="w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="partner-birth-location"
                className="block text-cosmic-gold text-sm mb-1"
              >
                Partner Birth Location
              </label>
              <input
                id="partner-birth-location"
                type="text"
                value={partnerData.birthLocation}
                onChange={(e) =>
                  handlePartnerDataChange('birthLocation', e.target.value)
                }
                placeholder="City, Country"
                className="w-full p-2 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Display name for debugging
ChartModeForm.displayName = 'ChartModeForm';

export default React.memo(ChartModeForm);
