import { extractPrefix, groupByPrefix, groupByMethod, summarizeGroups } from './group';
import { Route } from './types';

const makeRoute = (method: string, path: string): Route => ({
  method,
  path,
});

const routes: Route[] = [
  makeRoute('GET', '/api/users'),
  makeRoute('POST', '/api/users'),
  makeRoute('GET', '/api/users/123'),
  makeRoute('DELETE', '/api/posts/1'),
  makeRoute('GET', '/api/posts'),
  makeRoute('GET', '/health'),
];

describe('extractPrefix', () => {
  it('extracts top-level prefix', () => {
    expect(extractPrefix('/api/users/123')).toBe('/api');
    expect(extractPrefix('/health')).toBe('/health');
  });

  it('extracts deeper prefix at depth 2', () => {
    expect(extractPrefix('/api/users/123', 2)).toBe('/api/users');
  });

  it('handles root path', () => {
    expect(extractPrefix('/')).toBe('/');
  });
});

describe('groupByPrefix', () => {
  it('groups routes by top-level prefix', () => {
    const groups = groupByPrefix(routes);
    expect(groups).toHaveLength(2);
    const prefixes = groups.map((g) => g.prefix);
    expect(prefixes).toContain('/api');
    expect(prefixes).toContain('/health');
  });

  it('counts routes correctly', () => {
    const groups = groupByPrefix(routes);
    const api = groups.find((g) => g.prefix === '/api');
    expect(api?.count).toBe(5);
    const health = groups.find((g) => g.prefix === '/health');
    expect(health?.count).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(groupByPrefix([])).toEqual([]);
  });

  it('groups at depth 2', () => {
    const groups = groupByPrefix(routes, 2);
    const prefixes = groups.map((g) => g.prefix);
    expect(prefixes).toContain('/api/users');
    expect(prefixes).toContain('/api/posts');
  });
});

describe('groupByMethod', () => {
  it('groups routes by HTTP method', () => {
    const grouped = groupByMethod(routes);
    expect(Object.keys(grouped).sort()).toEqual(['DELETE', 'GET', 'POST']);
    expect(grouped['GET']).toHaveLength(4);
    expect(grouped['POST']).toHaveLength(1);
    expect(grouped['DELETE']).toHaveLength(1);
  });
});

describe('summarizeGroups', () => {
  it('returns prefix to count map', () => {
    const groups = groupByPrefix(routes);
    const summary = summarizeGroups(groups);
    expect(summary['/api']).toBe(5);
    expect(summary['/health']).toBe(1);
  });
});
