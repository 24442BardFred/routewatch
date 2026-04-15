import axios from 'axios';

export interface Route {
  method: string;
  path: string;
  description?: string;
}

export function normalizeMethod(method: string): string {
  return method.toUpperCase().trim();
}

export function normalizePath(p: string): string {
  return '/' + p.replace(/^\/+|\/+$/g, '');
}

export function sortRoutes(routes: Route[]): Route[] {
  return [...routes].sort((a, b) => {
    const pathCmp = a.path.localeCompare(b.path);
    return pathCmp !== 0 ? pathCmp : a.method.localeCompare(b.method);
  });
}

function normalizeRoute(route: Partial<Route>): Route {
  return {
    method: normalizeMethod(route.method ?? 'GET'),
    path: normalizePath(route.path ?? '/'),
    description: route.description,
  };
}

export async function fetchRoutes(url: string): Promise<Route[]> {
  const response = await axios.get(url, { timeout: 10000 });
  const data = response.data;

  let raw: Partial<Route>[] = [];

  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray(data.routes)) {
    raw = data.routes;
  } else if (data && Array.isArray(data.endpoints)) {
    raw = data.endpoints;
  } else {
    throw new Error(
      'Unexpected response format: expected an array or object with routes/endpoints array'
    );
  }

  const routes = raw
    .filter((r) => r && typeof r === 'object' && r.path)
    .map(normalizeRoute);

  return sortRoutes(routes);
}
