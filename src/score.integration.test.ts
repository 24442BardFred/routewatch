import { diffSnapshots } from './diff';
import { computeHealthScore } from './score';
import { RouteSnapshot } from './types';

function makeSnapshot(routes: Array<{ method: string; path: string }>): RouteSnapshot {
  return {
    timestamp: new Date().toISOString(),
    source: 'http://localhost:3000',
    routes: routes.map((r) => ({ method: r.method, path: r.path })),
  };
}

describe('score integration with diffSnapshots', () => {
  it('returns A grade when snapshots are identical', () => {
    const routes = [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ];
    const before = makeSnapshot(routes);
    const after = makeSnapshot(routes);
    const diff = diffSnapshots(before, after);
    const health = computeHealthScore(diff);
    expect(health.grade).toBe('A');
    expect(health.score).toBe(100);
  });

  it('lowers score when routes are removed between snapshots', () => {
    const before = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'DELETE', path: '/users/:id' },
      { method: 'POST', path: '/orders' },
    ]);
    const after = makeSnapshot([
      { method: 'GET', path: '/users' },
    ]);
    const diff = diffSnapshots(before, after);
    const health = computeHealthScore(diff);
    expect(health.score).toBeLessThan(100);
    expect(['C', 'D', 'F']).toContain(health.grade);
    expect(health.breakdown.removed).toBe(2);
  });

  it('maintains high score when only new routes are added', () => {
    const before = makeSnapshot([{ method: 'GET', path: '/health' }]);
    const after = makeSnapshot([
      { method: 'GET', path: '/health' },
      { method: 'GET', path: '/metrics' },
      { method: 'POST', path: '/events' },
    ]);
    const diff = diffSnapshots(before, after);
    const health = computeHealthScore(diff);
    expect(health.score).toBeGreaterThanOrEqual(90);
    expect(health.breakdown.added).toBe(2);
    expect(health.breakdown.unchanged).toBe(1);
  });
});
