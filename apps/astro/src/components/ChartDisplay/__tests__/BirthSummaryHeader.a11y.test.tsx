import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BirthSummaryHeader } from '../BirthSummaryHeader';
import { createStubBirthData } from '../../../test-utils/createStubBirthData';

// Mock the UI components to ensure proper disabled behavior
vi.mock('@cosmichub/ui', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  Button: ({
    children,
    onClick,
    disabled,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    [key: string]: any;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('BirthSummaryHeader accessibility & shortcuts', () => {
  const base = createStubBirthData({
    year: 1990,
    month: 5,
    day: 17,
    hour: 10,
    minute: 45,
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    timezone: 'America/New_York',
  });

  it('announces recalculation state changes', async () => {
    const onEdit = vi.fn();
    const onRecalc = vi.fn();
    const onSave = vi.fn();

    // Test initial state - button should not be disabled
    const { rerender } = render(
      <BirthSummaryHeader
        birthData={base}
        isLoading={false}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );

    // Initially, the button should not be disabled
    const initialButtons = screen.getAllByRole('button');
    const initialRecalcButton = initialButtons.find(button =>
      button.textContent?.includes('Recalculate')
    );
    expect(initialRecalcButton).toBeInTheDocument();
    expect(initialRecalcButton).not.toBeDisabled();

    // Simulate loading state toggle
    rerender(
      <BirthSummaryHeader
        birthData={base}
        isLoading={true}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );

    // Wait for the button to update with the loading state
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const calculatingButton = buttons.find(button =>
        button.textContent?.includes('Calculating…')
      );
      expect(calculatingButton).toBeInTheDocument();

      // Debug: log the button to see what we're getting
      console.log('Button found:', calculatingButton?.outerHTML);
      console.log(
        'Button disabled:',
        calculatingButton?.hasAttribute('disabled')
      );
      console.log(
        'Button aria-disabled:',
        calculatingButton?.getAttribute('aria-disabled')
      );

      expect(calculatingButton).toBeDisabled();
      expect(calculatingButton).toHaveAttribute('disabled');
    });
  });

  it('supports keyboard shortcuts (e, r, s)', () => {
    const onEdit = vi.fn();
    const onRecalc = vi.fn();
    const onSave = vi.fn();
    const { container } = render(
      <BirthSummaryHeader
        birthData={base}
        isLoading={false}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );

    // Use more specific selector to avoid conflicts with other tests
    const region = container.querySelector(
      '[role="region"][aria-labelledby="chart-page-heading"]'
    ) as HTMLElement;
    expect(region).toBeInTheDocument();

    region.focus();
    fireEvent.keyDown(region, { key: 'e' });
    fireEvent.keyDown(region, { key: 'r' });
    fireEvent.keyDown(region, { key: 's' });
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRecalc).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
