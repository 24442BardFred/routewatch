import { describe, it, expect } from 'vitest';
import { matchesPattern, filterRoutes, Route } from './filter';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/users/123' },
  { method: 'DELETE', path: '/users/123' },
  { method: 'GET', path: '/products' },
  { method: 'PUT', path: '/products/456' },
  { method: 'GET', path: '/health' },
];

describe('matchesPattern', () => {
  it('matches exact paths', () => {
    expect(matchesPattern('/users', ['/users'])).toBe(true);
    expect(matchesPattern('/other', ['/users'])).toBe(false);
  });

  it('matches wildcard segments', () => {
    expect(matchesPattern('/users/123', ['/users/*'])).toBe(true);
    expect(matchesPattern('/users/123/orders', ['/users/*'])).toBe(false);
  });

  it('matches multiple patterns', () => {
    expect(matchesPattern('/health', ['/users', '/health'])).toBe(true);
  });

  it('returns false for empty pattern list', () => {
    expect(matchesPattern('/users', [])).toBe(false);
  });
});

describe('filterRoutes', () => {
  it('returns all routes when no options provided', () => {
    expect(filterRoutes(sampleRoutes, {})).toHaveLength(sampleRoutes.length);
  });

  it('filters by includeMethods', () => {
    const result = filterRoutes(sampleRoutes, { includeMethods: ['GET'] });
    expect(result.every((r) => r.method === 'GET')).toBe(true);
    expect(result).toHaveLength(4);
  });

  it('filters by excludeMethods', () => {
    const result = filterRoutes(sampleRoutes, { excludeMethods: ['DELETE', 'PUT'] });
    expect(result.some((r) => r.method === 'DELETE')).toBe(false);
    expect(result.some((r) => r.method === 'PUT')).toBe(false);
  });

  it('filters by includePaths', () => {
    const result = filterRoutes(sampleRoutes, { includePaths: ['/users', '/users/*'] });
    expect(result.every((r) => r.path.startsWith('/users'))).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('filters by excludePaths', () => {
    const result = filterRoutes(sampleRoutes, { excludePaths: ['/health'] });
    expect(result.some((r) => r.path === '/health')).toBe(false);
    expect(result).toHaveLength(sampleRoutes.length - 1);
  });

  it('combines method and path filters', () => {
    const result = filterRoutes(sampleRoutes, {
      includeMethods: ['GET'],
      excludePaths: ['/health'],
    });
    expect(result.every((r) => r.method === 'GET')).toBe(true);
    expect(result.some((r) => r.path === '/health')).toBe(false);
  });

  it('is case-insensitive for methods', () => {
    const routes: Route[] = [{ method: 'get', path: '/test' }];
    const result = filterRoutes(routes, { includeMethods: ['GET'] });
    expect(result).toHaveLength(1);
  });
});
