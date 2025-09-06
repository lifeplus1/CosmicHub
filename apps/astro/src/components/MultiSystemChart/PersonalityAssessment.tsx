import React, { useState, useCallback } from 'react';
import { Button, Modal, Card, CardHeader, CardTitle, CardContent, Progress, ErrorBoundary } from '@cosmichub/ui';
import '../../styles/cosmic-components.css';

interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'mbti' | 'enneagram';
  category: string;
  options: Array<{
    value: number;
    text: string;
  }>;
}

interface AssessmentResults {
  mbti: {
    e_i: number;
    s_n: number;
    t_f: number;
    j_p: number;
  };
  enneagram: Record<number, number>;
}

const QUICK_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // MBTI Questions
  {
    id: 'mbti_e_i_1',
    text: 'I am energized more by:',
    type: 'mbti',
    category: 'e_i',
    options: [
      { value: -2, text: 'Quiet reflection and solitude' },
      { value: -1, text: 'Small group discussions' },
      { value: 1, text: 'Group activities' },
      { value: 2, text: 'Large social gatherings' }
    ]
  },
  {
    id: 'mbti_s_n_1',
    text: 'When learning something new, I prefer:',
    type: 'mbti',
    category: 's_n',
    options: [
      { value: -2, text: 'Concrete examples and step-by-step instructions' },
      { value: -1, text: 'Practical demonstrations' },
      { value: 1, text: 'Theoretical concepts and possibilities' },
      { value: 2, text: 'Abstract ideas and future implications' }
    ]
  },
  {
    id: 'mbti_t_f_1',
    text: 'When making decisions, I prioritize:',
    type: 'mbti',
    category: 't_f',
    options: [
      { value: -2, text: 'Personal values and impact on people' },
      { value: -1, text: 'Harmony and relationships' },
      { value: 1, text: 'Logic and objective analysis' },
      { value: 2, text: 'Efficiency and rational outcomes' }
    ]
  },
  {
    id: 'mbti_j_p_1',
    text: 'I prefer to:',
    type: 'mbti',
    category: 'j_p',
    options: [
      { value: -2, text: 'Keep options open and adapt as I go' },
      { value: -1, text: 'Be flexible with my plans' },
      { value: 1, text: 'Have a plan and stick to it' },
      { value: 2, text: 'Make decisions quickly and move forward' }
    ]
  },
  // Enneagram Questions
  {
    id: 'enneagram_1',
    text: 'My biggest drive is to:',
    type: 'enneagram',
    category: 'core_motivation',
    options: [
      { value: 1, text: 'Be perfect and do things right' },
      { value: 2, text: 'Be loved and needed by others' },
      { value: 3, text: 'Achieve success and be admired' },
      { value: 4, text: 'Find my authentic self and be unique' },
      { value: 5, text: 'Understand everything and be competent' },
      { value: 6, text: 'Be secure and have support' },
      { value: 7, text: 'Maintain happiness and avoid pain' },
      { value: 8, text: 'Be in control and protect myself' },
      { value: 9, text: 'Maintain peace and avoid conflict' }
    ]
  },
  {
    id: 'enneagram_2',
    text: 'My biggest fear is:',
    type: 'enneagram',
    category: 'core_fear',
    options: [
      { value: 1, text: 'Being corrupt, defective, or wrong' },
      { value: 2, text: 'Being unloved or unwanted' },
      { value: 3, text: 'Being worthless without value apart from achievements' },
      { value: 4, text: 'Having no identity or significance' },
      { value: 5, text: 'Being incompetent or invaded' },
      { value: 6, text: 'Being without support or guidance' },
      { value: 7, text: 'Being trapped in pain or deprivation' },
      { value: 8, text: 'Being controlled or vulnerable' },
      { value: 9, text: 'Loss of connection and fragmentation' }
    ]
  }
];

interface PersonalityAssessmentProps {
  onComplete: (results: AssessmentResults) => void;
  onClose: () => void;
}

