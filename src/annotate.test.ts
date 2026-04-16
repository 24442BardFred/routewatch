import {
  addAnnotation,
  removeAnnotation,
  getAnnotation,
  annotateRoutes,
  AnnotationMap,
} from './annotate';
import { Route } from './types';

const emptyMap: AnnotationMap = {};

describe('addAnnotation', () => {
  it('adds an annotation under the correct key', () => {
    const map = addAnnotation(emptyMap, 'GET', '/users', 'lists users', 'alice');
    expect(map['GET:/users']).toBeDefined();
    expect(map['GET:/users'].note).toBe('lists users');
    expect(map['GET:/users'].author).toBe('alice');
  });

  it('normalises method to uppercase', () => {
    const map = addAnnotation(emptyMap, 'post', '/items', 'create item');
    expect(map['POST:/items']).toBeDefined();
  });

  it('does not mutate the original map', () => {
    addAnnotation(emptyMap, 'GET', '/test', 'note');
    expect(Object.keys(emptyMap)).toHaveLength(0);
  });
});

describe('removeAnnotation', () => {
  it('removes an existing annotation', () => {
    let map = addAnnotation(emptyMap, 'GET', '/users', 'note');
    map = removeAnnotation(map, 'GET', '/users');
    expect(map['GET:/users']).toBeUndefined();
  });

  it('is a no-op for missing keys', () => {
    const map = removeAnnotation(emptyMap, 'DELETE', '/gone');
    expect(Object.keys(map)).toHaveLength(0);
  });
});

describe('getAnnotation', () => {
  it('returns annotation when present', () => {
    const map = addAnnotation(emptyMap, 'GET', '/ping', 'health check');
    const ann = getAnnotation(map, 'GET', '/ping');
    expect(ann?.note).toBe('health check');
  });

  it('returns undefined when absent', () => {
    expect(getAnnotation(emptyMap, 'GET', '/nope')).toBeUndefined();
  });
});

describe('annotateRoutes', () => {
  const routes: Route[] = [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
  ];

  it('attaches annotations to matching routes', () => {
    const map = addAnnotation(emptyMap, 'GET', '/users', 'list');
    const annotated = annotateRoutes(routes, map);
    expect(annotated[0].annotation?.note).toBe('list');
    expect(annotated[1].annotation).toBeUndefined();
  });

  it('returns all routes even without annotations', () => {
    const annotated = annotateRoutes(routes, emptyMap);
    expect(annotated).toHaveLength(2);
  });
});
