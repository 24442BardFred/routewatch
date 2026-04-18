import { pruneSnapshots, formatPruneReport } from './prune';
import { RouteSnapshot } from './types';

function makeSnapshot(daysAgo: number, label: string): RouteSnapshot {
  const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return { timestamp: ts, label, routes: [] };
}

describe('pruneSnapshots', () => {
  it('keeps recent snapshots', () => {
    const snaps = [makeSnapshot(1, 'recent'), makeSnapshot(2, 'also-recent')];
    const result = pruneSnapshots(snaps, { olderThanDays: 30, keepMinimum: 1 });
    expect(result.pruned).toHaveLength(0);
    expect(result.kept).toHaveLength(2);
  });

  it('prunes old snapshots beyond keepMinimum', () => {
    const snaps = [
      makeSnapshot(1, 'new'),
      makeSnapshot(60, 'old1'),
      makeSnapshot(90, 'old2'),
    ];
    const result = pruneSnapshots(snaps, { olderThanDays: 30, keepMinimum: 1 });
    expect(result.kept).toContain('new');
    expect(result.pruned).toContain('old1');
    expect(result.pruned).toContain('old2');
  });

  it('respects keepMinimum even if all are old', () => {
    const snaps = [makeSnapshot(60, 'only-one')];
    const result = prunederThanDays: 30, keepMinimum: 1 });
    expect(result.kept).toContain('only-one');
    expect(result.pruned).toHaveLength(0);
  });

  it('sets correctly', () => {
    const snaps = [makeSnapshot(1, 'snap')];
    const result = pruneSnapshots(snaps, { dryRun: true });
    expect(result.dryRun).toBe(true);
  });
});

describe('formatPruneReport', () => {
  it('includes dry-run label when applicable', () => {
    const report = formatPruneReport({ pruned: [], kept: ['a'], dryRun: true });
    expect(report).toContain('[dry-run]');
  });

  it('lists pruned snapshot labels', () => {
    const report = formatPruneReport({ pruned: ['old-snap'], kept: ['new-snap'], dryRun: false });
    expect(report).toContain('old-snap');
    expect(report).toContain('Pruned: 1');
  });

  it('shows zero pruned when nothing removed', () => {
    const report = formatPruneReport({ pruned: [], kept: ['a', 'b'], dryRun: false });
    expect(report).toContain('Pruned: 0');
    expect(report).toContain('Kept:   2');
  });
});
