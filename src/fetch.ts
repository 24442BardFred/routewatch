import axios, { AxiosResponse } from 'axios';

export interface RouteEntry {
  method: string;
  path: string;
  statusCode?: number;
  description?: string;
}

export interface FetchOptions {
  baseUrl: string;
  routesPath?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

function normalizeMethod(method: string): string {
  return method.toUpperCase();
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export async function fetchRoutes(options: FetchOptions): Promise<RouteEntry[]> {
  const { baseUrl, routesPath = '/__routes', timeout = 5000, headers = {} } = options;

  const url = `${baseUrl.replace(/\/$/, '')}${routesPath}`;

  let response: AxiosResponse;
  try {
    response = await axios.get(url, { timeout, headers });
  } catch (err: any) {
    throw new Error(`Failed to fetch routes from ${url}: ${err.message}`);
  }

  const data = response.data;

  if (!Array.isArray(data)) {
    throw new Error(`Expected an array of routes from ${url}, got ${typeof data}`);
  }

  return data.map((entry: any): RouteEntry => {
    if (!entry.method || !entry.path) {
      throw new Error(`Invalid route entry: ${JSON.stringify(entry)}`);
    }
    return {
      method: normalizeMethod(entry.method),
      path: normalizePath(entry.path),
      statusCode: entry.statusCode ?? entry.status_code,
      description: entry.description,
    };
  });
}

export function sortRoutes(routes: RouteEntry[]): RouteEntry[] {
  return [...routes].sort((a, b) => {
    const pathCmp = a.path.localeCompare(b.path);
    return pathCmp !== 0 ? pathCmp : a.method.localeCompare(b.method);
  });
}
