/**
 * Core shared types for routewatch.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface Route {
  method: HttpMethod | string;
  path: string;
  status?: number;
  tags?: string[];
  summary?: string;
}

export interface RouteSnapshot {
  id: string;
  url: string;
  label?: string;
  timestamp: string;
  routes: Route[];
}

export interface RouteDiff {
  added: Route[];
  removed: Route[];
  modified: Array<{
    before: Route;
    after: Route;
  }>;
  snapshotBefore: RouteSnapshot;
  snapshotAfter: RouteSnapshot;
}

export type ReportFormat = 'text' | 'markdown' | 'json';

export interface RouteWatchConfig {
  url: string;
  label?: string;
  interval?: number;
  format?: ReportFormat;
  outputDir?: string;
  include?: string[];
  exclude?: string[];
}

export interface SnapshotMeta {
  id: string;
  url: string;
  label?: string;
  timestamp: string;
  routeCount: number;
}
