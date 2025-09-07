import React, { useState, useCallback, useMemo } from 'react';
import { signUp } from '@cosmichub/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { UserProfile } from '@cosmichub/types';
import ErrorBoundary from '../ErrorBoundary';

import { BasicAccountForm, type BasicAccountData } from './BasicAccountForm';
import { PersonalInfoForm, type PersonalInfoData } from './PersonalInfoForm';
import { PreferencesForm, type PreferencesData } from './PreferencesForm';
import { ConsentForm, type ConsentData } from './ConsentForm';

import styles from './SignupContainer.module.css';

interface SignupContainerProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

type StepKey = 'account' | 'personal' | 'preferences' | 'consent';

const STEPS = [
  {
    key: 'account' as const,
    title: 'Account Setup',
    description: 'Create your secure account',
    component: BasicAccountForm,
  },
  {
    key: 'personal' as const,
    title: 'Personal Info',
    description: 'Tell us about yourself',
    component: PersonalInfoForm,
  },
  {
    key: 'preferences' as const,
    title: 'Your Preferences',
    description: 'Customize your experience',
    component: PreferencesForm,
  },
  {
    key: 'consent' as const,
    title: 'Terms & Privacy',
    description: 'Review and accept terms',
    component: ConsentForm,
  },
];

const SignupContainer: React.FC<SignupContainerProps> = React.memo(({
  onSwitchToLogin,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<StepKey>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data states
  const [accountData, setAccountData] = useState<BasicAccountData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [personalData, setPersonalData] = useState<PersonalInfoData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    occupation: '',
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    experienceLevel: '',
    primaryGoals: '',
    healthConditions: '',
    meditationExperience: '',
    preferredSessionLength: '',
    notificationPreferences: {
      sessionReminders: true,
      weeklyProgress: true,
      newFrequencies: false,
      healthTips: true,
    },
  });

  const [consentData, setConsentData] = useState<ConsentData>({
    privacyConsent: false,
    healthDisclaimer: false,
  });

  // Validation states
  const [stepValidation, setStepValidation] = useState<Record<StepKey, boolean>>({
    account: false,
    personal: false,
    preferences: false,
    consent: false,
  });

  const currentStepIndex = useMemo(() => {
    return STEPS.findIndex(step => step.key === currentStep);
  }, [currentStep]);

  const currentStepConfig = useMemo(() => {
    return STEPS[currentStepIndex];
  }, [currentStepIndex]);

  const canProceed = useMemo(() => {
    return stepValidation[currentStep];
  }, [stepValidation, currentStep]);

  const canGoBack = useMemo(() => {
    return currentStepIndex > 0;
  }, [currentStepIndex]);

  const isLastStep = useMemo(() => {
    return currentStepIndex === STEPS.length - 1;
  }, [currentStepIndex]);

  const handleStepValidationChange = useCallback((isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [currentStep]: isValid,
    }));
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (!canGoBack) return;

    const prevStep = STEPS[currentStepIndex - 1];
    if (prevStep) {
      setCurrentStep(prevStep.key);
      setError('');
    }
  }, [canGoBack, currentStepIndex]);

  const handleSignup = useCallback(async (): Promise<void> => {
    setError('');
    setIsLoading(true);

    try {
      const newUser = await signUp(accountData.email, accountData.password);
      const db = getFirestore();

      // Create comprehensive user profile
      const userProfile: UserProfile = {
        userId: newUser.uid,
        birthData: {
          date: personalData.dateOfBirth,
          time: '12:00', // Default time since not collected in signup
          location: 'Unknown', // Default location since not collected in signup
        },
        email: accountData.email,
        firstName: personalData.firstName.trim(),
        lastName: personalData.lastName.trim(),
        fullName: `${personalData.firstName.trim()} ${personalData.lastName.trim()}`,
        dateOfBirth: personalData.dateOfBirth,
        occupation: personalData.occupation || null,
        experienceLevel: preferencesData.experienceLevel,
        primaryGoals: preferencesData.primaryGoals,
        healthConditions: preferencesData.healthConditions || null,
        meditationExperience: preferencesData.meditationExperience || null,
        preferredSessionLength: preferencesData.preferredSessionLength,
        notificationPreferences: preferencesData.notificationPreferences,
        privacyConsentGiven: consentData.privacyConsent,
        privacyConsentDate: consentData.privacyConsent ? new Date().toISOString() : undefined,
        healthDisclaimerAccepted: consentData.healthDisclaimer,
        healthDisclaimerDate: consentData.healthDisclaimer ? new Date().toISOString() : undefined,
        profileCompleted: true,
        hasCompletedOnboarding: true,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          signupSource: 'healwave-app',
        },
        subscription: {
          tier: 'free',
          status: 'active',
        },
      };

      // Save to Firestore
      await setDoc(doc(db, 'userProfiles', newUser.uid), userProfile);

      // Close signup modal on success
      if (onClose) {
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accountData, personalData, preferencesData, consentData, onClose]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;

    if (isLastStep) {
      // Handle signup submission
      void handleSignup();
    } else {
      const nextStep = STEPS[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.key);
        setError('');
      }
    }
  }, [canProceed, isLastStep, currentStepIndex, handleSignup]);

  const progressPercentage = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);
  const progressBarClass = `${styles.progressBar} ${styles[`step${currentStepIndex + 1}`]}`;

  const renderCurrentStep = useCallback(() => {
    if (!currentStepConfig) return null;
    
    switch (currentStep) {
      case 'account':
        return (
          <BasicAccountForm
            data={accountData}
            onChange={(data: BasicAccountData) => setAccountData(data)}
            onValidationChange={handleStepValidationChange}
            disabled={isLoading}
          />
        );
      case 'personal':
        return (
          <PersonalInfoForm
            data={personalData}
            onChange={(data: PersonalInfoData) => setPersonalData(data)}
            onValidationChange={handleStepValidationChange}
            disabled={isLoading}
          />
        );
      case 'preferences':
        return (
          <PreferencesForm
            data={preferencesData}
            onChange={(data: PreferencesData) => setPreferencesData(data)}
            onValidationChange={handleStepValidationChange}
            disabled={isLoading}
          />
        );
      case 'consent':
        return (
          <ConsentForm
            data={consentData}
            onChange={(data: ConsentData) => setConsentData(data)}
            onValidationChange={handleStepValidationChange}
            disabled={isLoading}
          />
        );
      default:
        return null;
    }
  }, [currentStep, currentStepConfig, accountData, personalData, preferencesData, consentData, handleStepValidationChange, isLoading]);

  return (
    <div className={styles.signupContainer}>
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/70">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-cyan-400">
            {progressPercentage}%
          </span>
        </div>
        <div className={styles.progressContainer}>
          <div className={progressBarClass} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="mb-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between space-x-4">
        <div className="flex space-x-4">
          {canGoBack && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="px-4 py-2 text-white/80 border border-white/20 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          )}
        </div>

        <div className="flex space-x-4">
          {onSwitchToLogin && currentStep === 'account' && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              className="px-4 py-2 text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In Instead
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Account...</span>
              </span>
            ) : isLastStep ? (
              'Create Account'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

SignupContainer.displayName = 'SignupContainer';

// Export with ErrorBoundary wrapper
const SignupContainerWithErrorBoundary: React.FC<SignupContainerProps> = (props) => (
  <ErrorBoundary
    fallback={
      <div className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-lg border border-red-500/30 rounded-lg shadow-2xl p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Signup Error</h3>
          <p className="text-red-300 mb-4">
            Something went wrong with the signup process. Please refresh the page and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }
  >
    <SignupContainer {...props} />
  </ErrorBoundary>
);

export default SignupContainerWithErrorBoundary;
