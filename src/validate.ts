import { Route } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const PATH_REGEX = /^\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%{}|^`]*$/;

export function validateRoute(route: Route): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!route.method) {
    errors.push('Route is missing a method');
  } else if (!VALID_METHODS.includes(route.method.toUpperCase())) {
    errors.push(`Invalid HTTP method: "${route.method}"`);
  }

  if (!route.path) {
    errors.push('Route is missing a path');
  } else if (!route.path.startsWith('/')) {
    errors.push(`Path must start with "/": "${route.path}"`);
  } else if (!PATH_REGEX.test(route.path)) {
    warnings.push(`Path contains unusual characters: "${route.path}"`);
  }

  if (route.path && route.path.length > 512) {
    warnings.push('Path is unusually long (> 512 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateRoutes(routes: Route[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(routes)) {
    return { valid: false, errors: ['Routes must be an array'], warnings: [] };
  }

  if (routes.length === 0) {
    allWarnings.push('No routes found in snapshot');
  }

  const seen = new Set<string>();
  routes.forEach((route, index) => {
    const result = validateRoute(route);
    result.errors.forEach((e) => allErrors.push(`Route[${index}]: ${e}`));
    result.warnings.forEach((w) => allWarnings.push(`Route[${index}]: ${w}`));

    const key = `${route.method?.toUpperCase()}:${route.path}`;
    if (seen.has(key)) {
      allWarnings.push(`Route[${index}]: Duplicate route detected: ${key}`);
    } else {
      seen.add(key);
    }
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
