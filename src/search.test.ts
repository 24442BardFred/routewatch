import { matchesQuery, searchSnapshot, searchSnapshots, formatSearchResults } from './search';
import { Route, Snapshot } from './types';

const makeRoute = (method: string, path: string, extra: Record<string, unknown> = {}): Route =>
  ({ method, path, ...extra } as unknown as Route);

const makeSnapshot = (id: string, routes: Route[]): Snapshot =>
  ({ id, timestamp: new Date().toISOString(), routes } as unknown as Snapshot);

describe('matchesQuery', () => {
  it('matches by method', () => {
    const r = makeRoute('GET', '/users');
    expect(matchesQuery(r, { method: 'GET' })).toContain('method');
  });

  it('matches by path substring', () => {
    const r = makeRoute('POST', '/api/users');
    expect(matchesQuery(r, { path: '/api' })).toContain('path');
  });

  it('returns empty when no match', () => {
    const r = makeRoute('GET', '/users');
    expect(matchesQuery(r, { method: 'DELETE' })).toHaveLength(0);
  });

  it('matches multiple fields', () => {
    const r = makeRoute('GET', '/users');
    const matched = matchesQuery(r, { method: 'GET', path: '/users' });
    expect(matched).toContain('method');
    expect(matched).toContain('path');
  });
});

describe('searchSnapshot', () => {
  it('returns matching routes', () => {
    const snap = makeSnapshot('snap1', [
      makeRoute('GET', '/users'),
      makeRoute('POST', '/items'),
    ]);
    const results = searchSnapshot(snap, { method: 'GET' });
    expect(results).toHaveLength(1);
    expect(results[0].route.path).toBe('/users');
  });

  it('returns empty for no filters', () => {
    const snap = makeSnapshot('snap1', [makeRoute('GET', '/users')]);
    expect(searchSnapshot(snap, {})).toHaveLength(0);
  });
});

describe('searchSnapshots', () => {
  it('searches across multiple snapshots', () => {
    const s1 = makeSnapshot('s1', [makeRoute('GET', '/a')]);
    const s2 = makeSnapshot('s2', [makeRoute('GET', '/b')]);
    const results = searchSnapshots([s1, s2], { method: 'GET' });
    expect(results).toHaveLength(2);
  });
});

describe('formatSearchResults', () => {
  it('returns no-match message for empty', () => {
    expect(formatSearchResults([])).toMatch(/No routes/);
  });

  it('formats results with count', () => {
    const snap = makeSnapshot('snap1', [makeRoute('GET', '/users')]);
    const results = [{ route: makeRoute('GET', '/users'), snapshotId: 'snap1', matchedOn: ['method'] }];
    const out = formatSearchResults(results);
    expect(out).toMatch('Found 1 result');
    expect(out).toMatch('/users');
  });
});
