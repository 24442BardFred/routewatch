import { buildPatch, applyPatch, formatPatchSummary } from './patch';
import { Route } from './types';

const r = (method: string, path: string): Route => ({ method, path });

describe('buildPatch', () => {
  it('detects added routes', () => {
    const ops = buildPatch([r('GET', '/a')], [r('GET', '/a'), r('POST', '/b')]);
    expect(ops).toContainEqual(expect.objectContaining({ op: 'add', path: 'POST:/b' }));
  });

  it('detects removed routes', () => {
    const ops = buildPatch([r('GET', '/a'), r('DELETE', '/c')], [r('GET', '/a')]);
    expect(ops).toContainEqual(expect.objectContaining({ op: 'remove', path: 'DELETE:/c' }));
  });

  it('detects replaced routes', () => {
    const before: Route[] = [{ method: 'GET', path: '/a', description: 'old' }];
    const after: Route[] = [{ method: 'GET', path: '/a', description: 'new' }];
    const ops = buildPatch(before, after);
    expect(ops).toContainEqual(expect.objectContaining({ op: 'replace', path: 'GET:/a' }));
  });

  it('returns empty for identical snapshots', () => {
    expect(buildPatch([r('GET', '/a')], [r('GET', '/a')])).toHaveLength(0);
  });
});

describe('applyPatch', () => {
  it('applies add operation', () => {
    const result = applyPatch([r('GET', '/a')], [{ op: 'add', path: 'POST:/b', value: r('POST', '/b') }]);
    expect(result.applied).toBe(1);
    expect(result.routes).toHaveLength(2);
  });

  it('applies remove operation', () => {
    const result = applyPatch([r('GET', '/a'), r('POST', '/b')], [{ op: 'remove', path: 'POST:/b' }]);
    expect(result.applied).toBe(1);
    expect(result.routes).toHaveLength(1);
  });

  it('skips add if route already exists', () => {
    const result = applyPatch([r('GET', '/a')], [{ op: 'add', path: 'GET:/a', value: r('GET', '/a') }]);
    expect(result.skipped).toBe(1);
  });

  it('applies replace operation', () => {
    const routes: Route[] = [{ method: 'GET', path: '/a', description: 'old' }];
    const result = applyPatch(routes, [{ op: 'replace', path: 'GET:/a', value: { description: 'new' } as any }]);
    expect(result.routes[0].description).toBe('new');
  });
});

describe('formatPatchSummary', () => {
  it('formats counts correctly', () => {
    const ops = [
      { op: 'add' as const, path: 'POST:/b', value: r('POST', '/b') },
      { op: 'remove' as const, path: 'DELETE:/c' },
      { op: 'replace' as const, path: 'GET:/a', value: r('GET', '/a') },
    ];
    expect(formatPatchSummary(ops)).toBe('Patch: +1 added, -1 removed, ~1 replaced');
  });
});
