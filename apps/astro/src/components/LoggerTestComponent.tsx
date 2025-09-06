import React, { useState, useCallback } from 'react';
import { devConsole } from '../config/environment';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorBoundary } from '@cosmichub/ui';

// Test component to verify logger functionality
const LoggerTestComponent: React.FC = React.memo(function LoggerTestComponent() {
  const [triggerError, setTriggerError] = useState(false);

  // Memoized event handlers for performance
  const testRegularLogging = useCallback(() => {
    console.log('🔍 Testing logging systems...');
    
    // Test devConsole
    devConsole.log?.('✅ devConsole.log works');
    devConsole.warn?.('⚠️ devConsole.warn works');
    devConsole.error?.('❌ devConsole.error works');
    devConsole.info?.('ℹ️ devConsole.info works');
    devConsole.debug?.('🐛 devConsole.debug works');
    
    console.log('✅ Regular logging test completed');
  }, []);

  const triggerErrorTest = useCallback(() => {
    console.log('🔥 About to trigger error for error boundary test...');
    setTriggerError(true);
  }, []);

  // Component that throws an error when triggerError is true
  const ErrorThrowingComponent: React.FC = () => {
    if (triggerError) {
      throw new Error('Test error from logger verification component');
    }
    return <div>No error - component is working normally</div>;
  };

  return (
    <ErrorBoundary level="component" name="LoggerTestComponent">
      <Card className="cosmic-glass border-cosmic-purple/30 bg-cosmic-dark/50 shadow-lg shadow-cosmic-purple/20 max-w-2xl mx-auto m-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-cosmic-gold font-cinzel flex items-center gap-2">
            🔧 Logger Test Component
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={testRegularLogging}
              variant="default"
              className="px-6 py-3 font-semibold"
              aria-label="Test regular logging functionality"
            >
              📝 Test Regular Logging
            </Button>

            <Button
              onClick={triggerErrorTest}
              variant="destructive"
              className="px-6 py-3 font-semibold"
              aria-label="Test error boundary logging functionality"
            >
              ⚠️ Test Error Boundary
            </Button>
          </div>

          <Card className="border-cosmic-silver/20 bg-cosmic-dark/30">
            <CardContent className="p-4">
              <ErrorThrowingComponent />
            </CardContent>
          </Card>

          <div className="text-sm text-cosmic-silver/70 leading-relaxed bg-cosmic-blue/10 p-4 rounded-lg border border-cosmic-blue/20">
            <strong className="text-cosmic-gold">Instructions:</strong> Check the browser console to see logging output.
            The error boundary logging will be visible when you trigger an error.
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
});

export default LoggerTestComponent;
