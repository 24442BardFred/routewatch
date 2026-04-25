import { RouteEntry } from './types';

export interface DeprecationRule {
  pattern: string;
  reason?: string;
  since?: string;
  replacement?: string;
}

export interface DeprecationResult {
  route: RouteEntry;
  rule: DeprecationRule;
}

export interface DeprecationReport {
  deprecated: DeprecationResult[];
  clean: RouteEntry[];
  total: number;
}

export function matchesDeprecationRule(route: RouteEntry, rule: DeprecationRule): boolean {
  try {
    const regex = new RegExp(rule.pattern);
    return regex.test(route.path);
  } catch {
    return route.path.includes(rule.pattern);
  }
}

export function checkDeprecations(
  routes: RouteEntry[],
  rules: DeprecationRule[]
): DeprecationReport {
  const deprecated: DeprecationResult[] = [];
  const clean: RouteEntry[] = [];

  for (const route of routes) {
    const matched = rules.find((rule) => matchesDeprecationRule(route, rule));
    if (matched) {
      deprecated.push({ route, rule: matched });
    } else {
      clean.push(route);
    }
  }

  return { deprecated, clean, total: routes.length };
}

export function formatDeprecationText(report: DeprecationReport): string {
  if (report.deprecated.length === 0) {
    return `No deprecated routes found (${report.total} checked).`;
  }
  const lines: string[] = [
    `Deprecated routes: ${report.deprecated.length}/${report.total}`,
    '',
  ];
  for (const { route, rule } of report.deprecated) {
    lines.push(`  [${route.method}] ${route.path}`);
    if (rule.reason) lines.push(`    Reason: ${rule.reason}`);
    if (rule.since) lines.push(`    Since: ${rule.since}`);
    if (rule.replacement) lines.push(`    Replacement: ${rule.replacement}`);
  }
  return lines.join('\n');
}

export function formatDeprecationMarkdown(report: DeprecationReport): string {
  if (report.deprecated.length === 0) {
    return `> ✅ No deprecated routes found (${report.total} checked).`;
  }
  const lines: string[] = [
    `## Deprecation Report`,
    ``,
    `**${report.deprecated.length}** deprecated route(s) out of **${report.total}** total.`,
    ``,
    `| Method | Path | Reason | Since | Replacement |`,
    `| ------ | ---- | ------ | ----- | ----------- |`,
  ];
  for (const { route, rule } of report.deprecated) {
    lines.push(
      `| \`${route.method}\` | \`${route.path}\` | ${rule.reason ?? '-'} | ${rule.since ?? '-'} | ${rule.replacement ?? '-'} |`
    );
  }
  return lines.join('\n');
}
