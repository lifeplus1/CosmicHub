import React from 'react';

export const AccessibleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accessibleName?: string }> = ({ children, accessibleName, ...rest }) => {
  return React.createElement('button', { 'aria-label': accessibleName, ...rest }, children);
};

export default { AccessibleButton };
