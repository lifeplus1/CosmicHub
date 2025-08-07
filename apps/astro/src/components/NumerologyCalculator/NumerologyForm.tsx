import React from 'react';
import type { NumerologyData } from './types';

interface NumerologyFormProps {
  formData: NumerologyData;
  setFormData: React.Dispatch<React.SetStateAction<NumerologyData>>;
  onSubmit: (e: React.FormEvent) => void;
}

const NumerologyForm: React.FC<NumerologyFormProps> = ({ formData, setFormData, onSubmit }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'name' ? value : parseInt(value) }));
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-4" aria-label="Numerology Input Form">
      <div>
        <label htmlFor="name" className="block mb-2 text-cosmic-gold">Full Name</label>
        <input
          id="name"
          className="cosmic-input"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
          aria-required="true"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="year" className="block mb-2 text-cosmic-gold">Year</label>
          <input
            id="year"
            className="cosmic-input"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            placeholder="Year"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="month" className="block mb-2 text-cosmic-gold">Month</label>
          <input
            id="month"
            className="cosmic-input"
            name="month"
            type="number"
            min="1"
            max="12"
            value={formData.month}
            onChange={handleChange}
            placeholder="Month"
            required
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="day" className="block mb-2 text-cosmic-gold">Day</label>
          <input
            id="day"
            className="cosmic-input"
            name="day"
            type="number"
            min="1"
            max="31"
            value={formData.day}
            onChange={handleChange}
            placeholder="Day"
            required
            aria-required="true"
          />
        </div>
      </div>
      <button className="cosmic-button" type="submit" aria-label="Calculate Numerology">
        Calculate Numerology
      </button>
    </form>
  );
};

export default NumerologyForm;