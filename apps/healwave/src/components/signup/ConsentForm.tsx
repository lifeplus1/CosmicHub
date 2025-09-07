import React, { useCallback } from 'react';

export interface ConsentData {
  privacyConsent: boolean;
  healthDisclaimer: boolean;
}

interface ConsentFormProps {
  data: ConsentData;
  onChange: (data: ConsentData) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

export const ConsentForm: React.FC<ConsentFormProps> = React.memo(({
  data,
  onChange,
  onValidationChange,
  disabled = false,
}) => {
  const handleConsentChange = useCallback((field: keyof ConsentData, checked: boolean) => {
    const newData = { ...data, [field]: checked };
    onChange(newData);
    
    // Check if all required consents are given
    const isValid = newData.privacyConsent && newData.healthDisclaimer;
    onValidationChange(isValid);
  }, [data, onChange, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Terms & Agreements</h2>
        <p className="text-blue-200">Please review and accept our terms</p>
      </div>

      <div className="space-y-6">
        {/* Privacy Policy Consent */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Privacy Policy</h3>
          <div className="max-h-32 overflow-y-auto text-sm text-white/80 mb-4 space-y-2">
            <p>
              HealWave collects and processes your personal information to provide personalized 
              sound healing experiences. We use your profile data to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Customize frequency recommendations based on your goals and experience</li>
              <li>Track your progress and provide insights</li>
              <li>Send you relevant wellness content (if you opt-in)</li>
              <li>Improve our services and develop new features</li>
            </ul>
            <p>
              We do not sell your personal data to third parties. Your health information 
              is encrypted and stored securely. You can request data deletion at any time.
            </p>
          </div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.privacyConsent}
              onChange={(e) => handleConsentChange('privacyConsent', e.target.checked)}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
              aria-describedby="privacy-consent-error"
              {...(!data.privacyConsent && { 'aria-invalid': 'true' })}
              required
            />
            <div>
              <span className="text-white/90 font-medium">
                I accept the Privacy Policy *
              </span>
              <p className="text-sm text-white/70 mt-1">
                Required to create your account and personalize your experience
              </p>
            </div>
          </label>
          {!data.privacyConsent && (
            <p id="privacy-consent-error" className="mt-2 text-sm text-red-400" role="alert">
              You must accept the Privacy Policy to continue
            </p>
          )}
        </div>

        {/* Health Disclaimer */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Health & Safety Disclaimer</h3>
          <div className="max-h-32 overflow-y-auto text-sm text-white/80 mb-4 space-y-2">
            <p className="font-medium text-yellow-300">
              ⚠️ Important: Sound healing frequencies are for wellness and relaxation purposes only.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Not Medical Treatment:</strong> HealWave frequencies are not intended to 
                diagnose, treat, cure, or prevent any medical condition
              </li>
              <li>
                <strong>Consult Healthcare Providers:</strong> Always consult qualified healthcare 
                professionals for medical concerns
              </li>
              <li>
                <strong>Discontinue if Uncomfortable:</strong> Stop using frequencies immediately 
                if you experience discomfort, seizures, or adverse reactions
              </li>
              <li>
                <strong>Epilepsy Warning:</strong> Certain frequencies may trigger seizures in 
                susceptible individuals
              </li>
              <li>
                <strong>Hearing Safety:</strong> Use appropriate volume levels to protect your hearing
              </li>
            </ul>
            <p>
              By using HealWave, you assume responsibility for your safety and agree that 
              HealWave is not liable for any adverse effects.
            </p>
          </div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.healthDisclaimer}
              onChange={(e) => handleConsentChange('healthDisclaimer', e.target.checked)}
              disabled={disabled}
              className="mt-1 w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
              aria-describedby="health-disclaimer-error"
              {...(!data.healthDisclaimer && { 'aria-invalid': 'true' })}
              required
            />
            <div>
              <span className="text-white/90 font-medium">
                I understand and acknowledge the Health & Safety Disclaimer *
              </span>
              <p className="text-sm text-white/70 mt-1">
                Required for your safety and our legal protection
              </p>
            </div>
          </label>
          {!data.healthDisclaimer && (
            <p id="health-disclaimer-error" className="mt-2 text-sm text-red-400" role="alert">
              You must acknowledge the Health & Safety Disclaimer to continue
            </p>
          )}
        </div>

        {/* Additional Information */}
        <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 text-xl">ℹ️</span>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Your Privacy Matters</p>
              <p>
                You can review our full{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a 
                  href="/terms-of-service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Terms of Service
                </a>
                {' '}at any time. You can modify your preferences or delete your account from your profile settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ConsentForm.displayName = 'ConsentForm';
