import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
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

const Boom: React.FC<{ mode?: 'render' | 'effect' }> = ({
  mode = 'render',
}) => {
  const [count, setCount] = useState(0);
  if (mode === 'render' && count > 1) {
    throw new Error('Render explosion after 2 clicks');
  }
  return (
    <div className='error-boundary-demo'>
      <p>Click the button to increment. After 2 clicks it will throw.</p>
      <button onClick={() => setCount(c => c + 1)}>Clicks: {count}</button>
    </div>
  );
};

export const Basic: Story = {
  render: args => (
    <ErrorBoundary {...args}>
      <Boom />
    </ErrorBoundary>
  ),
};

export const WithFallback: Story = {
  render: args => (
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
