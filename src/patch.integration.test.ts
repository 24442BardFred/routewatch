import { buildPatch, applyPatch } from './patch';
import { Route } from './types';

const snap = (routes: Route[]) => routes;

describe('patch integration', () => {
  it('round-trips: apply patch to before yields after', () => {
    const before: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'DELETE', path: '/users/:id' },
    ];
    const after: Route[] = [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
      { method: 'GET', path: '/users/:id' },
    ];

    const ops = buildPatch(before, after);
    const result = applyPatch(before, ops);

    const toKey = (r: Route) => `${r.method}:${r.path}`;
    const resultKeys = new Set(result.routes.map(toKey));
    const afterKeys = new Set(after.map(toKey));

    expect(resultKeys).toEqual(afterKeys);
  });

  it('no-op patch leaves routes unchanged', () => {
    const routes: Route[] = [{ method: 'GET', path: '/health' }];
    const ops = buildPatch(routes, routes);
    expect(ops).toHaveLength(0);
    const result = applyPatch(routes, ops);
    expect(result.routes).toHaveLength(1);
    expect(result.applied).toBe(0);
  });
});
