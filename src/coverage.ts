import { RouteEntry, Snapshot } from './types';

export interface CoverageResult {
  route: RouteEntry;
  covered: boolean;
  matchedPattern?: string;
}

export interface CoverageReport {
  total: number;
  covered: number;
  uncovered: number;
  coveragePercent: number;
  results: CoverageResult[];
}

export function checkRouteCoverage(
  snapshot: Snapshot,
  testedPatterns: string[]
): CoverageReport {
  const results: CoverageResult[] = snapshot.routes.map((route) => {
    const matchedPattern = testedPatterns.find((pattern) =>
      routeMatchesPattern(route, pattern)
    );
    return {
      route,
      covered: matchedPattern !== undefined,
      matchedPattern,
    };
  });

  const covered = results.filter((r) => r.covered).length;
  const total = results.length;

  return {
    total,
    covered,
    uncovered: total - covered,
    coveragePercent: total === 0 ? 100 : Math.round((covered / total) * 100),
    results,
  };
}

export function routeMatchesPattern(route: RouteEntry, pattern: string): boolean {
  const [patternMethod, patternPath] = pattern.split(' ');
  if (!patternPath) {
    return route.path.startsWith(patternMethod);
  }
  const methodMatch =
    patternMethod === '*' ||
    route.method.toUpperCase() === patternMethod.toUpperCase();
  const pathMatch = pathMatchesGlob(route.path, patternPath);
  return methodMatch && pathMatch;
}

function pathMatchesGlob(path: string, glob: string): boolean {
  const regexStr = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '[^/]');
  return new RegExp(`^${regexStr}$`).test(path);
}

export function formatCoverageText(report: CoverageReport): string {
  const lines: string[] = [
    `Route Coverage: ${report.covered}/${report.total} (${report.coveragePercent}%)`,
    '',
  ];
  const uncovered = report.results.filter((r) => !r.covered);
  if (uncovered.length > 0) {
    lines.push('Uncovered Routes:');
    uncovered.forEach((r) => {
      lines.push(`  [${r.route.method.toUpperCase()}] ${r.route.path}`);
    });
  } else {
    lines.push('All routes are covered.');
  }
  return lines.join('\n');
}

export function formatCoverageMarkdown(report: CoverageReport): string {
  const lines: string[] = [
    `## Route Coverage`,
    ``,
    `**${report.covered}/${report.total} routes covered (${report.coveragePercent}%)**`,
    ``,
    `| Method | Path | Covered |`,
    `|--------|------|---------|`,
  ];
  report.results.forEach((r) => {
    const status = r.covered ? '✅' : '❌';
    lines.push(`| ${r.route.method.toUpperCase()} | \`${r.route.path}\` | ${status} |`);
  });
  return lines.join('\n');
}
