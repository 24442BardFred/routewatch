import { resolveRoutes, formatResolvedReport } from './resolve';
import { Route } from './types';

const sampleRoutes: Route[] = [
  { method: 'GET', path: '/users', status: 200 },
  { method: 'GET', path: '/users/:id', status: 200 },
  { method: 'PUT', path: '/users/:id', status: 200 },
  { method: 'DELETE', path: '/users/:id', status: 204 },
  { method: 'GET', path: '/users/:userId/posts/:postId', status: 200 },
  { method: 'GET', path: '/health', status: 200 },
  { method: 'GET', path: '/files/*', status: 200 },
];

describe('resolve integration', () => {
  it('resolves all sample routes', () => {
    const resolved = resolveRoutes(sampleRoutes);
    expect(resolved).toHaveLength(sampleRoutes.length);
  });

  it('correctly identifies wildcard vs static routes', () => {
    const resolved = resolveRoutes(sampleRoutes);
    const wildcards = resolved.filter(r => r.isWildcard);
    const statics = resolved.filter(r => !r.isWildcard);
    expect(wildcards.length).toBe(5);
    expect(statics.length).toBe(2);
  });

  it('extracts all param names across routes', () => {
    const resolved = resolveRoutes(sampleRoutes);
    const multiParam = resolved.find(r => r.path.includes('posts'));
    expect(multiParam?.paramNames).toEqual(['userId', 'postId']);
  });

  it('generates a full report without errors', () => {
    const resolved = resolveRoutes(sampleRoutes);
    const report = formatResolvedReport(resolved);
    expect(report).toContain('Resolved 7 route(s)');
    expect(report).toContain('{userId}');
    expect(report).toContain('{postId}');
  });
});
