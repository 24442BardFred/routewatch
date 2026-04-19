import { applyRenameRule, renameRoutes, renameSnapshot, formatRenameSummary } from './rename';
import { Route, Snapshot } from './types';

const makeRoute = (method: string, path: string): Route => ({ method, path, status: 200 });

const makeSnapshot = (routes: Route[]): Snapshot => ({
  id: 'snap1',
  timestamp: '2024-01-01T00:00:00Z',
  source: 'http://localhost',
  routes,
});

describe('applyRenameRule', () => {
  it('renames exact match', () => {
    expect(applyRenameRule('/api/v1/users', { from: '/api/v1/users', to: '/api/v2/users' })).toBe('/api/v2/users');
  });

  it('returns unchanged if no match', () => {
    expect(applyRenameRule('/api/v1/posts', { from: '/api/v1/users', to: '/api/v2/users' })).toBe('/api/v1/posts');
  });

  it('handles wildcard rename', () => {
    expect(applyRenameRule('/api/v1/users', { from: '/api/v1/*', to: '/api/v2/*' })).toBe('/api/v2/users');
  });

  it('wildcard no match returns original', () => {
    expect(applyRenameRule('/other/path', { from: '/api/v1/*', to: '/api/v2/*' })).toBe('/other/path');
  });
});

describe('renameRoutes', () => {
  it('renames matching routes', () => {
    const routes = [makeRoute('GET', '/api/v1/users'), makeRoute('POST', '/api/v1/posts')];
    const { renamed, routes: result } = renameRoutes(routes, [{ from: '/api/v1/users', to: '/api/v2/users' }]);
    expect(renamed).toBe(1);
    expect(result[0].path).toBe('/api/v2/users');
    expect(result[1].path).toBe('/api/v1/posts');
  });

  it('applies first matching rule only', () => {
    const routes = [makeRoute('GET', '/api/v1/users')];
    const rules = [
      { from: '/api/v1/users', to: '/api/v2/users' },
      { from: '/api/v1/users', to: '/api/v3/users' },
    ];
    const { routes: result } = renameRoutes(routes, rules);
    expect(result[0].path).toBe('/api/v2/users');
  });

  it('returns zero renamed when no rules match', () => {
    const routes = [makeRoute('GET', '/health')];
    const { renamed } = renameRoutes(routes, [{ from: '/api/v1/users', to: '/api/v2/users' }]);
    expect(renamed).toBe(0);
  });
});

describe('renameSnapshot', () => {
  it('returns updated snapshot and summary', () => {
    const snap = makeSnapshot([makeRoute('GET', '/api/v1/users'), makeRoute('GET', '/health')]);
    const { snapshot, summary } = renameSnapshot(snap, [{ from: '/api/v1/users', to: '/api/v2/users' }]);
    expect(snapshot.routes[0].path).toBe('/api/v2/users');
    expect(summary.renamed).toBe(1);
    expect(summary.unchanged).toBe(1);
  });
});

describe('formatRenameSummary', () => {
  it('formats summary text', () => {
    const text = formatRenameSummary({ rules: [{ from: '/a', to: '/b' }], renamed: 3, unchanged: 7 });
    expect(text).toContain('Rules applied : 1');
    expect(text).toContain('Routes renamed: 3');
    expect(text).toContain('Unchanged     : 7');
  });
});
