import { Snapshot, Route } from './types';
import { DiffResult } from './diff';

export interface RollupEntry {
  label: string;
  snapshot: Snapshot;
  routeCount: number;
  added: number;
  removed: number;
  changed: number;
}

export interface RollupReport {
  entries: RollupEntry[];
  totalAdded: number;
  totalRemoved: number;
  totalChanged: number;
  baselineLabel: string;
}

export function buildRollupEntry(
  label: string,
  snapshot: Snapshot,
  diff?: DiffResult
): RollupEntry {
  return {
    label,
    snapshot,
    routeCount: snapshot.routes.length,
    added: diff ? diff.added.length : 0,
    removed: diff ? diff.removed.length : 0,
    changed: diff ? diff.changed.length : 0,
  };
}

export function buildRollup(
  snapshots: { label: string; snapshot: Snapshot }[],
  diffs: DiffResult[]
): RollupReport {
  if (snapshots.length === 0) {
    return { entries: [], totalAdded: 0, totalRemoved: 0, totalChanged: 0, baselineLabel: '' };
  }

  const entries: RollupEntry[] = snapshots.map((s, i) =>
    buildRollupEntry(s.label, s.snapshot, i > 0 ? diffs[i - 1] : undefined)
  );

  return {
    entries,
    totalAdded: diffs.reduce((sum, d) => sum + d.added.length, 0),
    totalRemoved: diffs.reduce((sum, d) => sum + d.removed.length, 0),
    totalChanged: diffs.reduce((sum, d) => sum + d.changed.length, 0),
    baselineLabel: snapshots[0].label,
  };
}

export function formatRollupText(report: RollupReport): string {
  const lines: string[] = ['Route Rollup Report', '==================='];
  if (report.entries.length === 0) {
    lines.push('No snapshots provided.');
    return lines.join('\n');
  }
  lines.push(`Baseline: ${report.baselineLabel}`);
  lines.push('');
  for (const e of report.entries) {
    lines.push(`[${e.label}] routes=${e.routeCount} +${e.added} -${e.removed} ~${e.changed}`);
  }
  lines.push('');
  lines.push(`Totals: +${report.totalAdded} -${report.totalRemoved} ~${report.totalChanged}`);
  return lines.join('\n');
}

export function formatRollupMarkdown(report: RollupReport): string {
  const lines: string[] = ['## Route Rollup Report', ''];
  if (report.entries.length === 0) {
    lines.push('_No snapshots provided._');
    return lines.join('\n');
  }
  lines.push(`**Baseline:** ${report.baselineLabel}`, '');
  lines.push('| Label | Routes | Added | Removed | Changed |');
  lines.push('|-------|--------|-------|---------|---------|');
  for (const e of report.entries) {
    lines.push(`| ${e.label} | ${e.routeCount} | +${e.added} | -${e.removed} | ~${e.changed} |`);
  }
  lines.push('');
  lines.push(`**Totals:** +${report.totalAdded} -${report.totalRemoved} ~${report.totalChanged}`);
  return lines.join('\n');
}
