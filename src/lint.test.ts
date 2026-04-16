import { describe, it, expect } from 'vitest';
import {
  lintRoutes,
  ruleNoTrailingSlash,
  ruleNoUppercasePath,
  ruleMethodUppercase,
  ruleNoDoubleSlash,
} from './lint';
import { Route } from './types';

const r = (method: string, path: string): Route => ({ method, path, status: 200 });

describe('ruleNoTrailingSlash', () => {
  it('flags trailing slash', () => {
    expect(ruleNoTrailingSlash(r('GET', '/users/'))).not.toBeNull();
  });
  it('ignores root path', () => {
    expect(ruleNoTrailingSlash(r('GET', '/'))).toBeNull();
  });
  it('passes clean path', () => {
    expect(ruleNoTrailingSlash(r('GET', '/users'))).toBeNull();
  });
});

describe('ruleNoUppercasePath', () => {
  it('flags uppercase', () => {
    expect(ruleNoUppercasePath(r('GET', '/Users'))).not.toBeNull();
  });
  it('passes lowercase', () => {
    expect(ruleNoUppercasePath(r('GET', '/users'))).toBeNull();
  });
});

describe('ruleMethodUppercase', () => {
  it('flags lowercase method', () => {
    expect(ruleMethodUppercase(r('get', '/users'))).not.toBeNull();
  });
  it('passes uppercase method', () => {
    expect(ruleMethodUppercase(r('GET', '/users'))).toBeNull();
  });
});

describe('ruleNoDoubleSlash', () => {
  it('flags double slash', () => {
    expect(ruleNoDoubleSlash(r('GET', '/users//profile'))).not.toBeNull();
  });
  it('passes normal path', () => {
    expect(ruleNoDoubleSlash(r('GET', '/users/profile'))).toBeNull();
  });
});

describe('lintRoutes', () => {
  it('returns passed=true for clean routes', () => {
    const result = lintRoutes([r('GET', '/users'), r('POST', '/items')]);
    expect(result.passed).toBe(true);
    expect(result.errorCount).toBe(0);
  });

  it('counts errors and warns separately', () => {
    const result = lintRoutes([r('GET', '/Users/'), r('get', '/items')]);
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.warnCount).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
  });

  it('supports custom rules', () => {
    const customRule = (route: Route) =>
      route.path === '/forbidden'
        ? { route, rule: 'no-forbidden', message: 'Forbidden path', severity: 'error' as const }
        : null;
    const result = lintRoutes([r('GET', '/forbidden')], [customRule]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].rule).toBe('no-forbidden');
  });
});
