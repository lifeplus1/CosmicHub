import React, { useState } from 'react';
import { useAuth } from '@cosmichub/auth';
import { Card, Button } from '@cosmichub/ui';
import ChartWheel from '../features/ChartWheel';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  city: string;
  timezone: string;
}

const ChartWheelPage: React.FC = () => {
  const { user } = useAuth();
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [showAspects, setShowAspects] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    city: '',
    lat: '',
    lon: '',
    timezone: 'America/New_York'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const data: BirthData = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      city: formData.city,
      timezone: formData.timezone
    };

    setBirthData(data);
  };

  const loadSampleChart = () => {
    const sampleData: BirthData = {
      year: 1990,
      month: 6,
      day: 21,
      hour: 12,
      minute: 0,
      lat: 40.7128,
      lon: -74.0060,
      city: "New York",
      timezone: "America/New_York"
    };
    setBirthData(sampleData);
    
    // Update form data to reflect the sample
    setFormData({
      year: '1990',
      month: '6',
      day: '21',
      hour: '12',
      minute: '0',
      city: 'New York',
      lat: '40.7128',
      lon: '-74.0060',
      timezone: 'America/New_York'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4">
          Interactive Chart Wheel
        </h1>
        <p className="text-xl text-cosmic-silver">
          Explore your natal chart with detailed planetary positions and aspects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Input Form */}
        <div className="lg:col-span-1">
          <Card title="Birth Information">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="month" className="block text-cosmic-silver mb-1 text-sm">Month</label>
                  <input
                    type="number"
                    id="month"
                    name="month"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="6"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="day" className="block text-cosmic-silver mb-1 text-sm">Day</label>
                  <input
                    type="number"
                    id="day"
                    name="day"
                    min="1"
                    max="31"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="21"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-cosmic-silver mb-1 text-sm">Year</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="1900"
                    max="2100"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="1990"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="hour" className="block text-cosmic-silver mb-1 text-sm">Hour (24h)</label>
                  <input
                    type="number"
                    id="hour"
                    name="hour"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="12"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="minute" className="block text-cosmic-silver mb-1 text-sm">Minute</label>
                  <input
                    type="number"
                    id="minute"
                    name="minute"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-cosmic-silver mb-1 text-sm">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                  placeholder="New York"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="lat" className="block text-cosmic-silver mb-1 text-sm">Latitude</label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    step="0.0001"
                    value={formData.lat}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="40.7128"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lon" className="block text-cosmic-silver mb-1 text-sm">Longitude</label>
                  <input
                    type="number"
                    id="lon"
                    name="lon"
                    step="0.0001"
                    value={formData.lon}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                    placeholder="-74.0060"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-cosmic-silver mb-1 text-sm">Timezone</label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">Central European Time</option>
                </select>
              </div>

              <div className="space-y-2">
                <Button variant="primary" className="w-full" onClick={handleSubmit}>
                  Generate Chart
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={loadSampleChart}
                >
                  Load Sample Chart
                </Button>
              </div>
            </div>
          </Card>

          {/* Chart Options */}
          <Card title="Display Options" className="mt-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="showAspects" 
                  checked={showAspects}
                  onChange={(e) => setShowAspects(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showAspects" className="text-cosmic-silver">
                  Show Aspects
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="showAnimation" 
                  checked={showAnimation}
                  onChange={(e) => setShowAnimation(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showAnimation" className="text-cosmic-silver">
                  Enable Animations
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Display */}
        <div className="lg:col-span-2">
          {birthData ? (
            <ChartWheel 
              birthData={birthData}
              showAspects={showAspects}
              showAnimation={showAnimation}
            />
          ) : (
            <Card title="Chart Wheel" className="h-96 flex items-center justify-center">
              <div className="text-center text-cosmic-silver">
                <div className="text-6xl mb-4">🌌</div>
                <p className="text-lg">Enter your birth information to generate your chart</p>
                <p className="text-sm mt-2 text-cosmic-silver/70">
                  Or click "Load Sample Chart" to see a demonstration
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Chart Information */}
      {birthData && (
        <Card title="Chart Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-cosmic-silver">Birth Date:</span>
              <span className="text-cosmic-gold ml-2">
                {birthData.month}/{birthData.day}/{birthData.year}
              </span>
            </div>
            <div>
              <span className="text-cosmic-silver">Birth Time:</span>
              <span className="text-cosmic-gold ml-2">
                {birthData.hour.toString().padStart(2, '0')}:{birthData.minute.toString().padStart(2, '0')}
              </span>
            </div>
            <div>
              <span className="text-cosmic-silver">Location:</span>
              <span className="text-cosmic-gold ml-2">{birthData.city}</span>
            </div>
            <div>
              <span className="text-cosmic-silver">Coordinates:</span>
              <span className="text-cosmic-gold ml-2">
                {birthData.lat.toFixed(4)}, {birthData.lon.toFixed(4)}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChartWheelPage;
