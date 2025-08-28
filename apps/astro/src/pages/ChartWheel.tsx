import React, { useState } from 'react';
import { useAuth } from '@cosmichub/auth';
import { Card, Button } from '@cosmichub/ui';
import ChartWheel from '../features/ChartWheel';
import { useBirthData } from '../contexts/BirthDataContext';

const ChartWheelPage: React.FC = () => {
  useAuth();
  const { birthData, setBirthData } = useBirthData();
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
    timezone: 'America/New_York',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const data = {
      year: parseInt(formData.year),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      hour: parseInt(formData.hour),
      minute: parseInt(formData.minute),
      lat: parseFloat(formData.lat),
      lon: parseFloat(formData.lon),
      city: formData.city,
      timezone: formData.timezone,
    };
    
    setBirthData(data);
  };

  const loadSampleChart = () => {
    const sampleData = {
      year: 1990,
      month: 6,
      day: 21,
      hour: 12,
      minute: 0,
      lat: 40.7128,
      lon: -74.006,
      city: 'New York',
      timezone: 'America/New_York',
    };
    setBirthData(sampleData);

    setFormData({
      year: '1990',
      month: '6',
      day: '21',
      hour: '12',
      minute: '0',
      city: 'New York',
      lat: '40.7128',
      lon: '-74.0060',
      timezone: 'America/New_York',
    });
  };

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-cosmic-gold mb-4'>
          Interactive Chart Wheel
        </h1>
        <p className='text-xl text-cosmic-silver'>
          Explore your natal chart with detailed planetary positions and aspects
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1'>
          <Card title='Birth Information'>
            <div className='space-y-4'>
              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <label htmlFor='month' className='block text-cosmic-silver mb-1 text-sm'>
                    Month
                  </label>
                  <select
                    id='month'
                    name='month'
                    value={formData.month}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  >
                    <option value=''>Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='day' className='block text-cosmic-silver mb-1 text-sm'>
                    Day
                  </label>
                  <select
                    id='day'
                    name='day'
                    value={formData.day}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  >
                    <option value=''>Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='year' className='block text-cosmic-silver mb-1 text-sm'>
                    Year
                  </label>
                  <input
                    type='number'
                    id='year'
                    name='year'
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder='1990'
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label htmlFor='hour' className='block text-cosmic-silver mb-1 text-sm'>
                    Hour (24hr)
                  </label>
                  <select
                    id='hour'
                    name='hour'
                    value={formData.hour}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  >
                    <option value=''>Hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor='minute' className='block text-cosmic-silver mb-1 text-sm'>
                    Minute
                  </label>
                  <select
                    id='minute'
                    name='minute'
                    value={formData.minute}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  >
                    <option value=''>Minute</option>
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor='city' className='block text-cosmic-silver mb-1 text-sm'>
                  Birth City
                </label>
                <input
                  type='text'
                  id='city'
                  name='city'
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder='New York, NY'
                  className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label htmlFor='lat' className='block text-cosmic-silver mb-1 text-sm'>
                    Latitude
                  </label>
                  <input
                    type='number'
                    id='lat'
                    name='lat'
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder='40.7128'
                    step='0.0001'
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  />
                </div>
                <div>
                  <label htmlFor='lon' className='block text-cosmic-silver mb-1 text-sm'>
                    Longitude
                  </label>
                  <input
                    type='number'
                    id='lon'
                    name='lon'
                    value={formData.lon}
                    onChange={handleInputChange}
                    placeholder='-74.0060'
                    step='0.0001'
                    className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='timezone' className='block text-cosmic-silver mb-1 text-sm'>
                  Timezone
                </label>
                <select
                  id='timezone'
                  name='timezone'
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 bg-cosmic-dark border border-cosmic-silver/30 rounded-lg'
                >
                  <option value='America/New_York'>Eastern Time</option>
                  <option value='America/Chicago'>Central Time</option>
                  <option value='America/Denver'>Mountain Time</option>
                  <option value='America/Los_Angeles'>Pacific Time</option>
                  <option value='Europe/London'>GMT</option>
                  <option value='Europe/Paris'>Central European Time</option>
                </select>
              </div>

              <div className='flex space-x-2'>
                <Button
                  onClick={handleSubmit}
                  className='flex-1 bg-cosmic-gold hover:bg-cosmic-gold/90'
                >
                  Generate Chart
                </Button>
                <Button
                  onClick={loadSampleChart}
                  variant='secondary'
                  className='flex-1'
                >
                  Load Sample Chart
                </Button>
              </div>
            </div>
          </Card>

          <Card title='Chart Options' className='mt-6'>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='showAspects'
                  checked={showAspects}
                  onChange={e => setShowAspects(e.target.checked)}
                  className='rounded'
                />
                <label htmlFor='showAspects' className='text-cosmic-silver'>
                  Show Aspects
                </label>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='showAnimation'
                  checked={showAnimation}
                  onChange={e => setShowAnimation(e.target.checked)}
                  className='rounded'
                />
                <label htmlFor='showAnimation' className='text-cosmic-silver'>
                  Enable Animations
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className='lg:col-span-2'>
          {birthData !== null ? (
            <ChartWheel
              birthData={birthData}
              showAspects={showAspects}
              showAnimation={showAnimation}
            />
          ) : (
            <Card title='Chart Wheel' className='h-96 flex items-center justify-center'>
              <div className='text-center text-cosmic-silver'>
                <div className='text-6xl mb-4'>🌌</div>
                <p className='text-lg'>
                  Enter your birth information to generate your chart
                </p>
                <p className='text-sm mt-2 text-cosmic-silver/70'>
                  Or click &ldquo;Load Sample Chart&rdquo; to see a demonstration
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {birthData !== null && (
        <Card title='Chart Information'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-cosmic-silver'>Birth Date:</span>
              <span className='text-cosmic-gold ml-2'>
                {birthData.month}/{birthData.day}/{birthData.year}
              </span>
            </div>
            <div>
              <span className='text-cosmic-silver'>Birth Time:</span>
              <span className='text-cosmic-gold ml-2'>
                {birthData.hour?.toString().padStart(2, '0')}:
                {birthData.minute?.toString().padStart(2, '0')}
              </span>
            </div>
            <div>
              <span className='text-cosmic-silver'>Location:</span>
              <span className='text-cosmic-gold ml-2'>{birthData.city}</span>
            </div>
            <div>
              <span className='text-cosmic-silver'>Coordinates:</span>
              <span className='text-cosmic-gold ml-2'>
                {typeof birthData.lat === 'number' && typeof birthData.lon === 'number'
                  ? `${birthData.lat.toFixed(4)}, ${birthData.lon.toFixed(4)}`
                  : 'Coords N/A'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChartWheelPage;
