/**
 * @fileoverview InterpretationFormContainer Component
 * 
 * Main container component for AI interpretation form with consistent styling
 * and layout structure. Provides the base container for all interpretation
 * form modes and subcomponents.
 * 
 * @component InterpretationFormContainer
 * @example
 * ```tsx
 * <InterpretationFormContainer>
 *   <InterpretationModeSelector />
 *   <ChartModeForm />
 *   <GenerateButton />
 * </InterpretationFormContainer>
 * ```
 */

import React, { type ReactNode } from 'react';
import { 
  InterpretationFormContainerPropsSchema,
  type InterpretationFormContainerProps 
} from '../../schemas/interpretationForm';

// Extend the props with proper ReactNode typing
interface ExtendedInterpretationFormContainerProps extends Omit<InterpretationFormContainerProps, 'children'> {
  children: ReactNode;
}

/**
 * Main container for interpretation form components
 * 
 * Provides consistent cosmic-themed styling and layout structure
 * for all interpretation form modes and subcomponents.
 * 
 * @param props - Container component props
 * @param props.children - Child components to render
 * @param props.className - Optional additional CSS classes
 * @param props.aria-labelledby - ARIA label reference for accessibility
 * @param props.role - ARIA role for semantic structure
 */
const InterpretationFormContainer: React.FC<ExtendedInterpretationFormContainerProps> = ({
  children,
  className = '',
  'aria-labelledby': ariaLabelledBy,
  role,
}) => {
  // Validate props using Type Bridge schema (skip children validation due to ReactNode complexity)
  const validation = InterpretationFormContainerPropsSchema.safeParse({
    children: 'validated-separately', // ReactNode validation handled by TypeScript
    className,
    'aria-labelledby': ariaLabelledBy,
    role,
  });

  if (!validation.success) {
    console.warn('InterpretationFormContainer: Invalid props', validation.error);
  }

  const baseClasses = [
    'max-w-2xl',
    'mx-auto',
    'p-6',
    'bg-cosmic-dark/60',
    'backdrop-blur-xl',
    'border',
    'border-cosmic-silver/20',
    'rounded-xl',
  ].join(' ');

  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div
      className={combinedClasses}
      aria-labelledby={ariaLabelledBy}
      {...(role && { role })}
    >
      {/* Main heading */}
      <h1 
        id="interpretation-form-heading"
        className="text-2xl font-bold text-cosmic-gold mb-6 font-playfair"
      >
        Generate AI Interpretation
      </h1>

      {/* Form content container */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// Display name for debugging
InterpretationFormContainer.displayName = 'InterpretationFormContainer';

export default InterpretationFormContainer;
