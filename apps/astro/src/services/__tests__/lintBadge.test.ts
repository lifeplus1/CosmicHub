import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Lint badge JSON shape & invariants test.
 * Ensures script output remains backward compatible for README / shields usage.
 */
// Mark as slow to allow filtering; keep for integration coverage.
describe.skip('lint-badge output (slow integration)', () => {
  it('produces stable schema with expected fields and color logic', () => {
  // process.cwd() inside vitest for this file is the astro app root; monorepo root is one level up
    // Walk up until package.json containing lint:badge script is found (monorepo root)
    let root = process.cwd();
    for (let i = 0; i < 4; i++) { // safety limit
      const pkgPath = path.join(root, 'package.json');
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkg = JSON.parse(readFileSync(pkgPath,'utf8')) as { scripts?: Record<string,string> };
        if (pkg.scripts && 'lint:badge' in pkg.scripts) break;
      } catch {/* ignore */}
      root = path.join(root, '..');
    }
    execSync('node ./scripts/lint-badge.mjs', { cwd: root, stdio: 'pipe' });

    const raw = readFileSync(path.join(root, 'lint-metrics-badge.json'), 'utf8');
    const badge = JSON.parse(raw) as Record<string, unknown>;

    expect(badge).toMatchObject({ schemaVersion: 1, label: 'lint reduction' });
  expect(typeof badge['message']).toBe('string');
  expect(typeof badge['color']).toBe('string');

  const message = badge['message'] as string;
    // Pattern: "<delta> (<percent>%)" where percent can be negative or positive float
    expect(/^[-]?\d+ \([-]?\d+(?:\.\d+)?%\)$/.test(message)).toBe(true);

  const color = badge['color'] as string;
    const allowed = ['red', 'orange', 'yellow', 'green', 'brightgreen'];
    expect(allowed.includes(color)).toBe(true);

    // Derive percent from message and assert color classification boundaries
    const pctMatch = message.match(/\((-?\d+(?:\.\d+)?)%\)$/);
    expect(pctMatch).not.toBeNull();
    const pct = Number(pctMatch?.[1]);
    if (pct <= 0) expect(color).toBe('red');
    else if (pct < 25) expect(color).toBe('orange');
    else if (pct < 50) expect(color).toBe('yellow');
    else if (pct < 75) expect(color).toBe('green');
    else expect(color).toBe('brightgreen');
  });
});
