import { useState, type FC, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import type { ChartBirthData } from '@cosmichub/types';
import { devConsole } from '../config/environment';

// Removed unused FormFields type (was never referenced)

interface SimpleBirthFormProps {
  title?: string;
  submitButtonText?: string;
  onSubmit?: (data: ChartBirthData) => void;
  showSampleButton?: boolean;
  navigateTo?: string; // Custom navigation path
}

export const SimpleBirthForm: FC<SimpleBirthFormProps> = ({
  title = "Birth Details",
  submitButtonText = "Calculate Chart",
  onSubmit,
  // showSampleButton removed (unused prop)
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

  const validateFormData = (data: typeof formData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Required field validation (explicit empty string checks)
    if (data.birthDate === '') {
      errors.birthDate = 'Birth date is required';
    }
    if (data.birthTime === '') {
      errors.birthTime = 'Birth time is required';
    }
    const trimmedLocation = data.birthLocation.trim();
    if (trimmedLocation === '') {
      errors.birthLocation = 'Birth location is required';
    }
    
    return errors;
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data
    const errors = validateFormData(formData);

    // Check if date is reasonable (between 1900 and current year + 1)
  if (formData.birthDate !== '') {
      const [yearStr] = formData.birthDate.split('-');
      const selectedYear = parseInt(yearStr, 10);
      const currentYear = new Date().getFullYear();
      if (selectedYear < 1900 || selectedYear > currentYear + 1) {
        errors.birthDate = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }

  const hasErrors = Object.keys(errors).length !== 0;
    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

  try {
      // Parse the date string explicitly to avoid timezone issues
      const [yearStr, monthStr, dayStr] = formData.birthDate.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const [hours, minutes] = formData.birthTime.split(':').map(Number);

      const chartData: ChartBirthData = {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        city: formData.birthLocation.trim(),
      };

      setBirthData(chartData);

      const storedBirthData = {
        date: formData.birthDate,
        time: formData.birthTime,
        location: formData.birthLocation.trim(),
      };

      sessionStorage.setItem('birthData', JSON.stringify(storedBirthData));

  if (onSubmit !== undefined && onSubmit !== null) {
        onSubmit(chartData);
      } else {
        navigate(navigateTo ?? '/chart-results');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      devConsole.error('Error creating chart:', errorMessage);
      setValidationErrors({ 
        form: 'Failed to create chart. Please check your inputs and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sample functionality removed

  // Geolocation functionality
  interface ReverseGeocodeResponse {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
    };
  }

  const handleDetectLocation = (): void => {
  if (navigator.geolocation === null || navigator.geolocation === undefined) {
      setValidationErrors({
        birthLocation: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (response.status === 200) {
            const data = await response.json() as unknown as ReverseGeocodeResponse; // typed response
            const address = data.address ?? {};
            const city = address.city ?? address.town ?? address.village ?? '';
            const state = address.state ?? '';
            const country = address.country ?? '';
            let locationString = '';
            if (city !== '' && state !== '' && country !== '') {
              locationString = `${city}, ${state}, ${country}`;
            } else if (city !== '' && country !== '') {
              locationString = `${city}, ${country}`;
            } else if (country !== '') {
              locationString = country;
            }

            if (locationString !== '') {
              setFormData(prev => ({ ...prev, birthLocation: locationString }));
            } else {
              setValidationErrors({
                birthLocation: 'Could not determine location name. Please enter manually.'
              });
            }
          } else {
            setValidationErrors({
              birthLocation: 'Could not determine location name. Please enter manually.'
            });
          }
        } catch (error) {
          devConsole.error('Error with reverse geocoding:', error);
          setValidationErrors({
            birthLocation: 'Could not determine location name. Please enter manually.'
          });
        } finally {
          setIsDetectingLocation(false);
        }
        })();
      },
  (error: GeolocationPositionError) => {
        devConsole.error('Geolocation error:', error);
        let message = 'Could not get your location. ';
        switch (error.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            message += 'Please allow location access and try again.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            message += 'Location information is unavailable.';
            break;
          case GeolocationPositionError.TIMEOUT:
            message += 'Location request timed out.';
            break;
          default:
            message += 'An unknown error occurred.';
            break;
        }
        setValidationErrors({
          birthLocation: message
        });
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
  <form onSubmit={(e) => { handleFormSubmit(e); }} className="space-y-4">
        {/* Birth Date - Single composite field */}
        <div>
          <label htmlFor="birth-date" className="block text-cosmic-silver mb-2">Birth Date</label>
          <input 
            id="birth-date"
            name="birthDate"
            type="date" 
            value={formData.birthDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({...prev, birthDate: e.target.value}))}
            className={`w-full p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
              typeof validationErrors.birthDate === 'string' && validationErrors.birthDate !== ''
                ? 'border-red-500 focus:border-red-400'
                : 'border-cosmic-purple focus:border-cosmic-gold'
            } transition-colors`}
            required
            aria-label="Select your birth date"
            aria-describedby="birth-date-error"
          />
          {typeof validationErrors.birthDate === 'string' && validationErrors.birthDate !== '' && (
            <p id="birth-date-error" className="text-red-400 text-sm mt-1" aria-live="polite">
              ⚠️ {validationErrors.birthDate}
            </p>
          )}
        </div>
        
        {/* Birth Time - Single composite field */}
        <div>
          <label htmlFor="birth-time" className="block text-cosmic-silver mb-2">Birth Time</label>
          <input 
            id="birth-time"
            type="time" 
            value={formData.birthTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({...prev, birthTime: e.target.value}))}
            className={`w-full p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
              typeof validationErrors.birthTime === 'string' && validationErrors.birthTime !== ''
                ? 'border-red-500 focus:border-red-400'
                : 'border-cosmic-purple focus:border-cosmic-gold'
            } transition-colors`}
            required
            aria-label="Select your birth time"
            aria-describedby="birth-time-error"
          />
          {typeof validationErrors.birthTime === 'string' && validationErrors.birthTime !== '' && (
            <p id="birth-time-error" className="text-red-400 text-sm mt-1" aria-live="polite">
              ⚠️ {validationErrors.birthTime}
            </p>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({...prev, birthLocation: e.target.value}))}
              className={`flex-1 p-3 rounded bg-cosmic-dark border text-cosmic-silver ${
                typeof validationErrors.birthLocation === 'string' && validationErrors.birthLocation !== ''
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-cosmic-purple focus:border-cosmic-gold'
              } transition-colors`}
              required
              aria-label="Enter your birth location"
              aria-describedby="birth-location-error"
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
          {typeof validationErrors.birthLocation === 'string' && validationErrors.birthLocation !== '' && (
            <p id="birth-location-error" className="text-red-400 text-sm mt-1" aria-live="polite">
              ⚠️ {validationErrors.birthLocation}
            </p>
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
                  <li>• Click &quot;Current&quot; to use your current location as reference</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};
