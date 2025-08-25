import React, { useState, createContext, useContext } from 'react';

export interface AccordionProps {
  type: 'single' | 'multiple';
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = createContext<{
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}>({
  openItems: [],
  toggleItem: () => {},
  type: 'single',
});

const AccordionItemContext = createContext<string>('');

export const Accordion: React.FC<AccordionProps> = ({
  type,
  collapsible = false,
  children,
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(prev =>
        prev.includes(value) && collapsible ? [] : [value]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className = '',
}) => {
  return (
    <AccordionItemContext.Provider value={value}>
      <div
        className={`border border-cosmic-purple/30 rounded-lg bg-cosmic-dark/30 ${className}`}
        data-value={value}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className = '',
}) => {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      className={`flex w-full items-center justify-between p-4 text-left font-medium text-cosmic-silver hover:bg-cosmic-purple/20 transition-colors ${className}`}
      onClick={() => toggleItem(value)}
    >
      {children}
      <span
        className={`transition-transform text-cosmic-gold ${isOpen ? 'rotate-180' : ''}`}
      >
        ▼
      </span>
    </button>
  );
};

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className = '',
}) => {
  const { openItems } = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={`px-4 pb-4 text-cosmic-silver ${className}`}>
      {children}
    </div>
  );
};
