import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface UpgradeModalContextType {
  isOpen: boolean;
  feature?: string;
  openUpgradeModal: (feature?: string) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType | undefined>(undefined);

export interface UpgradeModalProviderProps {
  children: ReactNode;
}

/**
 * Provider for managing upgrade modal state globally across the app
 */
export const UpgradeModalProvider: React.FC<UpgradeModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();

  const openUpgradeModal = useCallback((requiredFeature?: string) => {
    setFeature(requiredFeature);
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsOpen(false);
    setFeature(undefined);
  }, []);

  const value: UpgradeModalContextType = {
    isOpen,
    feature,
    openUpgradeModal,
    closeUpgradeModal
  };

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
    </UpgradeModalContext.Provider>
  );
};

/**
 * Hook to access upgrade modal functionality
 */
export const useUpgradeModal = (): UpgradeModalContextType => {
  const context = useContext(UpgradeModalContext);
  if (context === undefined || context === null) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return context;
};
