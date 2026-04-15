/**
 * Route filtering utilities for routewatch.
 * Allows users to include/exclude routes based on method, path patterns, or tags.
 */

export interface FilterOptions {
  includeMethods?: string[];
  excludeMethods?: string[];
  includePaths?: string[];
  excludePaths?: string[];
}

export interface Route {
  method: string;
  path: string;
  tags?: string[];
}

/**
 * Returns true if the given path matches any of the provided glob-like patterns.
 * Supports '*' as a wildcard segment.
 */
export function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')
      .replace(/\*\*/g, '.*');
    const regex = new RegExp(`^${regexStr}$`);
    return regex.test(path);
  });
}

/**
 * Filters a list of routes based on the provided FilterOptions.
 */
export function filterRoutes(routes: Route[], options: FilterOptions): Route[] {
  return routes.filter((route) => {
    const method = route.method.toUpperCase();

    if (
      options.includeMethods &&
      options.includeMethods.length > 0 &&
      !options.includeMethods.map((m) => m.toUpperCase()).includes(method)
    ) {
      return false;
    }

    if (
      options.excludeMethods &&
      options.excludeMethods.map((m) => m.toUpperCase()).includes(method)
    ) {
      return false;
    }

    if (
      options.includePaths &&
      options.includePaths.length > 0 &&
      !matchesPattern(route.path, options.includePaths)
    ) {
      return false;
    }

    if (
      options.excludePaths &&
      options.excludePaths.length > 0 &&
      matchesPattern(route.path, options.excludePaths)
    ) {
      return false;
    }

    return true;
  });
}
