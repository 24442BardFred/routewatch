import { applyTransformRule, transformRoutes, transformSnapshot, formatTransformSummary } from './transform';
import { formatTransformMarkdown, formatTransformCsv } from './transform.format';
import { Route, Snapshot } from './types';

const r = (method: string, path: string): Route => ({ method, path });

describe('applyTransformRule', () => {
  it('transforms method', () => {
    const result = applyTransformRule(r('GET', '/a'), { field: 'method', from: 'GET', to: 'POST' });
    expect(result.method).toBe('POST');
  });

  it('transforms path', () => {
    const result = applyTransformRule(r('GET', '/old'), { field: 'path', from: '/old', to: '/new' });
    expect(result.path).toBe('/new');
  });

  it('returns same object when no match', () => {
    const route = r('DELETE', '/x');
    const result = applyTransformRule(route, { field: 'method', from: 'GET', to: 'POST' });
    expect(result).toBe(route);
  });
});

describe('transformRoutes', () => {
  it('counts applied and skipped', () => {
    const routes = [r('GET', '/a'), r('POST', '/b'), r('GET', '/c')];
    const { routes: out, applied, skipped } = transformRoutes(routes, [{ field: 'method', from: 'GET', to: 'PUT' }]);
    expect(applied).toBe(2);
    expect(skipped).toBe(1);
    expect(out.filter(x => x.method === 'PUT')).toHaveLength(2);
  });
});

describe('transformSnapshot', () => {
  const snap: Snapshot = { id: 's1', timestamp: '2024-01-01', routes: [r('GET', '/a'), r('POST', '/b')] };

  it('returns transformed snapshot', () => {
    const result = transformSnapshot(snap, [{ field: 'path', from: '/a', to: '/v2/a' }]);
    expect(result.applied).toBe(1);
    expect(result.snapshot.routes.find(x => x.path === '/v2/a')).toBeDefined();
  });
});

describe('formatTransformSummary', () => {
  it('formats text summary', () => {
    const text = formatTransformSummary({ snapshot: {} as Snapshot, applied: 3, skipped: 1 });
    expect(text).toContain('3 route(s) modified');
  });
});

describe('formatTransformMarkdown', () => {
  it('includes table', () => {
    const md = formatTransformMarkdown({ snapshot: {} as Snapshot, applied: 1, skipped: 0 }, [{ field: 'method', from: 'GET', to: 'POST' }]);
    expect(md).toContain('| method |');
  });
});

describe('formatTransformCsv', () => {
  it('includes header and summary', () => {
    const csv = formatTransformCsv({ snapshot: {} as Snapshot, applied: 2, skipped: 1 }, [{ field: 'path', from: '/a', to: '/b' }]);
    expect(csv).toContain('field,from,to');
    expect(csv).toContain('modified=2');
  });
});
