import { Route } from './types';

export interface TaggedRoute extends Route {
  tags: string[];
}

/**
 * Infer tags from a route path and method.
 * e.g. /api/v1/users -> ['users', 'v1']
 */
export function inferTags(route: Route): string[] {
  const tags: string[] = [];

  const segments = route.path
    .split('/')
    .filter(Boolean)
    .filter((s) => !s.startsWith(':') && !s.startsWith('{'));

  for (const segment of segments) {
    if (/^v\d+$/i.test(segment)) {
      tags.push(segment.toLowerCase());
    } else if (segment !== 'api') {
      tags.push(segment.toLowerCase());
    }
  }

  // Add method-based tag
  const method = route.method.toUpperCase();
  if (method === 'GET') tags.push('read');
  else if (method === 'POST') tags.push('write');
  else if (method === 'PUT' || method === 'PATCH') tags.push('update');
  else if (method === 'DELETE') tags.push('delete');

  return [...new Set(tags)];
}

/**
 * Apply tags to a route, merging inferred tags with any existing tags.
 */
export function tagRoute(route: Route, extraTags: string[] = []): TaggedRoute {
  const inferred = inferTags(route);
  const merged = [...new Set([...inferred, ...extraTags])];
  return { ...route, tags: merged };
}

/**
 * Tag all routes in an array.
 */
export function tagRoutes(
  routes: Route[],
  extraTagsMap: Record<string, string[]> = {}
): TaggedRoute[] {
  return routes.map((route) => {
    const key = `${route.method.toUpperCase()} ${route.path}`;
    const extra = extraTagsMap[key] ?? [];
    return tagRoute(route, extra);
  });
}

/**
 * Filter tagged routes by a given tag.
 */
export function filterByTag(routes: TaggedRoute[], tag: string): TaggedRoute[] {
  const normalized = tag.toLowerCase();
  return routes.filter((r) => r.tags.includes(normalized));
}
