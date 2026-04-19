import { classifyRoute, classifyRoutes, groupByCategory } from './classify';
import { formatClassifyMarkdown, formatClassifyCsv } from './classify.format';
import { Route } from './types';

const r = (method: string, path: string): Route => ({ method, path });

describe('classifyRoute', () => {
  it('detects health routes', () => {
    expect(classifyRoute(r('GET', '/health'))).toBe('health');
    expect(classifyRoute(r('GET', '/api/ping'))).toBe('health');
    expect(classifyRoute(r('GET', '/status'))).toBe('health');
  });

  it('detects auth routes', () => {
    expect(classifyRoute(r('POST', '/auth/login'))).toBe('auth');
    expect(classifyRoute(r('POST', '/oauth/token'))).toBe('auth');
  });

  it('detects webhook routes', () => {
    expect(classifyRoute(r('POST', '/webhook/github'))).toBe('webhook');
    expect(classifyRoute(r('POST', '/hooks/stripe'))).toBe('webhook');
  });

  it('detects resource routes', () => {
    expect(classifyRoute(r('GET', '/users'))).toBe('resource');
    expect(classifyRoute(r('GET', '/users/:id'))).toBe('resource');
  });

  it('falls back to action for POST verbs', () => {
    expect(classifyRoute(r('POST', '/orders/create'))).toBe('action');
  });

  it('returns unknown for ambiguous GET routes', () => {
    expect(classifyRoute(r('GET', '/foo/bar'))).toBe('unknown');
  });
});

describe('classifyRoutes', () => {
  it('adds category to each route', () => {
    const routes = [r('GET', '/health'), r('GET', '/users')];
    const result = classifyRoutes(routes);
    expect(result[0].category).toBe('health');
    expect(result[1].category).toBe('resource');
  });
});

describe('groupByCategory', () => {
  it('groups routes by category', () => {
    const routes = [r('GET', '/health'), r('GET', '/users'), r('POST', '/auth/login')];
    const groups = groupByCategory(routes);
    expect(groups.health).toHaveLength(1);
    expect(groups.resource).toHaveLength(1);
    expect(groups.auth).toHaveLength(1);
  });
});

describe('formatClassifyMarkdown', () => {
  it('produces markdown with headers', () => {
    const md = formatClassifyMarkdown([r('GET', '/health')]);
    expect(md).toContain('# Route Classification Report');
    expect(md).toContain('Health');
    expect(md).toContain('/health');
  });
});

describe('formatClassifyCsv', () => {
  it('produces csv rows', () => {
    const classified = classifyRoutes([r('GET', '/users')]);
    const csv = formatClassifyCsv(classified);
    expect(csv).toContain('method,path,category');
    expect(csv).toContain('GET,/users,resource');
  });
});
