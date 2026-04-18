import { Route } from './types';

export function routeSignature(route: Route): string {
  return `${route.method.toUpperCase()}:${route.path}`;
}

export function dedupeRoutes(routes: Route[]): Route[] {
  const seen = new Map<string, Route>();
  for (const route of routes) {
    const key = routeSignature(route);
    if (!seen.has(key)) {
      seen.set(key, route);
    }
  }
  return Array.from(seen.values());
}

export function findDuplicates(routes: Route[]): Route[][] {
  const groups = new Map<string, Route[]>();
  for (const route of routes) {
    const key = routeSignature(route);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(route);
  }
  return Array.from(groups.values()).filter(g => g.length > 1);
}

export function formatDuplicateReport(duplicates: Route[][]): string {
  if (duplicates.length === 0) return 'No duplicate routes found.';
  const lines: string[] = [`Found ${duplicates.length} duplicate route(s):`];
  for (const group of duplicates) {
    const key = routeSignature(group[0]);
    lines.push(`  ${key} — ${group.length} occurrences`);
  }
  return lines.join('\n');
}
