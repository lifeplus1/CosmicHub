import React, { useState } from 'react';
import { generateAIInterpretation } from '../../services/api';
import { useToast } from '../ToastProvider';
import { useAIInterpretation } from './useAIInterpretation';
import type { ChartInterpretationRequest, InterpretationRequest } from './types';

interface InterpretationResult {
  data?: unknown;
  content?: string;
}

interface InterpretationFormProps {
  onInterpretationGenerated?: (interpretation: InterpretationResult) => void;
  chartId?: string;
  mode?: 'chart' | 'direct'; // chart mode uses existing API, direct mode uses new AI service
}

const InterpretationForm: React.FC<InterpretationFormProps> = ({ 
  onInterpretationGenerated,
  chartId,
  mode = 'direct' // Default to new AI service
}) => {
  // Mock user for development - remove auth dependency for now
  const user = { uid: 'mock-user' };
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateInterpretation, interpretation, loading, error } = useAIInterpretation();
  
  const [formData, setFormData] = useState({
    type: 'natal',
    focus: [] as string[],
    question: '',
    // Fields for direct AI interpretation
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    interpretationType: 'general' as InterpretationRequest['interpretationType']
  });

  const interpretationTypes = [
    { value: 'natal', label: 'Natal Chart', description: 'Core personality and life path analysis' },
    { value: 'transit', label: 'Current Transits', description: 'Current planetary influences' },
    { value: 'synastry', label: 'Relationship Compatibility', description: 'Compare two charts for compatibility' },
    { value: 'composite', label: 'Composite Chart', description: 'Relationship dynamics and purpose' },
  ];

  const aiInterpretationTypes = [
    { value: 'general', label: 'General Reading', description: 'Overall cosmic blueprint and life theme' },
    { value: 'personality', label: 'Personality Analysis', description: 'Deep dive into character traits and strengths' },
    { value: 'career', label: 'Career Guidance', description: 'Professional path and natural talents' },
    { value: 'relationships', label: 'Relationship Insights', description: 'Love compatibility and relationship patterns' }
  ];

  const focusAreas = [
    'Personality', 'Career', 'Relationships', 'Life Purpose', 'Challenges', 
    'Strengths', 'Current Cycle', 'Future Trends', 'Spiritual Growth'
  ];

  const handleFocusToggle = (focus: string): void => {
    setFormData(prev => ({
      ...prev,
      focus: prev.focus.includes(focus)
        ? prev.focus.filter(f => f !== focus)
        : [...prev.focus, focus]
    }));
  };

  const handleChartGenerate = async (): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate interpretations",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const requestData: ChartInterpretationRequest = {
        chartId: chartId ?? 'default',
        userId: user.uid,
        type: formData.type,
        focus: formData.focus.length > 0 ? formData.focus : undefined,
      };

      // Add question to request if provided
      const bodyData = {
        ...requestData,
        ...(formData.question.trim() !== '' && { question: formData.question })
      };

      const result = await generateAIInterpretation(bodyData as ChartInterpretationRequest);
      
      toast({
        title: "Interpretation Generated",
        description: "Your personalized astrological interpretation is ready",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onInterpretationGenerated) {
        onInterpretationGenerated({ data: result.data });
      }

    } catch (error) {
      console.error('Error generating interpretation:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate interpretation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectGenerate = async (): Promise<void> => {
    if (!formData.birthDate || !formData.birthTime || !formData.birthLocation) {
      toast({
        title: "Missing Information",
        description: "Please provide your birth date, time, and location",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const requestData: InterpretationRequest = {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthLocation: formData.birthLocation,
        interpretationType: formData.interpretationType,
      };

      await generateInterpretation(requestData);
      
      if (interpretation) {
        toast({
          title: "Interpretation Generated",
          description: "Your personalized AI interpretation is ready",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (onInterpretationGenerated) {
          onInterpretationGenerated({ content: interpretation });
        }
      }

    } catch (error) {
      console.error('Error generating interpretation:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate interpretation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerate = () => {
    if (mode === 'chart') {
      return handleChartGenerate();
    } else {
      return handleDirectGenerate();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cosmic-dark/60 backdrop-blur-xl border border-cosmic-silver/20 rounded-xl">
      <h2 className="text-2xl font-bold text-cosmic-gold mb-6 font-playfair">
        Generate AI Interpretation
      </h2>

      <div className="space-y-6">
        {mode === 'direct' && (
          <>
            {/* Birth Information for Direct AI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="birth-date" className="block text-cosmic-gold font-medium mb-2">
                  Birth Date
                </label>
                <input
                  id="birth-date"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e): void => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none"
                  title="Select your birth date"
                  aria-label="Birth date"
                />
              </div>
              <div>
                <label htmlFor="birth-time" className="block text-cosmic-gold font-medium mb-2">
                  Birth Time
                </label>
                <input
                  id="birth-time"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e): void => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                  className="w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none"
                  title="Select your birth time"
                  aria-label="Birth time"
                />
              </div>
              <div>
                <label htmlFor="birth-location" className="block text-cosmic-gold font-medium mb-2">
                  Birth Location
                </label>
                <input
                  id="birth-location"
                  type="text"
                  value={formData.birthLocation}
                  onChange={(e): void => setFormData(prev => ({ ...prev, birthLocation: e.target.value }))}
                  placeholder="City, Country"
                  className="w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none"
                />
              </div>
            </div>

            {/* AI Interpretation Type */}
            <div>
              <label className="block text-cosmic-gold font-medium mb-3">
                Interpretation Focus
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiInterpretationTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.interpretationType === type.value
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interpretationType"
                      value={type.value}
                      checked={formData.interpretationType === type.value}
                      onChange={(e): void => setFormData(prev => ({ 
                        ...prev, 
                        interpretationType: e.target.value as InterpretationRequest['interpretationType']
                      }))}
                      className="sr-only"
                      aria-labelledby={`interpretation-type-${type.value}`}
                      aria-label={`${type.label}: ${type.description}`}
                    />
                    <div className="text-cosmic-silver">
                      <div className="font-semibold" id={`interpretation-type-${type.value}`}>{type.label}</div>
                      <div className="text-sm text-cosmic-silver/70 mt-1">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'chart' && (
          <>
            {/* Interpretation Type */}
            <div>
              <label className="block text-cosmic-gold font-medium mb-3">
                Interpretation Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interpretationTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="sr-only"
                      aria-labelledby={`chart-type-${type.value}`}
                      aria-label={`${type.label}: ${type.description}`}
                    />
                    <div className="text-cosmic-silver">
                      <div className="font-semibold" id={`chart-type-${type.value}`}>{type.label}</div>
                      <div className="text-sm text-cosmic-silver/70 mt-1">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-cosmic-gold font-medium mb-3">
                Focus Areas (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((focus) => (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => handleFocusToggle(focus)}
                    className={`px-3 py-2 text-sm rounded-full border transition-all ${
                      formData.focus.includes(focus)
                        ? 'bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/50'
                        : 'bg-cosmic-dark/40 text-cosmic-silver/70 border-cosmic-silver/30 hover:border-cosmic-silver/50'
                    }`}
                  >
                    {focus}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Question */}
            <div>
              <label className="block text-cosmic-gold font-medium mb-3">
                Specific Question (Optional)
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Ask a specific question about your chart..."
                className="w-full p-3 bg-cosmic-dark/40 border border-cosmic-silver/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/50 focus:border-cosmic-gold focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || loading || (mode === 'chart' && !user)}
          className="w-full py-3 px-6 bg-cosmic-gold text-cosmic-dark font-semibold rounded-lg hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {(isGenerating || loading) ? (
            <>
              <div className="w-5 h-5 border-2 border-cosmic-dark border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🔮</span>
              <span>Generate Interpretation</span>
            </>
          )}
        </button>

        {mode === 'chart' && !user && (
          <p className="text-cosmic-silver/70 text-center text-sm">
            Please log in to generate personalized interpretations
          </p>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {interpretation && (
          <div className="p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg">
            <h3 className="text-cosmic-gold font-semibold mb-2">Your Interpretation:</h3>
            <p className="text-cosmic-silver whitespace-pre-wrap">{interpretation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterpretationForm;