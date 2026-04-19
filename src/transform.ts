import { Route, Snapshot } from './types';

export interface TransformRule {
  field: 'method' | 'path' | 'tag';
  from: string;
  to: string;
}

export interface TransformResult {
  snapshot: Snapshot;
  applied: number;
  skipped: number;
}

export function applyTransformRule(route: Route, rule: TransformRule): Route {
  if (rule.field === 'method' && route.method === rule.from.toUpperCase()) {
    return { ...route, method: rule.to.toUpperCase() };
  }
  if (rule.field === 'path' && route.path === rule.from) {
    return { ...route, path: rule.to };
  }
  if (rule.field === 'tag') {
    const tags: string[] = (route as any).tags ?? [];
    if (tags.includes(rule.from)) {
      const newTags = tags.map(t => (t === rule.from ? rule.to : t));
      return { ...route, tags: newTags } as Route;
    }
  }
  return route;
}

export function transformRoutes(routes: Route[], rules: TransformRule[]): { routes: Route[]; applied: number; skipped: number } {
  let applied = 0;
  let skipped = 0;
  const result = routes.map(route => {
    let current = route;
    let changed = false;
    for (const rule of rules) {
      const next = applyTransformRule(current, rule);
      if (next !== current) { changed = true; current = next; }
    }
    if (changed) applied++; else skipped++;
    return current;
  });
  return { routes: result, applied, skipped };
}

export function transformSnapshot(snapshot: Snapshot, rules: TransformRule[]): TransformResult {
  const { routes, applied, skipped } = transformRoutes(snapshot.routes, rules);
  return {
    snapshot: { ...snapshot, routes },
    applied,
    skipped,
  };
}

export function formatTransformSummary(result: TransformResult): string {
  const lines = [
    `Transform complete: ${result.applied} route(s) modified, ${result.skipped} unchanged.`,
  ];
  return lines.join('\n');
}
