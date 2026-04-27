import { RouteEntry, Snapshot } from './types';
import { DiffResult } from './diff';

export interface DeltaStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  totalBefore: number;
  totalAfter: number;
  changeRate: number;
}

export interface DeltaReport {
  from: string;
  to: string;
  stats: DeltaStats;
  addedRoutes: RouteEntry[];
  removedRoutes: RouteEntry[];
  modifiedRoutes: Array<{ before: RouteEntry; after: RouteEntry }>;
}

export function computeDeltaStats(diff: DiffResult, before: Snapshot, after: Snapshot): DeltaStats {
  const added = diff.added.length;
  const removed = diff.removed.length;
  const modified = diff.modified ? diff.modified.length : 0;
  const totalBefore = before.routes.length;
  const totalAfter = after.routes.length;
  const unchanged = totalBefore - removed - modified;
  const changeRate = totalBefore === 0 ? 1 : (added + removed + modified) / totalBefore;

  return {
    added,
    removed,
    modified,
    unchanged: Math.max(0, unchanged),
    totalBefore,
    totalAfter,
    changeRate: Math.round(changeRate * 1000) / 1000,
  };
}

export function buildDeltaReport(diff: DiffResult, before: Snapshot, after: Snapshot): DeltaReport {
  return {
    from: before.label ?? before.timestamp,
    to: after.label ?? after.timestamp,
    stats: computeDeltaStats(diff, before, after),
    addedRoutes: diff.added,
    removedRoutes: diff.removed,
    modifiedRoutes: diff.modified ?? [],
  };
}

export function formatDeltaText(report: DeltaReport): string {
  const { stats, from, to } = report;
  const lines: string[] = [
    `Delta Report: ${from} → ${to}`,
    `─────────────────────────────────`,
    `  Added:     ${stats.added}`,
    `  Removed:   ${stats.removed}`,
    `  Modified:  ${stats.modified}`,
    `  Unchanged: ${stats.unchanged}`,
    `  Total:     ${stats.totalBefore} → ${stats.totalAfter}`,
    `  Change Rate: ${(stats.changeRate * 100).toFixed(1)}%`,
  ];
  return lines.join('\n');
}

export function formatDeltaMarkdown(report: DeltaReport): string {
  const { stats, from, to } = report;
  const lines: string[] = [
    `## Delta Report`,
    `**From:** \`${from}\` → **To:** \`${to}\``,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Added | ${stats.added} |`,
    `| Removed | ${stats.removed} |`,
    `| Modified | ${stats.modified} |`,
    `| Unchanged | ${stats.unchanged} |`,
    `| Total Before | ${stats.totalBefore} |`,
    `| Total After | ${stats.totalAfter} |`,
    `| Change Rate | ${(stats.changeRate * 100).toFixed(1)}% |`,
  ];
  return lines.join('\n');
}
