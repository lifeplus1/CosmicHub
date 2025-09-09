import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TipsSection } from '../TipsSection';

describe('TipsSection', () => {
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

  it('displays all tip items', () => {
    const { getByText } = render(<TipsSection />);
    
    // Check that key tip text is present (based on actual rendered content)
    expect(getByText(/Use headphones for proper binaural effect/)).toBeTruthy();
    expect(getByText(/Start with lower volumes and gradually increase/)).toBeTruthy();
    expect(getByText(/Delta waves.*are best for sleep/)).toBeTruthy();
    expect(getByText(/Alpha waves.*promote relaxation/)).toBeTruthy();
    expect(getByText(/Theta waves.*enhance meditation/)).toBeTruthy();
    expect(getByText(/Beta waves.*improve focus/)).toBeTruthy();
  });

  it('displays quick reference section', () => {
    const { getByText } = render(<TipsSection />);
    expect(getByText('Quick Reference:')).toBeTruthy();
    // Check each line separately since they're in different elements
    expect(getByText('Sleep:')).toBeTruthy();
    expect(getByText('Delta (0.5-4 Hz)')).toBeTruthy();
    expect(getByText('Meditation:')).toBeTruthy();
    expect(getByText('Theta (4-8 Hz)')).toBeTruthy();
    expect(getByText('Relaxation:')).toBeTruthy();
    expect(getByText('Alpha (8-14 Hz)')).toBeTruthy();
    expect(getByText('Focus:')).toBeTruthy();
    expect(getByText('Beta (14-30 Hz)')).toBeTruthy();
  });

  it('displays safety warnings', () => {
    const { getByText } = render(<TipsSection />);
    expect(getByText('Safety Note:')).toBeTruthy();
    expect(getByText(/If you have epilepsy or other neurological conditions/)).toBeTruthy();
    expect(getByText(/Stop use if you experience discomfort/)).toBeTruthy();
  });

  it('displays astro app link', () => {
    const { getByRole } = render(<TipsSection />);
    const link = getByRole('link', { name: /Try our Astro app/i });
    expect(link).toHaveAttribute('href', '/astro');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has proper container styling', () => {
    const { container } = render(<TipsSection />);
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('p-4', 'rounded-lg', 'bg-cyan-500/10');
  });
});
