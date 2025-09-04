import React from 'react';

export const AccessibleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accessibleName?: string }> = ({ children, accessibleName, ...rest }) => {
  return (
    <button aria-label={accessibleName} {...rest}>
      {children}
    </button>
  );
};

export default { AccessibleButton };