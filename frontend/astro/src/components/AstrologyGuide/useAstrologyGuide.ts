import { useState, useCallback } from 'react';

export const useAstrologyGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openGuide = useCallback((tabIndex: number = 0) => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, onClose, openGuide };
};