import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import type { ChartBirthData } from '../services/api';

interface SimpleBirthFormProps {
  title?: string;
  submitButtonText?: string;
  onSubmit?: (data: ChartBirthData) => void;
  showSampleButton?: boolean;
  navigateTo?: string; // Custom navigation path
}

export const SimpleBirthForm: React.FC<SimpleBirthFormProps> = ({
  title = "Birth Details",
  submitButtonText = "Calculate Chart",
  onSubmit,
  showSampleButton = false,
  navigateTo
}) => {
  const navigate = useNavigate();
  const { setBirthData } = useBirthData();
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form state with empty defaults - users must enter their own data
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  });

  // Sample birth data removed - users must enter their own data

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form data
    const errors: Record<string, string> = {};
    
    if (!formData.birthDate) {
      errors.birthDate = 'Birth date is required';
    }
    
    if (!formData.birthTime) {
      errors.birthTime = 'Birth time is required';
    }
    
    if (!formData.birthLocation.trim()) {
      errors.birthLocation = 'Birth location is required';
    }
    
    // Check if date is reasonable (between 1900 and current year + 1)
    if (formData.birthDate) {
      const [yearStr] = formData.birthDate.split('-');
      const selectedYear = parseInt(yearStr, 10);
      const currentYear = new Date().getFullYear();
      if (selectedYear < 1900 || selectedYear > currentYear + 1) {
        errors.birthDate = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse the date string explicitly to avoid timezone issues
      // formData.birthDate is in YYYY-MM-DD format from date input
      const [yearStr, monthStr, dayStr] = formData.birthDate.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      
      const [hours, minutes] = formData.birthTime.split(':').map(Number);

      // No need to provide coordinates or timezone - backend will determine automatically from city
      const chartData: ChartBirthData = {
        year: year,
        month: month,
        day: day,
        hour: hours,
        minute: minutes,
        city: formData.birthLocation.trim()
        // lat, lon, and timezone will be automatically determined by backend
      };

      setBirthData(chartData);
      
      // Store birth data in sessionStorage for ChartResults page
      const storedBirthData = {
        date: formData.birthDate, // "YYYY-MM-DD" format
        time: formData.birthTime, // "HH:MM" format  
        location: formData.birthLocation.trim()
      };
      
      sessionStorage.setItem('birthData', JSON.stringify(storedBirthData));
      console.log('✅ Birth data stored in sessionStorage for chart-results page:', storedBirthData);
      
      // Navigate to chart-results page instead of calling onSubmit
      if (onSubmit) {
        onSubmit(chartData);
      } else {
        navigate(navigateTo || '/chart-results');
      }
    } catch (error) {
      console.error('Error creating chart:', error);
      alert('Error creating chart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sample functionality removed

  // Geolocation functionality
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village;
            const state = data.address?.state;
            const country = data.address?.country;
            
            let locationString = '';
            if (city && state && country) {
              locationString = `${city}, ${state}, ${country}`;
            } else if (city && country) {
              locationString = `${city}, ${country}`;
            } else if (country) {
              locationString = country;
            }
            
            if (locationString) {
              setFormData(prev => ({ ...prev, birthLocation: locationString }));
            } else {
              alert('Could not determine location name. Please enter manually.');
            }
          } else {
            alert('Could not determine location name. Please enter manually.');
          }
        } catch (error) {
          console.error('Error with reverse geocoding:', error);
          alert('Could not determine location name. Please enter manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = 'Could not get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message += 'Location request timed out.';
            break;
          default:
            message += 'An unknown error occurred.';
            break;
        }
        alert(message);
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  return (
    <Card title={title}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Birth Date - Single composite field */}
        <div>
          <label htmlFor="birth-date" className="block text-cosmic-silver mb-2">Birth Date</label>
          <input 
            id="birth-date"
            type="date" 
            value={formData.birthDate}
            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            className={`w-full p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
              validationErrors.birthDate 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-cosmic-purple focus:border-cosmic-gold'
            } transition-colors`}
            required
            aria-label="Select your birth date"
          />
          {validationErrors.birthDate && (
            <p className="text-red-400 text-sm mt-1">⚠️ {validationErrors.birthDate}</p>
          )}
        </div>
        
        {/* Birth Time - Single composite field */}
        <div>
          <label htmlFor="birth-time" className="block text-cosmic-silver mb-2">Birth Time</label>
          <input 
            id="birth-time"
            type="time" 
            value={formData.birthTime}
            onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
            className={`w-full p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
              validationErrors.birthTime 
                ? 'border-red-500 focus:border-red-400' 
                : 'border-cosmic-purple focus:border-cosmic-gold'
            } transition-colors`}
            required
            aria-label="Select your birth time"
          />
          {validationErrors.birthTime && (
            <p className="text-red-400 text-sm mt-1">⚠️ {validationErrors.birthTime}</p>
          )}
        </div>
        
        {/* Birth Location - Single composite field */}
        <div>
          <label htmlFor="birth-location" className="block text-cosmic-silver mb-2">Birth Location</label>
          <div className="flex gap-2">
            <input 
              id="birth-location"
              type="text" 
              placeholder="City, State/Country (e.g., New York, NY or London, UK)"
              value={formData.birthLocation}
              onChange={(e) => setFormData({...formData, birthLocation: e.target.value})}
              className={`flex-1 p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
                validationErrors.birthLocation 
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-cosmic-purple focus:border-cosmic-gold'
              } transition-colors`}
              required
              aria-label="Enter your birth location"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="px-4 py-3 bg-cosmic-gold/20 hover:bg-cosmic-gold/30 disabled:bg-gray-600 border border-cosmic-gold/30 text-cosmic-gold text-sm rounded transition-colors whitespace-nowrap"
              title="Use your current location"
            >
              {isDetectingLocation ? '📍...' : '📍 Current'}
            </button>
          </div>
          {validationErrors.birthLocation && (
            <p className="text-red-400 text-sm mt-1">⚠️ {validationErrors.birthLocation}</p>
          )}
          <p className="text-cosmic-silver/60 text-sm mt-1">
            💡 Timezone will be automatically detected from your location
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cosmic-purple hover:bg-cosmic-purple/80 disabled:bg-gray-600 text-white p-3 rounded transition-colors relative overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin text-lg">🌌</div>
                <span>Calculating cosmic positions...</span>
              </div>
            ) : (
              submitButtonText
            )}
          </button>
          
          {/* Quick tips */}
          <div className="mt-4 p-3 bg-cosmic-gold/10 rounded-lg border border-cosmic-gold/20">
            <div className="flex items-start gap-2">
              <span className="text-cosmic-gold mt-0.5">💡</span>
              <div className="text-sm">
                <p className="text-cosmic-gold font-medium mb-1">Pro Tips:</p>
                <ul className="text-cosmic-silver/80 space-y-1 text-xs">
                  <li>• Use exact birth time from birth certificate for accuracy</li>
                  <li>• Include state/province for better location matching</li>
                  <li>• Click "Current" to use your current location as reference</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};
