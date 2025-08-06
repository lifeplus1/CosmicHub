import React, { useState } from 'react';
import { signUp } from '../auth';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface SignupProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onClose }) => {
  // Basic account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // User profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [primaryGoals, setPrimaryGoals] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [meditationExperience, setMeditationExperience] = useState('');
  const [preferredSessionLength, setPreferredSessionLength] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({
    sessionReminders: false,
    weeklyProgress: false,
    newFrequencies: false,
    healthTips: false
  });
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [healthDisclaimer, setHealthDisclaimer] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // If user is already logged in, show success message
  if (user) {
    return (
      <div className="text-center">
        <div className="text-green-400 text-xl mb-4">✅ Already logged in!</div>
        <p className="text-gray-300 mb-4">Welcome, {user.email}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!privacyConsent) {
      setError('Please accept the privacy policy to continue');
      return;
    }

    if (!healthDisclaimer) {
      setError('Please acknowledge the health disclaimer to continue');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signUp(email, password);
      const db = getFirestore();
      
      // Create comprehensive user profile
      const userProfile = {
        // Basic info
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        
        // Personal information
        dateOfBirth: dateOfBirth || null,
        occupation: occupation.trim() || null,
        
        // Healing and wellness background
        experienceLevel: experienceLevel || null,
        primaryGoals: primaryGoals.trim() || null,
        healthConditions: healthConditions.trim() || null,
        meditationExperience: meditationExperience || null,
        preferredSessionLength: preferredSessionLength || null,
        
        // Notification preferences
        notificationPreferences: {
          sessionReminders: notificationPreferences.sessionReminders,
          weeklyProgress: notificationPreferences.weeklyProgress,
          newFrequencies: notificationPreferences.newFrequencies,
          healthTips: notificationPreferences.healthTips
        },
        
        // Account metadata
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileCompleted: !!(firstName && lastName && experienceLevel),
        privacyConsentGiven: true,
        privacyConsentDate: new Date().toISOString(),
        healthDisclaimerAccepted: true,
        healthDisclaimerDate: new Date().toISOString(),
        
        // Usage analytics
        signupSource: 'web',
        hasCompletedOnboarding: false,
        totalSessionsCompleted: 0,
        totalListeningMinutes: 0,
        favoriteFrequencies: [],
        lastActiveAt: new Date().toISOString(),
        
        // Wellness tracking
        moodTrackingEnabled: false,
        progressTrackingEnabled: true,
        reminderSettings: {
          enabled: notificationPreferences.sessionReminders,
          frequency: 'daily',
          preferredTime: '19:00'
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      onClose?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-white mb-2">Join HealWave</h2>
          <p className="text-gray-300">Create your personalized healing frequency profile</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 border-b border-purple-500/30 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 border-b border-purple-500/30 pb-2">
              Additional Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-200 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-200 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Teacher, Engineer, Artist"
                />
              </div>
            </div>
          </div>

          {/* Wellness & Experience Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 border-b border-purple-500/30 pb-2">
              Wellness Background
            </h3>
            
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-200 mb-2">
                Experience with Sound Healing
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select your experience level</option>
                <option value="beginner">Beginner - New to sound healing</option>
                <option value="some-experience">Some Experience - Tried a few times</option>
                <option value="regular-practice">Regular Practice - Part of my routine</option>
                <option value="advanced">Advanced - Deep understanding and practice</option>
              </select>
            </div>

            <div>
              <label htmlFor="meditationExperience" className="block text-sm font-medium text-gray-200 mb-2">
                Meditation Experience
              </label>
              <select
                id="meditationExperience"
                value={meditationExperience}
                onChange={(e) => setMeditationExperience(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select your meditation experience</option>
                <option value="none">No experience</option>
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="experienced">Experienced (2+ years)</option>
                <option value="expert">Expert/Teacher level</option>
              </select>
            </div>

            <div>
              <label htmlFor="primaryGoals" className="block text-sm font-medium text-gray-200 mb-2">
                Primary Wellness Goals
              </label>
              <textarea
                id="primaryGoals"
                value={primaryGoals}
                onChange={(e) => setPrimaryGoals(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="e.g., Stress relief, better sleep, focus enhancement, pain management, spiritual growth..."
              />
            </div>

            <div>
              <label htmlFor="preferredSessionLength" className="block text-sm font-medium text-gray-200 mb-2">
                Preferred Session Length
              </label>
              <select
                id="preferredSessionLength"
                value={preferredSessionLength}
                onChange={(e) => setPreferredSessionLength(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select preferred session length</option>
                <option value="5-10">5-10 minutes (Quick sessions)</option>
                <option value="10-20">10-20 minutes (Standard sessions)</option>
                <option value="20-30">20-30 minutes (Extended sessions)</option>
                <option value="30+">30+ minutes (Deep sessions)</option>
                <option value="flexible">Flexible - varies by need</option>
              </select>
            </div>
          </div>

          {/* Health Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 border-b border-purple-500/30 pb-2">
              Health & Safety (Optional)
            </h3>
            
            <div>
              <label htmlFor="healthConditions" className="block text-sm font-medium text-gray-200 mb-2">
                Relevant Health Conditions
              </label>
              <textarea
                id="healthConditions"
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Any hearing sensitivity, epilepsy, or other conditions we should know about (optional, helps us provide safer recommendations)"
              />
              <p className="text-xs text-gray-400 mt-1">
                This information helps us provide appropriate frequency recommendations
              </p>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 border-b border-purple-500/30 pb-2">
              Notification Preferences
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.sessionReminders}
                  onChange={(e) => setNotificationPreferences(prev => ({
                    ...prev,
                    sessionReminders: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-200">Daily session reminders</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.weeklyProgress}
                  onChange={(e) => setNotificationPreferences(prev => ({
                    ...prev,
                    weeklyProgress: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-200">Weekly progress reports</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.newFrequencies}
                  onChange={(e) => setNotificationPreferences(prev => ({
                    ...prev,
                    newFrequencies: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-200">New frequency releases</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.healthTips}
                  onChange={(e) => setNotificationPreferences(prev => ({
                    ...prev,
                    healthTips: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-gray-200">Wellness tips and insights</span>
              </label>
            </div>
          </div>

          {/* Legal Agreements */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={healthDisclaimer}
                  onChange={(e) => setHealthDisclaimer(e.target.checked)}
                  required
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                />
                <span className="text-sm text-gray-200">
                  I understand that sound healing frequencies are for wellness purposes only and not a substitute for medical treatment. I will consult healthcare professionals for medical concerns. *
                </span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  required
                  className="w-4 h-4 text-purple-500 bg-white/10 border-purple-500/30 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                />
                <span className="text-sm text-gray-200">
                  I agree to the <span className="text-purple-300 underline cursor-pointer">Privacy Policy</span> and <span className="text-purple-300 underline cursor-pointer">Terms of Service</span> *
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Your Healing Account...
              </div>
            ) : (
              'Start Your Healing Journey'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our healing frequency guidelines
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
