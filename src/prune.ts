import { RouteSnapshot } from './types';

export interface PruneOptions {
  olderThanDays?: number;
  keepMinimum?: number;
  dryRun?: boolean;
}

export interface PruneResult {
  pruned: string[];
  kept: string[];
  dryRun: boolean;
}

export function pruneSnapshots(
  snapshots: RouteSnapshot[],
  options: PruneOptions = {}
): PruneResult {
  const { olderThanDays = 30, keepMinimum = 1, dryRun = false } = options;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  const pruned: string[] = [];
  const kept: string[] = [];

  sorted.forEach((snap, index) => {
    const age = new Date(snap.timestamp).getTime();
    const tooOld = age < cutoff;
    const belowMinimum = index < keepMinimum;

    if (tooOld && !belowMinimum) {
      pruned.push(snap.label ?? snap.timestamp);
    } else {
      kept.push(snap.label ?? snap.timestamp);
    }
  });

  return { pruned, kept, dryRun };
}

export function formatPruneReport(result: PruneResult): string {
  const lines: string[] = [];
  const mode = result.dryRun ? '[dry-run] ' : '';
  lines.push(`${mode}Prune Report`);
  lines.push(`  Kept:   ${result.kept.length}`);
  lines.push(`  Pruned: ${result.pruned.length}`);
  if (result.pruned.length > 0) {
    result.pruned.forEach(label => lines.push(`    - ${label}`));
  }
  return lines.join('\n');
}
