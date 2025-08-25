import React, { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useToast } from './ToastProvider';
import axios from 'axios';
import { getAuthToken } from '../services/api';
import { apiConfig } from '../config/environment';

interface PersonalityResult {
  sun_sign: string;
  traits: string;
}

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  city: string;
}

const AnalyzePersonality: React.FC = React.memo(() => {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    city: '',
  });
  const [houseSystem, setHouseSystem] = useState<'P' | 'E'>('P');
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'houseSystem' && (value === 'P' || value === 'E')) {
      setHouseSystem(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      const token = await getAuthToken();
  const response = await axios.post(`${apiConfig.baseUrl}/analyze-personality`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Type-safe result assignment with validation
      const responseData = response.data as unknown;
      if (responseData !== null && responseData !== undefined && typeof responseData === 'object' && 
          'sun_sign' in responseData && 'traits' in responseData) {
        setResult(responseData as PersonalityResult);
      } else {
        throw new Error('Invalid response format');
      }
      toast({
        title: 'Personality Analyzed',
        description: 'Your personality analysis is complete.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as { response?: { data?: { detail?: string } } };
      const errorMessage = err.response?.data?.detail ?? 'Failed to analyze personality';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [formData, toast]);

  const onFormSubmit = useCallback((e: React.FormEvent): void => {
    handleSubmit(e).catch((error: unknown) => {
      // Log error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    });
  }, [handleSubmit]);

  const isFormValid = useCallback((): boolean => {
    return Object.values(formData).every((value: string) => 
      typeof value === 'string' && value.trim().length > 0
    ) && (houseSystem === 'P' || houseSystem === 'E');
  }, [formData, houseSystem]);

  if (loading) {
    return <span className="text-cosmic-silver">Loading...</span>;
  }

  if (user === null || user === undefined) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-xl p-4 mx-auto border rounded-lg shadow-2xl bg-cosmic-dark/80 backdrop-blur-xl border-cosmic-silver/20 text-cosmic-silver">
      <h1 className="mb-6 text-2xl font-bold text-center text-cosmic-gold">Personality Analysis</h1>
      <form onSubmit={onFormSubmit} aria-label="Personality Analysis Form">
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="year" className="block mb-2 text-cosmic-gold">Year <span aria-hidden="true">*</span></label>
            <input
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 1990"
              className="cosmic-input"
              aria-required="true"
              aria-label="e.g., 1990"
            />
          </div>
          <div>
            <label htmlFor="month" className="block mb-2 text-cosmic-gold">Month <span aria-hidden="true">*</span></label>
            <input
              id="month"
              type="number"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              placeholder="e.g., 1"
              className="cosmic-input"
              aria-required="true"
            aria-label="e.g., 1" />
          </div>
          <div>
            <label htmlFor="day" className="block mb-2 text-cosmic-gold">Day <span aria-hidden="true">*</span></label>
            <input
              id="day"
              type="number"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              placeholder="e.g., 1"
              className="cosmic-input"
              aria-required="true"
            aria-label="e.g., 1" />
          </div>
          <div>
            <label htmlFor="hour" className="block mb-2 text-cosmic-gold">Hour (24h) <span aria-hidden="true">*</span></label>
            <input
              id="hour"
              type="number"
              name="hour"
              value={formData.hour}
              onChange={handleInputChange}
              placeholder="e.g., 12"
              className="cosmic-input"
              aria-required="true"
            aria-label="e.g., 12" />
          </div>
          <div>
            <label htmlFor="minute" className="block mb-2 text-cosmic-gold">Minute <span aria-hidden="true">*</span></label>
            <input
              id="minute"
              type="number"
              name="minute"
              value={formData.minute}
              onChange={handleInputChange}
              placeholder="e.g., 0"
              className="cosmic-input"
              aria-required="true"
            aria-label="e.g., 0" />
          </div>
          <div>
            <label htmlFor="city" className="block mb-2 text-cosmic-gold">City <span aria-hidden="true">*</span></label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., New York"
              className="cosmic-input"
              aria-required="true"
            aria-label="e.g., New York" />
          </div>
          <div>
            <label htmlFor="houseSystem" className="block mb-2 text-cosmic-gold">House System <span aria-hidden="true">*</span></label>
            <select
              id="houseSystem"
              name="houseSystem"
              value={houseSystem}
              onChange={handleInputChange}
              className="cosmic-input"
              aria-required="true"
            >
              <option value="P">Placidus</option>
              <option value="E">Equal House</option>
            </select>
          </div>
          <button
            type="submit"
            className="cosmic-button"
            disabled={!isFormValid()}
          >
            Analyze Personality
          </button>
          {error !== null && error.length > 0 && (
            <div className="flex p-4 space-x-4 border border-red-500 rounded-md bg-red-900/50">
              <span className="text-xl text-red-500">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {result !== null && (
            <div className="p-4 mt-4 rounded-lg bg-cosmic-blue/30">
              <p className="text-cosmic-silver">Sun Sign: <span className="font-bold">{result.sun_sign}</span></p>
              <p className="text-cosmic-silver">Traits: <span className="font-bold">{result.traits}</span></p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
});

AnalyzePersonality.displayName = 'AnalyzePersonality';

export default AnalyzePersonality;