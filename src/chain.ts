import { RouteSnapshot, RouteDiff } from './types';

export interface ChainLink {
  snapshot: RouteSnapshot;
  label: string;
  timestamp: string;
}

export interface ChainComparison {
  from: ChainLink;
  to: ChainLink;
  diff: RouteDiff;
}

export function buildChain(snapshots: RouteSnapshot[]): ChainLink[] {
  return snapshots.map((snapshot) => ({
    snapshot,
    label: snapshot.label ?? snapshot.id,
    timestamp: snapshot.timestamp,
  }));
}

export function compareChain(
  chain: ChainLink[],
  diffFn: (a: RouteSnapshot, b: RouteSnapshot) => RouteDiff
): ChainComparison[] {
  const results: ChainComparison[] = [];
  for (let i = 1; i < chain.length; i++) {
    const from = chain[i - 1];
    const to = chain[i];
    results.push({ from, to, diff: diffFn(from.snapshot, to.snapshot) });
  }
  return results;
}

export function formatChainText(comparisons: ChainComparison[]): string {
  if (comparisons.length === 0) return 'No comparisons in chain.';
  const lines: string[] = ['Route Chain Comparison', '='.repeat(40)];
  for (const c of comparisons) {
    lines.push(`\n${c.from.label} → ${c.to.label} (${c.from.timestamp} → ${c.to.timestamp})`);
    lines.push(`  Added:   ${c.diff.added.length}`);
    lines.push(`  Removed: ${c.diff.removed.length}`);
    lines.push(`  Changed: ${c.diff.changed.length}`);
  }
  return lines.join('\n');
}

export function formatChainMarkdown(comparisons: ChainComparison[]): string {
  if (comparisons.length === 0) return '_No comparisons in chain._';
  const lines: string[] = ['## Route Chain Comparison', '| From | To | Added | Removed | Changed |', '|---|---|---|---|---|'];
  for (const c of comparisons) {
    lines.push(`| ${c.from.label} | ${c.to.label} | ${c.diff.added.length} | ${c.diff.removed.length} | ${c.diff.changed.length} |`);
  }
  return lines.join('\n');
}
