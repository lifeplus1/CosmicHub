import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';
import { signUp } from '@cosmichub/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  timezone: string;
  astrologicalExperience: string;
  interests: string;
  notificationPreferences: {
    dailyHoroscope: boolean;
    monthlyForecast: boolean;
    compatibilityInsights: boolean;
    newFeatures: boolean;
  };
  privacyConsent: boolean;
}

const Signup: React.FC = React.memo(() => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    timezone: '',
    astrologicalExperience: '',
    interests: '',
    notificationPreferences: {
      dailyHoroscope: false,
      monthlyForecast: false,
      compatibilityInsights: false,
      newFeatures: false,
    },
    privacyConsent: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checked,
        },
        privacyConsent:
          name === 'privacyConsent' ? checked : prev.privacyConsent,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      if (
        formData.email === '' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: 'Invalid Password',
          description: 'Password must be at least 6 characters',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Passwords do not match',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (formData.privacyConsent !== true) {
        toast({
          title: 'Consent Required',
          description:
            'You must agree to the Privacy Policy and Terms of Service',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      try {
        const userCredential = await signUp(formData.email, formData.password);
        const db = getFirestore();
        await setDoc(doc(db, 'users', userCredential.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          timeOfBirth: formData.timeOfBirth,
          placeOfBirth: formData.placeOfBirth,
          timezone: formData.timezone,
          astrologicalExperience: formData.astrologicalExperience,
          interests: formData.interests,
          notificationPreferences: formData.notificationPreferences,
          createdAt: new Date(),
        });

        toast({
          title: 'Account Created',
          description: 'Welcome to Cosmic Hub!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/chart');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        toast({
          title: 'Signup Failed',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, navigate, toast]
  );

  return (
    <div className='min-h-screen px-4 py-8 bg-gray-50'>
      <div className='max-w-lg p-8 mx-auto border shadow-2xl bg-cosmic-dark/80 backdrop-blur-xl border-cosmic-silver/20 rounded-3xl'>
        <div className='flex flex-col space-y-6'>
          <h2 className='text-3xl font-bold text-center text-cosmic-gold font-cinzel'>
            Join Cosmic Hub
          </h2>
          <p className='text-lg text-center text-cosmic-silver'>
            Create your account to unlock personalized astrology insights.
          </p>

          <form
            onSubmit={e => {
              void handleSubmit(e);
            }}
            aria-label='Signup Form'
          >
            <div className='flex flex-col space-y-6'>
              <div>
                <label htmlFor='email' className='block mb-2 text-cosmic-gold'>
                  Email <span aria-hidden='true'>*</span>
                </label>
                <input
                  id='email'
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='your@email.com'
                  className='cosmic-input'
                  aria-required='true'
                  aria-label='your@email.com'
                />
              </div>
              <div>
                <label
                  htmlFor='password'
                  className='block mb-2 text-cosmic-gold'
                >
                  Password <span aria-hidden='true'>*</span>
                </label>
                <input
                  id='password'
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='••••••••'
                  className='cosmic-input'
                  aria-required='true'
                  aria-label='••••••••'
                />
              </div>
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block mb-2 text-cosmic-gold'
                >
                  Confirm Password <span aria-hidden='true'>*</span>
                </label>
                <input
                  id='confirmPassword'
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder='••••••••'
                  className='cosmic-input'
                  aria-required='true'
                  aria-label='••••••••'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='block mb-2 text-cosmic-gold'
                  >
                    First Name
                  </label>
                  <input
                    id='firstName'
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder='First Name'
                    className='cosmic-input'
                    aria-label='First Name'
                  />
                </div>
                <div>
                  <label
                    htmlFor='lastName'
                    className='block mb-2 text-cosmic-gold'
                  >
                    Last Name
                  </label>
                  <input
                    id='lastName'
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Last Name'
                    className='cosmic-input'
                    aria-label='Last Name'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='dateOfBirth'
                    className='block mb-2 text-cosmic-gold'
                  >
                    Date of Birth
                  </label>
                  <input
                    id='dateOfBirth'
                    type='date'
                    name='dateOfBirth'
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className='cosmic-input'
                    aria-label='date input'
                  />
                </div>
                <div>
                  <label
                    htmlFor='timeOfBirth'
                    className='block mb-2 text-cosmic-gold'
                  >
                    Time of Birth
                  </label>
                  <input
                    id='timeOfBirth'
                    type='time'
                    name='timeOfBirth'
                    value={formData.timeOfBirth}
                    onChange={handleInputChange}
                    className='cosmic-input'
                    aria-label='time input'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='placeOfBirth'
                  className='block mb-2 text-cosmic-gold'
                >
                  Place of Birth
                </label>
                <input
                  id='placeOfBirth'
                  type='text'
                  name='placeOfBirth'
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  placeholder='City, State/Country'
                  className='cosmic-input'
                  aria-label='City, State/Country'
                />
              </div>
              <div>
                <label
                  htmlFor='timezone'
                  className='block mb-2 text-cosmic-gold'
                >
                  Timezone
                </label>
                <select
                  id='timezone'
                  name='timezone'
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className='cosmic-input'
                  aria-label='Timezone'
                >
                  <option value=''>Select Timezone</option>
                  <option value='America/New_York'>Eastern Time</option>
                  <option value='America/Chicago'>Central Time</option>
                  <option value='America/Denver'>Mountain Time</option>
                  <option value='America/Los_Angeles'>Pacific Time</option>
                  <option value='Europe/London'>GMT</option>
                  <option value='Europe/Paris'>Central European Time</option>
                  <option value='Asia/Tokyo'>Japan Standard Time</option>
                  <option value='Australia/Sydney'>
                    Australian Eastern Time
                  </option>
                </select>
              </div>
              <h3 className='mt-4 text-xl font-bold text-cosmic-gold'>
                Preferences
              </h3>
              <div>
                <label
                  htmlFor='astrologicalExperience'
                  className='block mb-2 text-cosmic-gold'
                >
                  Astrological Experience
                </label>
                <select
                  id='astrologicalExperience'
                  name='astrologicalExperience'
                  value={formData.astrologicalExperience}
                  onChange={handleInputChange}
                  className='cosmic-input'
                  aria-label='Astrological Experience Level'
                >
                  <option value=''>Select your experience level</option>
                  <option value='beginner'>Beginner - New to astrology</option>
                  <option value='intermediate'>
                    Intermediate - Some knowledge
                  </option>
                  <option value='advanced'>
                    Advanced - Deep understanding
                  </option>
                  <option value='professional'>
                    Professional - Practicing astrologer
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor='interests'
                  className='block mb-2 text-cosmic-gold'
                >
                  Areas of Interest
                </label>
                <textarea
                  id='interests'
                  name='interests'
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder='What aspects of astrology interest you most?'
                  className='cosmic-input'
                  rows={3}
                />
              </div>
              <div className='flex flex-col space-y-2'>
                <span
                  className='font-semibold text-cosmic-gold'
                  id='notification-preferences-heading'
                >
                  Notification Preferences
                </span>
                <label
                  htmlFor='dailyHoroscope'
                  className='flex items-center space-x-2'
                >
                  <input
                    type='checkbox'
                    name='dailyHoroscope'
                    id='dailyHoroscope'
                    checked={formData.notificationPreferences.dailyHoroscope}
                    onChange={handleCheckboxChange}
                    className='w-4 h-4 text-purple-500 rounded'
                    aria-label='checkbox input'
                  />
                  <span className='text-cosmic-silver'>Daily Horoscope</span>
                </label>
                <label
                  htmlFor='monthlyForecast'
                  className='flex items-center space-x-2'
                >
                  <input
                    type='checkbox'
                    name='monthlyForecast'
                    id='monthlyForecast'
                    checked={formData.notificationPreferences.monthlyForecast}
                    onChange={handleCheckboxChange}
                    className='w-4 h-4 text-purple-500 rounded'
                    aria-label='checkbox input'
                  />
                  <span className='text-cosmic-silver'>Monthly Forecast</span>
                </label>
                <label
                  htmlFor='compatibilityInsights'
                  className='flex items-center space-x-2'
                >
                  <input
                    type='checkbox'
                    name='compatibilityInsights'
                    id='compatibilityInsights'
                    checked={
                      formData.notificationPreferences.compatibilityInsights
                    }
                    onChange={handleCheckboxChange}
                    className='w-4 h-4 text-purple-500 rounded'
                    aria-label='checkbox input'
                  />
                  <span className='text-cosmic-silver'>
                    Compatibility Insights
                  </span>
                </label>
                <label
                  htmlFor='newFeatures'
                  className='flex items-center space-x-2'
                >
                  <input
                    type='checkbox'
                    name='newFeatures'
                    id='newFeatures'
                    checked={formData.notificationPreferences.newFeatures}
                    onChange={handleCheckboxChange}
                    className='w-4 h-4 text-purple-500 rounded'
                    aria-label='checkbox input'
                  />
                  <span className='text-cosmic-silver'>New Features</span>
                </label>
              </div>
              <div>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    name='privacyConsent'
                    id='privacyConsent'
                    checked={formData.privacyConsent}
                    onChange={handleCheckboxChange}
                    className='w-4 h-4 text-purple-500 rounded'
                    aria-required='true'
                    aria-label='checkbox input'
                  />
                  <label
                    htmlFor='privacyConsent'
                    className='text-sm text-cosmic-silver'
                  >
                    I agree to the{' '}
                    <a
                      href='/privacy-policy'
                      className='underline text-cosmic-gold hover:text-cosmic-gold/80'
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href='/terms-of-service'
                      className='underline text-cosmic-gold hover:text-cosmic-gold/80'
                    >
                      Terms of Service
                    </a>
                  </label>
                </div>
              </div>
              <button
                type='submit'
                className='w-full mt-6 cosmic-button'
                disabled={isLoading}
              >
                Create Cosmic Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

Signup.displayName = 'Signup';

export default Signup;
