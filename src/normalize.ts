import { Route, Snapshot } from './types';

export interface NormalizeOptions {
  lowercaseMethods?: boolean;
  trailingSlash?: 'add' | 'remove' | 'preserve';
  sortParams?: boolean;
}

const DEFAULT_OPTIONS: NormalizeOptions = {
  lowercaseMethods: false,
  trailingSlash: 'remove',
  sortParams: true,
};

export function normalizeMethod(method: string, lowercase: boolean): string {
  return lowercase ? method.toLowerCase() : method.toUpperCase();
}

export function normalizeTrailingSlash(
  path: string,
  mode: 'add' | 'remove' | 'preserve'
): string {
  if (mode === 'preserve') return path;
  if (mode === 'add') {
    return path.endsWith('/') ? path : `${path}/`;
  }
  // remove
  if (path === '/') return path;
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function normalizeQueryParams(path: string, sort: boolean): string {
  const [base, query] = path.split('?');
  if (!query) return base;
  if (!sort) return path;
  const params = query.split('&').sort();
  return `${base}?${params.join('&')}`;
}

export function normalizeRouteEntry(
  route: Route,
  options: NormalizeOptions = DEFAULT_OPTIONS
): Route {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const method = normalizeMethod(route.method, opts.lowercaseMethods ?? false);
  const pathWithSlash = normalizeTrailingSlash(
    route.path,
    opts.trailingSlash ?? 'remove'
  );
  const path = normalizeQueryParams(pathWithSlash, opts.sortParams ?? true);
  return { ...route, method, path };
}

export function normalizeRoutes(
  routes: Route[],
  options: NormalizeOptions = DEFAULT_OPTIONS
): Route[] {
  return routes.map((r) => normalizeRouteEntry(r, options));
}

export function normalizeSnapshot(
  snapshot: Snapshot,
  options: NormalizeOptions = DEFAULT_OPTIONS
): Snapshot {
  return {
    ...snapshot,
    routes: normalizeRoutes(snapshot.routes, options),
  };
}

export function formatNormalizeSummary(
  before: Route[],
  after: Route[]
): string {
  const changed = after.filter((r, i) => {
    const b = before[i];
    return !b || b.method !== r.method || b.path !== r.path;
  }).length;
  return `Normalized ${after.length} route(s); ${changed} modified.`;
}
