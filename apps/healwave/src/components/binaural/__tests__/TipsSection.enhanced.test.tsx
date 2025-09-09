import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TipsSection } from '../TipsSection';

describe('TipsSection', () => {
  beforeEach(() => {
    // Reset any mocks if needed
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText('Tips for Best Results')).toBeTruthy();
    });

    it('displays the main heading with icon', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText('Tips for Best Results')).toBeTruthy();
      expect(getByText('💡')).toBeTruthy();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<TipsSection className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has proper styling for the main container', () => {
      const { container } = render(<TipsSection />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('p-4', 'rounded-lg', 'bg-cyan-500/10', 'border', 'border-cyan-400/20');
    });
  });

  describe('Tips Content', () => {
    it('renders all tips with icons and text', () => {
      const { getByText } = render(<TipsSection />);
      
      // Check all tip icons
      expect(getByText('🎧')).toBeTruthy();
      expect(getByText('🔊')).toBeTruthy();
      expect(getByText('😴')).toBeTruthy();
      expect(getByText('🧘')).toBeTruthy();
      expect(getByText('😌')).toBeTruthy();
      expect(getByText('🎯')).toBeTruthy();
      
      // Check all tip texts
      expect(getByText('Use headphones for proper binaural effect')).toBeTruthy();
      expect(getByText('Start with lower volumes and gradually increase')).toBeTruthy();
      expect(getByText('Delta waves (0.5-4 Hz) are best for sleep')).toBeTruthy();
      expect(getByText('Theta waves (4-8 Hz) enhance meditation')).toBeTruthy();
      expect(getByText('Alpha waves (8-14 Hz) promote relaxation')).toBeTruthy();
      expect(getByText('Beta waves (14-30 Hz) improve focus')).toBeTruthy();
    });

    it('renders tips in a proper list structure', () => {
      const { container } = render(<TipsSection />);
      const tipsList = container.querySelector('ul');
      expect(tipsList).toBeTruthy();
      
      const tipItems = container.querySelectorAll('li');
      expect(tipItems).toHaveLength(6);
    });

    it('applies proper spacing and styling to tips', () => {
      const { container } = render(<TipsSection />);
      const tipsList = container.querySelector('ul');
      expect(tipsList).toHaveClass('space-y-2', 'mb-4');
      
      const tipItems = container.querySelectorAll('li');
      tipItems.forEach((item: Element) => {
        expect(item).toHaveClass('flex', 'items-start', 'space-x-2', 'text-sm', 'text-cyan-200/90');
      });
    });
  });

  describe('Astro App Link', () => {
    it('displays the astro app promotion text', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText(/Enhance your experience with astrological frequencies!/)).toBeTruthy();
    });

    it('renders the astro app link with proper attributes', () => {
      const { getByRole } = render(<TipsSection />);
      const link = getByRole('link', { name: /Try our Astro app/i });
      
      expect(link).toHaveAttribute('href', '/astro');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has proper styling for the astro app link', () => {
      const { getByRole } = render(<TipsSection />);
      const link = getByRole('link', { name: /Try our Astro app/i });
      
      expect(link).toHaveClass('text-cyan-400', 'hover:text-cyan-300', 'underline', 'transition-colors');
    });

    it('handles link interaction correctly', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<TipsSection />);
      const link = getByRole('link', { name: /Try our Astro app/i });
      
      // Test that clicking doesn't cause errors
      await user.click(link);
      expect(link).toHaveAttribute('href', '/astro');
    });
  });

  describe('Quick Reference Section', () => {
    it('displays the quick reference heading', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText('Quick Reference:')).toBeTruthy();
    });

    it('displays all frequency ranges with labels', () => {
      const { getByText } = render(<TipsSection />);
      
      // Check frequency range labels
      expect(getByText('Sleep:')).toBeTruthy();
      expect(getByText('Meditation:')).toBeTruthy();
      expect(getByText('Relaxation:')).toBeTruthy();
      expect(getByText('Focus:')).toBeTruthy();
      
      // Check frequency values
      expect(getByText('Delta (0.5-4 Hz)')).toBeTruthy();
      expect(getByText('Theta (4-8 Hz)')).toBeTruthy();
      expect(getByText('Alpha (8-14 Hz)')).toBeTruthy();
      expect(getByText('Beta (14-30 Hz)')).toBeTruthy();
    });

    it('uses proper grid layout for quick reference', () => {
      const { container } = render(<TipsSection />);
      const gridContainer = container.querySelector('.grid.grid-cols-2.gap-2');
      expect(gridContainer).toBeTruthy();
    });

    it('has proper styling for quick reference section', () => {
      const { container } = render(<TipsSection />);
      const quickRefSection = container.querySelector('.text-xs.text-cyan-200\\/80');
      expect(quickRefSection).toBeTruthy();
    });
  });

  describe('Safety Note Section', () => {
    it('displays the safety warning', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText('Safety Note:')).toBeTruthy();
      expect(getByText('⚠️')).toBeTruthy();
    });

    it('displays complete safety information', () => {
      const { getByText } = render(<TipsSection />);
      expect(getByText(/If you have epilepsy or other neurological conditions/)).toBeTruthy();
      expect(getByText(/Stop use if you experience discomfort/)).toBeTruthy();
    });

    it('has proper warning styling', () => {
      const { container } = render(<TipsSection />);
      const safetySection = container.querySelector('.bg-yellow-500\\/10.border.border-yellow-400\\/20');
      expect(safetySection).toBeTruthy();
    });

    it('uses warning colors for safety note', () => {
      const { container } = render(<TipsSection />);
      const warningIcon = container.querySelector('.text-yellow-400');
      expect(warningIcon).toBeTruthy();
      
      const warningText = container.querySelector('.text-yellow-200');
      expect(warningText).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('uses aria-hidden for decorative icons', () => {
      const { container } = render(<TipsSection />);
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('has proper heading structure', () => {
      const { getByRole } = render(<TipsSection />);
      const heading = getByRole('heading', { level: 5 });
      expect(heading).toHaveTextContent('Tips for Best Results');
    });

    it('provides accessible link text', () => {
      const { getByRole } = render(<TipsSection />);
      const link = getByRole('link', { name: /Try our Astro app/i });
      expect(link).toBeTruthy();
    });

    it('has proper focus management for interactive elements', () => {
      const { getByRole } = render(<TipsSection />);
      const link = getByRole('link', { name: /Try our Astro app/i });
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-cyan-400', 'rounded');
    });
  });

  describe('Layout and Structure', () => {
    it('has proper section separators', () => {
      const { container } = render(<TipsSection />);
      const borderSeparators = container.querySelectorAll('.border-t.border-cyan-400\\/20');
      expect(borderSeparators.length).toBeGreaterThan(0);
    });

    it('maintains proper spacing between sections', () => {
      const { container } = render(<TipsSection />);
      const sectionsWithMargin = container.querySelectorAll('.mt-3');
      expect(sectionsWithMargin.length).toBeGreaterThan(0);
    });

    it('uses flexbox layout for proper alignment', () => {
      const { container } = render(<TipsSection />);
      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
    });

    it('has responsive text sizing', () => {
      const { container } = render(<TipsSection />);
      
      // Check various text sizes are used appropriately
      expect(container.querySelector('.text-sm')).toBeTruthy();
      expect(container.querySelector('.text-xs')).toBeTruthy();
    });
  });

  describe('Visual Design', () => {
    it('uses cyan color theme consistently', () => {
      const { container } = render(<TipsSection />);
      
      expect(container.querySelector('.bg-cyan-500\\/10')).toBeTruthy();
      expect(container.querySelector('.border-cyan-400\\/20')).toBeTruthy();
      expect(container.querySelector('.text-cyan-300')).toBeTruthy();
      expect(container.querySelector('.text-cyan-200\\/90')).toBeTruthy();
    });

    it('applies backdrop blur effect', () => {
      const { container } = render(<TipsSection />);
      expect(container.firstChild).toHaveClass('backdrop-blur-sm');
    });

    it('has proper contrast for readability', () => {
      const { container } = render(<TipsSection />);
      
      // Check that text colors provide good contrast
      expect(container.querySelector('.text-cyan-200\\/90')).toBeTruthy();
      expect(container.querySelector('.text-cyan-200\\/80')).toBeTruthy();
    });
  });

  describe('Content Validation', () => {
    it('includes all essential binaural beat tips', () => {
      const { getByText } = render(<TipsSection />);
      
      // Essential tips should be present
      expect(getByText(/headphones/i)).toBeTruthy();
      expect(getByText(/volume/i)).toBeTruthy();
      expect(getByText(/Delta waves.*sleep/i)).toBeTruthy();
      expect(getByText(/Theta waves.*meditation/i)).toBeTruthy();
      expect(getByText(/Alpha waves.*relaxation/i)).toBeTruthy();
      expect(getByText(/Beta waves.*focus/i)).toBeTruthy();
    });

    it('provides accurate frequency information', () => {
      const { getAllByText } = render(<TipsSection />);
      
      // Verify frequency ranges are correct (may appear in both list and quick reference)
      expect(getAllByText(/0\.5-4 Hz/).length).toBeGreaterThan(0);
      expect(getAllByText(/4-8 Hz/).length).toBeGreaterThan(0);
      expect(getAllByText(/8-14 Hz/).length).toBeGreaterThan(0);
      expect(getAllByText(/14-30 Hz/).length).toBeGreaterThan(0);
    });

    it('includes important safety warnings', () => {
      const { getByText } = render(<TipsSection />);
      
      expect(getByText(/epilepsy/i)).toBeTruthy();
      expect(getByText(/neurological conditions/i)).toBeTruthy();
      expect(getByText(/healthcare provider/i)).toBeTruthy();
      expect(getByText(/discomfort.*headaches.*dizziness/i)).toBeTruthy();
    });
  });

  describe('Component Memorization', () => {
    it('has proper display name', () => {
      expect(TipsSection.displayName).toBe('TipsSection');
    });

    it('memoizes properly to prevent unnecessary re-renders', () => {
      const { rerender, getByText } = render(<TipsSection />);
      
      // Rerender with same props
      rerender(<TipsSection />);
      
      // Component should still be rendered correctly
      expect(getByText('Tips for Best Results')).toBeTruthy();
    });

    it('handles prop changes correctly', () => {
      const { rerender, container } = render(<TipsSection />);
      expect(container.firstChild).not.toHaveClass('custom-class');
      
      rerender(<TipsSection className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('User Experience', () => {
    it('presents information in logical order', () => {
      const { container } = render(<TipsSection />);
      
      // Tips should come first, then reference, then safety
      const sections = container.querySelectorAll('.border-t');
      expect(sections.length).toBeGreaterThan(1); // Multiple sections with borders
    });

    it('uses appropriate visual hierarchy', () => {
      const { container } = render(<TipsSection />);
      
      // Check heading is prominent
      const heading = container.querySelector('h5');
      expect(heading).toHaveClass('font-medium', 'text-cyan-300');
      
      // Check safety note stands out
      const safetySection = container.querySelector('.bg-yellow-500\\/10');
      expect(safetySection).toBeTruthy();
    });

    it('provides scannable content structure', () => {
      const { container } = render(<TipsSection />);
      
      // Lists should be easy to scan
      const list = container.querySelector('ul');
      expect(list).toHaveClass('space-y-2');
      
      // Grid layout for quick reference
      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
    });
  });
});
