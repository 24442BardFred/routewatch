import { ChainComparison } from './chain';

export function formatChainCsv(comparisons: ChainComparison[]): string {
  const header = 'from,to,from_timestamp,to_timestamp,added,removed,changed';
  const rows = comparisons.map((c) =>
    [
      c.from.label,
      c.to.label,
      c.from.timestamp,
      c.to.timestamp,
      c.diff.added.length,
      c.diff.removed.length,
      c.diff.changed.length,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function formatChainJson(comparisons: ChainComparison[]): string {
  return JSON.stringify(
    comparisons.map((c) => ({
      from: c.from.label,
      to: c.to.label,
      fromTimestamp: c.from.timestamp,
      toTimestamp: c.to.timestamp,
      added: c.diff.added.length,
      removed: c.diff.removed.length,
      changed: c.diff.changed.length,
    })),
    null,
    2
  );
}
