import React from 'react';
import { Card } from '@cosmichub/ui';

const ChartCalculation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4">
          Birth Chart Calculation
        </h1>
        <p className="text-xl text-cosmic-silver">
          Enter your birth information to generate your astrological chart
        </p>
      </div>

      <Card title="Birth Information" className="max-w-2xl mx-auto">
        <form className="space-y-4">
          <div>
            <label htmlFor="birth-date" className="block text-cosmic-silver mb-2">Birth Date</label>
            <input 
              id="birth-date"
              type="date" 
              className="w-full p-3 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select your birth date"
            />
          </div>
          
          <div>
            <label htmlFor="birth-time" className="block text-cosmic-silver mb-2">Birth Time</label>
            <input 
              id="birth-time"
              type="time" 
              className="w-full p-3 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select your birth time"
            />
          </div>
          
          <div>
            <label htmlFor="birth-location" className="block text-cosmic-silver mb-2">Birth Location</label>
            <input 
              id="birth-location"
              type="text" 
              placeholder="City, Country"
              className="w-full p-3 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Enter your birth location"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-cosmic-purple hover:bg-cosmic-purple/80 text-white p-3 rounded transition-colors"
          >
            Calculate Chart
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ChartCalculation;
