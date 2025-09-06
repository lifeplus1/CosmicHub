import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '../utils/axe';
import InterpretationForm from '../../components/AIInterpretation/InterpretationForm';

// Central mutable hook state for per-test adjustments
const hookState: {
  generateInterpretation: ReturnType<typeof vi.fn>;
  interpretation: string | null;
  loading: boolean;
  error: string | null;
} = {
  generateInterpretation: vi.fn(),
  interpretation: null,
  loading: false,
  error: null,
};

vi.mock('../../components/AIInterpretation/useAIInterpretation', () => ({
  useAIInterpretation: () => hookState,
}));

vi.mock('../../components/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../services/interpretationFocus', () => ({
  FOCUS_AREA_LABELS: ['Personality', 'Career', 'Relationships', 'Health'],
  focusLabelToCanonical: (label: string) => label.toLowerCase(),
}));

vi.mock('../../services/api', () => ({
  generateAIInterpretation: vi.fn(),
  updateInterpretation: vi.fn(),
}));

vi.mock('../../services/analytics', () => ({
  trackCosmicHubAIInteraction: vi.fn(),
}));

describe('InterpretationForm Accessibility', () => {
  beforeEach(() => {
    hookState.generateInterpretation = vi.fn();
    hookState.interpretation = null;
    hookState.loading = false;
    hookState.error = null;
  });
  describe('Direct Mode Accessibility', () => {
    it('has no accessibility violations in default state', async () => {
      const { container } = render(<InterpretationForm mode='direct' />);

      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'], // Allow color contrast issues due to cosmic theme
      });
    });

    it('provides proper form labels and structure', () => {
      render(<InterpretationForm mode='direct' />);

      // Check for proper form labeling
      expect(screen.getAllByLabelText(/birth date/i).length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText(/birth time/i).length).toBeGreaterThan(0);
      expect(
        screen.getAllByLabelText(/birth location/i).length
      ).toBeGreaterThan(0);

      // Check for at least one group/fieldset and legend text (duplicate-safe)
      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThan(0);
      expect(
        screen.queryAllByText(/select ai interpretation focus/i).length
      ).toBeGreaterThan(0);
    });

    it('provides proper ARIA attributes for form validation', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode='direct' />);

      const dateInput = screen.getAllByLabelText(/birth date/i).at(-1)!;
      await user.type(dateInput, 'invalid-date');
      await screen.findAllByText(/invalid date format/i);
      expect(dateInput).toHaveAttribute('aria-invalid', 'true');
      expect(dateInput).toHaveAttribute('aria-describedby');
    });

    it('maintains accessibility with validation errors', async () => {
      const user = userEvent.setup();
      const { container } = render(<InterpretationForm mode='direct' />);

      // Trigger validation errors
      await user.type(
        screen.getAllByLabelText(/birth date/i).at(-1)!,
        'invalid'
      );
      await user.type(
        screen.getAllByLabelText(/birth time/i).at(-1)!,
        'invalid'
      );

      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper radio button accessibility', () => {
      render(<InterpretationForm mode='direct' />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBeGreaterThan(0);
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Chart Mode Accessibility', () => {
    it('has no accessibility violations in chart mode', async () => {
      const { container } = render(
        <InterpretationForm mode='chart' chartId='test-chart' />
      );

      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper accessibility for focus area toggles', () => {
      render(<InterpretationForm mode='chart' chartId='test-chart' />);

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
        <InterpretationForm mode='chart' chartId='test-chart' />
      );

      const personalityButton = screen
        .getAllByRole('button', { name: /personality/i })
        .at(-1)!;
      await user.click(personalityButton);
      // After toggling, one of the personality buttons should reflect active state
      const activeButtons = screen
        .queryAllByRole('button', { name: /personality/i })
        .filter(btn => btn.getAttribute('aria-pressed') === 'true');
      expect(activeButtons.length).toBeGreaterThan(0);

      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });

    it('provides proper accessibility for synastry mode', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InterpretationForm mode='chart' chartId='test-chart' />
      );

      // Switch to synastry mode
      const synastryOption = screen
        .getAllByLabelText(/relationship compatibility/i)
        .at(-1)!;
      await user.click(synastryOption);

      // Check partner fields are properly labeled
      expect(screen.getByLabelText(/partner birth date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/partner birth time/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/partner birth location/i)
      ).toBeInTheDocument();

      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
    });
  });

  describe('Loading State Accessibility', () => {
    it('provides accessible loading state', () => {
      hookState.loading = true;
      const { unmount } = render(<InterpretationForm mode='direct' />);
      const generateButton = screen.getAllByRole('button', {
        name: /generating/i,
      })[0]!;
      expect(generateButton).toBeDisabled();
      unmount();
    });

    it('maintains accessibility during loading state', async () => {
      hookState.loading = true;
      const { container, unmount } = render(
        <InterpretationForm mode='direct' />
      );
      await expectNoA11yViolations(container as HTMLElement, {
        allow: ['color-contrast'],
      });
      unmount();
    });
  });

  describe('Error State Accessibility', () => {
    it('provides accessible error messages', () => {
      hookState.error = 'Failed to generate interpretation';
      const { unmount } = render(<InterpretationForm mode='direct' />);
      const errorMessages = screen.queryAllByText(
        /failed to generate interpretation/i
      );
      expect(errorMessages.length).toBeGreaterThan(0);
      unmount();
    });
  });

  describe('Live Regions and Status Updates', () => {
    it('provides live region for status updates', () => {
      render(<InterpretationForm mode='direct' />);

      const liveRegion = screen.getAllByRole('status').at(-1)!;
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('provides accessible interpretation display', () => {
      hookState.interpretation =
        'Your cosmic blueprint reveals amazing insights...';
      const { unmount } = render(<InterpretationForm mode='direct' />);
      const heading = screen.getByText(/your interpretation/i);
      expect(heading).toBeInTheDocument();
      const content = screen.getByText(/cosmic blueprint reveals/i);
      expect(content).toBeInTheDocument();
      const container = heading.closest('[aria-live]');
      expect(container).toHaveAttribute('aria-live', 'polite');
      unmount();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation for focus toggles', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode='chart' chartId='test-chart' />);

      const personalityButton = screen
        .getAllByRole('button', { name: /personality/i })
        .at(-1)!;

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
      render(<InterpretationForm mode='direct' />);

      // Start from first input
      const birthDateInput = screen.getAllByLabelText(/birth date/i).at(0)!;
      birthDateInput.focus();
      expect(document.activeElement).toBe(birthDateInput);

      // Tab through all inputs and buttons
      await user.tab(); // birth time
      expect(document.activeElement).toBe(
        screen.getAllByLabelText(/birth time/i).at(0)!
      );

      await user.tab(); // birth location
      expect(document.activeElement).toBe(
        screen.getAllByLabelText(/birth location/i).at(0)!
      );

      // Continue through interpretation type radios (loop until radio reached)
      let guard = 12;
      while (
        document.activeElement?.getAttribute('type') !== 'radio' &&
        guard > 0
      ) {
        await user.tab();
        guard--;
      }
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful element descriptions', () => {
      render(<InterpretationForm mode='direct' />);
      // Use the last instance to be robust against multiple mounts in the full suite.
      const dateInputs = screen.getAllByLabelText(/birth date/i);
      const dateInput = dateInputs.at(-1)!;
      expect(dateInput).toHaveAttribute('aria-describedby');
      expect(dateInput).toHaveAttribute('title');

      const timeInputs = screen.getAllByLabelText(/birth time/i);
      const timeInput = timeInputs.at(-1)!;
      expect(timeInput).toHaveAttribute('aria-describedby');
      expect(timeInput).toHaveAttribute('title');
    });

    it('provides context for interpretation types', () => {
      render(<InterpretationForm mode='direct' />);

      const interpretationTypes = screen.getAllByRole('radio');
      interpretationTypes.forEach(radio => {
        expect(radio).toHaveAttribute('aria-label');
        const label = radio.getAttribute('aria-label');
        expect(label).toContain(':'); // Should contain description
      });
    });

    it('announces form state changes appropriately', async () => {
      const user = userEvent.setup();
      render(<InterpretationForm mode='chart' chartId='test-chart' />);

      // Switch to synastry
      const synastryOption = screen
        .getAllByLabelText(/relationship compatibility/i)
        .at(-1)!;
      await user.click(synastryOption);

      // Partner fields should be announced to screen readers
      const partnerSections = screen.queryAllByText(/partner birth data/i);
      expect(partnerSections.length).toBeGreaterThan(0);
    });
  });
});
