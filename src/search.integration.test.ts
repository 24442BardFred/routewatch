import { searchSnapshots, formatSearchResults } from './search';
import { formatSearchMarkdown, formatSearchCsv } from './search.format';
import { Route, Snapshot } from './types';

const snap = (id: string, routes: Array<{ method: string; path: string }>): Snapshot =>
  ({ id, timestamp: new Date().toISOString(), routes } as unknown as Snapshot);

describe('search integration', () => {
  const snapshots = [
    snap('v1', [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
      { method: 'DELETE', path: '/users/:id' },
    ]),
    snap('v2', [
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/products' },
    ]),
  ];

  it('finds all GET routes across snapshots', () => {
    const results = searchSnapshots(snapshots, { method: 'GET' });
    expect(results).toHaveLength(3);
  });

  it('finds routes by path substring', () => {
    const results = searchSnapshots(snapshots, { path: '/users' });
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it('formats text output correctly', () => {
    const results = searchSnapshots(snapshots, { method: 'DELETE' });
    const text = formatSearchResults(results);
    expect(text).toContain('DELETE');
    expect(text).toContain('Found 1 result');
  });

  it('formats markdown output correctly', () => {
    const results = searchSnapshots(snapshots, { method: 'GET' });
    const md = formatSearchMarkdown(results);
    expect(md).toContain('| Snapshot |');
    expect(md).toContain('GET');
  });

  it('formats csv output correctly', () => {
    const results = searchSnapshots(snapshots, { path: '/products' });
    const csv = formatSearchCsv(results);
    expect(csv).toContain('snapshotId,method,path');
    expect(csv).toContain('/products');
  });
});
