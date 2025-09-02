import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
// @ts-expect-error: types may not resolve in monorepo test context
import userEvent from '@testing-library/user-event';

// Import test utilities
import { TestWrappers } from '../../../test-utils/TestWrappers';

// Import the component
import InterpretationForm from '../InterpretationForm';

describe('InterpretationForm - Auth Fix Test', () => {
  it('renders without authentication errors', async () => {
    // This should NOT crash with auth errors anymore
    const { container } = render(
      <TestWrappers>
        <InterpretationForm />
      </TestWrappers>
    );
    
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/generate ai interpretation/i)).toBeInTheDocument();
  });

  it('allows user interactions without auth errors', async () => {
    const user = userEvent.setup();
    render(
      <TestWrappers>
        <InterpretationForm />
      </TestWrappers>
    );
    
    // Try to interact with form elements
    const dateInput = screen.getByLabelText(/birth date/i);
    await user.type(dateInput, '1990-05-15');
    
    // Should not crash
    expect(dateInput).toHaveValue('1990-05-15');
  });

  it('can attempt to generate interpretation in development mode', async () => {
    const user = userEvent.setup();
    render(
      <TestWrappers>
        <InterpretationForm />
      </TestWrappers>
    );
    
    // Fill out the form
    await user.type(screen.getByLabelText(/birth date/i), '1990-05-15');
    await user.type(screen.getByLabelText(/birth time/i), '14:30');
    await user.type(screen.getByLabelText(/birth location/i), 'New York');
    
    // Try to generate - should NOT crash with auth errors
    const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
    await user.click(generateButton);
    
    // The API call will still fail, but shouldn't crash with auth errors
    expect(generateButton).toBeInTheDocument();
  });
});
