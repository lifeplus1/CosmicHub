import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useBirthData, formatBirthDataDisplay } from '../contexts/BirthDataContext';
import type { ChartBirthData } from '../services/api';

interface UnifiedBirthInputProps {
  onSubmit?: (data: ChartBirthData) => void;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  title?: string;
  description?: string;
  autoSubmit?: boolean;
  showCurrentData?: boolean;
  className?: string;
}

const SAMPLE_DATA = {
  year: 1990,
  month: 6,
  day: 21,
  hour: 14,
  minute: 30,
  city: 'New York, NY',
  lat: 40.7128,
  lon: -74.0060,
  timezone: 'America/New_York'
};

const MAJOR_CITIES = [
  { name: 'New York, NY', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
  { name: 'São Paulo, Brazil', lat: -23.5558, lon: -46.6396, tz: 'America/Sao_Paulo' }
];

export const UnifiedBirthInput: React.FC<UnifiedBirthInputProps> = ({
  onSubmit,
  showSubmitButton = true,
  submitButtonText = 'Calculate Chart',
  title = 'Birth Information',
  description = 'Enter your birth details to unlock your cosmic blueprint',
  autoSubmit = false,
  showCurrentData = true,
  className = ''
}) => {
  const { birthData, setBirthData, isDataValid } = useBirthData();
  
  // Form state - initialize with existing birth data or defaults
  const [formData, setFormData] = useState(() => ({
    year: birthData?.year?.toString() || '',
    month: birthData?.month?.toString() || '',
    day: birthData?.day?.toString() || '',
    hour: birthData?.hour?.toString() || '',
    minute: birthData?.minute?.toString() || '',
    city: birthData?.city || '',
    lat: birthData?.lat?.toString() || '',
    lon: birthData?.lon?.toString() || '',
    timezone: birthData?.timezone || ''
  }));

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [citySearchResults, setCitySearchResults] = useState<typeof MAJOR_CITIES>([]);

  // Update form when birth data changes from context
  useEffect(() => {
    if (birthData) {
      setFormData({
        year: birthData.year?.toString() || '',
        month: birthData.month?.toString() || '',
        day: birthData.day?.toString() || '',
        hour: birthData.hour?.toString() || '',
        minute: birthData.minute?.toString() || '',
        city: birthData.city || '',
        lat: birthData.lat?.toString() || '',
        lon: birthData.lon?.toString() || '',
        timezone: birthData.timezone || ''
      });
    }
  }, [birthData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Smart city search
    if (field === 'city' && value.length > 2) {
      const filtered = MAJOR_CITIES.filter(city => 
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setCitySearchResults(filtered.slice(0, 5));
    } else if (field === 'city' && value.length <= 2) {
      setCitySearchResults([]);
    }
  }, []);

  const handleCitySelect = useCallback((city: typeof MAJOR_CITIES[0]) => {
    setFormData(prev => ({
      ...prev,
      city: city.name,
      lat: city.lat.toString(),
      lon: city.lon.toString(),
      timezone: city.tz
    }));
    setCitySearchResults([]);
  }, []);

  const loadSampleData = useCallback(() => {
    setFormData({
      year: SAMPLE_DATA.year.toString(),
      month: SAMPLE_DATA.month.toString(),
      day: SAMPLE_DATA.day.toString(),
      hour: SAMPLE_DATA.hour.toString(),
      minute: SAMPLE_DATA.minute.toString(),
      city: SAMPLE_DATA.city,
      lat: SAMPLE_DATA.lat.toString(),
      lon: SAMPLE_DATA.lon.toString(),
      timezone: SAMPLE_DATA.timezone
    });
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const newBirthData: ChartBirthData = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      city: formData.city,
      lat: formData.lat ? parseFloat(formData.lat) : undefined,
      lon: formData.lon ? parseFloat(formData.lon) : undefined,
      timezone: formData.timezone || undefined
    };

    // Validate required fields
    if (!newBirthData.year || !newBirthData.month || !newBirthData.day || 
        !newBirthData.hour || newBirthData.minute === undefined || !newBirthData.city) {
      alert('Please fill in all required fields');
      return;
    }

    setBirthData(newBirthData);
    onSubmit?.(newBirthData);
  }, [formData, setBirthData, onSubmit]);

  // Auto-submit when data is complete and valid
  useEffect(() => {
    if (autoSubmit && isDataValid && birthData) {
      onSubmit?.(birthData);
    }
  }, [autoSubmit, isDataValid, birthData, onSubmit]);

  const isFormComplete = formData.year && formData.month && formData.day && 
                        formData.hour && formData.minute !== '' && formData.city;

  return (
    <div className={`unified-birth-input ${className}`}>
      {/* Current Data Display */}
      {showCurrentData && birthData && (
        <Card className="mb-6 bg-cosmic-gold/10 border-cosmic-gold/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-cosmic-gold font-semibold mb-1">Current Birth Data</h4>
              <p className="text-cosmic-silver/80 text-sm">
                {formatBirthDataDisplay(birthData)}
              </p>
            </div>
            <Button 
              onClick={() => setBirthData(null)} 
              variant="secondary" 
              className="text-sm"
            >
              Edit
            </Button>
          </div>
        </Card>
      )}

      {/* Input Form */}
      {(!birthData || !showCurrentData) && (
        <Card title={title}>
          <p className="text-cosmic-silver/70 mb-6">{description}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-cosmic-silver font-medium mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="1990"
                  min="1900"
                  max="2030"
                  required
                  className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-cosmic-silver font-medium mb-2">
                  Month <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', e.target.value)}
                  required
                  title="Select birth month"
                  className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-cosmic-silver font-medium mb-2">
                  Day <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  placeholder="15"
                  min="1"
                  max="31"
                  required
                  className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Time of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-cosmic-silver font-medium mb-2">
                  Hour (24-hour) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.hour}
                  onChange={(e) => handleInputChange('hour', e.target.value)}
                  placeholder="14"
                  min="0"
                  max="23"
                  required
                  className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-cosmic-silver font-medium mb-2">
                  Minute <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.minute}
                  onChange={(e) => handleInputChange('minute', e.target.value)}
                  placeholder="30"
                  min="0"
                  max="59"
                  required
                  className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Birth Location */}
            <div className="relative">
              <label className="block text-cosmic-silver font-medium mb-2">
                Birth City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Start typing a city name..."
                required
                className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
              />
              
              {/* City Search Results */}
              {citySearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg shadow-lg">
                  {citySearchResults.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-2 text-left text-cosmic-silver hover:bg-cosmic-purple/20 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-cosmic-gold hover:text-cosmic-gold/80 transition-colors text-sm font-medium"
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options (Optional)
              </button>
              
              {showAdvanced && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-cosmic-silver/70 font-medium mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.lat}
                      onChange={(e) => handleInputChange('lat', e.target.value)}
                      placeholder="40.7128"
                      className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-cosmic-silver/70 font-medium mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.lon}
                      onChange={(e) => handleInputChange('lon', e.target.value)}
                      placeholder="-74.0060"
                      className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-cosmic-silver/70 font-medium mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      placeholder="America/New_York"
                      className="w-full px-4 py-3 bg-cosmic-dark border border-cosmic-purple/30 rounded-lg text-cosmic-silver focus:border-cosmic-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
              <Button
                onClick={loadSampleData}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                📄 Load Sample Data
              </Button>
              
              {showSubmitButton && (
                <button
                  type="submit"
                  disabled={!isFormComplete}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isFormComplete
                      ? 'bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ✨ {submitButtonText}
                </button>
              )}
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
