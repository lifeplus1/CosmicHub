import React, { useState } from 'react';
import { AIInterpretationData } from './types';

interface InterpretationFormProps {
  onSubmit: (data: AIInterpretationData) => void;
}

const InterpretationForm: React.FC<InterpretationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<AIInterpretationData>({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium">
          Birth Date
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="birthTime" className="block text-sm font-medium">
          Birth Time
        </label>
        <input
          type="time"
          id="birthTime"
          name="birthTime"
          value={formData.birthTime}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="birthPlace" className="block text-sm font-medium">
          Birth Place
        </label>
        <input
          type="text"
          id="birthPlace"
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
          className="block w-full p-2 mt-1 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Get Interpretation
      </button>
    </form>
  );
};

export default InterpretationForm;