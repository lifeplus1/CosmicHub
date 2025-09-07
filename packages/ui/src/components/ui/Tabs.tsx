import React, { useState, createContext, useContext, memo, useCallback, useMemo } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
}

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: '',
  setActiveTab: () => {},
});

export const Tabs: React.FC<TabsProps> = memo(({
  defaultValue,
  children,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const setActiveTabCallback = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab: setActiveTabCallback,
  }), [activeTab, setActiveTabCallback]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

export const TabsList: React.FC<TabsListProps> = memo(({
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex space-x-1 bg-cosmic-dark/30 border border-cosmic-purple/30 rounded-lg p-1 ${className}`}
    >
      {children}
    </div>
  );
});

TabsList.displayName = 'TabsList';

export const TabsTrigger: React.FC<TabsTriggerProps> = memo(({
  value,
  children,
  className = '',
}) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  const handleClick = useCallback(() => {
    setActiveTab(value);
  }, [setActiveTab, value]);

  return (
    <button
      className={`
        px-3 py-1.5 text-sm font-medium rounded-md transition-colors
        ${
          isActive
            ? 'bg-cosmic-purple text-cosmic-gold shadow-lg shadow-cosmic-purple/20'
            : 'text-cosmic-silver hover:text-cosmic-gold hover:bg-cosmic-purple/20'
        }
        ${className}
      `}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent: React.FC<TabsContentProps> = memo(({
  value,
  children,
  className = '',
  id,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div 
      className={`mt-4 text-cosmic-silver ${className}`}
      id={id}
      aria-labelledby={ariaLabelledBy}
      role="tabpanel"
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';
