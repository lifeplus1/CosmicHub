import React, { useState } from 'react';
import { Button } from '@cosmichub/ui';

interface ErrorTestComponentProps {
  title?: string;
}

const ErrorTestComponent: React.FC<ErrorTestComponentProps> = ({ 
  title = "Error Boundary Test" 
}) => {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    // This will trigger the error boundary
    throw new Error('Test error triggered intentionally for error boundary demonstration');
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-cosmic-darker rounded-lg shadow-lg border border-cosmic-gold/20">
      <h3 className="text-xl font-semibold text-cosmic-gold mb-4">{title}</h3>
      
      <div className="space-y-4">
        <p className="text-cosmic-silver">
          This component can trigger an error to test the error boundary functionality.
        </p>
        
        <Button 
          onClick={() => setShouldThrowError(true)}
          variant="primary"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          🚫 Trigger Error
        </Button>
        
        <div className="mt-4 p-3 bg-cosmic-purple/20 rounded border border-cosmic-purple/30">
          <h4 className="text-sm font-medium text-cosmic-silver mb-2">What happens when you click:</h4>
          <ol className="text-xs text-cosmic-silver/80 space-y-1">
            <li>1. Component throws an error</li>
            <li>2. Error boundary catches it</li>
            <li>3. Displays custom error UI</li>
            <li>4. Shows recovery options</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestComponent;
