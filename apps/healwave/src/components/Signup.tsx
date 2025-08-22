import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { signUp, useAuth } from '@cosmichub/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface SignupProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

interface NotificationPreferences {
  sessionReminders: boolean;
  weeklyProgress: boolean;
  newFrequencies: boolean;
  healthTips: boolean;
}

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  occupation: string | null;
  experienceLevel: string | null;
  primaryGoals: string | null;
  healthConditions: string | null;
  meditationExperience: string | null;
  preferredSessionLength: string | null;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  lastLoginAt: string;
  profileCompleted: boolean;
  privacyConsentGiven: boolean;
  privacyConsentDate: string;
  healthDisclaimerAccepted: boolean;
  healthDisclaimerDate: string;
  signupSource: string;
  hasCompletedOnboarding: boolean;
  totalSessionsCompleted: number;
  totalListeningMinutes: number;
  favoriteFrequencies: string[];
  lastActiveAt: string;
  moodTrackingEnabled: boolean;
  progressTrackingEnabled: boolean;
  reminderSettings: {
    enabled: boolean;
    frequency: string;
    preferredTime: string;
  };
}

const Signup: FC<SignupProps> = ({ onSwitchToLogin, onClose }) => {
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
        <div className="mb-4 text-xl text-green-400">✅ Already logged in!</div>
        <p className="mb-4 text-gray-300">Welcome, {user.email}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600"
        >
          Continue
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
      const userProfile: UserProfile = {
        // Basic info
        email: user.email || '',
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
      <div className="p-8 border shadow-2xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl border-purple-500/20">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Join HealWave</h2>
          <p className="text-gray-300">Create your account for personalized sound healing</p>
        </div>

        {error && (
          <div className="p-3 mb-6 border rounded-lg bg-red-500/20 border-red-500/50">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

  <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          {/* Account Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-200">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your first name"
                aria-label="First Name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-200">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your last name"
                aria-label="Last Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-200">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              aria-required="true"
              className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              aria-label="Email Address"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-200">
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                aria-label="Password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-200">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                aria-label="Confirm Password"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="dateOfBirth" className="block mb-2 text-sm font-medium text-gray-200">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 text-white transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  aria-label="Date of Birth"
                />
              </div>

              <div>
                <label htmlFor="occupation" className="block mb-2 text-sm font-medium text-gray-200">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your profession"
                  aria-label="Occupation"
                />
              </div>
            </div>
          </div>

          {/* Healing Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Healing Preferences</h3>
            <div>
              <label htmlFor="experienceLevel" className="block mb-2 text-sm font-medium text-gray-200">
                Experience with Sound Healing
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Experience with Sound Healing"
              >
                <option value="">Select level...</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="primaryGoals" className="block mb-2 text-sm font-medium text-gray-200">
                Primary Wellness Goals
              </label>
              <textarea
                id="primaryGoals"
                value={primaryGoals}
                onChange={(e) => setPrimaryGoals(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Reduce stress, improve sleep..."
                aria-label="Primary Wellness Goals"
              />
            </div>

            <div>
              <label htmlFor="healthConditions" className="block mb-2 text-sm font-medium text-gray-200">
                Relevant Health Conditions
              </label>
              <textarea
                id="healthConditions"
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Any conditions we should be aware of (optional)"
                aria-label="Relevant Health Conditions"
              />
            </div>

            <div>
              <label htmlFor="meditationExperience" className="block mb-2 text-sm font-medium text-gray-200">
                Meditation Experience
              </label>
              <select
                id="meditationExperience"
                value={meditationExperience}
                onChange={(e) => setMeditationExperience(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Meditation Experience"
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
                <option value="daily">Daily Practice</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferredSessionLength" className="block mb-2 text-sm font-medium text-gray-200">
                Preferred Session Length
              </label>
              <select
                id="preferredSessionLength"
                value={preferredSessionLength}
                onChange={(e) => setPreferredSessionLength(e.target.value)}
                className="w-full px-4 py-3 text-white transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Preferred Session Length"
              >
                <option value="">Select...</option>
                <option value="short">Short (5-15 min)</option>
                <option value="medium">Medium (15-30 min)</option>
                <option value="long">Long (30+ min)</option>
              </select>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={notificationPreferences.sessionReminders}
                  onChange={(e) => setNotificationPreferences(prev => ({
                    ...prev,
                    sessionReminders: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
                  aria-label="Daily session reminders"
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
                  className="w-4 h-4 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
                  aria-label="Weekly progress reports"
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
                  className="w-4 h-4 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
                  aria-label="New frequency releases"
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
                  className="w-4 h-4 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
                  aria-label="Wellness tips and insights"
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
                  aria-required="true"
                  className="w-4 h-4 mt-1 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
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
                  aria-required="true"
                  className="w-4 h-4 mt-1 text-purple-500 rounded bg-white/10 border-purple-500/30 focus:ring-purple-500 focus:ring-2"
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
                <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
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
              className="font-medium text-purple-400 transition-colors hover:text-purple-300"
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