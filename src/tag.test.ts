import { inferTags, tagRoute, tagRoutes, filterByTag } from './tag';
import { Route } from './types';

const makeRoute = (method: string, path: string): Route => ({
  method,
  path,
});

describe('inferTags', () => {
  it('extracts resource segment as tag', () => {
    const tags = inferTags(makeRoute('GET', '/api/v1/users'));
    expect(tags).toContain('users');
  });

  it('extracts version segment as tag', () => {
    const tags = inferTags(makeRoute('GET', '/api/v1/users'));
    expect(tags).toContain('v1');
  });

  it('excludes "api" segment from tags', () => {
    const tags = inferTags(makeRoute('GET', '/api/users'));
    expect(tags).not.toContain('api');
  });

  it('excludes path parameters from tags', () => {
    const tags = inferTags(makeRoute('GET', '/api/users/:id'));
    expect(tags).not.toContain(':id');
  });

  it('adds "read" tag for GET method', () => {
    const tags = inferTags(makeRoute('GET', '/api/users'));
    expect(tags).toContain('read');
  });

  it('adds "write" tag for POST method', () => {
    const tags = inferTags(makeRoute('POST', '/api/users'));
    expect(tags).toContain('write');
  });

  it('adds "delete" tag for DELETE method', () => {
    const tags = inferTags(makeRoute('DELETE', '/api/users/:id'));
    expect(tags).toContain('delete');
  });

  it('adds "update" tag for PATCH method', () => {
    const tags = inferTags(makeRoute('PATCH', '/api/users/:id'));
    expect(tags).toContain('update');
  });
});

describe('tagRoute', () => {
  it('merges inferred tags with extra tags', () => {
    const tagged = tagRoute(makeRoute('GET', '/api/users'), ['public']);
    expect(tagged.tags).toContain('public');
    expect(tagged.tags).toContain('users');
  });

  it('deduplicates tags', () => {
    const tagged = tagRoute(makeRoute('GET', '/api/users'), ['users']);
    expect(tagged.tags.filter((t) => t === 'users').length).toBe(1);
  });
});

describe('tagRoutes', () => {
  it('tags multiple routes', () => {
    const routes = [
      makeRoute('GET', '/api/users'),
      makeRoute('POST', '/api/posts'),
    ];
    const tagged = tagRoutes(routes);
    expect(tagged[0].tags).toContain('users');
    expect(tagged[1].tags).toContain('posts');
  });

  it('applies extra tags from map', () => {
    const routes = [makeRoute('GET', '/api/users')];
    const tagged = tagRoutes(routes, { 'GET /api/users': ['admin'] });
    expect(tagged[0].tags).toContain('admin');
  });
});

describe('filterByTag', () => {
  it('returns only routes matching the tag', () => {
    const routes = tagRoutes([
      makeRoute('GET', '/api/users'),
      makeRoute('POST', '/api/orders'),
    ]);
    const result = filterByTag(routes, 'users');
    expect(result.length).toBe(1);
    expect(result[0].path).toBe('/api/users');
  });

  it('returns empty array if no match', () => {
    const routes = tagRoutes([makeRoute('GET', '/api/users')]);
    expect(filterByTag(routes, 'nonexistent')).toEqual([]);
  });
});
