import { RouteSnapshot, RouteDiff } from './types';
import { diffSnapshots } from './diff';

export interface DriftEntry {
  route: string;
  method: string;
  path: string;
  changeCount: number;
  firstSeen: string;
  lastChanged: string;
  status: 'stable' | 'drifting' | 'volatile';
}

export interface DriftReport {
  entries: DriftEntry[];
  stable: number;
  drifting: number;
  volatile: number;
  generatedAt: string;
}

function driftStatus(changeCount: number): 'stable' | 'drifting' | 'volatile' {
  if (changeCount === 0) return 'stable';
  if (changeCount <= 2) return 'drifting';
  return 'volatile';
}

export function buildDriftReport(snapshots: RouteSnapshot[]): DriftReport {
  if (snapshots.length < 2) {
    return {
      entries: [],
      stable: 0,
      drifting: 0,
      volatile: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const changeMap = new Map<string, { method: string; path: string; count: number; firstSeen: string; lastChanged: string }>();

  for (let i = 1; i < snapshots.length; i++) {
    const diff: RouteDiff = diffSnapshots(snapshots[i - 1], snapshots[i]);
    const changed = [...diff.added, ...diff.removed, ...diff.modified];
    for (const route of changed) {
      const key = `${route.method}:${route.path}`;
      const existing = changeMap.get(key);
      if (existing) {
        existing.count += 1;
        existing.lastChanged = snapshots[i].timestamp;
      } else {
        changeMap.set(key, {
          method: route.method,
          path: route.path,
          count: 1,
          firstSeen: snapshots[i - 1].timestamp,
          lastChanged: snapshots[i].timestamp,
        });
      }
    }
  }

  // Include stable routes (present in all snapshots with no changes)
  const allRoutes = snapshots[0].routes;
  for (const route of allRoutes) {
    const key = `${route.method}:${route.path}`;
    if (!changeMap.has(key)) {
      changeMap.set(key, {
        method: route.method,
        path: route.path,
        count: 0,
        firstSeen: snapshots[0].timestamp,
        lastChanged: snapshots[0].timestamp,
      });
    }
  }

  const entries: DriftEntry[] = Array.from(changeMap.entries()).map(([key, val]) => ({
    route: key,
    method: val.method,
    path: val.path,
    changeCount: val.count,
    firstSeen: val.firstSeen,
    lastChanged: val.lastChanged,
    status: driftStatus(val.count),
  }));

  entries.sort((a, b) => b.changeCount - a.changeCount);

  return {
    entries,
    stable: entries.filter(e => e.status === 'stable').length,
    drifting: entries.filter(e => e.status === 'drifting').length,
    volatile: entries.filter(e => e.status === 'volatile').length,
    generatedAt: new Date().toISOString(),
  };
}

export function formatDriftText(report: DriftReport): string {
  const lines: string[] = [
    `Drift Report — ${report.generatedAt}`,
    `Stable: ${report.stable}  Drifting: ${report.drifting}  Volatile: ${report.volatile}`,
    '',
  ];
  for (const e of report.entries) {
    lines.push(`[${e.status.toUpperCase()}] ${e.method} ${e.path} (changes: ${e.changeCount}, last: ${e.lastChanged})`);
  }
  return lines.join('\n');
}

export function formatDriftMarkdown(report: DriftReport): string {
  const lines: string[] = [
    `## Drift Report`,
    `> Generated: ${report.generatedAt}`,
    '',
    `| Status | Count |`,
    `|--------|-------|`,
    `| ✅ Stable | ${report.stable} |`,
    `| ⚠️ Drifting | ${report.drifting} |`,
    `| 🔴 Volatile | ${report.volatile} |`,
    '',
    `| Method | Path | Changes | Status | Last Changed |`,
    `|--------|------|---------|--------|--------------|`,
  ];
  for (const e of report.entries) {
    const icon = e.status === 'stable' ? '✅' : e.status === 'drifting' ? '⚠️' : '🔴';
    lines.push(`| ${e.method} | ${e.path} | ${e.changeCount} | ${icon} ${e.status} | ${e.lastChanged} |`);
  }
  return lines.join('\n');
}
