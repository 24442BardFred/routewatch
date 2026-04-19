import { formatSnapshotDiffCsv, formatSnapshotDiffJson } from './snapshot.diff.format';
import { buildSnapshotDiff } from './snapshot.diff';
import { RouteSnapshot } from './types';

function makeSnapshot(id: string, routes: { method: string; path: string }[]): RouteSnapshot {
  return { id, timestamp: new Date().toISOString(), routes: routes.map(r => ({ ...r, tags: [] })) };
}

describe('formatSnapshotDiffCsv', () => {
  it('has header row', () => {
    const a = makeSnapshot('a', []);
    const b = makeSnapshot('b', []);
    const csv = formatSnapshotDiffCsv(buildSnapshotDiff(a, b));
    expect(csv.startsWith('type,method,path')).toBe(true);
  });

  it('includes added routes', () => {
    const a = makeSnapshot('a', []);
    const b = makeSnapshot('b', [{ method: 'GET', path: '/items' }]);
    const csv = formatSnapshotDiffCsv(buildSnapshotDiff(a, b));
    expect(csv).toContain('added,GET,/items');
  });

  it('includes removed routes', () => {
    const a = makeSnapshot('a', [{ method: 'DELETE', path: '/old' }]);
    const b = makeSnapshot('b', []);
    const csv = formatSnapshotDiffCsv(buildSnapshotDiff(a, b));
    expect(csv).toContain('removed,DELETE,/old');
  });
});

describe('formatSnapshotDiffJson', () => {
  it('returns valid JSON', () => {
    const a = makeSnapshot('a', []);
    const b = makeSnapshot('b', []);
    const json = formatSnapshotDiffJson(buildSnapshotDiff(a, b));
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes summary counts', () => {
    const a = makeSnapshot('a', [{ method: 'GET', path: '/x' }]);
    const b = makeSnapshot('b', []);
    const parsed = JSON.parse(formatSnapshotDiffJson(buildSnapshotDiff(a, b)));
    expect(parsed.summary.removed).toBe(1);
  });
});
