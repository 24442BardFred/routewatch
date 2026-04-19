import {
  extractParamNames,
  resolvePathTemplate,
  isWildcardPath,
  resolveRoute,
  resolveRoutes,
  formatResolvedReport,
} from './resolve';
import { Route } from './types';

const makeRoute = (method: string, path: string): Route => ({ method, path, status: 200 });

describe('extractParamNames', () => {
  it('extracts single param', () => {
    expect(extractParamNames('/users/:id')).toEqual(['id']);
  });
  it('extracts multiple params', () => {
    expect(extractParamNames('/users/:userId/posts/:postId')).toEqual(['userId', 'postId']);
  });
  it('returns empty for static path', () => {
    expect(extractParamNames('/users')).toEqual([]);
  });
});

describe('resolvePathTemplate', () => {
  it('converts :param to {param}', () => {
    expect(resolvePathTemplate('/users/:id')).toBe('/users/{id}');
  });
  it('leaves static paths unchanged', () => {
    expect(resolvePathTemplate('/health')).toBe('/health');
  });
});

describe('isWildcardPath', () => {
  it('detects param paths as wildcard', () => {
    expect(isWildcardPath('/users/:id')).toBe(true);
  });
  it('detects * wildcard', () => {
    expect(isWildcardPath('/files/*')).toBe(true);
  });
  it('returns false for static path', () => {
    expect(isWildcardPath('/health')).toBe(false);
  });
});

describe('resolveRoute', () => {
  it('resolves a parameterized route', () => {
    const r = resolveRoute(makeRoute('GET', '/users/:id'));
    expect(r.resolvedPath).toBe('/users/{id}');
    expect(r.paramNames).toEqual(['id']);
    expect(r.isWildcard).toBe(true);
  });
  it('resolves a static route', () => {
    const r = resolveRoute(makeRoute('GET', '/health'));
    expect(r.resolvedPath).toBe('/health');
    expect(r.paramNames).toEqual([]);
    expect(r.isWildcard).toBe(false);
  });
});

describe('formatResolvedReport', () => {
  it('returns message for empty list', () => {
    expect(formatResolvedReport([])).toBe('No routes to resolve.');
  });
  it('formats routes', () => {
    const routes = resolveRoutes([makeRoute('GET', '/users/:id'), makeRoute('POST', '/health')]);
    const report = formatResolvedReport(routes);
    expect(report).toContain('Resolved 2 route(s)');
    expect(report).toContain('{id}');
    expect(report).toContain('(wildcard)');
  });
});
