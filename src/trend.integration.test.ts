import { computeTrend } from './trend';
import { RouteSnapshot } from './types';

function snap(label: string, paths: string[]): RouteSnapshot {
  return {
    label,
    timestamp: new Date().toISOString(),
    routes: paths.map((p) => ({ method: 'GET', path: p })),
  };
}

describe('computeTrend integration', () => {
  it('tracks a realistic multi-snapshot API evolution', () => {
    const snapshots: RouteSnapshot[] = [
      snap('v1.0', ['/health', '/users', '/products']),
      snap('v1.1', ['/health', '/users', '/products', '/orders']),
      snap('v1.2', ['/health', '/users', '/products', '/orders', '/invoices']),
      snap('v2.0', ['/health', '/v2/users', '/v2/products', '/v2/orders']),
    ];

    const trend = computeTrend(snapshots);

    expect(trend.points).toHaveLength(4);
    expect(trend.points[0].routeCount).toBe(3);
    expect(trend.points[2].routeCount).toBe(5);
    expect(trend.peakCount).toBe(5);
    expect(trend.troughCount).toBe(3);

    // v2.0 has 4 routes vs v1.0's 3 → net +1
    expect(trend.netChange).toBe(1);

    // v2.0 dropped all original routes and added new ones
    const lastPoint = trend.points[3];
    expect(lastPoint.addedSinceFirst).toBeGreaterThan(0);
    expect(lastPoint.removedSinceFirst).toBeGreaterThan(0);
  });

  it('shows zero growth rate when route count is unchanged', () => {
    const s1 = snap('a', ['/foo', '/bar']);
    const s2 = snap('b', ['/foo', '/baz']); // same count, different routes
    const trend = computeTrend([s1, s2]);
    expect(trend.netChange).toBe(0);
    expect(trend.growthRate).toBe(0);
  });
});
