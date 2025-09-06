// Local shim to satisfy TS in this package's test context if module resolution race occurs.
// When the real '@testing-library/react' types are resolved this augmentation is harmless.
declare module '@testing-library/react' {
  export const render: any;
  export const waitFor: any;
}
