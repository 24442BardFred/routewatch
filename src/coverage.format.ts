import { CoverageReport } from './coverage';

export function formatCoverageCsv(report: CoverageReport): string {
  const header = 'method,path,covered,matched_pattern';
  const rows = report.results.map((r) => {
    const method = r.route.method.toUpperCase();
    const path = r.route.path;
    const covered = r.covered ? 'true' : 'false';
    const pattern = r.matchedPattern ?? '';
    return `${method},${path},${covered},${pattern}`;
  });
  return [header, ...rows].join('\n');
}

export function formatCoverageJson(report: CoverageReport): string {
  return JSON.stringify(
    {
      summary: {
        total: report.total,
        covered: report.covered,
        uncovered: report.uncovered,
        coveragePercent: report.coveragePercent,
      },
      results: report.results.map((r) => ({
        method: r.route.method.toUpperCase(),
        path: r.route.path,
        covered: r.covered,
        matchedPattern: r.matchedPattern ?? null,
      })),
    },
    null,
    2
  );
}
