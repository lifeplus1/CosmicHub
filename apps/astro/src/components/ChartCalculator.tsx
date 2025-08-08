import React, { useState } from "react";
import { FaBook, FaInfoCircle } from "react-icons/fa";
import ChartDisplay from "./ChartDisplay";
import { MultiSystemChartDisplay } from "./MultiSystemChartDisplay";
import type { MultiSystemChartData } from "./MultiSystemChartDisplay";
import FeatureGuard from "./FeatureGuard";
import { EducationalTooltip } from "./EducationalTooltip";
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  city: string;
  multiSystem: boolean;
}

export interface ExtendedChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  sun?: string;
  moon?: string;
  rising?: string;
  planets: Record<string, {
    position: number;
    house: number;
    retrograde?: boolean;
    speed?: number;
  }>;
  houses: Array<{
    house: number;
    cusp: number;
    sign: string;
  }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}

function isExtendedChartData(data: any): data is ExtendedChartData {
  return data && 'planets' in data && 'houses' in data && 'aspects' in data;
}

const ChartCalculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
    multiSystem: false,
  });
  const [houseSystem, setHouseSystem] = useState<string>("P"); // Default to Placidus
  const [chart, setChart] = useState<ExtendedChartData | MultiSystemChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setHouseSystem(e.target.value);
  };

  const handleSwitchChange = (checked: boolean): void => {
    setFormData((prev) => ({ ...prev, multiSystem: checked }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = formData.multiSystem ? '/calculate-multi-system' : '/calculate';
      const url = `${import.meta.env.VITE_BACKEND_URL}${endpoint}?house_system=${houseSystem}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to calculate chart");
      }

      const data = await response.json();
      setChart(data.chart as ExtendedChartData | MultiSystemChartData);
      setSuccess(formData.multiSystem 
        ? "Multi-system analysis complete with Western, Vedic, Chinese, Mayan, and Uranian astrology" 
        : "Western tropical chart calculated");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.year && formData.month && formData.day && 
    formData.hour && formData.minute && formData.city;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Birth Chart Calculator</h2>
          <p className="text-gray-300 mb-4">Enter your birth details for accurate astrological insights</p>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm text-cyan-300 border border-cyan-500/30">
            <FaInfoCircle className="mr-2" />
            Pro Tip: Use exact birth time for precise calculations
          </div>
        </div>

        {/* Guide Section */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full flex items-center justify-between text-white font-semibold"
            aria-expanded={isGuideOpen ? 'true' : 'false'}
            aria-controls="guide-content"
          >
            <div className="flex items-center space-x-2">
              <FaBook className="text-cyan-400" />
              <span>Astrology Chart Guide</span>
            </div>
            <span>{isGuideOpen ? '−' : '+'}</span>
          </button>
          
          {isGuideOpen && (
            <div id="guide-content" className="mt-4 space-y-4 text-gray-300">
              <p>Your natal chart is a snapshot of the sky at your birth moment, revealing personality, strengths, and life path.</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Key Components:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Planets:</strong> Core energies and drives</li>
                  <li><strong>Signs:</strong> How energies express</li>
                  <li><strong>Houses:</strong> Life areas affected</li>
                  <li><strong>Aspects:</strong> Planetary relationships</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Multi-System Mode (Premium):</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Western Tropical: Modern psychological</li>
                  <li>Vedic Sidereal: Ancient Indian wisdom</li>
                  <li>Chinese: Elemental cycles</li>
                  <li>Mayan: Sacred calendar</li>
                  <li>Uranian: Hypothetical planets</li>
                </ul>
              </div>
              <p className="text-sm italic">Calculations powered by Swiss Ephemeris for astronomical accuracy.</p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                Birth Year *
                <EducationalTooltip
                  title="Birth Year in Astrology"
                  description="Your birth year determines generational planets like Uranus, Neptune, and Pluto positions."
                />
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="e.g., 1990"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                Birth Month *
                <EducationalTooltip
                  title="Birth Month Significance"
                  description="Determines your Sun sign, the core of your identity."
                />
              </label>
              <input
                type="number"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                placeholder="1-12"
                min="1"
                max="12"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                Birth Day *
                <EducationalTooltip
                  title="Birth Day Nuances"
                  description="Fine-tunes your Sun sign and can influence Moon position."
                />
              </label>
              <input
                type="number"
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                placeholder="1-31"
                min="1"
                max="31"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                Birth Hour (24h) *
                <EducationalTooltip
                  title="Birth Time Precision"
                  description="Critical for accurate Rising sign and house placements. Use 24-hour format."
                />
              </label>
              <input
                type="number"
                name="hour"
                value={formData.hour}
                onChange={handleInputChange}
                placeholder="0-23"
                min="0"
                max="23"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                Birth Minute *
                <EducationalTooltip
                  title="Minute Accuracy"
                  description="Minutes matter! Even a 4-minute difference can change your Rising sign. Check your birth certificate for exact time."
                />
              </label>
              <input
                type="number"
                name="minute"
                value={formData.minute}
                onChange={handleInputChange}
                placeholder="0-59"
                min="0"
                max="59"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gold-200 mb-2">
                House System
                <EducationalTooltip
                  title="House Systems Explained"
                  description="House systems determine how the 12 houses are calculated and can affect interpretation. Each system has different strengths."
                  examples={[
                    "Placidus: Most popular, time-based division",
                    "Equal House: Each house is exactly 30 degrees",
                    "Whole Sign: Each sign equals one house",
                    "Koch: Similar to Placidus, handles extreme latitudes better"
                  ]}
                />
              </label>
              <select
                value={houseSystem}
                onChange={handleSelectChange}
                aria-label="House System Selection"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              >
                <option value="P">Placidus (Most Popular)</option>
                <option value="E">Equal House</option>
                <option value="W">Whole Sign (Traditional)</option>
                <option value="K">Koch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gold-200 mb-2">
              Birth Location *
              <EducationalTooltip
                title="Birth Location Importance"
                description="Your birth location determines time zone and geographical coordinates needed for accurate house calculations and local planetary angles."
                examples={[
                  "Use the most specific location possible",
                  "Include city, state/province, and country",
                  "Different cities can have different astrology"
                ]}
              />
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., New York, NY, USA"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>

          <div className="flex items-center space-x-4">
            <FeatureGuard feature="multi-system">
              <SwitchPrimitive.Root
                checked={formData.multiSystem}
                onCheckedChange={handleSwitchChange}
                className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-pointer transition-colors"
                aria-label="Toggle multi-system mode"
              >
                <SwitchPrimitive.Thumb
                  className="block w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0.5 data-[state=checked]:translate-x-5.5 transition-transform"
                />
              </SwitchPrimitive.Root>
            </FeatureGuard>
            <span className="text-white font-medium">
              Enable Multi-System Analysis
              <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">Premium</span>
            </span>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-200 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3 px-4 bg-gradient-to-r from-gold-500 to-yellow-500 hover:from-gold-600 hover:to-yellow-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {formData.multiSystem ? "Calculating Multi-System Chart..." : "Calculating Chart..."}
              </div>
            ) : (
              formData.multiSystem ? "🌟 Calculate Multi-System Chart 🌟" : "Calculate Natal Chart"
            )}
          </button>
        </form>

        {/* Chart Display */}
        {chart && (
          <div>
            {formData.multiSystem
              ? !isExtendedChartData(chart) && (
                  <MultiSystemChartDisplay chartData={chart as MultiSystemChartData} isLoading={loading} />
                )
              : isExtendedChartData(chart) && <ChartDisplay chart={chart} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartCalculator;