import {
  hashRoute,
  hashRoutes,
  buildDigest,
  compareDigests,
  formatDigestText,
  formatDigestMarkdown,
} from './digest';
import { formatDigestCsv, formatDigestJson } from './digest.format';
import { RouteSnapshot, Route } from './types';

const r1: Route = { method: 'GET', path: '/users' };
const r2: Route = { method: 'POST', path: '/users' };
const r3: Route = { method: 'DELETE', path: '/users/:id' };

function makeSnapshot(id: string, routes: Route[]): RouteSnapshot {
  return { id, timestamp: '2024-01-01T00:00:00Z', routes };
}

describe('hashRoute', () => {
  it('returns a 12-char hex string', () => {
    expect(hashRoute(r1)).toMatch(/^[a-f0-9]{12}$/);
  });

  it('same route produces same hash', () => {
    expect(hashRoute(r1)).toBe(hashRoute({ method: 'get', path: '/users' }));
  });

  it('different routes produce different hashes', () => {
    expect(hashRoute(r1)).not.toBe(hashRoute(r2));
  });
});

describe('hashRoutes', () => {
  it('returns a 64-char hex string', () => {
    expect(hashRoutes([r1, r2])).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is order-independent', () => {
    expect(hashRoutes([r1, r2])).toBe(hashRoutes([r2, r1]));
  });

  it('changes when route set changes', () => {
    expect(hashRoutes([r1])).not.toBe(hashRoutes([r1, r2]));
  });
});

describe('buildDigest', () => {
  it('builds a digest with correct route count', () => {
    const snap = makeSnapshot('snap-1', [r1, r2, r3]);
    const digest = buildDigest(snap);
    expect(digest.routeCount).toBe(3);
    expect(digest.snapshotId).toBe('snap-1');
    expect(Object.keys(digest.perRouteHashes)).toHaveLength(3);
  });
});

describe('compareDigests', () => {
  it('detects no changes for identical snapshots', () => {
    const snap = makeSnapshot('s1', [r1, r2]);
    const d = buildDigest(snap);
    const result = compareDigests(d, d);
    expect(result.changed).toBe(false);
  });

  it('detects added routes', () => {
    const d1 = buildDigest(makeSnapshot('s1', [r1]));
    const d2 = buildDigest(makeSnapshot('s2', [r1, r2]));
    const result = compareDigests(d1, d2);
    expect(result.changed).toBe(true);
    expect(result.addedKeys).toHaveLength(1);
  });

  it('detects removed routes', () => {
    const d1 = buildDigest(makeSnapshot('s1', [r1, r2]));
    const d2 = buildDigest(makeSnapshot('s2', [r1]));
    const result = compareDigests(d1, d2);
    expect(result.removedKeys).toHaveLength(1);
  });
});

describe('formatDigestText', () => {
  it('includes hash and route count', () => {
    const d = buildDigest(makeSnapshot('s1', [r1]));
    const text = formatDigestText(d);
    expect(text).toContain('Routes   : 1');
    expect(text).toContain('Hash     :');
    expect(text).toContain('GET /users');
  });
});

describe('formatDigestMarkdown', () => {
  it('returns markdown table', () => {
    const d = buildDigest(makeSnapshot('s1', [r1]));
    const md = formatDigestMarkdown(d);
    expect(md).toContain('## Digest');
    expect(md).toContain('| Route | Hash |');
  });
});

describe('formatDigestCsv', () => {
  it('returns csv with header', () => {
    const d = buildDigest(makeSnapshot('s1', [r1]));
    const csv = formatDigestCsv(d);
    expect(csv).toContain('route,hash');
    expect(csv).toContain('GET /users');
  });
});

describe('formatDigestJson', () => {
  it('returns valid JSON', () => {
    const d = buildDigest(makeSnapshot('s1', [r1]));
    const obj = JSON.parse(formatDigestJson(d));
    expect(obj.snapshotId).toBe('s1');
    expect(Array.isArray(obj.routes)).toBe(true);
  });
});
