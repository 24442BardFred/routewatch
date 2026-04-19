import { diffSnapshots } from './diff';
import { Snapshot } from './snapshot';

const makeSnapshot = (routes: { method: string; path: string }[]): Snapshot => ({
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  routes,
});

describe('diffSnapshots', () => {
  it('returns no changes when snapshots are identical', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const result = diffSnapshots(snap, snap);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
    expect(result.summary).toBe('No route changes detected.');
  });

  it('returns no changes when both snapshots are empty', () => {
    const snap = makeSnapshot([]);
    const result = diffSnapshots(snap, snap);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
    expect(result.summary).toBe('No route changes detected.');
  });

  it('detects added routes', () => {
    const base = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const head = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ]);
    const result = diffSnapshots(base, head);
    expect(result.added).toHaveLength(1);
    expect(result.added[0]).toMatchObject({ type: 'added', method: 'POST', path: '/users' });
  });

  it('detects removed routes', () => {
    const base = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'DELETE', path: '/users/:id' },
    ]);
    const head = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const result = diffSnapshots(base, head);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0]).toMatchObject({ type: 'removed', method: 'DELETE', path: '/users/:id' });
  });

  it('detects modified routes', () => {
    const base = makeSnapshot([{ method: 'GET', path: '/users', deprecated: false } as any]);
    const head = makeSnapshot([{ method: 'GET', path: '/users', deprecated: true } as any]);
    const result = diffSnapshots(base, head);
    expect(result.modified).toHaveLength(1);
    expect(result.modified[0].type).toBe('modified');
  });

  it('summary reflects correct counts', () => {
    const base = makeSnapshot([{ method: 'GET', path: '/old' }]);
    const head = makeSnapshot([{ method: 'POST', path: '/new' }]);
    const result = diffSnapshots(base, head);
    expect(result.summary).toContain('+1 added');
    expect(result.summary).toContain('-1 removed');
  });

  it('treats same path with different methods as distinct routes', () => {
    const base = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const head = makeSnapshot([{ method: 'POST', path: '/users' }]);
    const result = diffSnapshots(base, head);
    expect(result.added).toHaveLength(1);
    expect(result.removed).toHaveLength(1);
    expect(result.modified).toHaveLength(0);
  });
});
