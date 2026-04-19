import { buildSnapshotDiff, formatSnapshotDiffText, formatSnapshotDiffMarkdown } from './snapshot.diff';
import { formatSnapshotDiffCsv, formatSnapshotDiffJson } from './snapshot.diff.format';
import { RouteSnapshot } from './types';

function snap(id: string, routes: { method: string; path: string }[]): RouteSnapshot {
  return { id, timestamp: '2024-01-01T00:00:00Z', routes: routes.map(r => ({ ...r, tags: [] })) };
}

describe('snapshot.diff integration', () => {
  const before = snap('v1', [
    { method: 'GET', path: '/users' },
    { method: 'DELETE', path: '/users/:id' },
  ]);
  const after = snap('v2', [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
  ]);

  it('produces consistent counts across all formats', () => {
    const entry = buildSnapshotDiff(before, after);
    expect(entry.addedCount).toBe(1);
    expect(entry.removedCount).toBe(1);
    expect(entry.changedCount).toBe(0);

    const text = formatSnapshotDiffText(entry);
    expect(text).toContain('Added:   1');
    expect(text).toContain('Removed: 1');

    const md = formatSnapshotDiffMarkdown(entry);
    expect(md).toContain('| Added | 1 |');

    const csv = formatSnapshotDiffCsv(entry);
    expect(csv).toContain('added,POST,/users');
    expect(csv).toContain('removed,DELETE,/users/:id');

    const json = JSON.parse(formatSnapshotDiffJson(entry));
    expect(json.from).toBe('v1');
    expect(json.to).toBe('v2');
    expect(json.summary.added).toBe(1);
  });
});
