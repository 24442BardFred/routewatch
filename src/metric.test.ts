import { computeMetrics, countByMethod, pathDepth, formatMetricsText } from './metric';
import type { RouteSnapshot } from './types';

function makeSnapshot(routes: { method: string; path: string; deprecated?: boolean }[]): RouteSnapshot {
  return { timestamp: new Date().toISOString(), source: 'test', routes: routes as any };
}

describe('pathDepth', () => {
  it('returns 0 for root', () => expect(pathDepth('/')).toBe(0));
  it('returns 1 for top-level', () => expect(pathDepth('/users')).toBe(1));
  it('returns 3 for nested', () => expect(pathDepth('/api/v1/users')).toBe(3));
});

describe('countByMethod', () => {
  it('counts methods correctly', () => {
    const snap = makeSnapshot([
      { method: 'GET', path: '/a' },
      { method: 'get', path: '/b' },
      { method: 'POST', path: '/c' },
    ]);
    expect(countByMethod(snap)).toEqual({ GET: 2, POST: 1 });
  });
});

describe('computeMetrics', () => {
  it('returns zeros for empty snapshot', () => {
    const m = computeMetrics(makeSnapshot([]));
    expect(m.totalRoutes).toBe(0);
    expect(m.avgPathDepth).toBe(0);
  });

  it('computes metrics correctly', () => {
    const snap = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
      { method: 'GET', path: '/users/profile/settings' },
      { method: 'DELETE', path: '/orders/items', deprecated: true },
    ]);
    const m = computeMetrics(snap);
    expect(m.totalRoutes).toBe(4);
    expect(m.methodCounts).toEqual({ GET: 2, POST: 1, DELETE: 1 });
    expect(m.maxPathDepth).toBe(3);
    expect(m.uniquePrefixes).toBe(2);
    expect(m.deprecatedCount).toBe(1);
  });
});

describe('formatMetricsText', () => {
  it('includes all fields', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/ping' }]);
    const text = formatMetricsText(computeMetrics(snap));
    expect(text).toContain('Total routes');
    expect(text).toContain('GET');
    expect(text).toContain('Deprecated');
  });
});
