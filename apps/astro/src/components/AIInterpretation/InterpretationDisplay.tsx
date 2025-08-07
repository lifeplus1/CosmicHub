import React from 'react';

interface InterpretationDisplayProps {
  interpretation: string | null;
  loading: boolean;
  error: string | null;
}

const InterpretationDisplay: React.FC<InterpretationDisplayProps> = ({
  interpretation,
  loading,
  error,
}) => {
  if (loading) {
    return <div className="text-center">Loading interpretation...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!interpretation) {
    return <div className="text-gray-500">Enter your details to get an interpretation.</div>;
  }

  return (
    <div className="p-4 mt-6 border rounded-md">
      <h2 className="mb-2 text-xl font-semibold">Your Astrological Interpretation</h2>
      <p>{interpretation}</p>
    </div>
  );
};

export default InterpretationDisplay;