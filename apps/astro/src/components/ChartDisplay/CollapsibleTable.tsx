import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@cosmichub/ui';

interface CollapsibleTableProps {
  /** Unique identifier for this table section */
  value: string;
  /** Title displayed in the header */
  title: string;
  /** Icon/emoji for the title */
  icon: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Count of items to display in header */
  count?: number;
  /** Table content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const CollapsibleTable: React.FC<CollapsibleTableProps> = ({
  value,
  title,
  icon,
  subtitle,
  count,
  children,
  className = '',
}) => {
  return (
    <AccordionItem value={value} className={`cosmic-glass border-cosmic-purple/30 ${className}`}>
      <AccordionTrigger className="hover:bg-cosmic-purple/10 rounded-t-lg px-6 py-4">
        <div className="flex items-center justify-between w-full mr-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-cosmic-gold text-left">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-cosmic-silver/70 text-left">{subtitle}</p>
              )}
            </div>
          </div>
          {count !== undefined && (
            <div className="bg-cosmic-purple/20 px-3 py-1 rounded-full border border-cosmic-purple/30">
              <span className="text-cosmic-gold font-medium text-sm">{count}</span>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="border-t border-cosmic-purple/20">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CollapsibleTable;
