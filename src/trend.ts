import { RouteSnapshot } from './types';

export interface TrendPoint {
  label: string;
  timestamp: string;
  routeCount: number;
  addedSinceFirst: number;
  removedSinceFirst: number;
}

export interface TrendSummary {
  points: TrendPoint[];
  netChange: number;
  peakCount: number;
  troughCount: number;
  growthRate: number; // percentage change from first to last
}

export function buildTrendPoints(snapshots: RouteSnapshot[]): TrendPoint[] {
  if (snapshots.length === 0) return [];

  const firstRoutes = new Set(snapshots[0].routes.map((r) => `${r.method}:${r.path}`));

  return snapshots.map((snap, idx) => {
    const current = new Set(snap.routes.map((r) => `${r.method}:${r.path}`));
    let added = 0;
    let removed = 0;

    current.forEach((key) => {
      if (!firstRoutes.has(key)) added++;
    });
    firstRoutes.forEach((key) => {
      if (!current.has(key)) removed++;
    });

    return {
      label: snap.label ?? `snapshot-${idx + 1}`,
      timestamp: snap.timestamp,
      routeCount: snap.routes.length,
      addedSinceFirst: added,
      removedSinceFirst: removed,
    };
  });
}

export function computeTrend(snapshots: RouteSnapshot[]): TrendSummary {
  const points = buildTrendPoints(snapshots);

  if (points.length === 0) {
    return { points: [], netChange: 0, peakCount: 0, troughCount: 0, growthRate: 0 };
  }

  const counts = points.map((p) => p.routeCount);
  const first = counts[0];
  const last = counts[counts.length - 1];
  const peakCount = Math.max(...counts);
  const troughCount = Math.min(...counts);
  const netChange = last - first;
  const growthRate = first === 0 ? 0 : Math.round(((last - first) / first) * 100 * 100) / 100;

  return { points, netChange, peakCount, troughCount, growthRate };
}
