import { Route } from './types';

export interface ResolvedRoute extends Route {
  resolvedPath: string;
  paramNames: string[];
  isWildcard: boolean;
}

export function extractParamNames(path: string): string[] {
  const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
}

export function resolvePathTemplate(path: string): string {
  return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '{$1}');
}

export function isWildcardPath(path: string): boolean {
  return path.includes('*') || path.includes(':');
}

export function resolveRoute(route: Route): ResolvedRoute {
  return {
    ...route,
    resolvedPath: resolvePathTemplate(route.path),
    paramNames: extractParamNames(route.path),
    isWildcard: isWildcardPath(route.path),
  };
}

export function resolveRoutes(routes: Route[]): ResolvedRoute[] {
  return routes.map(resolveRoute);
}

export function formatResolvedRoute(r: ResolvedRoute): string {
  const params = r.paramNames.length > 0 ? ` [params: ${r.paramNames.join(', ')}]` : '';
  const wildcard = r.isWildcard ? ' (wildcard)' : '';
  return `${r.method} ${r.resolvedPath}${params}${wildcard}`;
}

export function formatResolvedReport(routes: ResolvedRoute[]): string {
  if (routes.length === 0) return 'No routes to resolve.';
  const lines = routes.map(formatResolvedRoute);
  return `Resolved ${routes.length} route(s):\n` + lines.map(l => `  ${l}`).join('\n');
}
