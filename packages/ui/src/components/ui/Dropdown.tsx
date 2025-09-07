import React, { useState, useRef, useEffect, useId, useCallback, useMemo } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = React.memo(({
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find(option => option.value === selectedValue),
    [options, selectedValue]
  );

  const availableOptions = useMemo(
    () => options.filter(option => !option.disabled),
    [options]
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = useCallback((optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange?.(optionValue);
    // Return focus to button after selection
    setTimeout(() => buttonRef.current?.focus(), 0);
  }, [onChange]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  }, [disabled, isOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex(prev => 
          prev < availableOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(availableOptions.length - 1);
      } else {
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : availableOptions.length - 1
        );
      }
    }
  }, [isOpen, availableOptions.length, handleToggle]);

  const handleOptionKeyDown = useCallback((event: React.KeyboardEvent, optionValue: string, optionDisabled?: boolean) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!optionDisabled) {
        handleSelect(optionValue);
      }
    }
  }, [handleSelect]);

  const handleOptionClick = useCallback((optionValue: string, optionDisabled?: boolean) => {
    if (!optionDisabled) {
      handleSelect(optionValue);
    }
  }, [handleSelect]);

  const baseClasses = useMemo(() =>
    'w-full px-3 py-2 text-left rounded-md border text-sm ring-offset-cosmic-dark focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2 transition-colors',
    []
  );
  
  const errorClasses = useMemo(() => error
    ? 'border-red-500 bg-cosmic-dark text-cosmic-silver'
    : 'border-cosmic-purple/30 bg-cosmic-dark text-cosmic-silver hover:border-cosmic-purple/50',
    [error]
  );
  
  const disabledClasses = useMemo(() => disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer',
    [disabled]
  );

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
          ref={buttonRef}
          type='button'
          id={labelId}
          className={`${baseClasses} ${errorClasses} ${disabledClasses} flex items-center justify-between`}
          onClick={handleToggle}
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
              ref={listRef}
              role='listbox'
              id={listboxId}
              className='py-1'
              aria-labelledby={labelId}
            >
              {options.map((option) => {
                const selected = selectedOption?.value === option.value;
                const optionDisabled = option.disabled;
                const isFocused = focusedIndex === availableOptions.findIndex(ao => ao.value === option.value);
                const baseItemClass = `px-3 py-2 text-sm transition-colors cursor-pointer focus:outline-none ${
                  optionDisabled
                    ? 'text-cosmic-silver/40 cursor-not-allowed'
                    : selected
                      ? 'bg-cosmic-purple/20 text-cosmic-gold'
                      : isFocused
                        ? 'bg-cosmic-purple/10 text-cosmic-gold'
                        : 'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold'
                }`;

                if (selected) {
                  return (
                    <li
                      key={option.value}
                      role='option'
                      aria-selected='true'
                      className={baseItemClass}
                      onClick={() => handleOptionClick(option.value, optionDisabled)}
                      onKeyDown={(e) => handleOptionKeyDown(e, option.value, optionDisabled)}
                      tabIndex={isFocused ? 0 : -1}
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
                    onClick={() => handleOptionClick(option.value, optionDisabled)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value, optionDisabled)}
                    tabIndex={isFocused ? 0 : -1}
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
});

Dropdown.displayName = 'Dropdown';
