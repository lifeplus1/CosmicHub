// Global ambient module declaration for eslint-plugin-jsx-a11y
// Fallback minimal typing to silence TS complaints when importing in config files.
// If upstream types become available, remove this file and install the official types.
declare module 'eslint-plugin-jsx-a11y' {
  // We keep the shape loose; ESLint consumes plugin objects dynamically.
  const plugin: any;
  export = plugin; // CommonJS style export assignment covers default import usage
}
