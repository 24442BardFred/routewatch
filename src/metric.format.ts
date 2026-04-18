import type { RouteMetrics } from './metric';

export function formatMetricsMarkdown(m: RouteMetrics): string {
  const rows = Object.entries(m.methodCounts)
    .map(([method, count]) => `| ${method} | ${count} |`)
    .join('\n');

  const methodTable = rows
    ? `| Method | Count |\n|--------|-------|\n${rows}`
    : '_No routes_';

  return [
    '## Route Metrics',
    '',
    `- **Total routes**: ${m.totalRoutes}`,
    `- **Avg path depth**: ${m.avgPathDepth}`,
    `- **Max path depth**: ${m.maxPathDepth}`,
    `- **Unique prefixes**: ${m.uniquePrefixes}`,
    `- **Deprecated**: ${m.deprecatedCount}`,
    '',
    '### Methods',
    '',
    methodTable,
  ].join('\n');
}

export function formatMetricsCsv(m: RouteMetrics): string {
  const header = 'metric,value';
  const rows = [
    `totalRoutes,${m.totalRoutes}`,
    `avgPathDepth,${m.avgPathDepth}`,
    `maxPathDepth,${m.maxPathDepth}`,
    `uniquePrefixes,${m.uniquePrefixes}`,
    `deprecatedCount,${m.deprecatedCount}`,
    ...Object.entries(m.methodCounts).map(([k, v]) => `method.${k},${v}`),
  ];
  return [header, ...rows].join('\n');
}