export const PersonalityAssessment: React.FC<PersonalityAssessmentProps> = React.memo(function PersonalityAssessment({
  onComplete,
  onClose
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [assessmentType, setAssessmentType] = useState<'quick' | 'full'>('quick');

  const currentQuestion = QUICK_ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUICK_ASSESSMENT_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / QUICK_ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (isLastQuestion) {
      // Calculate results
      const results = calculateResults(answers, questionId, value);
      onComplete(results);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [isLastQuestion, answers, onComplete]);

  const calculateResults = (allAnswers: Record<string, number>, lastQuestionId: string, lastValue: number): AssessmentResults => {
    const finalAnswers = { ...allAnswers, [lastQuestionId]: lastValue };
    
    // Calculate MBTI scores
    const mbtiScores = {
      e_i: 0,
      s_n: 0,
      t_f: 0,
      j_p: 0
    };

    // Calculate Enneagram scores
    const enneagramScores: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };

    QUICK_ASSESSMENT_QUESTIONS.forEach(question => {
      const answer = finalAnswers[question.id];
      if (answer !== undefined) {
        if (question.type === 'mbti') {
          const category = question.category as keyof typeof mbtiScores;
          mbtiScores[category] += answer;
        } else if (question.type === 'enneagram') {
          if (question.options.some(opt => opt.value === answer && answer >= 1 && answer <= 9)) {
            const enneagramType = answer;
            if (enneagramScores[enneagramType] !== undefined) {
              enneagramScores[enneagramType] += 2;
            }
          }
        }
      }
    });

    // Normalize MBTI scores to 0-1 range
    const normalizedMbti = {
      e_i: (mbtiScores.e_i + 8) / 16, // Convert -8 to 8 range to 0-1
      s_n: (mbtiScores.s_n + 8) / 16,
      t_f: (mbtiScores.t_f + 8) / 16,
      j_p: (mbtiScores.j_p + 8) / 16
    };

    return {
      mbti: normalizedMbti,
      enneagram: enneagramScores
    };
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  const goBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Personality Assessment"
      size="lg"
      className="max-w-2xl"
    >
      <ErrorBoundary level="component" name="PersonalityAssessment">
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-cosmic-silver/80">
              <span>Question {currentQuestionIndex + 1} of {QUICK_ASSESSMENT_QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="border-cosmic-purple/30 bg-cosmic-dark/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-cosmic-gold font-cinzel leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleAnswer(currentQuestion.id, option.value))}
                    className="w-full text-left p-4 rounded-lg border-2 border-cosmic-purple/20 bg-cosmic-dark/20 hover:border-cosmic-purple/60 hover:bg-cosmic-purple/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50 focus:ring-offset-2 focus:ring-offset-cosmic-dark group"
                    aria-label={`Select answer: ${option.text}`}
                    tabIndex={0}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-5 h-5 rounded-full border-2 border-cosmic-silver/40 flex items-center justify-center group-hover:border-cosmic-gold transition-colors">
                        <div className="w-3 h-3 rounded-full bg-cosmic-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-cosmic-silver group-hover:text-cosmic-gold transition-colors font-medium">
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={goBack}
              variant="outline"
              disabled={currentQuestionIndex === 0}
              className="min-w-[100px]"
            >
              Previous
            </Button>
            <div className="text-sm text-cosmic-silver/60 text-center">
              {isLastQuestion ? 'Select your answer to complete' : 'Select your answer to continue'}
            </div>
            <div className="w-[100px]" /> {/* Spacer for alignment */}
          </div>

          {/* Assessment Type Toggle */}
          <Card className="border-cosmic-purple/20 bg-cosmic-dark/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => setAssessmentType('quick')}
                  variant={assessmentType === 'quick' ? 'cosmic' : 'outline'}
                  size="sm"
                  className="flex-1 max-w-xs"
                >
                  Quick Assessment (6 questions)
                </Button>
                <Button
                  onClick={() => setAssessmentType('full')}
                  variant={assessmentType === 'full' ? 'cosmic' : 'outline'}
                  size="sm"
                  disabled
                  className="flex-1 max-w-xs opacity-50 cursor-not-allowed"
                >
                  Full Assessment (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </Modal>
  );
});
