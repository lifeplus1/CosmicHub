/**
 * Global type declarations for test environment
 * Based on Component Best Practices Checklist - Testing Coverage section
 */

// React global for test files
declare global {
  var React: typeof import('react');
  var fireEvent: typeof import('@testing-library/react').fireEvent;
  var screen: typeof import('@testing-library/react').screen;
  
  // Node.js types for test environment
  namespace NodeJS {
    interface Timeout {}
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
  
  // DOM types for test files
  type NodeListOf<T> = {
    [index: number]: T;
    readonly length: number;
  };
}

export {};
