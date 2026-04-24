import { DriftReport } from './drift';

export function formatDriftCsv(report: DriftReport): string {
  const header = 'method,path,changeCount,status,firstSeen,lastChanged';
  const rows = report.entries.map(e =>
    [e.method, e.path, e.changeCount, e.status, e.firstSeen, e.lastChanged]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export function formatDriftJson(report: DriftReport): string {
  return JSON.stringify(
    {
      generatedAt: report.generatedAt,
      summary: {
        stable: report.stable,
        drifting: report.drifting,
        volatile: report.volatile,
      },
      entries: report.entries,
    },
    null,
    2
  );
}
