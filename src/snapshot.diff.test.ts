import { buildSnapshotDiff, formatSnapshotDiffText, formatSnapshotDiffMarkdown } from './snapshot.diff';
import { RouteSnapshot } from './types';

function makeSnapshot(id: string, routes: { method: string; path: string }[]): RouteSnapshot {
  return { id, timestamp: new Date().toISOString(), routes: routes.map(r => ({ ...r, tags: [] })) };
}

describe('buildSnapshotDiff', () => {
  it('counts added routes', () => {
    const a = makeSnapshot('a', []);
    const b = makeSnapshot('b', [{ method: 'GET', path: '/users' }]);
    const entry = buildSnapshotDiff(a, b);
    expect(entry.addedCount).toBe(1);
    expect(entry.removedCount).toBe(0);
  });

  it('counts removed routes', () => {
    const a = makeSnapshot('a', [{ method: 'GET', path: '/users' }]);
    const b = makeSnapshot('b', []);
    const entry = buildSnapshotDiff(a, b);
    expect(entry.removedCount).toBe(1);
    expect(entry.addedCount).toBe(0);
  });

  it('sets from/to ids', () => {
    const a = makeSnapshot('snap-1', []);
    const b = makeSnapshot('snap-2', []);
    const entry = buildSnapshotDiff(a, b);
    expect(entry.from).toBe('snap-1');
    expect(entry.to).toBe('snap-2');
  });
});

describe('formatSnapshotDiffText', () => {
  it('includes header and counts', () => {
    const a = makeSnapshot('a', [{ method: 'GET', path: '/old' }]);
    const b = makeSnapshot('b', [{ method: 'POST', path: '/new' }]);
    const entry = buildSnapshotDiff(a, b);
    const text = formatSnapshotDiffText(entry);
    expect(text).toContain('a → b');
    expect(text).toContain('Added:   1');
    expect(text).toContain('Removed: 1');
  });
});

describe('formatSnapshotDiffMarkdown', () => {
  it('includes markdown header', () => {
    const a = makeSnapshot('a', []);
    const b = makeSnapshot('b', [{ method: 'GET', path: '/x' }]);
    const entry = buildSnapshotDiff(a, b);
    const md = formatSnapshotDiffMarkdown(entry);
    expect(md).toContain('## Diff');
    expect(md).toContain('### Added');
  });
});
