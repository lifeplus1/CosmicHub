// Minimal ambient declaration for eslint-plugin-jsx-a11y so TS stops complaining.
// If official types become available, remove this file and install them.
declare module 'eslint-plugin-jsx-a11y' {
  // Plugin object shape is intentionally loose.
  const plugin: any;
  export = plugin;
}
