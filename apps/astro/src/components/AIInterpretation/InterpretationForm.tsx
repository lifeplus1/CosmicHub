import React, { useState } from 'react';
import { useAuth } from '@cosmichub/auth';
import { generateAIInterpretation } from '../../services/api';
import { useToast } from '../ToastProvider';
import type { InterpretationRequest } from './types';

interface InterpretationFormProps {
  onInterpretationGenerated?: (interpretation: any) => void;
  chartId?: string;
}

const InterpretationForm: React.FC<InterpretationFormProps> = ({ 
  onInterpretationGenerated,
  chartId 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'natal',
    focus: [] as string[],
    question: '',
  });

  const interpretationTypes = [
    { value: 'natal', label: 'Natal Chart', description: 'Core personality and life path analysis' },
    { value: 'transit', label: 'Current Transits', description: 'Current planetary influences' },
    { value: 'synastry', label: 'Relationship Compatibility', description: 'Compare two charts for compatibility' },
    { value: 'composite', label: 'Composite Chart', description: 'Relationship dynamics and purpose' },
  ];

  const focusAreas = [
    'Personality', 'Career', 'Relationships', 'Life Purpose', 'Challenges', 
    'Strengths', 'Current Cycle', 'Future Trends', 'Spiritual Growth'
  ];

  const handleFocusToggle = (focus: string) => {
    setFormData(prev => ({
      ...prev,
      focus: prev.focus.includes(focus)
        ? prev.focus.filter(f => f !== focus)
        : [...prev.focus, focus]
    }));
  };

  const handleGenerate = async () => {
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
      const requestData: InterpretationRequest = {
        chartId: chartId || 'default',
        userId: user.uid,
        type: formData.type,
        focus: formData.focus.length > 0 ? formData.focus : undefined,
      };

      // Add question to request if provided
      const bodyData = {
        ...requestData,
        ...(formData.question && { question: formData.question })
      };

      const result = await generateAIInterpretation(bodyData);
      
      toast({
        title: "Interpretation Generated",
        description: "Your personalized astrological interpretation is ready",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onInterpretationGenerated) {
        onInterpretationGenerated(result.data);
      }

      // Reset form
      setFormData({
        type: 'natal',
        focus: [],
        question: '',
      });

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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-cosmic-dark/60 backdrop-blur-xl border border-cosmic-silver/20 rounded-xl">
      <h2 className="text-2xl font-bold text-cosmic-gold mb-6 font-playfair">
        Generate AI Interpretation
      </h2>

      <div className="space-y-6">
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
                />
                <div className="text-cosmic-silver">
                  <div className="font-semibold">{type.label}</div>
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

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !user}
          className="w-full py-3 px-6 bg-cosmic-gold text-cosmic-dark font-semibold rounded-lg hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
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

        {!user && (
          <p className="text-cosmic-silver/70 text-center text-sm">
            Please log in to generate personalized interpretations
          </p>
        )}
      </div>
    </div>
  );
};

export default InterpretationForm;