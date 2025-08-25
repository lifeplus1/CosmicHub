declare module 'build-lint-badge' {
  export function buildLintBadge(metrics: {
    totalBaseline: number;
    totalCurrent: number;
  }): {
    color: string;
  };
}
