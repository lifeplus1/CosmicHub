import { configureAxe } from 'vitest-axe';

// Minimal local types (vitest-axe doesn't export AxeResults type explicitly)
interface AxeNodeResult {
  target: string[];
}
interface AxeViolation {
  id: string;
  help: string;
  nodes: AxeNodeResult[];
}
interface AxeResults {
  violations: AxeViolation[];
}

// Axe expects rules as an object map; disable color-contrast temporarily.
// Using object form for rules to satisfy configureAxe typing; color-contrast disabled temporarily.

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  } as Record<string, { enabled: boolean }>,
});

// Global lock to prevent concurrent axe runs
let axeLock = Promise.resolve();

export async function runAxe(node: HTMLElement): Promise<AxeResults> {
  // Serialize axe runs to prevent "Axe is already running" errors
  const currentRun = axeLock.then(async () => {
    // Add a small delay between runs to ensure axe cleans up properly
    await new Promise(resolve => setTimeout(resolve, 50));
    return axe(node) as Promise<AxeResults>;
  });
  
  axeLock = currentRun;
  return currentRun;
}

export async function expectNoA11yViolations(
  node: HTMLElement,
  options?: { allow?: string[] }
): Promise<AxeResults> {
  const results = await runAxe(node);
  const { violations } = results;
  const allowList = options?.allow ?? [];
  const filtered = violations.filter(v => !allowList.includes(v.id));
  if (filtered.length > 0) {
    const summary = filtered
      .map(
        v =>
          `${v.id}: ${v.help} -> ${v.nodes.map(n => n.target.join(' ')).join(', ')}`
      )
      .join('\n');
    throw new Error(`A11y violations (filtered):\n${summary}`);
  }
  return results;
}
