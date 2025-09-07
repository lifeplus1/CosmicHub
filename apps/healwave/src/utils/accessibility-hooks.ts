/**
 * HealWave Enhanced Accessibility Hooks and Utilities
 * Provides accessibility hooks, types, and utility functions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  audioDescriptions: boolean;
}

// Custom hook for managing accessibility settings
export function useAccessibility(): {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
} {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('healwave-accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AccessibilitySettings;
        return parsed;
      } catch {
        // If parsing fails, use defaults
      }
    }
    return {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      screenReaderMode: false,
      keyboardNavigation: true,
      audioDescriptions: false
    };
  });

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('healwave-accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    document.documentElement.setAttribute('data-reduce-motion', settings.reduceMotion.toString());
    document.documentElement.setAttribute('data-high-contrast', settings.highContrast.toString());
    document.documentElement.setAttribute('data-screen-reader', settings.screenReaderMode.toString());
  }, [settings]);

  return { settings, updateSetting, announceToScreenReader };
}

// Custom hook for keyboard navigation
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowKeys?.('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowKeys?.('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowKeys?.('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowKeys?.('right');
        break;
    }
  }, [onEnter, onEscape, onArrowKeys]);

  return { handleKeyDown };
}

// Custom hook for focus management
export function useFocusManagement(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the container or first focusable element
      const container = containerRef.current;
      if (container) {
        const firstFocusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          container.focus();
        }
      }
    } else {
      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  const trapFocus = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  return { containerRef, trapFocus };
}

// Enhanced ARIA live region for frequency announcements
export function useFrequencyAnnouncements() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announceFrequencyChange = useCallback((frequency: number, preset?: string) => {
    if (liveRegionRef.current) {
      const message = preset 
        ? `Now playing ${preset} at ${frequency} Hz`
        : `Frequency changed to ${frequency} Hz`;
      
      liveRegionRef.current.textContent = message;
    }
  }, []);

  const announcePlayState = useCallback((isPlaying: boolean, frequency?: number) => {
    if (liveRegionRef.current) {
      const message = isPlaying 
        ? `Healing frequency started${frequency ? ` at ${frequency} Hz` : ''}`
        : 'Healing frequency stopped';
      
      liveRegionRef.current.textContent = message;
    }
  }, []);

  const announceVolumeChange = useCallback((volume: number) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Volume set to ${Math.round(volume * 100)}%`;
    }
  }, []);

  return {
    announceFrequencyChange,
    announcePlayState,
    announceVolumeChange,
    liveRegionRef
  };
}

// CSS for screen reader only content
export const srOnlyStyles = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

// Types for components
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export interface AccessibleSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  formatValue?: (value: number) => string;
}
