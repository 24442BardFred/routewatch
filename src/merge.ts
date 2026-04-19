import { Route, Snapshot } from './types';

export interface MergeOptions {
  strategy: 'union' | 'intersection' | 'left' | 'right';
  dedupe?: boolean;
}

export interface MergeResult {
  snapshot: Snapshot;
  added: number;
  dropped: number;
  total: number;
}

function routeKey(route: Route): string {
  return `${route.method.toUpperCase()}:${route.path}`;
}

export function mergeRoutes(a: Route[], b: Route[], options: MergeOptions): Route[] {
  const mapA = new Map(a.map(r => [routeKey(r), r]));
  const mapB = new Map(b.map(r => [routeKey(r), r]));

  switch (options.strategy) {
    case 'union': {
      const merged = new Map([...mapA, ...mapB]);
      return Array.from(merged.values());
    }
    case 'intersection': {
      return a.filter(r => mapB.has(routeKey(r)));
    }
    case 'left':
      return [...a];
    case 'right':
      return [...b];
    default:
      return [...a];
  }
}

export function mergeSnapshots(
  base: Snapshot,
  incoming: Snapshot,
  options: MergeOptions = { strategy: 'union', dedupe: true }
): MergeResult {
  const before = base.routes.length;
  const merged = mergeRoutes(base.routes, incoming.routes, options);

  const snapshot: Snapshot = {
    ...base,
    routes: merged,
    timestamp: new Date().toISOString(),
    label: `merge(${base.label ?? 'base'},${incoming.label ?? 'incoming'})`,
  };

  return {
    snapshot,
    added: merged.length - before,
    dropped: before - merged.length < 0 ? 0 : before - merged.length,
    total: merged.length,
  };
}

export function formatMergeSummary(result: MergeResult): string {
  const lines = [
    `Merge complete: ${result.total} routes total`,
    `  Added   : ${result.added}`,
    `  Dropped : ${result.dropped}`,
  ];
  return lines.join('\n');
}
