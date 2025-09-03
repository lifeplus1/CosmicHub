import React, { useState } from 'react';
import { devConsole } from '../config/environment';

// Test component to verify logger functionality
const LoggerTestComponent: React.FC = () => {
  const [triggerError, setTriggerError] = useState(false);

  // Test regular logging
  const testRegularLogging = () => {
    console.log('🔍 Testing logging systems...');
    
    // Test devConsole
    devConsole.log?.('✅ devConsole.log works');
    devConsole.warn?.('⚠️ devConsole.warn works');
    devConsole.error?.('❌ devConsole.error works');
    devConsole.info?.('ℹ️ devConsole.info works');
    devConsole.debug?.('🐛 devConsole.debug works');
    
    console.log('✅ Regular logging test completed');
  };

  // Component that throws an error when triggerError is true
  const ErrorThrowingComponent: React.FC = () => {
    if (triggerError) {
      throw new Error('Test error from logger verification component');
    }
    return <div>No error - component is working normally</div>;
  };

  return (
    <div className="p-5 border border-cosmic-silver/20 bg-cosmic-dark/30 backdrop-blur-lg rounded-lg m-3 cosmic-glass">
      <h3 className="text-lg font-semibold text-cosmic-silver mb-4 gradient-text-cosmic">Logger Test Component</h3>
      
      <div className="mb-4 flex flex-wrap gap-3">
        <button 
          onClick={testRegularLogging}
          className="px-4 py-2 bg-blue-600/80 text-white border-none rounded-lg cursor-pointer 
                     hover:bg-blue-500/90 transition-colors cosmic-button cosmic-focus
                     cosmic-glow font-medium"
        >
          Test Regular Logging
        </button>
        
        <button 
          onClick={() => {
            console.log('🔥 About to trigger error for error boundary test...');
            setTriggerError(true);
          }}
          className="px-4 py-2 bg-red-600/80 text-white border-none rounded-lg cursor-pointer 
                     hover:bg-red-500/90 transition-colors cosmic-button cosmic-focus
                     font-medium"
        >
          Test Error Boundary Logging
        </button>
      </div>
      
      <div className="p-4 bg-cosmic-dark/50 border border-cosmic-silver/10 rounded-lg
                      backdrop-blur-sm">
        <ErrorThrowingComponent />
      </div>
      
      <div className="mt-4 text-xs text-cosmic-silver/70 leading-relaxed">
        Check the browser console to see logging output.
        The error boundary logging will be visible when you trigger an error.
      </div>
    </div>
  );
};

export default LoggerTestComponent;
