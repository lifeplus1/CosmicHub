import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from '@cosmichub/ui';
import './ErrorBoundary.stories.css';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Feedback/ErrorBoundary (Astro)'.replace(/\s+/g, ' '),
  component: ErrorBoundary,
  args: {
    name: 'DemoBoundary',
  },
};
export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

const Boom: React.FC<{ mode?: 'render' | 'effect' }> = React.memo(function Boom({
  mode = 'render',
}) {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  if (mode === 'render' && count > 1) {
    throw new Error('Render explosion after 2 clicks');
  }
  
  return (
    <div className='error-boundary-demo'>
      <p>Click the button to increment. After 2 clicks it will throw.</p>
      <button 
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Increment counter, current count: ${count}`}
        type="button"
      >
        Clicks: {count}
      </button>
    </div>
  );
});

export const Basic: Story = {
  render: (args) => (
    <ErrorBoundary {...args}>
      <Boom />
    </ErrorBoundary>
  ),
};

export const WithFallback: Story = {
  render: (args) => (
    <ErrorBoundary
      {...args}
      fallback={
        <div className='error-boundary-fallback'>Custom fallback UI</div>
      }
    >
      <Boom />
    </ErrorBoundary>
  ),
};
