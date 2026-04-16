import { Route } from './types';

export interface RouteGroup {
  prefix: string;
  routes: Route[];
  count: number;
}

/**
 * Extract the top-level path prefix from a route path.
 * e.g. "/api/users/123" => "/api"
 */
export function extractPrefix(path: string, depth: number = 1): string {
  const parts = path.replace(/^\//, '').split('/');
  const prefix = parts.slice(0, depth).join('/');
  return prefix ? `/${prefix}` : '/';
}

/**
 * Group routes by their path prefix at the given depth.
 */
export function groupByPrefix(routes: Route[], depth: number = 1): RouteGroup[] {
  const map = new Map<string, Route[]>();

  for (const route of routes) {
    const prefix = extractPrefix(route.path, depth);
    if (!map.has(prefix)) {
      map.set(prefix, []);
    }
    map.get(prefix)!.push(route);
  }

  const groups: RouteGroup[] = [];
  for (const [prefix, groupRoutes] of map.entries()) {
    groups.push({
      prefix,
      routes: groupRoutes,
      count: groupRoutes.length,
    });
  }

  return groups.sort((a, b) => a.prefix.localeCompare(b.prefix));
}

/**
 * Group routes by HTTP method.
 */
export function groupByMethod(routes: Route[]): Record<string, Route[]> {
  const result: Record<string, Route[]> = {};

  for (const route of routes) {
    const method = route.method.toUpperCase();
    if (!result[method]) {
      result[method] = [];
    }
    result[method].push(route);
  }

  return result;
}

/**
 * Summarize groups as a label -> count map.
 */
export function summarizeGroups(groups: RouteGroup[]): Record<string, number> {
  return Object.fromEntries(groups.map((g) => [g.prefix, g.count]));
}
