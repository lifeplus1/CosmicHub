/**
 * Type declarations for @eslint/js module
 * This provides TypeScript support for ESLint configuration
 */

declare module '@eslint/js' {
  interface ESLintRule {
    [key: string]: string | number | boolean | object | Array<any>;
  }

  interface ESLintConfig {
    rules: Record<string, ESLintRule>;
  }

  interface ESLintConfigs {
    recommended: ESLintConfig;
    all: ESLintConfig;
  }

  const js: {
    configs: ESLintConfigs;
  };

  export = js;
}
