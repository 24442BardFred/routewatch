import type { RouteSnapshot } from './types';

export interface RouteMetrics {
  totalRoutes: number;
  methodCounts: Record<string, number>;
  avgPathDepth: number;
  maxPathDepth: number;
  uniquePrefixes: number;
  deprecatedCount: number;
}

export function countByMethod(snapshot: RouteSnapshot): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const route of snapshot.routes) {
    const m = route.method.toUpperCase();
    counts[m] = (counts[m] ?? 0) + 1;
  }
  return counts;
}

export function pathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
}

export function computeMetrics(snapshot: RouteSnapshot): RouteMetrics {
  const routes = snapshot.routes;
  if (routes.length === 0) {
    return { totalRoutes: 0, methodCounts: {}, avgPathDepth: 0, maxPathDepth: 0, uniquePrefixes: 0, deprecatedCount: 0 };
  }

  const depths = routes.map(r => pathDepth(r.path));
  const avgPathDepth = parseFloat((depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(2));
  const maxPathDepth = Math.max(...depths);

  const prefixes = new Set(routes.map(r => '/' + r.path.split('/').filter(Boolean)[0]).filter(Boolean));

  const deprecatedCount = routes.filter(r => (r as any).deprecated === true).length;

  return {
    totalRoutes: routes.length,
    methodCounts: countByMethod(snapshot),
    avgPathDepth,
    maxPathDepth,
    uniquePrefixes: prefixes.size,
    deprecatedCount,
  };
}

export function formatMetricsText(m: RouteMetrics): string {
  const methods = Object.entries(m.methodCounts)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
  return [
    `Total routes   : ${m.totalRoutes}`,
    `Methods        : ${methods || 'none'}`,
    `Avg path depth : ${m.avgPathDepth}`,
    `Max path depth : ${m.maxPathDepth}`,
    `Unique prefixes: ${m.uniquePrefixes}`,
    `Deprecated     : ${m.deprecatedCount}`,
  ].join('\n');
}
