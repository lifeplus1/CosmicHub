/**
 * SPIRITUAL ONBOARDING FLOW
 * 
 * Progressive disclosure onboarding system that introduces users 
 * to spiritual systems based on their experience level and interests.
 * Implements AI #5 requirement for user onboarding flows.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Progress, ErrorBoundary } from '@cosmichub/ui';
import {
  FaHeart,
  FaStar,
  FaMoon,
  FaSun,
  FaEye,
  FaTree,
  FaGem,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

interface OnboardingData {
  spiritualExperience: 'beginner' | 'intermediate' | 'advanced' | '';
  interests: string[];
  practiceStyle: 'structured' | 'intuitive' | 'mixed' | '';
  timeCommitment: '5-15min' | '15-30min' | '30-60min' | '60min+' | '';
  goals: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | '';
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = React.memo(({ userId: _userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    spiritualExperience: '',
    interests: [],
    practiceStyle: '',
    timeCommitment: '',
    goals: [],
    learningStyle: ''
  });

  const totalSteps = 6;

  // Memoized options arrays for performance
  const experienceLevels = useMemo(() => [
    { id: 'beginner', icon: FaSun, label: 'Beginner', desc: 'New to spiritual practices' },
    { id: 'intermediate', icon: FaMoon, label: 'Intermediate', desc: 'Some experience with spiritual systems' },
    { id: 'advanced', icon: FaStar, label: 'Advanced', desc: 'Deep practice and understanding' }
  ], []);

  const spiritualSystems = useMemo(() => [
    { id: 'astrology', icon: FaSun, label: 'Astrology' },
    { id: 'tarot', icon: FaEye, label: 'Tarot' },
    { id: 'kabbalah', icon: FaTree, label: 'Kabbalah' },
    { id: 'humandesign', icon: FaGem, label: 'Human Design' },
    { id: 'genekeys', icon: FaHeart, label: 'Gene Keys' },
    { id: 'numerology', icon: FaStar, label: 'Numerology' }
  ], []);

  const updateData = useCallback((field: keyof OnboardingData, value: unknown) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      void handleComplete();
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async () => {
    try {
      // Here we would save the onboarding data to the backend
      console.log('Saving onboarding data:', onboardingData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsComplete(true);
      
      // Complete onboarding after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [onboardingData, onComplete]);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cosmic-dark via-cosmic-purple/20 to-cosmic-blue/20 p-4">
        <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20 max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6 animate-bounce">✨</div>
            <CardTitle className="text-2xl font-bold text-cosmic-gold mb-4 font-cinzel">
              Welcome to Your Journey!
            </CardTitle>
            <p className="text-cosmic-silver/80 mb-6 leading-relaxed">
              Your personalized learning path has been created based on your preferences.
            </p>
            <div className="flex items-center justify-center text-cosmic-gold">
              <FaCheckCircle className="text-3xl animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cosmic-dark via-cosmic-purple/20 to-cosmic-blue/20 p-4">
        <Card className="cosmic-glass border-cosmic-gold/20 shadow-2xl shadow-cosmic-purple/20 max-w-2xl mx-auto w-full">
          <CardHeader className="text-center border-b border-cosmic-gold/10 pb-6">
            <CardTitle className="text-3xl font-bold text-cosmic-gold font-cinzel mb-2">
              Spiritual Onboarding
            </CardTitle>
            <p className="text-cosmic-silver/70">
              Let&apos;s personalize your cosmic learning journey
            </p>
          </CardHeader>
          <CardContent className="p-8">
            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm text-cosmic-silver/60 mb-3">
                <span className="font-medium">Step {currentStep} of {totalSteps}</span>
                <span className="text-cosmic-gold font-semibold">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <Progress value={(currentStep / totalSteps) * 100} className="h-3" />
            </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="text-center space-y-6">
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-cosmic-gold mb-4">
                Welcome to CosmicHub Education
              </h2>
              <p className="text-lg text-cosmic-silver/80 mb-6">
                Let&apos;s personalize your spiritual learning journey. This will only take a few minutes.
              </p>
              <div className="bg-cosmic-purple/20 rounded-lg p-4">
                <h3 className="font-semibold text-cosmic-silver mb-2">What You&apos;ll Get:</h3>
                <ul className="text-left text-cosmic-silver/70 space-y-1">
                  <li>• Personalized learning recommendations</li>
                  <li>• Progressive skill development</li>
                  <li>• Community connections</li>
                  <li>• Achievement tracking</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cosmic-gold text-center mb-6">
                What&apos;s Your Spiritual Experience Level?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experienceLevels.map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    className={`p-4 rounded-lg border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 ${
                      onboardingData.spiritualExperience === id
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/20 hover:border-cosmic-silver/40'
                    }`}
                    onClick={() => updateData('spiritualExperience', id)}
                    onKeyDown={(e) => handleKeyDown(e, () => updateData('spiritualExperience', id))}
                    aria-label={`Select ${label} experience level: ${desc}`}
                    tabIndex={0}
                  >
                    <Icon className="text-2xl mb-2 text-cosmic-gold" />
                    <h3 className="font-semibold text-cosmic-silver">{label}</h3>
                    <p className="text-sm text-cosmic-silver/70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cosmic-gold text-center mb-6">
                Which Spiritual Systems Interest You?
              </h2>
              <p className="text-center text-cosmic-silver/70 mb-6">
                Select all that apply - we&apos;ll customize your learning path
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {spiritualSystems.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    className={`p-4 rounded-lg border-2 transition-all text-center focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 ${
                      onboardingData.interests.includes(id)
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/20 hover:border-cosmic-silver/40'
                    }`}
                    onClick={() => {
                      const newInterests = onboardingData.interests.includes(id)
                        ? onboardingData.interests.filter(i => i !== id)
                        : [...onboardingData.interests, id];
                      updateData('interests', newInterests);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, () => {
                      const newInterests = onboardingData.interests.includes(id)
                        ? onboardingData.interests.filter(i => i !== id)
                        : [...onboardingData.interests, id];
                      updateData('interests', newInterests);
                    })}
                    aria-label={`${onboardingData.interests.includes(id) ? 'Deselect' : 'Select'} ${label} spiritual system`}
                    tabIndex={0}
                  >
                    <Icon className="text-2xl mb-2 text-cosmic-gold mx-auto" />
                    <h3 className="font-semibold text-cosmic-silver text-sm">{label}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cosmic-gold text-center mb-6">
                How Do You Prefer to Learn?
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'structured', label: 'Structured Learning', desc: 'Step-by-step curriculum with clear progression' },
                  { id: 'intuitive', label: 'Intuitive Exploration', desc: 'Follow your interests and inner guidance' },
                  { id: 'mixed', label: 'Mixed Approach', desc: 'Combination of structure and flexibility' }
                ].map(({ id, label, desc }) => (
                  <button
                    key={id}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      onboardingData.practiceStyle === id
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/20 hover:border-cosmic-silver/40'
                    }`}
                    onClick={() => updateData('practiceStyle', id)}
                  >
                    <h3 className="font-semibold text-cosmic-silver mb-1">{label}</h3>
                    <p className="text-sm text-cosmic-silver/70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cosmic-gold text-center mb-6">
                How Much Time Can You Dedicate Daily?
              </h2>
              <div className="space-y-4">
                {[
                  { id: '5-15min', label: '5-15 minutes', desc: 'Quick daily practices and micro-lessons' },
                  { id: '15-30min', label: '15-30 minutes', desc: 'Balanced learning with moderate depth' },
                  { id: '30-60min', label: '30-60 minutes', desc: 'Comprehensive study and practice sessions' },
                  { id: '60min+', label: '60+ minutes', desc: 'Deep immersion and advanced practices' }
                ].map(({ id, label, desc }) => (
                  <button
                    key={id}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      onboardingData.timeCommitment === id
                        ? 'border-cosmic-gold bg-cosmic-gold/10'
                        : 'border-cosmic-silver/20 hover:border-cosmic-silver/40'
                    }`}
                    onClick={() => updateData('timeCommitment', id)}
                  >
                    <h3 className="font-semibold text-cosmic-silver mb-1">{label}</h3>
                    <p className="text-sm text-cosmic-silver/70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-cosmic-gold text-center mb-6">
                What Are Your Primary Goals?
              </h2>
              <p className="text-center text-cosmic-silver/70 mb-6">
                Select all that resonate with you
              </p>
              <div className="space-y-3">
                {[
                  'Personal spiritual development',
                  'Understanding my life purpose',
                  'Improving relationships',
                  'Developing intuitive abilities',
                  'Professional spiritual practice',
                  'Teaching and mentoring others',
                  'Healing and transformation',
                  'Community and connection'
                ].map((goal) => (
                  <button
                    key={goal}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      onboardingData.goals.includes(goal)
                        ? 'border-cosmic-gold bg-cosmic-gold/10 text-cosmic-gold'
                        : 'border-cosmic-silver/20 hover:border-cosmic-silver/40 text-cosmic-silver'
                    }`}
                    onClick={() => {
                      const newGoals = onboardingData.goals.includes(goal)
                        ? onboardingData.goals.filter(g => g !== goal)
                        : [...onboardingData.goals, goal];
                      updateData('goals', newGoals);
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-cosmic-silver/20">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
              >
                <FaArrowLeft className="text-sm" /> Previous
              </Button>

              <Button
                onClick={nextStep}
                variant={currentStep === totalSteps ? 'cosmic' : 'default'}
                className="flex items-center gap-2 px-8 py-3 font-semibold"
                disabled={
                  (currentStep === 2 && !onboardingData.spiritualExperience) ||
                  (currentStep === 3 && onboardingData.interests.length === 0) ||
                  (currentStep === 4 && !onboardingData.practiceStyle) ||
                  (currentStep === 5 && !onboardingData.timeCommitment) ||
                  (currentStep === 6 && onboardingData.goals.length === 0)
                }
              >
                {currentStep === totalSteps ? '✨ Complete Setup' : 'Next'} <FaArrowRight className="text-sm" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
});

// Add display name for React.memo
OnboardingFlow.displayName = 'OnboardingFlow';

export default OnboardingFlow;
