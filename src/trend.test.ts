import { buildTrendPoints, computeTrend } from './trend';
import { RouteSnapshot } from './types';

function makeSnapshot(label: string, routes: { method: string; path: string }[]): RouteSnapshot {
  return {
    label,
    timestamp: new Date().toISOString(),
    routes: routes.map((r) => ({ method: r.method, path: r.path })),
  };
}

const snap1 = makeSnapshot('v1', [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
]);

const snap2 = makeSnapshot('v2', [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'DELETE', path: '/users/:id' },
]);

const snap3 = makeSnapshot('v3', [
  { method: 'GET', path: '/users' },
]);

describe('buildTrendPoints', () => {
  it('returns empty array for no snapshots', () => {
    expect(buildTrendPoints([])).toEqual([]);
  });

  it('first point has zero added/removed since first', () => {
    const points = buildTrendPoints([snap1, snap2]);
    expect(points[0].addedSinceFirst).toBe(0);
    expect(points[0].removedSinceFirst).toBe(0);
  });

  it('detects added routes relative to first snapshot', () => {
    const points = buildTrendPoints([snap1, snap2]);
    expect(points[1].addedSinceFirst).toBe(1);
    expect(points[1].removedSinceFirst).toBe(0);
  });

  it('detects removed routes relative to first snapshot', () => {
    const points = buildTrendPoints([snap1, snap3]);
    expect(points[1].removedSinceFirst).toBe(1);
  });

  it('uses label from snapshot', () => {
    const points = buildTrendPoints([snap1]);
    expect(points[0].label).toBe('v1');
  });
});

describe('computeTrend', () => {
  it('returns zero values for empty input', () => {
    const result = computeTrend([]);
    expect(result.netChange).toBe(0);
    expect(result.growthRate).toBe(0);
  });

  it('computes net change correctly', () => {
    const result = computeTrend([snap1, snap2]);
    expect(result.netChange).toBe(1);
  });

  it('computes peak and trough counts', () => {
    const result = computeTrend([snap1, snap2, snap3]);
    expect(result.peakCount).toBe(3);
    expect(result.troughCount).toBe(1);
  });

  it('computes growth rate as percentage', () => {
    const result = computeTrend([snap1, snap2]);
    expect(result.growthRate).toBe(50);
  });
});
