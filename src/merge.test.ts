import { mergeRoutes, mergeSnapshots, formatMergeSummary } from './merge';
import { Route, Snapshot } from './types';

const r = (method: string, path: string): Route => ({ method, path });

const snap = (routes: Route[], label?: string): Snapshot => ({
  id: label ?? 'snap',
  timestamp: '2024-01-01T00:00:00Z',
  label,
  routes,
});

describe('mergeRoutes', () => {
  const a = [r('GET', '/users'), r('POST', '/users')];
  const b = [r('GET', '/users'), r('DELETE', '/users/:id')];

  it('union combines all unique routes', () => {
    const result = mergeRoutes(a, b, { strategy: 'union' });
    expect(result).toHaveLength(3);
  });

  it('intersection returns only shared routes', () => {
    const result = mergeRoutes(a, b, { strategy: 'intersection' });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/users');
  });

  it('left returns only left routes', () => {
    const result = mergeRoutes(a, b, { strategy: 'left' });
    expect(result).toEqual(a);
  });

  it('right returns only right routes', () => {
    const result = mergeRoutes(a, b, { strategy: 'right' });
    expect(result).toEqual(b);
  });

  it('union with empty right returns left routes', () => {
    const result = mergeRoutes(a, [], { strategy: 'union' });
    expect(result).toEqual(a);
  });

  it('intersection with empty right returns no routes', () => {
    const result = mergeRoutes(a, [], { strategy: 'intersection' });
    expect(result).toHaveLength(0);
  });
});

describe('mergeSnapshots', () => {
  it('merges two snapshots and returns metadata', () => {
    const base = snap([r('GET', '/a')], 'v1');
    const incoming = snap([r('POST', '/b')], 'v2');
    const result = mergeSnapshots(base, incoming);
    expect(result.total).toBe(2);
    expect(result.snapshot.label).toContain('v1');
    expect(result.snapshot.label).toContain('v2');
  });

  it('reports added routes', () => {
    const base = snap([r('GET', '/a')]);
    const incoming = snap([r('GET', '/a'), r('GET', '/b')]);
    const result = mergeSnapshots(base, incoming);
    expect(result.added).toBe(1);
  });

  it('reports dropped routes', () => {
    const base = snap([r('GET', '/a'), r('GET', '/b')]);
    const incoming = snap([r('GET', '/a')]);
    const result = mergeSnapshots(base, incoming);
    expect(result.dropped).toBe(1);
  });
});

describe('formatMergeSummary', () => {
  it('formats summary text', () => {
    const text = formatMergeSummary({ snapshot: snap([]), added: 2, dropped: 1, total: 5 });
    expect(text).toContain('5 routes total');
    expect(text).toContain('Added   : 2');
  });

  it('includes dropped count in summary text', () => {
    const text = formatMergeSummary({ snapshot: snap([]), added: 0, dropped: 3, total: 7 });
    expect(text).toContain('Dropped : 3');
  });
});
