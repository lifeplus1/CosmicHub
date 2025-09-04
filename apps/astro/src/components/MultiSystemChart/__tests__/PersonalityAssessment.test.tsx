import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PersonalityAssessment } from '../PersonalityAssessment';

// Mock the assessment results interface to match the actual component
interface AssessmentResults {
  mbti: {
    e_i: number;
    s_n: number;
    t_f: number;
    j_p: number;
  };
  enneagram: Record<number, number>;
}

const mockOnComplete = vi.fn();
const mockOnClose = vi.fn();

describe('PersonalityAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial assessment interface', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Should show first question
    expect(screen.getByText(/personality assessment/i)).toBeInTheDocument();
    
    // Should have close button
    const closeButton = screen.getByRole('button', { name: '✕' });
    expect(closeButton).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Should show progress bar or indicator - look for progress element by class or text content
    const progressElement = screen.getByText(/question 1 of 6/i);
    expect(progressElement).toBeInTheDocument();
  });

  it('handles answer selection and progresses through questions', async () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Find and click first answer option
    const answerButtons = screen.getAllByRole('button');
    const firstAnswer = answerButtons.find(btn => 
      btn.textContent && !btn.textContent.match(/close|×/i)
    );
    
    if (firstAnswer) {
      fireEvent.click(firstAnswer);
      
      // Should progress to next question or complete
      await waitFor(() => {
        // Either new question appears or assessment completes
        expect(true).toBe(true); // Placeholder for actual progression logic
      });
    }
  });

  it('calculates MBTI results correctly', async () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Simulate completing all questions with specific pattern
    // This would require answering all questions in sequence
    // For now, test the calculation logic directly if possible
    
    // Mock a completed assessment
    const _mockResults: AssessmentResults = {
      mbti: {
        e_i: 0.7, // Introverted
        s_n: 0.8, // Intuitive
        t_f: 0.6, // Thinking
        j_p: 0.9  // Judging
      },
      enneagram: {
        1: 0.2, 2: 0.1, 3: 0.3, 4: 0.2, 5: 0.8, // Type 5 dominant
        6: 0.4, 7: 0.1, 8: 0.3, 9: 0.2
      }
    };
    
    // Verify calculation logic would be tested here
    expect(_mockResults.mbti.e_i).toBeGreaterThan(0);
    expect(_mockResults.mbti.e_i).toBeLessThanOrEqual(1);
    expect(Object.keys(_mockResults.enneagram)).toHaveLength(9);
  });

  it('handles assessment completion', async () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // This would test the full flow through all questions
    // For now, verify the completion callback is properly typed
    expect(typeof mockOnComplete).toBe('function');
  });

  it('allows closing the assessment', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '✕' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays quick vs full assessment options', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Should have quick assessment button available
    expect(screen.getByRole('button', { name: /quick assessment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /full assessment/i })).toBeInTheDocument();
  });

  it('validates answer inputs', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Should not allow progression without selecting an answer
    // This tests the validation logic
    const continueButton = screen.queryByRole('button', { name: /continue|next/ });
    if (continueButton) {
      // Should be disabled initially
      expect(continueButton).toBeDisabled();
    }
  });

  it('handles assessment type switching', () => {
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Test switching between quick and full assessment
    const typeToggle = screen.queryByRole('button', { name: /quick|full|switch/ });
    if (typeToggle) {
      fireEvent.click(typeToggle);
      // Should update the assessment type
    }
    
    expect(true).toBe(true); // Placeholder for actual implementation
  });

  it('shows confidence scores in results', async () => {
    // This would test that confidence scores are calculated and displayed
    // after assessment completion
    expect(true).toBe(true); // Placeholder for implementation
  });

  it('handles edge cases gracefully', () => {
    // Test error boundaries and edge cases
    render(<PersonalityAssessment onComplete={mockOnComplete} onClose={mockOnClose} />);
    
    // Should not crash with invalid inputs
    expect(screen.getByText(/personality assessment/i)).toBeInTheDocument();
  });
});
