import React from 'react';
import { render, screen, fireEvent, waitFor, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, expect } from 'vitest';

// Test utilities for catching UI issues before runtime
export const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']): RenderResult => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

export const renderWithProviders = (component: React.ReactElement): RenderResult => {
  // Add your providers here (Auth, Theme, etc.)
  return renderWithRouter(component);
};

// Hook for testing navigation
export const mockNavigate = () => {
  const mockFn = vi.fn();
  vi.doMock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockFn,
  }));
  return mockFn;
};

// Test for routing errors
export const testNavigation = async (triggerElement: HTMLElement, expectedPath: string) => {
  const navigateMock = mockNavigate();

  fireEvent.click(triggerElement);

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith(expectedPath);
  });
};

// Test for React hooks violations
export const testHooksOrder = (component: React.ComponentType) => {
  // This will catch hooks violations during test execution
  expect(() => {
    renderWithProviders(React.createElement(component));
  }).not.toThrow();
};

// Test for accessibility
export const testAccessibility = (container: HTMLElement) => {
  // Check for alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });

  // Check for aria-labels on interactive elements
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('aria-label');
  });
};

// Test for error boundaries
export const testErrorBoundary = async (ErrorComponent: React.ComponentType, errorMessage: string) => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  renderWithProviders(React.createElement(ErrorComponent));

  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  consoleSpy.mockRestore();
};

// Test for loading states
export const testLoadingState = async (component: React.ComponentType) => {
  renderWithProviders(React.createElement(component));

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

// Test for form validation
export const testFormValidation = async (
  form: HTMLFormElement,
  invalidData: Record<string, string | number | boolean>,
  expectedErrors: string[]
) => {
  // Fill form with invalid data
  Object.entries(invalidData).forEach(([field, value]) => {
    const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  });

  fireEvent.submit(form);

  // Check for validation errors
  await waitFor(() => {
    expectedErrors.forEach(error => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });
};
