import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { expectNoA11yViolations } from '../../a11y/utils/axe';
import InterpretationForm from '../InterpretationForm';

// Mock dependencies
vi.mock('../useAIInterpretation', () => ({
  useAIInterpretation: () => ({
    generateInterpretation: vi.fn(),
    interpretation: null,
    loading: false,
    error: null,
  }),
}));

vi.mock('../../../components/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../../services/interpretationFocus', () => ({
  FOCUS_AREA_LABELS: ['Personality', 'Career', 'Relationships', 'Health'],
  focusLabelToCanonical: (label: string) => label.toLowerCase(),
}));

vi.mock('../../../services/api', () => ({
  generateAIInterpretation: vi.fn(),
  updateInterpretation: vi.fn(),
}));

vi.mock('../../../services/analytics', () => ({
  trackCosmicHubAIInteraction: vi.fn(),
}));

describe('InterpretationForm Accessibility', () => {
  describe('Direct Mode Accessibility', () => {
    it('has no accessibility violations in default state', async () => {
      const { container } = render(<InterpretationForm mode="direct" />);
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'], // Allow color contrast issues due to cosmic theme
      });
    });

    it('provides proper form labels and structure', () => {
      render(<InterpretationForm mode="direct" />);
      
      // Check for proper form labeling
      expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birth time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birth location/i)).toBeInTheDocument();
      
      // Check for fieldset and legend
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText(/select ai interpretation focus/i)).toBeInTheDocument();
    });

    it('provides proper ARIA attributes for form validation', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode="direct" />);
      
      const dateInput = screen.getByLabelText(/birth date/i);
      await user.type(dateInput, 'invalid-date');
      
      expect(dateInput).toHaveAttribute('aria-invalid', 'true');
      expect(dateInput).toHaveAttribute('aria-describedby');
    });

    it('maintains accessibility with validation errors', async () => {
      const user = userEvent.setup();
      const { container } = render(<InterpretationForm mode="direct" />);
      
      // Trigger validation errors
      await user.type(screen.getByLabelText(/birth date/i), 'invalid');
      await user.type(screen.getByLabelText(/birth time/i), 'invalid');
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper radio button accessibility', () => {
      render(<InterpretationForm mode="direct" />);
      
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'interpretationType');
        expect(radio).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Chart Mode Accessibility', () => {
    it('has no accessibility violations in chart mode', async () => {
      const { container } = render(
        <InterpretationForm mode="chart" chartId="test-chart" />
      );
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper accessibility for focus area toggles', () => {
      render(<InterpretationForm mode="chart" chartId="test-chart" />);
      
      const focusButtons = screen.getAllByRole('button', { pressed: false });
      const focusAreaButtons = focusButtons.filter(button => 
        ['Personality', 'Career', 'Relationships', 'Health'].some(area =>
          button.textContent?.includes(area)
        )
      );
      
      focusAreaButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
        expect(button).toHaveAttribute('data-active');
      });
    });

    it('maintains accessibility when focus areas are toggled', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InterpretationForm mode="chart" chartId="test-chart" />
      );
      
      const personalityButton = screen.getByRole('button', { name: /personality/i });
      await user.click(personalityButton);
      
      expect(personalityButton).toHaveAttribute('aria-pressed', 'true');
      expect(personalityButton).toHaveAttribute('data-active', 'true');
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper accessibility for synastry mode', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InterpretationForm mode="chart" chartId="test-chart" />
      );
      
      // Switch to synastry mode
      const synastryOption = screen.getByLabelText(/relationship compatibility/i);
      await user.click(synastryOption);
      
      // Check partner fields are properly labeled
      expect(screen.getByLabelText(/partner birth date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/partner birth time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/partner birth location/i)).toBeInTheDocument();
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });
  });

  describe('Loading State Accessibility', () => {
    it('provides accessible loading state', () => {
      // Mock loading state
      vi.doMock('../useAIInterpretation', () => ({
        useAIInterpretation: () => ({
          generateInterpretation: vi.fn(),
          interpretation: null,
          loading: true,
          error: null,
        }),
      }));
      
      const { unmount } = render(<InterpretationForm mode="direct" />);
      
      const generateButton = screen.getByRole('button', { name: /generating/i });
      expect(generateButton).toBeDisabled();
      expect(generateButton).toHaveAttribute('aria-disabled', 'true');
      
      unmount();
      vi.doUnmock('../useAIInterpretation');
    });

    it('maintains accessibility during loading state', async () => {
      // Mock loading state
      vi.doMock('../useAIInterpretation', () => ({
        useAIInterpretation: () => ({
          generateInterpretation: vi.fn(),
          interpretation: null,
          loading: true,
          error: null,
        }),
      }));
      
      const { container, unmount } = render(<InterpretationForm mode="direct" />);
      
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
      
      unmount();
      vi.doUnmock('../useAIInterpretation');
    });
  });

  describe('Error State Accessibility', () => {
    it('provides accessible error messages', () => {
      // Mock error state
      vi.doMock('../useAIInterpretation', () => ({
        useAIInterpretation: () => ({
          generateInterpretation: vi.fn(),
          interpretation: null,
          loading: false,
          error: 'Failed to generate interpretation',
        }),
      }));
      
      const { unmount } = render(<InterpretationForm mode="direct" />);
      
      const errorMessage = screen.getByText(/failed to generate interpretation/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role');
      
      unmount();
      vi.doUnmock('../useAIInterpretation');
    });
  });

  describe('Live Regions and Status Updates', () => {
    it('provides live region for status updates', () => {
      render(<InterpretationForm mode="direct" />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('provides accessible interpretation display', () => {
      // Mock interpretation result
      vi.doMock('../useAIInterpretation', () => ({
        useAIInterpretation: () => ({
          generateInterpretation: vi.fn(),
          interpretation: 'Your cosmic blueprint reveals amazing insights...',
          loading: false,
          error: null,
        }),
      }));
      
      const { unmount } = render(<InterpretationForm mode="direct" />);
      
      const interpretationSection = screen.getByText(/your interpretation/i);
      expect(interpretationSection).toBeInTheDocument();
      
      const interpretationContent = screen.getByText(/your cosmic blueprint reveals/i);
      expect(interpretationContent).toBeInTheDocument();
      
      // Check for live region attribute
      const container = interpretationSection.closest('[aria-live]');
      expect(container).toHaveAttribute('aria-live', 'polite');
      
      unmount();
      vi.doUnmock('../useAIInterpretation');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for focus toggles', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode="chart" chartId="test-chart" />);
      
      const personalityButton = screen.getByRole('button', { name: /personality/i });
      
      // Tab to the button
      await user.tab();
      while (document.activeElement !== personalityButton) {
        await user.tab();
      }
      
      expect(document.activeElement).toBe(personalityButton);
      
      // Activate with space/enter
      await user.keyboard(' ');
      expect(personalityButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('provides proper tab order for all interactive elements', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode="direct" />);
      
      // Start from first input
      const birthDateInput = screen.getByLabelText(/birth date/i);
      birthDateInput.focus();
      expect(document.activeElement).toBe(birthDateInput);
      
      // Tab through all inputs and buttons
      await user.tab(); // birth time
      expect(document.activeElement).toBe(screen.getByLabelText(/birth time/i));
      
      await user.tab(); // birth location
      expect(document.activeElement).toBe(screen.getByLabelText(/birth location/i));
      
      // Continue through interpretation type radios
      await user.tab();
      expect(document.activeElement?.getAttribute('type')).toBe('radio');
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful element descriptions', () => {
      render(<InterpretationForm mode="direct" />);
      
      const dateInput = screen.getByLabelText(/birth date/i);
      expect(dateInput).toHaveAttribute('aria-describedby');
      expect(dateInput).toHaveAttribute('title');
      
      const timeInput = screen.getByLabelText(/birth time/i);
      expect(timeInput).toHaveAttribute('aria-describedby');
      expect(timeInput).toHaveAttribute('title');
    });

    it('provides context for interpretation types', () => {
      render(<InterpretationForm mode="direct" />);
      
      const interpretationTypes = screen.getAllByRole('radio');
      interpretationTypes.forEach(radio => {
        expect(radio).toHaveAttribute('aria-label');
        const label = radio.getAttribute('aria-label');
        expect(label).toContain(':'); // Should contain description
      });
    });

    it('announces form state changes appropriately', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode="chart" chartId="test-chart" />);
      
      // Switch to synastry
      const synastryOption = screen.getByLabelText(/relationship compatibility/i);
      await user.click(synastryOption);
      
      // Partner fields should be announced to screen readers
      const partnerSection = screen.getByText(/partner birth data/i);
      expect(partnerSection).toBeInTheDocument();
    });
  });
});
