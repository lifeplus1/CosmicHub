import React from 'react';
import type { DateRange } from './types';

interface DateRangeFormProps {
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
}

const DateRangeForm: React.FC<DateRangeFormProps> = ({ dateRange, setDateRange }) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({ ...dateRange, endDate: e.target.value });
  };

  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-cosmic-gold">Date Range</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-cosmic-silver">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={handleStartDateChange}
              className="cosmic-input"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-2 text-sm font-medium text-cosmic-silver">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={handleEndDateChange}
              className="cosmic-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeForm;