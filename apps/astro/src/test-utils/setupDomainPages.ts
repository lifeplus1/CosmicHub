import { vi } from 'vitest';

vi.mock('@cosmichub/ui', async (importOriginal) => {
  const actual: any = await importOriginal();
  // Let TypeScript resolve the extension automatically
  const { AccessibleButton } = await import('./mockCosmicUI');
  return { ...actual, AccessibleButton };
});
