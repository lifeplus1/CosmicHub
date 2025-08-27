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
  label?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  label,
  onChange,
  disabled = false,
  className = '',
  error,
}) => {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const listboxId = `${reactId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value ?? '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const baseClasses =
    'w-full px-3 py-2 text-left rounded-md border text-sm ring-offset-cosmic-dark focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2 transition-colors';
  const errorClasses = error
    ? 'border-red-500 bg-cosmic-dark text-cosmic-silver'
    : 'border-cosmic-purple/30 bg-cosmic-dark text-cosmic-silver hover:border-cosmic-purple/50';
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={labelId}
          className='block text-sm font-medium text-cosmic-silver'
        >
          {label}
        </label>
      )}
      <div ref={dropdownRef} className='relative'>
        <button
          type='button'
          id={labelId}
          className={`${baseClasses} ${errorClasses} ${disabledClasses} flex items-center justify-between`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup='listbox'
          {...(isOpen
            ? { 'aria-expanded': 'true' }
            : { 'aria-expanded': 'false' })}
          aria-labelledby={labelId}
          aria-controls={listboxId}
        >
          <span
            className={
              selectedOption ? 'text-cosmic-silver' : 'text-cosmic-silver/50'
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} text-cosmic-silver/70`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isOpen && (
          <div className='absolute z-50 w-full mt-1 bg-cosmic-dark/95 backdrop-blur-lg border border-cosmic-purple/20 rounded-md shadow-lg max-h-60 overflow-auto'>
            <ul
              role='listbox'
              id={listboxId}
              className='py-1'
              aria-labelledby={labelId}
            >
              {options.map(option => {
                const selected = selectedOption?.value === option.value;
                const optionDisabled = option.disabled;
                const baseItemClass = `px-3 py-2 text-sm transition-colors cursor-pointer ${
                  optionDisabled
                    ? 'text-cosmic-silver/40 cursor-not-allowed'
                    : selected
                      ? 'bg-cosmic-purple/20 text-cosmic-gold'
                      : 'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold'
                }`;

                const commonHandlers = {
                  onClick: () => {
                    if (!optionDisabled) {
                      handleSelect(option.value);
                    }
                  },
                  onKeyDown: (e: React.KeyboardEvent<HTMLLIElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!optionDisabled) {
                        handleSelect(option.value);
                      }
                    }
                  },
                };

                if (selected) {
                  return (
                    <li
                      key={option.value}
                      role='option'
                      aria-selected='true'
                      className={baseItemClass}
                      {...commonHandlers}
                    >
                      <div className='flex items-center justify-between'>
                        <span>{option.label}</span>
                        <svg
                          className='w-4 h-4 text-cosmic-gold'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={option.value}
                    role='option'
                    aria-selected='false'
                    className={baseItemClass}
                    {...commonHandlers}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{option.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p className='text-sm text-red-400' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};
