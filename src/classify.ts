import { Route } from './types';

export type RouteCategory = 'resource' | 'action' | 'health' | 'auth' | 'webhook' | 'unknown';

export interface ClassifiedRoute extends Route {
  category: RouteCategory;
}

const HEALTH_PATTERNS = [/health/, /ping/, /status/, /ready/, /live/];
const AUTH_PATTERNS = [/auth/, /login/, /logout/, /token/, /oauth/, /session/];
const WEBHOOK_PATTERNS = [/webhook/, /hook/, /callback/, /event/];
const ACTION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function classifyRoute(route: Route): RouteCategory {
  const path = route.path.toLowerCase();
  const method = route.method.toUpperCase();

  if (HEALTH_PATTERNS.some(p => p.test(path))) return 'health';
  if (AUTH_PATTERNS.some(p => p.test(path))) return 'auth';
  if (WEBHOOK_PATTERNS.some(p => p.test(path))) return 'webhook';

  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? '';

  // Actions often look like /resource/verb or non-noun last segments
  if (ACTION_METHODS.includes(method) && /[a-z]+(ate|ify|ize|end|ect)$/.test(lastSegment)) {
    return 'action';
  }

  // Resource routes: GET /things, GET /things/:id
  if (/^[a-z]+s$/.test(lastSegment) || /^:[a-z]+id$/i.test(lastSegment)) {
    return 'resource';
  }

  if (ACTION_METHODS.includes(method)) return 'action';

  return 'unknown';
}

export function classifyRoutes(routes: Route[]): ClassifiedRoute[] {
  return routes.map(r => ({ ...r, category: classifyRoute(r) }));
}

export function groupByCategory(routes: Route[]): Record<RouteCategory, Route[]> {
  const result: Record<RouteCategory, Route[]> = {
    resource: [], action: [], health: [], auth: [], webhook: [], unknown: []
  };
  for (const route of routes) {
    result[classifyRoute(route)].push(route);
  }
  return result;
}

export function formatClassifyReport(groups: Record<RouteCategory, Route[]>): string {
  const lines: string[] = ['Route Classification Report', '==========================='];
  for (const [cat, routes] of Object.entries(groups)) {
    lines.push(`\n${cat.toUpperCase()} (${routes.length})`);
    for (const r of routes) lines.push(`  ${r.method.padEnd(7)} ${r.path}`);
  }
  return lines.join('\n');
}
