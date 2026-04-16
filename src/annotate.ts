import { Route } from './types';

export interface Annotation {
  route: string;
  method: string;
  note: string;
  author?: string;
  createdAt: string;
}

export interface AnnotationMap {
  [key: string]: Annotation;
}

function routeKey(method: string, route: string): string {
  return `${method.toUpperCase()}:${route}`;
}

export function addAnnotation(
  map: AnnotationMap,
  method: string,
  route: string,
  note: string,
  author?: string
): AnnotationMap {
  const key = routeKey(method, route);
  return {
    ...map,
    [key]: {
      route,
      method: method.toUpperCase(),
      note,
      author,
      createdAt: new Date().toISOString(),
    },
  };
}

export function removeAnnotation(
  map: AnnotationMap,
  method: string,
  route: string
): AnnotationMap {
  const key = routeKey(method, route);
  const next = { ...map };
  delete next[key];
  return next;
}

export function getAnnotation(
  map: AnnotationMap,
  method: string,
  route: string
): Annotation | undefined {
  return map[routeKey(method, route)];
}

export function annotateRoutes(
  routes: Route[],
  map: AnnotationMap
): (Route & { annotation?: Annotation })[] {
  return routes.map((r) => ({
    ...r,
    annotation: getAnnotation(map, r.method, r.path),
  }));
}
