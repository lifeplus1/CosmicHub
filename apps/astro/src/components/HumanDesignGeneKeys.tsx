import React, { useState, useCallback, lazy, Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FaUser, FaStar, FaKey, FaChartLine } from 'react-icons/fa';
import { useAuth } from '@cosmichub/auth';
import { useToast } from './ToastProvider';

const HumanDesignChart = lazy(() => import('./HumanDesignChart'));
const GeneKeysChart = lazy(() => import('./GeneKeysChart'));
const EducationalContent = lazy(() => import('./EducationalContent'));

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  city: string;
  timezone: string;
}

const HumanDesignGeneKeys: React.FC = React.memo(() => {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    city: '',
    timezone: 'America/New_York'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    const requiredFields = ['year', 'month', 'day', 'hour', 'minute', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData].trim());
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const data: BirthData = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      city: formData.city,
      timezone: formData.timezone
    };

    setBirthData(data);
    setShowCalculation(true);
  }, [formData, toast]);

  const handleNewCalculation = useCallback(() => {
    setBirthData(null);
    setShowCalculation(false);
    setFormData({
      year: '',
      month: '',
      day: '',
      hour: '',
      minute: '',
      city: '',
      timezone: 'America/New_York'
    });
  }, []);

  if (!user) {
    return (
      <div className="py-10 text-center">
        <div className="flex max-w-2xl p-4 mx-auto space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50">
          <span className="text-xl text-yellow-500">⚠️</span>
          <p className="text-cosmic-silver">Please log in to access Human Design and Gene Keys calculations.</p>
        </div>
      </div>
    );
  }

  if (showCalculation && birthData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-cosmic-silver">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold">Human Design & Gene Keys</h2>
                <p>Your complete genetic blueprint and consciousness codes</p>
              </div>
              <button
                className="px-4 py-2 transition-colors border rounded bg-white/20 border-white/50 text-cosmic-silver hover:bg-white/30"
                onClick={handleNewCalculation}
                aria-label="Start New Calculation"
              >
                New Calculation
              </button>
            </div>
          </div>
        </div>

        <div className="py-4 mx-auto max-w-7xl">
          <div className="mb-6 cosmic-card">
            <div className="p-4">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <FaUser className="text-gold-400" />
                  <p className="font-bold text-cosmic-silver">
                    {formData.city} • {formData.month}/{formData.day}/{formData.year} • {formData.hour}:{formData.minute.padStart(2, '0')} {formData.timezone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs.Root defaultValue="human-design">
            <Tabs.List className="flex border-b border-cosmic-silver/30">
              <Tabs.Trigger value="human-design" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
                <div className="flex items-center space-x-2">
                  <FaChartLine />
                  <span>Human Design</span>
                </div>
              </Tabs.Trigger>
              <Tabs.Trigger value="gene-keys" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
                <div className="flex items-center space-x-2">
                  <FaKey />
                  <span>Gene Keys</span>
                </div>
              </Tabs.Trigger>
              <Tabs.Trigger value="learn" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">
                <div className="flex items-center space-x-2">
                  <FaStar />
                  <span>Learn More</span>
                </div>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="human-design" className="pt-4">
              <Suspense fallback={<div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>}>
                <HumanDesignChart birthData={birthData} />
              </Suspense>
            </Tabs.Content>
            <Tabs.Content value="gene-keys" className="pt-4">
              <Suspense fallback={<div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>}>
                <GeneKeysChart birthData={birthData} />
              </Suspense>
            </Tabs.Content>
            <Tabs.Content value="learn" className="pt-4">
              <Suspense fallback={<div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>}>
                <EducationalContent />
              </Suspense>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl py-10 mx-auto">
      <div className="cosmic-card">
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-center text-cosmic-gold">Enter Your Birth Information</h2>
          <form aria-label="Human Design & Gene Keys Form">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="month" className="block mb-2 text-cosmic-gold">Month <span aria-hidden="true">*</span></label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="cosmic-input"
                    aria-required="true"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('en', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="day" className="block mb-2 text-cosmic-gold">Day <span aria-hidden="true">*</span></label>
                  <input
                    id="day"
                    name="day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={handleInputChange}
                    placeholder="Day"
                    className="cosmic-input"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block mb-2 text-cosmic-gold">Year <span aria-hidden="true">*</span></label>
                  <input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max="2030"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="Year"
                    className="cosmic-input"
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hour" className="block mb-2 text-cosmic-gold">Hour (24h) <span aria-hidden="true">*</span></label>
                  <input
                    id="hour"
                    name="hour"
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={handleInputChange}
                    placeholder="Hour"
                    className="cosmic-input"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="minute" className="block mb-2 text-cosmic-gold">Minute <span aria-hidden="true">*</span></label>
                  <input
                    id="minute"
                    name="minute"
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={handleInputChange}
                    placeholder="Minute"
                    className="cosmic-input"
                    aria-required="true"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="city" className="block mb-2 text-cosmic-gold">Birth City <span aria-hidden="true">*</span></label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City, State/Country"
                  className="cosmic-input"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block mb-2 text-cosmic-gold">Timezone <span aria-hidden="true">*</span></label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="cosmic-input"
                  aria-required="true"
                  aria-label="Timezone"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Tokyo">Japan Standard Time</option>
                  <option value="Australia/Sydney">Australian Eastern Time</option>
                </select>
              </div>
              <button
                className="w-full cosmic-button"
                onClick={handleCalculate}
                aria-label="Calculate Human Design & Gene Keys"
              >
                Calculate Human Design & Gene Keys
              </button>
            </div>
          </form>

          <div className="flex p-4 mt-6 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
            <span className="text-xl text-blue-500">ℹ️</span>
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-bold text-cosmic-silver">Why both systems?</p>
              <p className="text-sm text-cosmic-silver">
                Human Design provides your mechanical operating instructions, while Gene Keys offers 
                the contemplative path for consciousness evolution. Together, they create a complete 
                map for living your authentic purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HumanDesignGeneKeys.displayName = 'HumanDesignGeneKeys';

export default HumanDesignGeneKeys;