import { useState, useCallback } from 'react';

export const useAstrologyGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Removed unused tabIndex parameter (was causing no-unused-vars)
  const openGuide = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, onClose, openGuide };
};