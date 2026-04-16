import { describe, it, expect } from 'vitest';
import { lintRoutes } from './lint';
import { validateRoutes } from './validate';
import { Route } from './types';

const routes: Route[] = [
  { method: 'GET', path: '/users', status: 200 },
  { method: 'POST', path: '/users', status: 201 },
  { method: 'GET', path: '/users/:id', status: 200 },
  { method: 'DELETE', path: '/Users/:id/', status: 204 },
  { method: 'get', path: '/items', status: 200 },
];

describe('lint integration', () => {
  it('validates before linting', () => {
    const valid = validateRoutes(routes);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('finds issues in mixed route set', () => {
    const result = lintRoutes(routes);
    expect(result.passed).toBe(false);
    const rules = result.issues.map(i => i.rule);
    expect(rules).toContain('no-uppercase-path');
    expect(rules).toContain('no-trailing-slash');
    expect(rules).toContain('method-uppercase');
  });

  it('clean routes pass lint', () => {
    const clean: Route[] = [
      { method: 'GET', path: '/users', status: 200 },
      { method: 'POST', path: '/orders', status: 201 },
    ];
    const result = lintRoutes(clean);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
