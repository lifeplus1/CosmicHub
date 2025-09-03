import React, { useState } from 'react';

// Simple Button component since we can't import the UI package version
const Button: React.FC<{
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, variant = 'primary', size = 'md', disabled = false, children }) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`}
    >
      {children}
    </button>
  );
};

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

export const PersonalityAssessment: React.FC<PersonalityAssessmentProps> = ({
  onComplete,
  onClose
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [assessmentType, setAssessmentType] = useState<'quick' | 'full'>('quick');

  const currentQuestion = QUICK_ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUICK_ASSESSMENT_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / QUICK_ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (isLastQuestion) {
      // Calculate results
      const results = calculateResults(answers, questionId, value);
      onComplete(results);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

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

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Personality Assessment</h2>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {QUICK_ASSESSMENT_QUESTIONS.length}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
            >
              ✕
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-purple-600 h-2 rounded-full transition-all duration-300 w-[${Math.min(100, Math.max(0, progress))}%]`}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-purple-600 opacity-0" />
                    </div>
                    <span className="text-gray-900">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={goBack}
              variant="secondary"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              {isLastQuestion ? 'Select your answer to complete' : 'Select your answer to continue'}
            </div>
          </div>

          {/* Assessment Type Toggle */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setAssessmentType('quick')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  assessmentType === 'quick'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Quick Assessment (6 questions)
              </button>
              <button
                onClick={() => setAssessmentType('full')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  assessmentType === 'full'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled
              >
                Full Assessment (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
