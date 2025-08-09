import React, { useState, useRef, useEffect, useId } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  label?: string; // Accessible label (falls back to placeholder)
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  label,
  onChange,
  disabled = false,
  className = ''
}) => {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const listboxId = `${reactId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    onChange?.(optionValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Accessible label (visually hidden if not explicitly provided) */}
      <span id={labelId} className="sr-only">
        {label || placeholder}
      </span>
      {isOpen ? (
        <button
          type="button"
          className={`
            w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            ring-2 ring-blue-500 border-blue-500
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby={labelId}
          aria-controls={listboxId}
          {...(disabled ? { 'aria-disabled': 'true' } : {})}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          className={`
            w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby={labelId}
          aria-controls={listboxId}
          {...(disabled ? { 'aria-disabled': 'true' } : {})}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul
            role="listbox"
            id={listboxId}
            className="py-1 overflow-auto max-h-60"
            aria-labelledby={labelId}
            aria-label="Dropdown options"
          >
            {options.map((option) => {
              const selected = selectedOption?.value === option.value;
              const disabledOpt = option.disabled;
              return selected ? (
                <li
                  key={option.value}
                  id={`${listboxId}-opt-${option.value}`}
                  role="option"
                  aria-selected="true"
                  {...(disabledOpt ? { 'aria-disabled': 'true' } : {})}
                  className={`px-4 py-2 text-sm transition-colors ${
                    disabledOpt
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'cursor-pointer bg-blue-100 text-blue-900'
                  }`}
                  onClick={() => !disabledOpt && handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ) : (
                <li
                  key={option.value}
                  id={`${listboxId}-opt-${option.value}`}
                  role="option"
                  aria-selected="false"
                  {...(disabledOpt ? { 'aria-disabled': 'true' } : {})}
                  className={`px-4 py-2 text-sm transition-colors ${
                    disabledOpt
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'cursor-pointer text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => !disabledOpt && handleSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      !disabledOpt && handleSelect(option.value);
                    }
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
