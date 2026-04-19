import { RollupReport } from './rollup';

export function formatRollupCsv(report: RollupReport): string {
  const lines: string[] = ['label,routes,added,removed,changed'];
  for (const e of report.entries) {
    lines.push(`${e.label},${e.routeCount},${e.added},${e.removed},${e.changed}`);
  }
  return lines.join('\n');
}

export function formatRollupJson(report: RollupReport): string {
  return JSON.stringify(
    {
      baselineLabel: report.baselineLabel,
      totals: {
        added: report.totalAdded,
        removed: report.totalRemoved,
        changed: report.totalChanged,
      },
      entries: report.entries.map((e) => ({
        label: e.label,
        routeCount: e.routeCount,
        added: e.added,
        removed: e.removed,
        changed: e.changed,
      })),
    },
    null,
    2
  );
}
