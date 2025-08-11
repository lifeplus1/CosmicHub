import React, { useState } from "react";
import { FaBook, FaInfoCircle } from "react-icons/fa";
import ChartDisplay from "./ChartDisplay";
import { MultiSystemChartDisplay } from "./MultiSystemChartDisplay";
import type { MultiSystemChartData } from "./MultiSystemChartDisplay";
import type { ChartBirthData } from "../services/api";
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

// Helper function to convert FormData to ChartBirthData
function convertToChartBirthData(formData: FormData): ChartBirthData {
  return {
    year: parseInt(formData.year),
    month: parseInt(formData.month),
    day: parseInt(formData.day),
    hour: parseInt(formData.hour),
    minute: parseInt(formData.minute),
    city: formData.city
  };
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
    <div className="container px-4 py-8 mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Birth Chart Calculator</h2>
          <p className="mb-4 text-gray-300">Enter your birth details for accurate astrological insights</p>
          <div className="inline-flex items-center px-4 py-2 text-sm border rounded-full bg-white/10 text-cyan-300 border-cyan-500/30">
            <FaInfoCircle className="mr-2" />
            Pro Tip: Use exact birth time for precise calculations
          </div>
        </div>

        {/* Guide Section */}
        <div className="p-6 border bg-white/5 backdrop-blur-md rounded-xl border-white/10">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="flex items-center justify-between w-full font-semibold text-white"
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
                <ul className="pl-5 space-y-1 list-disc">
                  <li><strong>Planets:</strong> Core energies and drives</li>
                  <li><strong>Signs:</strong> How energies express</li>
                  <li><strong>Houses:</strong> Life areas affected</li>
                  <li><strong>Aspects:</strong> Planetary relationships</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Multi-System Mode (Premium):</h4>
                <ul className="pl-5 space-y-1 list-disc">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 border bg-white/5 backdrop-blur-md rounded-xl border-white/10">
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                required
                aria-required="true"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gold-200">
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
                className="w-full px-4 py-3 text-white transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="P">Placidus (Most Popular)</option>
                <option value="E">Equal House</option>
                <option value="W">Whole Sign (Traditional)</option>
                <option value="K">Koch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gold-200">
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
              className="w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
              aria-required="true"
            />
          </div>

          <div className="flex items-center space-x-4">
            <FeatureGuard feature="multi-system" requiredTier="premium">
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
            <span className="font-medium text-white">
              Enable Multi-System Analysis
              <span className="px-2 py-1 ml-2 text-xs text-purple-300 rounded-full bg-purple-500/20">Premium</span>
            </span>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-200 border rounded-lg bg-red-500/20 border-red-500/50">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-200 border rounded-lg bg-green-500/20 border-green-500/50">
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
                <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
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
                  <MultiSystemChartDisplay birthData={convertToChartBirthData(formData)} showComparison={true} />
                )
              : isExtendedChartData(chart) && <ChartDisplay chart={chart} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartCalculator;