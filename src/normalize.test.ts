import {
  normalizeMethod,
  normalizeTrailingSlash,
  normalizeQueryParams,
  normalizeRouteEntry,
  normalizeRoutes,
  normalizeSnapshot,
  formatNormalizeSummary,
} from './normalize';
import { Route, Snapshot } from './types';

const makeRoute = (method: string, path: string): Route => ({
  method,
  path,
});

const makeSnapshot = (routes: Route[]): Snapshot => ({
  id: 'test',
  timestamp: '2024-01-01T00:00:00Z',
  routes,
});

describe('normalizeMethod', () => {
  it('uppercases method by default', () => {
    expect(normalizeMethod('get', false)).toBe('GET');
  });
  it('lowercases method when flag is set', () => {
    expect(normalizeMethod('POST', true)).toBe('post');
  });
});

describe('normalizeTrailingSlash', () => {
  it('removes trailing slash', () => {
    expect(normalizeTrailingSlash('/api/users/', 'remove')).toBe('/api/users');
  });
  it('preserves root slash when removing', () => {
    expect(normalizeTrailingSlash('/', 'remove')).toBe('/');
  });
  it('adds trailing slash', () => {
    expect(normalizeTrailingSlash('/api/users', 'add')).toBe('/api/users/');
  });
  it('preserves path when mode is preserve', () => {
    expect(normalizeTrailingSlash('/api/users/', 'preserve')).toBe('/api/users/');
  });
});

describe('normalizeQueryParams', () => {
  it('sorts query params alphabetically', () => {
    expect(normalizeQueryParams('/search?z=1&a=2', true)).toBe('/search?a=2&z=1');
  });
  it('leaves path unchanged when no query string', () => {
    expect(normalizeQueryParams('/api/users', true)).toBe('/api/users');
  });
  it('preserves order when sort is false', () => {
    expect(normalizeQueryParams('/search?z=1&a=2', false)).toBe('/search?z=1&a=2');
  });
});

describe('normalizeRouteEntry', () => {
  it('applies all normalizations with defaults', () => {
    const route = makeRoute('get', '/api/users/');
    const result = normalizeRouteEntry(route);
    expect(result.method).toBe('GET');
    expect(result.path).toBe('/api/users');
  });
  it('respects custom options', () => {
    const route = makeRoute('DELETE', '/api/items');
    const result = normalizeRouteEntry(route, { lowercaseMethods: true, trailingSlash: 'add' });
    expect(result.method).toBe('delete');
    expect(result.path).toBe('/api/items/');
  });
});

describe('normalizeRoutes', () => {
  it('normalizes an array of routes', () => {
    const routes = [makeRoute('post', '/api/v1/'), makeRoute('GET', '/api/v2')];
    const result = normalizeRoutes(routes);
    expect(result[0].method).toBe('POST');
    expect(result[0].path).toBe('/api/v1');
    expect(result[1].method).toBe('GET');
  });
});

describe('normalizeSnapshot', () => {
  it('normalizes all routes in a snapshot', () => {
    const snap = makeSnapshot([makeRoute('get', '/api/users/')]);
    const result = normalizeSnapshot(snap);
    expect(result.routes[0].method).toBe('GET');
    expect(result.routes[0].path).toBe('/api/users');
    expect(result.id).toBe('test');
  });
});

describe('formatNormalizeSummary', () => {
  it('reports modified count', () => {
    const before = [makeRoute('get', '/api/users/')];
    const after = [makeRoute('GET', '/api/users')];
    const summary = formatNormalizeSummary(before, after);
    expect(summary).toMatch(/1 route/);
    expect(summary).toMatch(/1 modified/);
  });
  it('reports zero modified when unchanged', () => {
    const routes = [makeRoute('GET', '/api/users')];
    const summary = formatNormalizeSummary(routes, routes);
    expect(summary).toMatch(/0 modified/);
  });
});
