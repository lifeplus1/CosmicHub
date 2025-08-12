import React, { useState } from 'react';

// Simple stub for useDisclosure hook replacement
export const useDisclosure = (): {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
} => {
  const [isOpen, setIsOpen] = useState(false);
  
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen),
  };
};

// Simple stub for useColorModeValue
export const useColorModeValue = (light: string, dark: string): string => dark;

// Temporary toast implementation
export const useToast = () => {
  return ({ title, description, status, duration }: {
    title?: string;
    description?: string;
    status?: string;
    duration?: number;
  }) => {
    console.log(`Toast: ${title} - ${description} (${status})`);
  };
};
