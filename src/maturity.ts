import { Route, Snapshot } from './types';

export type MaturityLevel = 'experimental' | 'stable' | 'deprecated' | 'unknown';

export interface MaturityEntry {
  route: Route;
  level: MaturityLevel;
  reason: string;
}

export interface MaturityReport {
  snapshot: string;
  timestamp: string;
  entries: MaturityEntry[];
  counts: Record<MaturityLevel, number>;
}

const DEPRECATED_PATTERNS = [/\/v[0-9]+\//, /\/legacy\//i, /\/old\//i, /\/deprecated\//i];
const EXPERIMENTAL_PATTERNS = [/\/beta\//i, /\/alpha\//i, /\/preview\//i, /\/experimental\//i];

export function classifyMaturity(route: Route): MaturityEntry {
  const path = route.path.toLowerCase();

  for (const pattern of DEPRECATED_PATTERNS) {
    if (pattern.test(path)) {
      return { route, level: 'deprecated', reason: `Path matches deprecated pattern: ${pattern}` };
    }
  }

  for (const pattern of EXPERIMENTAL_PATTERNS) {
    if (pattern.test(path)) {
      return { route, level: 'experimental', reason: `Path matches experimental pattern: ${pattern}` };
    }
  }

  if (route.tags?.includes('deprecated')) {
    return { route, level: 'deprecated', reason: 'Tagged as deprecated' };
  }

  if (route.tags?.includes('experimental') || route.tags?.includes('beta')) {
    return { route, level: 'experimental', reason: 'Tagged as experimental or beta' };
  }

  if (route.tags?.includes('stable')) {
    return { route, level: 'stable', reason: 'Tagged as stable' };
  }

  return { route, level: 'unknown', reason: 'No maturity signal detected' };
}

export function buildMaturityReport(snapshot: Snapshot): MaturityReport {
  const entries = snapshot.routes.map(classifyMaturity);
  const counts: Record<MaturityLevel, number> = { experimental: 0, stable: 0, deprecated: 0, unknown: 0 };
  for (const entry of entries) {
    counts[entry.level]++;
  }
  return {
    snapshot: snapshot.name,
    timestamp: snapshot.timestamp,
    entries,
    counts,
  };
}

export function formatMaturityText(report: MaturityReport): string {
  const lines: string[] = [
    `Maturity Report — ${report.snapshot} (${report.timestamp})`,
    `Stable: ${report.counts.stable}  Experimental: ${report.counts.experimental}  Deprecated: ${report.counts.deprecated}  Unknown: ${report.counts.unknown}`,
    '',
  ];
  for (const entry of report.entries) {
    lines.push(`[${entry.level.toUpperCase().padEnd(12)}] ${entry.route.method.padEnd(7)} ${entry.route.path}`);
    lines.push(`  Reason: ${entry.reason}`);
  }
  return lines.join('\n');
}

export function formatMaturityMarkdown(report: MaturityReport): string {
  const lines: string[] = [
    `## Maturity Report — \`${report.snapshot}\``,
    `> ${report.timestamp}`,
    '',
    `| Level | Count |`,
    `|-------|-------|`,
    `| stable | ${report.counts.stable} |`,
    `| experimental | ${report.counts.experimental} |`,
    `| deprecated | ${report.counts.deprecated} |`,
    `| unknown | ${report.counts.unknown} |`,
    '',
    `| Method | Path | Level | Reason |`,
    `|--------|------|-------|--------|`,
  ];
  for (const entry of report.entries) {
    lines.push(`| \`${entry.route.method}\` | \`${entry.route.path}\` | ${entry.level} | ${entry.reason} |`);
  }
  return lines.join('\n');
}
