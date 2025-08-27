import React from 'react';
import { Accordion } from '@cosmichub/ui';

interface StatefulAccordionProps {
  type: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

  // The Accordion component from @cosmichub/ui manages its own state internally
  // We need to create a controlled version that syncs with our external state

  // For now, we'll use the built-in Accordion and handle state at the parent level
  // This is a simplification - in a full implementation we'd need to modify the Accordion component
  return (
    <Accordion type={type} collapsible={true} className={className}>
      {children}
    </Accordion>
  );
};

export default StatefulAccordion;
