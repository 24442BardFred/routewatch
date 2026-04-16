import { addAnnotation, annotateRoutes, removeAnnotation, AnnotationMap } from './annotate';
import { Route } from './types';

const routes: Route[] = [
  { method: 'GET', path: '/products' },
  { method: 'POST', path: '/products' },
  { method: 'DELETE', path: '/products/:id' },
];

describe('annotate integration', () => {
  it('round-trips add and remove correctly', () => {
    let map: AnnotationMap = {};
    map = addAnnotation(map, 'GET', '/products', 'fetch all products', 'dev');
    map = addAnnotation(map, 'DELETE', '/products/:id', 'remove product', 'dev');
    expect(Object.keys(map)).toHaveLength(2);

    map = removeAnnotation(map, 'GET', '/products');
    expect(Object.keys(map)).toHaveLength(1);

    const annotated = annotateRoutes(routes, map);
    const get = annotated.find((r) => r.method === 'GET' && r.path === '/products');
    const del = annotated.find((r) => r.method === 'DELETE');
    const post = annotated.find((r) => r.method === 'POST');

    expect(get?.annotation).toBeUndefined();
    expect(del?.annotation?.note).toBe('remove product');
    expect(post?.annotation).toBeUndefined();
  });

  it('overwrites an existing annotation', () => {
    let map: AnnotationMap = {};
    map = addAnnotation(map, 'POST', '/products', 'original note');
    map = addAnnotation(map, 'POST', '/products', 'updated note', 'editor');
    const annotated = annotateRoutes(routes, map);
    const post = annotated.find((r) => r.method === 'POST');
    expect(post?.annotation?.note).toBe('updated note');
    expect(post?.annotation?.author).toBe('editor');
  });
});
