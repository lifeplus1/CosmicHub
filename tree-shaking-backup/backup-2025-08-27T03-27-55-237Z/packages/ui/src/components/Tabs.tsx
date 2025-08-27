import React, { useState, createContext, useContext } from 'react';

  children: React.ReactNode;
  className?: string;
}

  className?: string;
}

  children: React.ReactNode;
  className?: string;
}

  children: React.ReactNode;
  className?: string;
}

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: '',
  setActiveTab: () => {},
});

  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

  return (
    <div
      className={`flex space-x-1 bg-cosmic-dark/30 border border-cosmic-purple/30 rounded-lg p-1 ${className}`}
    >
      {children}
    </div>
  );
};

  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

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
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={`mt-4 text-cosmic-silver ${className}`}>{children}</div>
  );
};
