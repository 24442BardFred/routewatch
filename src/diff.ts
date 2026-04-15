import { Snapshot } from './snapshot';

export interface RouteChange {
  type: 'added' | 'removed' | 'modified';
  method: string;
  path: string;
  details?: string;
}

export interface DiffResult {
  added: RouteChange[];
  removed: RouteChange[];
  modified: RouteChange[];
  summary: string;
}

export function diffSnapshots(base: Snapshot, head: Snapshot): DiffResult {
  const result: DiffResult = {
    added: [],
    removed: [],
    modified: [],
    summary: '',
  };

  const baseRouteMap = new Map(
    base.routes.map((r) => [`${r.method.toUpperCase()} ${r.path}`, r])
  );
  const headRouteMap = new Map(
    head.routes.map((r) => [`${r.method.toUpperCase()} ${r.path}`, r])
  );

  for (const [key, headRoute] of headRouteMap.entries()) {
    if (!baseRouteMap.has(key)) {
      result.added.push({
        type: 'added',
        method: headRoute.method.toUpperCase(),
        path: headRoute.path,
      });
    } else {
      const baseRoute = baseRouteMap.get(key)!;
      if (JSON.stringify(baseRoute) !== JSON.stringify(headRoute)) {
        result.modified.push({
          type: 'modified',
          method: headRoute.method.toUpperCase(),
          path: headRoute.path,
          details: `Changed from ${JSON.stringify(baseRoute)} to ${JSON.stringify(headRoute)}`,
        });
      }
    }
  }

  for (const [key, baseRoute] of baseRouteMap.entries()) {
    if (!headRouteMap.has(key)) {
      result.removed.push({
        type: 'removed',
        method: baseRoute.method.toUpperCase(),
        path: baseRoute.path,
      });
    }
  }

  const total = result.added.length + result.removed.length + result.modified.length;
  result.summary = total === 0
    ? 'No route changes detected.'
    : `${total} change(s): +${result.added.length} added, -${result.removed.length} removed, ~${result.modified.length} modified.`;

  return result;
}
