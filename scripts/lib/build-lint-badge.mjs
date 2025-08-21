/**
 * Build lint badge object from lint delta summary.
 * @param {{ totalBaseline: number; totalCurrent: number }} summary
 */
export function buildLintBadge(summary) {
  const { totalBaseline, totalCurrent } = summary;
  const pct = ((totalBaseline - totalCurrent) / Math.max(1, totalBaseline)) * 100;
  return {
    schemaVersion: 1,
    label: 'lint reduction',
    message: `${(totalBaseline - totalCurrent)} (${pct.toFixed(1)}%)`,
    color: pct <= 0 ? 'red' : pct < 25 ? 'orange' : pct < 50 ? 'yellow' : pct < 75 ? 'green' : 'brightgreen'
  };
}

export default buildLintBadge;
