import React from 'react';
import InterpretationForm from './ai-interpretation/InterpretationForm';
import InterpretationDisplay from './ai-interpretation/InterpretationDisplay';
import { useAIInterpretation } from './ai-interpretation/useAIInterpretation';
import { AIInterpretationData } from './ai-interpretation/types';

const AIInterpretation: React.FC = () => {
  const { interpretation, loading, error, fetchInterpretation } = useAIInterpretation();

  const handleSubmit = (data: AIInterpretationData) => {
    fetchInterpretation(data);
  };

  return (
    <div className="p-4 ai-interpretation-container">
      <h1 className="mb-4 text-2xl font-bold">AI Astrological Interpretation</h1>
      <InterpretationForm onSubmit={handleSubmit} />
      <InterpretationDisplay interpretation={interpretation} loading={loading} error={error} />
    </div>
  );
};

export default AIInterpretation;