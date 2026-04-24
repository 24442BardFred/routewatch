import {
  fingerprintRoute,
  fingerprintRoutes,
  buildFingerprintIndex,
  fingerprintsMatch,
  findNewRoutes,
  findRemovedRoutes,
  formatFingerprintSummary,
} from './fingerprint';
import { Route, Snapshot } from './types';

const makeRoute = (method: string, path: string, tags?: string[]): Route => ({
  method,
  path,
  ...(tags ? { tags } : {}),
} as Route);

const makeSnapshot = (routes: Route[], label?: string): Snapshot => ({
  timestamp: '2024-01-01T00:00:00Z',
  label,
  routes,
} as Snapshot);

describe('fingerprintRoute', () => {
  it('normalises method to uppercase and trims trailing slash', () => {
    expect(fingerprintRoute(makeRoute('get', '/users/'))).toBe('GET:/users');
  });

  it('handles root path', () => {
    expect(fingerprintRoute(makeRoute('GET', '/'))).toBe('GET:/');
  });

  it('includes sorted tags when present', () => {
    const fp = fingerprintRoute(makeRoute('POST', '/items', ['beta', 'admin']));
    expect(fp).toBe('POST:/items[admin,beta]');
  });

  it('omits tag brackets when no tags', () => {
    const fp = fingerprintRoute(makeRoute('DELETE', '/items'));
    expect(fp).not.toContain('[');
  });
});

describe('fingerprintRoutes', () => {
  it('returns sorted fingerprints', () => {
    const routes = [makeRoute('POST', '/b'), makeRoute('GET', '/a')];
    const fps = fingerprintRoutes(routes);
    expect(fps).toEqual(['GET:/a', 'POST:/b']);
  });
});

describe('buildFingerprintIndex', () => {
  it('builds a Set of fingerprints', () => {
    const routes = [makeRoute('GET', '/ping'), makeRoute('POST', '/data')];
    const index = buildFingerprintIndex(routes);
    expect(index.has('GET:/ping')).toBe(true);
    expect(index.has('POST:/data')).toBe(true);
    expect(index.has('DELETE:/data')).toBe(false);
  });
});

describe('fingerprintsMatch', () => {
  it('returns true for identical route sets', () => {
    const routes = [makeRoute('GET', '/a'), makeRoute('POST', '/b')];
    expect(fingerprintsMatch(makeSnapshot(routes), makeSnapshot([...routes]))).toBe(true);
  });

  it('returns false when route counts differ', () => {
    const a = makeSnapshot([makeRoute('GET', '/a')]);
    const b = makeSnapshot([makeRoute('GET', '/a'), makeRoute('POST', '/b')]);
    expect(fingerprintsMatch(a, b)).toBe(false);
  });

  it('returns false when a route differs', () => {
    const a = makeSnapshot([makeRoute('GET', '/a')]);
    const b = makeSnapshot([makeRoute('GET', '/b')]);
    expect(fingerprintsMatch(a, b)).toBe(false);
  });
});

describe('findNewRoutes / findRemovedRoutes', () => {
  const base = makeSnapshot([makeRoute('GET', '/a'), makeRoute('POST', '/b')]);
  const next = makeSnapshot([makeRoute('GET', '/a'), makeRoute('DELETE', '/c')]);

  it('finds added routes', () => {
    const added = findNewRoutes(base, next);
    expect(added).toHaveLength(1);
    expect(added[0].path).toBe('/c');
  });

  it('finds removed routes', () => {
    const removed = findRemovedRoutes(base, next);
    expect(removed).toHaveLength(1);
    expect(removed[0].path).toBe('/b');
  });
});

describe('formatFingerprintSummary', () => {
  it('includes counts and route details', () => {
    const base = makeSnapshot([makeRoute('GET', '/a')], 'v1');
    const next = makeSnapshot([makeRoute('GET', '/a'), makeRoute('POST', '/b')], 'v2');
    const summary = formatFingerprintSummary(base, next);
    expect(summary).toContain('v1');
    expect(summary).toContain('v2');
    expect(summary).toContain('Added     : 1');
    expect(summary).toContain('Removed   : 0');
    expect(summary).toContain('+ POST /b');
  });
});
