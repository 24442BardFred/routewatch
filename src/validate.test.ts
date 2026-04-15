import { validateRoute, validateRoutes } from './validate';
import { Route } from './types';

const makeRoute = (method: string, path: string): Route => ({ method, path });

describe('validateRoute', () => {
  it('returns valid for a well-formed route', () => {
    const result = validateRoute(makeRoute('GET', '/api/users'));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns error for missing method', () => {
    const result = validateRoute(makeRoute('', '/api/users'));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Route is missing a method');
  });

  it('returns error for invalid HTTP method', () => {
    const result = validateRoute(makeRoute('FETCH', '/api/users'));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid HTTP method/);
  });

  it('returns error for missing path', () => {
    const result = validateRoute(makeRoute('GET', ''));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Route is missing a path');
  });

  it('returns error for path not starting with slash', () => {
    const result = validateRoute(makeRoute('POST', 'api/users'));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/must start with/);
  });

  it('returns warning for very long path', () => {
    const longPath = '/' + 'a'.repeat(513);
    const result = validateRoute(makeRoute('GET', longPath));
    expect(result.warnings.some((w) => w.includes('unusually long'))).toBe(true);
  });

  it('accepts all standard HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    methods.forEach((method) => {
      const result = validateRoute(makeRoute(method, '/test'));
      expect(result.valid).toBe(true);
    });
  });
});

describe('validateRoutes', () => {
  it('returns valid for a list of well-formed routes', () => {
    const routes = [makeRoute('GET', '/users'), makeRoute('POST', '/users')];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error if routes is not an array', () => {
    const result = validateRoutes(null as any);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Routes must be an array');
  });

  it('warns when routes array is empty', () => {
    const result = validateRoutes([]);
    expect(result.warnings).toContain('No routes found in snapshot');
  });

  it('warns on duplicate routes', () => {
    const routes = [makeRoute('GET', '/users'), makeRoute('GET', '/users')];
    const result = validateRoutes(routes);
    expect(result.warnings.some((w) => w.includes('Duplicate route'))).toBe(true);
  });

  it('aggregates errors from multiple invalid routes', () => {
    const routes = [makeRoute('', '/ok'), makeRoute('GET', 'no-slash')];
    const result = validateRoutes(routes);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
