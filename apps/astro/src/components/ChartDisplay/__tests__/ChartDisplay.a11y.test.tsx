import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ChartDisplay } from '../ChartDisplay';
import type { ChartLike } from '../normalizeChart';

// Mock the heavy dependencies
vi.mock('@cosmichub/ui', async () => {
  const actual = await vi.importActual('@cosmichub/ui');
  return {
    ...actual,
    Accordion: ({ children, value }: any) => (
      <div data-testid="accordion" data-value={JSON.stringify(value)}>
        {children}
      </div>
    ),
    AccordionItem: ({ children, value }: any) => (
      <div data-testid="accordion-item" data-value={value}>
        {children}
      </div>
    ),
    AccordionTrigger: ({ children, onClick }: any) => (
      <button onClick={onClick} data-testid="accordion-trigger">
        {children}
      </button>
    ),
    AccordionContent: ({ children }: any) => <div>{children}</div>,
  };
});

describe('ChartDisplay keyboard navigation & accessibility', () => {
  const mockChart: ChartLike = {
    planets: {
      sun: { position: 0, retrograde: false, sign: 'aries', degree: 0, house: 1 },
      moon: { position: 30, retrograde: false, sign: 'taurus', degree: 30, house: 2 },
    },
    asteroids: {
      chiron: { position: 60, retrograde: false, sign: 'gemini', degree: 60, house: 3 },
    },
    points: {},
    houses: [
      { cusp: 0 },
      { cusp: 30 },
    ],
    aspects: [
      { planet1: 'sun', planet2: 'moon', type: 'sextile', orb: 2 },
    ],
  };

  it('supports keyboard navigation for search functionality', async () => {
    render(<ChartDisplay chart={mockChart} />);
    
    // Find search input by placeholder or label
    const searchInput = screen.getByPlaceholderText(/search/i) || screen.getByRole('textbox');
    
    // Type search term
    fireEvent.change(searchInput, { target: { value: 'sun' } });
    
    // Verify search term is applied
    expect(searchInput).toHaveValue('sun');
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');
  });

  it('announces filtered results to screen readers', async () => {
    render(<ChartDisplay chart={mockChart} />);
    
    // Look for live region that announces filter results
    const liveRegion = screen.getByRole('status', { name: /astrology chart data/i });
    expect(liveRegion).toBeInTheDocument();
    
    // Check for accessible filter feedback
    await waitFor(() => {
      const announcement = screen.getByText(/filtered results:/i);
      expect(announcement).toBeInTheDocument();
    });
  });

  it('provides proper ARIA labels for overview cards', () => {
    render(<ChartDisplay chart={mockChart} />);
    
    // Overview cards should be accessible
    const overviewSection = screen.getByRole('status');
    expect(overviewSection).toHaveAttribute('aria-live', 'polite');
    
    // Look for planet count card
    expect(screen.getByText('🪐 Planets')).toBeInTheDocument();
    expect(screen.getByText('☄️ Asteroids')).toBeInTheDocument();
  });

  it('supports view toggle keyboard interaction', async () => {
    render(<ChartDisplay chart={mockChart} />);
    
    // Find view toggle buttons
    const separateViewBtn = screen.getByRole('button', { name: /separate tables/i });
    
    // Test button activation with keyboard
    fireEvent.keyDown(separateViewBtn, { key: ' ', code: 'Space' });
    fireEvent.click(separateViewBtn);
    
    // Verify view change (separate view should be active)
    expect(separateViewBtn).toHaveClass(/bg-cosmic-gold/);
  });

  it('provides accessible error states', () => {
    // Test error state accessibility
    render(<ChartDisplay chart={null} />);
    
    // Error should be announced
    const errorAlert = screen.getByRole('alert', { name: /no chart data available/i });
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
  });

  it('provides accessible loading states', () => {
    // Mock loading state by not providing chart data initially
    const { rerender } = render(<ChartDisplay chart={undefined} />);
    
    // Loading state should be accessible
    const loadingStatus = screen.getByRole('status', { name: /loading chart data/i });
    expect(loadingStatus).toBeInTheDocument();
    expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
    
    // Test loading completion
    rerender(<ChartDisplay chart={mockChart} />);
    expect(screen.queryByRole('status', { name: /loading/i })).not.toBeInTheDocument();
  });
});
