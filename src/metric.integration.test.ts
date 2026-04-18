import { computeMetrics, formatMetricsText } from './metric';
import type { RouteSnapshot } from './types';

function snap(routes: { method: string; path: string }[]): RouteSnapshot {
  return { timestamp: new Date().toISOString(), source: 'integration', routes: routes as any };
}

describe('metric integration', () => {
  it('handles a realistic API surface', () => {
    const snapshot = snap([
      { method: 'GET', path: '/api/v1/users' },
      { method: 'POST', path: '/api/v1/users' },
      { method: 'GET', path: '/api/v1/users/:id' },
      { method: 'PUT', path: '/api/v1/users/:id' },
      { method: 'DELETE', path: '/api/v1/users/:id' },
      { method: 'GET', path: '/api/v1/products' },
      { method: 'POST', path: '/api/v1/products' },
      { method: 'GET', path: '/health' },
    ]);

    const m = computeMetrics(snapshot);
    expect(m.totalRoutes).toBe(8);
    expect(m.methodCounts['GET']).toBe(5);
    expect(m.uniquePrefixes).toBe(2); // /api, /health
    expect(m.maxPathDepth).toBe(4);
    expect(m.avgPathDepth).toBeGreaterThan(2);

    const text = formatMetricsText(m);
    expect(text).toContain('8');
    expect(text).toContain('GET: 5');
  });
});
