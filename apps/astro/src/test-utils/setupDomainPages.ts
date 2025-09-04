import { vi } from 'vitest';

vi.mock('@cosmichub/ui', async (importOriginal) => {
  const actual: any = await importOriginal();
  // Explicit extension to avoid ambiguous resolution with stale .ts variant in some caches
  const { AccessibleButton } = await import('./mockCosmicUI.tsx');
  return { ...actual, AccessibleButton };
});
